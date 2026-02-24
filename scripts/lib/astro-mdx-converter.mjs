/**
 * Main Astro MDX Converter
 * تبدیل جامع محتوا برای Astro (LaTeX → MDX)
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { ContentValidator } from './astro-content-schema.mjs';
import { ImageOptimizer } from './image-optimizer.mjs';
import { LinkNormalizer } from './link-normalizer.mjs';
import { MermaidProcessor } from './mermaid-processor.mjs';


export class AstroMDXConverter {
  constructor(options = {}) {
    this.validator = new ContentValidator();
    this.imageOptimizer = new ImageOptimizer(options.imageOptimizer);
    this.linkNormalizer = new LinkNormalizer(options.linkNormalizer);

    this.options = {
      strict: options.strict !== false, // خطای سخت برای frontmatter نامعتبر
      autoFixFrontmatter: options.autoFixFrontmatter !== false,
      processImages: options.processImages !== false,
      processLinks: options.processLinks !== false,
      htmlEscape: options.htmlEscape !== false,
      ...options,
    };

    this.stats = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      warnings: [],
      errors: [],
    };
  }

  /**
   * Main convert function
   */
  async convert(content, options = {}) {
    try {
      // ۱. شناسایی و validate frontmatter
      const { data: frontmatter, content: body } = matter(content);

      // ۲. Validate فrontmatter
      const validation = ContentValidator.validateFrontmatter(frontmatter);
      if (!validation.success) {
        if (this.options.strict) {
          throw new Error(
            `❌ Frontmatter نامعتبر:\n${validation.errors.map(e => `- ${e.path}: ${e.message}`).join('\n')}`
          );
        } else if (this.options.autoFixFrontmatter) {
          console.warn('⚠️ Frontmatter خودکار اصلاح می‌شود...');
          // Try to auto-fix
          const fixed = this.autoFixFrontmatter(frontmatter);
          const revalidation = ContentValidator.validateFrontmatter(fixed);
          if (revalidation.success) {
            Object.assign(frontmatter, revalidation.data);
          } else {
            this.stats.warnings.push(
              `هشدار: Frontmatter نامی تمام نقاص نیست`
            );
          }
        }
      }

      // ۳. Process content body
      let processedBody = body;

      // ۳.۱ Process images
      if (this.options.processImages) {
        processedBody = await this.processImages(
          processedBody,
          options.sourceFile
        );
      }

      // ۳.۲ Process links
      if (this.options.processLinks) {
        processedBody = this.linkNormalizer.normalizeLinksInContent(
          processedBody,
          options.sourceFile || 'content.mdx',
          { lang: frontmatter.lang || 'fa' }
        );
      }

      // ۳.۳ Process tables
      processedBody = this.processTablesWrapper(processedBody);

      // ۳.۴ Escape JSX/HTML if needed
      if (this.options.htmlEscape) {
        processedBody = this.escapeJSXUnsafe(processedBody);
      }

      // ۴. Generate final MDX
      const mdxContent = this.generateMDX(validation.data || frontmatter, processedBody);

      this.stats.succeeded++;

      return {
        success: true,
        content: mdxContent,
        frontmatter: validation.data || frontmatter,
        body: processedBody,
        stats: this.stats,
      };
    } catch (error) {
      this.stats.failed++;
      this.stats.errors.push(error.message);

      return {
        success: false,
        error: error.message,
        stats: this.stats,
      };
    }
  }

    /**
   * Comprehensive HTML entity map
   */
  static HTML_ENTITIES = {
    // Typography
    '&hellip;': '…', '&mdash;': '—', '&ndash;': '–',
    '&laquo;': '«', '&raquo;': '»', '&bull;': '•',
    '&middot;': '·',

    // Quotes
    '&ldquo;': '\u201C', '&rdquo;': '\u201D',
    '&lsquo;': '\u2018', '&rsquo;': '\u2019',

    // Spaces & Joiners
    '&nbsp;': '\u00A0', '&zwnj;': '\u200C', '&zwj;': '\u200D',
    '&thinsp;': '\u2009', '&ensp;': '\u2002', '&emsp;': '\u2003',

    // Arrows
    '&rarr;': '→', '&larr;': '←', '&darr;': '↓',
    '&uarr;': '↑', '&harr;': '↔',

    // Accented (French, German, etc.)
    '&eacute;': 'é', '&Eacute;': 'É', '&egrave;': 'è',
    '&Egrave;': 'È', '&ecirc;': 'ê', '&Ecirc;': 'Ê',
    '&euml;': 'ë', '&aacute;': 'á', '&agrave;': 'à',
    '&acirc;': 'â', '&auml;': 'ä', '&Auml;': 'Ä',
    '&ouml;': 'ö', '&Ouml;': 'Ö', '&uuml;': 'ü',
    '&Uuml;': 'Ü', '&icirc;': 'î', '&ccedil;': 'ç',
    '&scaron;': 'š', '&szlig;': 'ß', '&oslash;': 'ø',
    '&aring;': 'å', '&aelig;': 'æ', '&ntilde;': 'ñ',

    // Symbols
    '&times;': '×', '&divide;': '÷', '&copy;': '©',
    '&reg;': '®', '&trade;': '™', '&deg;': '°',
    '&para;': '¶', '&sect;': '§',

    // HTML reserved (decode LAST)
    '&amp;': '&',
  };

  /**
   * Decode HTML entities in text
   */
  static decodeHTMLEntities(text) {
    let result = text;

    // Named entities (skip &amp; for now)
    for (const [entity, char] of Object.entries(AstroMDXConverter.HTML_ENTITIES)) {
      if (entity === '&amp;') continue;
      result = result.replaceAll(entity, char);
    }

    // Numeric decimal: &#128214;
    result = result.replace(/&#(\d+);/g, (_, c) => {
      try { return String.fromCodePoint(parseInt(c, 10)); }
      catch { return `&#${c};`; }
    });

    // Numeric hex: &#x02BB;
    result = result.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try { return String.fromCodePoint(parseInt(h, 16)); }
      catch { return `&#x${h};`; }
    });

    // Now decode &amp; (avoid creating new entities)
    result = result.replace(/&amp;(?!#?\w+;)/g, '&');

    return result;
  }

  /**
   * Main HTML preprocessor — run BEFORE existing MDX processing
   * Converts raw HTML content into MDX-ready format
   *
   * @param {string} htmlContent - Raw HTML string
   * @param {object} options - { filename, frontmatter }
   * @returns {string} MDX-ready content with frontmatter
   */
  async preprocessHTML(htmlContent, options = {}) {
    const log = options.silent ? () => {} : (msg) => console.log(msg);
    log('🔄 HTML Preprocessing started...\n');

    let content = htmlContent;

    // ── Step 1: Extract body ──
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) content = bodyMatch[1];
    log('  ✅ Step 1: Extract body');

    // ── Step 2: Extract frontmatter from header ──
    const fm = options.frontmatter ||
      this._extractFrontmatterFromHTML(content, options.filename);
    log('  ✅ Step 2: Extract frontmatter');

    // ── Step 3: Strip boilerplate ──
    content = content
      .replace(/<header\s+class="page-header">[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<main[^>]*>/gi, '')
      .replace(/<\/main>/gi, '');
    log('  ✅ Step 3: Strip boilerplate');

    // ── Step 4: Strip HTML comments ──
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    log('  ✅ Step 4: Strip HTML comments');

    // ── Step 5: Convert Mermaid blocks (BEFORE entity decode!) ──
    content = this._convertMermaidBlocks(content);
    log('  ✅ Step 5: Convert Mermaid blocks');

    // ── Step 6: Convert headings ──
    content = this._convertHeadings(content);
    log('  ✅ Step 6: Convert headings');

    // ── Step 7: Fix self-closing tags ──
    content = content
      .replace(/<br\s*>/gi, '<br/>')
      .replace(/<br\s+\/>/gi, '<br/>')
      .replace(/<hr\s*>/gi, '<hr/>')
      .replace(/<hr\s+\/>/gi, '<hr/>')
      .replace(/<img\s+([^>]*?)(?<!\/)>/gi, '<img \$1 />');
    log('  ✅ Step 7: Fix self-closing tags');

    // ── Step 8: Decode HTML entities (selective) ──
    content = this._decodeEntitiesSelective(content);
    log('  ✅ Step 8: Decode HTML entities');

    // ── Step 9: Run MermaidProcessor on code fences ──
    const mermaidProc = new MermaidProcessor({
      decodeHTMLEntities: true,
      stripClassAnnotations: true,
      fixNewlines: true,
    });
    content = await mermaidProc.process(content);
    log(`  ✅ Step 9: Mermaid fixes (${mermaidProc.getStats().fixed} fixed)`);

    // ── Step 10: Clean whitespace ──
    content = content
      .replace(/\n{4,}/g, '\n\n\n')
      .split('\n').map(l => l.trimEnd()).join('\n')
      .trim() + '\n';
    log('  ✅ Step 10: Clean whitespace');

    // ── Step 11: Assemble with frontmatter ──
    const frontmatterStr = this.generateFrontmatter(fm);
    const finalContent = `---\n${frontmatterStr}\n---\n\n${content}`;

    log(`\n✅ HTML preprocessing complete`);
    log(`   Size: ${(finalContent.length / 1024).toFixed(1)} KB`);
    log(`   Lines: ${finalContent.split('\n').length}`);

    return finalContent;
  }

  /**
   * Extract frontmatter data from HTML header
   */
  _extractFrontmatterFromHTML(html, filename = '') {
    const fm = {
      title: '', description: '', lang: 'fa',
      publishDate: new Date().toISOString().split('T')[0],
      author: '', categories: [], tags: [], draft: true,
    };

    const headerMatch = html.match(
      /<header\s+class="page-header">([\s\S]*?)<\/header>/i
    );
    if (headerMatch) {
      const h = headerMatch[1];
      const h1 = h.match(/<h1>([\s\S]*?)<\/h1>/i);
      if (h1) fm.title = AstroMDXConverter.decodeHTMLEntities(
        h1[1].replace(/<[^>]*>/g, '').trim()
      );
      const sub = h.match(/class="subtitle"[^>]*>([\s\S]*?)<\/div>/i);
      if (sub) fm.description = AstroMDXConverter.decodeHTMLEntities(
        sub[1].replace(/<[^>]*>/g, '').trim()
      );
      const auth = h.match(/<strong>(.*?)<\/strong>/i);
      if (auth) fm.author = AstroMDXConverter.decodeHTMLEntities(auth[1].trim());
    }

    if (!fm.title && filename) {
      fm.title = filename.replace(/\.html?$/i, '').replace(/[-_]/g, ' ');
    }

    return fm;
  }

  /**
   * Convert <pre class="mermaid"> blocks to ```mermaid fences
   */
  _convertMermaidBlocks(html) {
    // Pattern: wrapper with title + pre.mermaid + caption
    let result = html.replace(
      /<div\s+class="diagram-wrapper">\s*(?:<(?:div|p)\s+class="diagram-title"[^>]*>([\s\S]*?)<\/(?:div|p)>\s*)?<pre\s+class="mermaid">([\s\S]*?)<\/pre>\s*(?:<(?:div|p|figcaption)\s+class="diagram-caption"[^>]*>([\s\S]*?)<\/(?:div|p|figcaption)>\s*)?<\/div>/gi,
      (_, rawTitle, rawMermaid, rawCaption) =>
        this._buildMermaidFence(rawTitle, rawMermaid, rawCaption)
    );

    // Bare <pre class="mermaid"> without wrapper
    result = result.replace(
      /<pre\s+class="mermaid">([\s\S]*?)<\/pre>/gi,
      (_, rawMermaid) => this._buildMermaidFence(null, rawMermaid, null)
    );

    return result;
  }

  _buildMermaidFence(rawTitle, rawMermaid, rawCaption) {
    let code = AstroMDXConverter.decodeHTMLEntities(rawMermaid.trim());
    code = code.split('\n').map(l => l.trimEnd()).join('\n').trim();

    const parts = [];
    if (rawTitle) {
      const t = AstroMDXConverter.decodeHTMLEntities(
        rawTitle.replace(/<[^>]*>/g, '').trim()
      );
      parts.push(`\n**${t}**\n`);
    }
    parts.push('```mermaid');
    parts.push(code);
    parts.push('```');
    if (rawCaption) {
      const c = AstroMDXConverter.decodeHTMLEntities(
        rawCaption.replace(/<[^>]*>/g, '').trim()
      );
      parts.push(`\n*${c}*`);
    }
    return '\n' + parts.join('\n') + '\n';
  }

  /**
   * Convert HTML headings to markdown
   */
  _convertHeadings(html) {
    let r = html;

    // <h2 class="section-title"><span class="num">N</span> Title</h2>
    r = r.replace(
      /<h2\s+class="section-title">\s*<span\s+class="num">(.*?)<\/span>\s*([\s\S]*?)\s*<\/h2>/gi,
      (_, num, title) => {
        const clean = AstroMDXConverter.decodeHTMLEntities(
          title.replace(/<[^>]*>/g, '').trim()
        );
        return `\n## ${num}. ${clean}\n`;
      }
    );

    // <h3 id="...">content</h3>
    r = r.replace(
      /<h3\s+(?:id="([^"]*)")?\s*>([\s\S]*?)<\/h3>/gi,
      (_, id, content) => {
        const clean = AstroMDXConverter.decodeHTMLEntities(
          content.replace(/<[^>]*>/g, '').trim()
        );
        return id ? `\n### ${clean} {#${id}}\n` : `\n### ${clean}\n`;
      }
    );

    return r;
  }

  /**
   * Decode entities selectively (skip mermaid code fences)
   */
  _decodeEntitiesSelective(content) {
    const lines = content.split('\n');
    let inMermaid = false;

    return lines.map(line => {
      if (line.trim() === '```mermaid') { inMermaid = true; return line; }
      if (inMermaid && line.trim() === '```') { inMermaid = false; return line; }
      if (inMermaid) return line;
      return AstroMDXConverter.decodeHTMLEntities(line);
    }).join('\n');
  }
  
  // ═══════════════════════════════════════════════
  // OPTION B: preprocessHTML returns body-only
  // Let existing pipeline handle frontmatter entirely
  // ═══════════════════════════════════════════════

  // In astro-mdx-converter.mjs, add this method:

  async preprocessHTMLToBody(htmlContent, options = {}) {
    // Same as preprocessHTML but returns ONLY the body
    // No frontmatter generation — that's the main pipeline's job

    let content = htmlContent;

    // All the same steps...
    content = this._extractBodyFromHTML(content);
    content = this._stripBoilerplate(content);
    content = this._stripComments(content);
    content = this._convertMermaidBlocks(content);
    content = this._collapseSplitTags(content);
    content = this._convertHeadings(content);
    content = this._fixSelfClosingTags(content);
    content = this._removeEmptyWrappers(content);
    content = this._mapCSSClasses(content);
    content = this._decodeEntitiesSelective(content);
    content = this._cleanWhitespace(content);

    // Extract metadata hints (for AI pipeline to use)
    const hints = this._extractMetadataHints(htmlContent);

    return {
      body: content,
      hints, // { title, description, author, lang }
    };
  }

  _extractMetadataHints(html) {
    const hints = {};
    const hm = html.match(
      /<header\s+class="page-header">([\s\S]*?)<\/header>/i
    );
    if (hm) {
      const h = hm[1];
      const h1 = h.match(/<h1>([\s\S]*?)<\/h1>/i);
      if (h1) hints.title = AstroMDXConverter.decodeHTMLEntities(
        h1[1].replace(/<[^>]*>/g, '').trim()
      );
      const sub = h.match(/class="subtitle"[^>]*>([\s\S]*?)<\/div>/i);
      if (sub) hints.description = AstroMDXConverter.decodeHTMLEntities(
        sub[1].replace(/<[^>]*>/g, '').trim()
      );
      const auth = h.match(/<strong>(.*?)<\/strong>/i);
      if (auth) hints.author = AstroMDXConverter.decodeHTMLEntities(
        auth[1].trim()
      );
    }

    // Detect language
    if (/[\u0600-\u06FF]/.test(hints.title || '')) hints.lang = 'fa';

    return hints;
  }
  /**
   * Auto-fix common frontmatter issues
   */
  autoFixFrontmatter(frontmatter) {
    const fixed = { ...frontmatter };

    // ۱. اضافه کردن required fields
    if (!fixed.title) {
      fixed.title = 'Untitled';
      this.stats.warnings.push('عنوان اضافه شد: Untitled');
    }

    if (!fixed.description) {
      fixed.description = 'No description provided';
      this.stats.warnings.push('توضیح اضافه شد');
    }

    if (!fixed.lang) {
      fixed.lang = 'fa';
      this.stats.warnings.push('زبان تنظیم شد: fa');
    }

    if (!fixed.publishDate) {
      fixed.publishDate = new Date();
      this.stats.warnings.push('تاریخ تنظیم شد: امروز');
    }

    if (!fixed.author) {
      fixed.author = 'Anonymous';
      this.stats.warnings.push('نویسنده تنظیم شد: Anonymous');
    }

    // ۲. تنظیم defaults برای optional fields
    fixed.tags = fixed.tags || [];
    fixed.categories = fixed.categories || [];
    fixed.interface = fixed.interface || 'descriptive-politics';
    fixed.draft = fixed.draft ?? true;

    return fixed;
  }

  /**
   * Process images in content
   */
  async processImages(content, sourceFile = '') {
    const images = this.imageOptimizer.extractImages(content);
    let result = content;

    for (const image of images) {
      try {
        // Validate image
        if (image.src.startsWith('http')) {
          // Skip external images
          continue;
        }

        const metadata = this.imageOptimizer.generateImageMetadata(
          image.src,
          { alt: image.alt }
        );

        // Generate MDX image reference
        let replacement;
        if (image.type === 'markdown') {
          replacement = `<img src="${metadata.src}" alt="${metadata.alt}" loading="lazy" />`;
        } else {
          replacement = image.fullMatch; // Keep HTML as-is
        }

        result = result.replace(image.fullMatch, replacement);
      } catch (error) {
        this.stats.warnings.push(
          `⚠️ تصویر پردازش نشد: ${image.src} - ${error.message}`
        );
      }
    }

    return result;
  }

  /**
   * Wrap tables with responsive container
   */
  processTablesWrapper(content) {
    // Pattern: GitHub-flavored markdown tables
    // | header | header |
    // | ------ | ------ |
    // | data   | data   |

    const tableRegex =
      /(?:^|\n)\|(?:.+\|)+\n(?:\|?(?:\s*:-*-*:\s*|:-*\s*|-*:\s*|\s*-*\s*)\|)+\n(?:\|(?:.+\|)+\n)*/gm;

    return content.replace(
      tableRegex,
      match =>
        `<div className="table-wrapper">\n\n${match}\n</div>\n`
    );
  }

  /**
   * Escape unsafe JSX/HTML
   */
  escapeJSXUnsafe(content) {
    // Only escape specific patterns that could break JSX
    let result = content;

    // Escape curly braces in code blocks (not in mermaid diagrams)
    result = result.replace(
      /```(?!mermaid)([\s\S]*?)```/g,
      (match, inner) => {
        return match.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
      }
    );

    return result;
  }

  /**
   * Generate final MDX content with proper formatting
   */
  generateMDX(frontmatter, body) {
    const fm = this.generateFrontmatter(frontmatter);
    const separator = '---';

    return `${separator}\n${fm}\n${separator}\n\n${body}`;
  }

  /**
   * Generate YAML frontmatter
   */
  generateFrontmatter(frontmatter) {
    const lines = [];

    // ترتیب مشخص برای frontmatter
    const order = [
      'title',
      'description',
      'lang',
      'publishDate',
      'author',
      'tags',
      'categories',
      'interface',
      'draft',
    ];

    for (const key of order) {
      if (!(key in frontmatter)) continue;

      const value = frontmatter[key];

      if (Array.isArray(value)) {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      } else if (typeof value === 'string') {
        // Quote if contains special characters
        if (value.includes(':') || value.includes('\n')) {
          lines.push(`${key}: |`);
          for (const line of value.split('\n')) {
            lines.push(`  ${line}`);
          }
        } else {
          lines.push(`${key}: "${value}"`);
        }
      } else if (value instanceof Date) {
        lines.push(`${key}: ${value.toISOString().split('T')[0]}`);
      } else if (typeof value === 'boolean') {
        lines.push(`${key}: ${value}`);
      } else {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      }
    }

    // Additional fields
    for (const key in frontmatter) {
      if (!order.includes(key)) {
        const value = frontmatter[key];
        if (typeof value === 'string') {
          lines.push(`${key}: "${value}"`);
        } else {
          lines.push(`${key}: ${JSON.stringify(value)}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Convert array of files
   */
  async convertFiles(filePaths, options = {}) {
    const results = [];

    for (const filePath of filePaths) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const result = await this.convert(content, { sourceFile: filePath });

        if (result.success) {
          console.log(`✅ ${filePath}`);
        } else {
          console.error(`❌ ${filePath}: ${result.error}`);
        }

        results.push({ filePath, ...result });
      } catch (error) {
        console.error(`❌ ${filePath}: ${error.message}`);
        results.push({ filePath, success: false, error: error.message });
      }
    }

    this.stats.processed = filePaths.length;
    return results;
  }

  /**
   * Get conversion stats
   */
  getStats() {
    return {
      ...this.stats,
      successRate: `${((this.stats.succeeded / this.stats.processed) * 100).toFixed(2)}%`,
    };
  }
}

export default AstroMDXConverter;
