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
