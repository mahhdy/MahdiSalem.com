#!/usr/bin/env node
/**
 * سیستم جامع پردازش محتوا - نسخه ۲.۱
 * با پشتیبانی از Mermaid
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let globby, matter, cheerio, TurndownService, gfm;
try {
    globby = (await import('globby')).globby;
    matter = (await import('gray-matter')).default;
    cheerio = await import('cheerio');
    TurndownService = (await import('turndown')).default;
    gfm = (await import('turndown-plugin-gfm')).gfm;
} catch (err) {
    console.error('❌ لطفاً وابستگی‌ها را نصب کنید: npm install');
    console.error(err);
    process.exit(1);
}

import { PreambleParser } from './lib/preamble-parser.mjs';
import { StyleGenerator } from './lib/style-generator.mjs';
import { SmartRenderer } from './lib/smart-renderer.mjs';
import { PDFExtractor, UniversalExtractor } from './lib/pdf-extractor.mjs';
import { AITagger } from './lib/ai-tagger.mjs';
import { MermaidProcessor } from './lib/mermaid-processor.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { removeAllHtmlComments } = require('./remove-html-comments.cjs');

// تلاش برای import ماژول ZIP (اختیاری)
let ZipExtractor, BookStructureProcessor;
try {
    const zipModule = await import('./lib/zip-extractor.mjs');
    ZipExtractor = zipModule.ZipExtractor;
    BookStructureProcessor = zipModule.BookStructureProcessor;
} catch {
    // ZIP پشتیبانی نمی‌شود
}

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    sourceDir: 'content-source',
    outputDir: 'src/content',
    cacheDir: '.content-cache',
    stylesDir: 'src/styles/book-themes',
    diagramsDir: 'public/diagrams',
    imagesDir: 'public/images/extracted',

    supportedFormats: {
        latex: ['.tex', '.ltx', '.TEX', '.LTX', '.TeX', '.LTX'],
        markdown: ['.md', '.mdx', '.MD', '.MDX', '.Md', '.MDx'],
        html: ['.html', '.htm', '.HTML', '.HTM'],
        pdf: ['.pdf', '.PDF', '.Pdf'],
        word: ['.docx', '.doc', '.DOCX', '.DOC', '.Docx', '.Doc'],
        zip: ['.zip', '.ZIP', '.Zip']
    },

    ai: {
        enabled: process.env.AI_ENABLED !== 'false',
        provider: process.env.AI_PROVIDER || 'openai'
    },

    mermaid: {
        renderMode: process.env.MERMAID_RENDER_MODE || 'client'
    }
};

// ═══════════════════════════════════════════════════════════════
// کلاس ContentPipeline
// ═══════════════════════════════════════════════════════════════

export class ContentPipeline {
    constructor(options = {}) {
        this.parser = new PreambleParser();
        this.styleGen = new StyleGenerator(CONFIG.stylesDir);
        this.renderer = new SmartRenderer({
            outputDir: CONFIG.diagramsDir,
            cacheDir: CONFIG.cacheDir
        });
        this.pdfExtractor = new PDFExtractor({ imageOutputDir: CONFIG.imagesDir });
        this.universalExtractor = new UniversalExtractor();

        // ⭐ پردازشگر Mermaid
        this.mermaidProcessor = new MermaidProcessor({
            outputDir: CONFIG.diagramsDir,
            renderMode: options.mermaidRenderMode || CONFIG.mermaid.renderMode
        });

        // AI
        this.aiEnabled = options.aiEnabled ?? CONFIG.ai.enabled;
        if (this.aiEnabled) {
            this.aiTagger = new AITagger({ provider: options.aiProvider || CONFIG.ai.provider });
        }

        // ZIP
        if (BookStructureProcessor) {
            this.bookStructureProcessor = new BookStructureProcessor(this);
        }

        this.configCache = new Map();
        this.stats = { latex: 0, markdown: 0, pdf: 0, word: 0, aiTagged: 0, errors: 0, skipped: 0 };
        this.hashes = {};
        this.hashFilePath = path.join(CONFIG.cacheDir, 'hashes.json');
        this.archiveDir = path.join(CONFIG.sourceDir, 'Archive');
    }

    async archiveProcessedFile(filePath) {
        try {
            const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const targetDir = path.join(this.archiveDir, date);
            await fs.mkdir(targetDir, { recursive: true });

            const fileName = path.basename(filePath);
            let targetPath = path.join(targetDir, fileName);

            // Handle duplicates by renaming
            if (await fs.access(targetPath).then(() => true).catch(() => false)) {
                const ext = path.extname(fileName);
                const name = path.basename(fileName, ext);
                const timestamp = Date.now();
                targetPath = path.join(targetDir, `${name}_${timestamp}${ext}`);
            }

            // Move the file
            await fs.rename(filePath, targetPath);
            console.log(`   📦 بایگانی: ${path.basename(targetPath)}`);
            return targetPath;
        } catch (error) {
            console.error(`   ⚠️ خطا در بایگانی ${path.basename(filePath)}: ${error.message}`);
            return null;
        }
    }

    async loadHashes() {
        try {
            const data = await fs.readFile(this.hashFilePath, 'utf-8');
            this.hashes = JSON.parse(data);
        } catch (error) {
            this.hashes = {};
        }
    }

    async saveHashes() {
        try {
            await fs.mkdir(CONFIG.cacheDir, { recursive: true });
            await fs.writeFile(this.hashFilePath, JSON.stringify(this.hashes, null, 2));
        } catch (error) {
            console.error('❌ خطا در ذخیره کش hash:', error.message);
        }
    }

    async getFileHash(filePath) {
        try {
            const content = await fs.readFile(filePath);
            return crypto.createHash('md5').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    async processFile(filePath, options = {}) {
        const ext = path.extname(filePath).toLowerCase();
        const { lang = this.detectLanguage(filePath) } = options;

        console.log(`\n📄 پردازش: ${path.basename(filePath)}`);

        try {
            let result;

            if (CONFIG.supportedFormats.latex.includes(ext)) {
                result = await this.processLaTeX(filePath, options);
                this.stats.latex++;
            } else if (CONFIG.supportedFormats.markdown.includes(ext)) {
                result = await this.processMarkdown(filePath, options);
                this.stats.markdown++;
            } else if (CONFIG.supportedFormats.html.includes(ext)) {
                result = await this.processHTML(filePath, options);
                this.stats.html = (this.stats.html || 0) + 1;
            } else if (CONFIG.supportedFormats.pdf.includes(ext)) {
                result = await this.processPDF(filePath, options);
                this.stats.pdf++;
            } else if (CONFIG.supportedFormats.word.includes(ext)) {
                result = await this.processWord(filePath, options);
                this.stats.word++;
            } else if (CONFIG.supportedFormats.zip.includes(ext)) {
                return this.processZipBook(filePath, options);
            } else {
                throw new Error(`فرمت پشتیبانی نمی‌شود: ${ext}`);
            }

            if (this.aiEnabled && result) {
                result = await this.enrichWithAI(result, lang);
                this.stats.aiTagged++;
            }

            return result;

        } catch (error) {
            this.stats.errors++;
            console.error(`   ❌ خطا: ${error.message}`);
            throw error;
        }
    }

    async processLaTeX(filePath, options = {}) {
        const { bookSlug, chapterNumber, config } = options;

        let content = await fs.readFile(filePath, 'utf-8');
        const finalConfig = config || await this.parser.getDefaultConfig();

        const prefix = bookSlug ? `${bookSlug}-ch${chapterNumber || 0}` : path.basename(filePath, '.tex');

        // پردازش TikZ
        content = await this.processAllDiagrams(content, finalConfig, prefix);

        // پیش‌پردازش
        content = this.preProcessLaTeX(content);

        // تبدیل با Pandoc
        let markdown = await this.convertWithPandoc(content);

        // ⭐ پردازش Mermaid
        markdown = await this.mermaidProcessor.process(markdown, { prefix });

        // پس‌پردازش نهایی
        markdown = this.postProcessMarkdown(markdown, finalConfig);

        const title = this.extractTitle(markdown) || path.basename(filePath, '.tex');

        return { type: 'latex', source: filePath, title, content: markdown, metadata: { bookSlug, chapterNumber } };
    }

    async processMarkdown(filePath, options = {}) {
        const content = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(content);

        const prefix = path.basename(filePath, path.extname(filePath));

        // ⭐ پردازش Mermaid
        const processedBody = await this.mermaidProcessor.process(body, { prefix });

        const title = frontmatter.title || this.extractTitle(processedBody) || path.basename(filePath, '.md');

        return { type: 'markdown', source: filePath, title, content: processedBody, frontmatter, metadata: {} };
    }

    async processPDF(filePath, options = {}) {
        console.log(`   📄 استخراج از PDF...`);
        const extracted = await this.pdfExtractor.toMarkdown(filePath, options);
        const title = extracted.metadata?.title || path.basename(filePath, '.pdf');

        return {
            type: 'pdf',
            source: filePath,
            title,
            content: extracted.markdown,
            pdfMetadata: extracted.metadata,
            metadata: {
                pdfOnly: true,
                showPdfViewer: true
            }
        };
    }

    async processWord(filePath, options = {}) {
        console.log(`   📝 استخراج از Word...`);
        const extracted = await this.universalExtractor.extract(filePath);
        const title = this.extractTitle(extracted.markdown) || path.basename(filePath, '.docx');

        return { type: 'word', source: filePath, title, content: extracted.markdown, metadata: {} };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔴 REPLACE the existing processHTML() with this version
    // This preserves rich HTML formatting instead of flattening to markdown
    // ═══════════════════════════════════════════════════════════════

    async processHTML(filePath, options = {}) {
        console.log(`   🌐 پردازش HTML (rich-preserve mode)...`);
        let content = await fs.readFile(filePath, 'utf-8');

        // ── Step 1: Extract metadata BEFORE stripping ──
        const $ = cheerio.load(content);

        // Title: from <header>, then <h1>, then <title>, then filename
        let title = '';
        const pageHeader = $('header.page-header');
        if (pageHeader.length) {
            title = pageHeader.find('h1').text().trim();
        }
        if (!title) title = $('h1').first().text().trim();
        if (!title) title = $('title').text().trim();
        if (!title) title = path.basename(filePath, path.extname(filePath));

        // Description: from header subtitle, then meta tag
        let description = '';
        const subtitle = pageHeader.find('.subtitle');
        if (subtitle.length) {
            description = subtitle.text().trim();
        }
        if (!description) {
            description = $('meta[name="description"]').attr('content') || '';
        }

        // Author: from header
        let author = '';
        const metaDiv = pageHeader.find('.meta strong');
        if (metaDiv.length) {
            author = metaDiv.first().text().trim();
        }

        // Detect language
        const htmlLang = $('html').attr('lang') || '';
        const lang = htmlLang || (this.hasPersianCharacters(title) ? 'fa' : 'en');

        // ── Step 2: Preprocess HTML body ──
        const processedBody = this._preprocessHTMLBody(content);

        // ── Step 3: Run MermaidProcessor on the result ──
        const prefix = path.basename(filePath, path.extname(filePath));
        const finalContent = await this.mermaidProcessor.process(processedBody, { prefix });

        console.log(`   ✅ HTML processed: ${title}`);

        return {
            type: 'html',
            source: filePath,
            title: this._decodeEntities(title),
            content: finalContent,
            metadata: {
                description: this._decodeEntities(description),
                author: this._decodeEntities(author),
                lang,
            }
        };
    }
    // ═══════════════════════════════════════════════════════════════
    // 🟢 NEW: HTML Body Preprocessor — rich formatting preserved
    // Add this right after processHTML()
    // ═══════════════════════════════════════════════════════════════

    _preprocessHTMLBody(html) {
        let c = html;

        // 1. Extract <body> if full document
        const bodyMatch = c.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyMatch) c = bodyMatch[1];

        // 2. Strip boilerplate
        c = c.replace(/<header\s+class="page-header">[\s\S]*?<\/header>/gi, '');
        c = c.replace(/<footer[\s\S]*?<\/footer>/gi, '');
        c = c.replace(/<style[\s\S]*?<\/style>/gi, '');
        c = c.replace(/<script[\s\S]*?<\/script>/gi, '');
        c = c.replace(/<main[^>]*>/gi, '');
        c = c.replace(/<\/main>/gi, '');

        // 3. Strip ALL comments
        c = removeAllHtmlComments(c);
        // Also strip CSS comments in inline styles
        c = c.replace(
            /style="([^"]*)"/gi,
            (match, styleContent) => {
                const cleaned = styleContent.replace(/\/\*[\s\S]*?\*\//g, '');
                return `style="${cleaned}"`;
            }
        );

        // 4. Convert Mermaid <pre> blocks → ```mermaid fences
        //    (MUST happen before entity decoding!)
        c = this._convertMermaidPreBlocks(c);

        // 5. Collapse split/broken OPENING TAG attributes (multi-line attr → one line)
        c = c.replace(
            /<(\w+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))?)*)\s*>/g,
            (match) => match.replace(/\s*\n\s*/g, ' ')
        );

        // 5b. Universal line-balancer: join lines until every opened HTML tag is closed.
        //     MDX's strict parser fails when a tag opens on one line and its content
        //     or closing tag appears on the next — it treats the gap as a paragraph.
        //     We scan line-by-line, count net open tags, and join subsequent lines
        //     until the tag depth returns to zero. Works for ANY tag, no hardcoded list.
        c = this._balanceHTMLLines(c);

        // 6. Convert headings (produces HTML id= anchors, not {#id} markdown)
        c = this._convertHTMLHeadings(c);

        // 7. Fix self-closing tags for MDX compatibility
        c = c.replace(/<br\s*>/gi, '<br/>');
        c = c.replace(/<br\s+\/>/gi, '<br/>');
        c = c.replace(/<hr\s*>/gi, '<hr/>');
        c = c.replace(/<hr\s+\/>/gi, '<hr/>');
        // Fix img: add self-close slash if missing (careful: avoid double-slashing)
        c = c.replace(/<img(\s[^>]*?)(?<!\/)(\s*)>/gi, '<img$1/>');

        // 8. Remove empty wrapper divs (iterative until stable)
        let prev;
        do {
            prev = c;
            c = c.replace(/<div[^>]*>\s*<\/div>/gi, '');
            c = c.replace(
                /<div>\s*(<(?:div|section|table|article|nav|details)[\s>][\s\S]*?<\/(?:div|section|table|article|nav|details)>)\s*<\/div>/gi,
                '$1'
            );
        } while (c !== prev);

        // 9. Map CSS classes to site equivalents
        c = this._mapHTMLClasses(c);

        // 10. Decode HTML entities (selective — skip mermaid fences)
        c = this._decodeEntitiesSelective(c);

        // 11. Clean whitespace
        c = c.replace(/\n{4,}/g, '\n\n\n');
        c = c.split('\n').map(l => l.trimEnd()).join('\n');
        c = c.trim() + '\n';

        // 12. Compact HTML blocks — remove blank lines WITHIN HTML block contexts.
        //     MDX uses blank lines to switch between HTML-block and markdown mode.
        //     A blank line inside <details>, <nav>, <table>, <section> etc. makes
        //     MDX exit HTML mode mid-block, breaking nested tag parsing.
        c = this._compactHTMLBlocks(c);

        return c;
    }

    // ─── Remove blank lines within PURE-HTML block contexts for MDX ───
    // MDX spec: a blank line terminates an HTML block. This matters only
    // for containers that MDX parses as fully literal HTML — specifically
    // list/table/details/nav structures. Layout wrappers (section, div)
    // intentionally excluded because they can contain markdown content.
    _compactHTMLBlocks(html) {
        // Pass 1: Flatten all <li>...</li> blocks onto single lines.
        // MDX parses HTML with a JSX-like parser that requires <li> closing tags
        // before any block-level children appear on a new line. Flattening
        // prevents the "Expected closing tag for <li>" error.
        html = this._flattenListItems(html);

        // Only seal tags whose entire content is HTML (no markdown inside)
        const SEAL_TAGS = 'details|nav|ul|ol|li|table|thead|tbody|tfoot|tr|th|td|caption|colgroup|col|select|optgroup|option|datalist|dialog|fieldset|figure|figcaption';

        const openPat = new RegExp(`<(?:${SEAL_TAGS})(?:\\s[^>]*)?>`, 'g');
        const closePat = new RegExp(`</(?:${SEAL_TAGS})>`, 'g');

        // Marker for lines that are markdown — we never suppress blanks before these
        const isMdLine = (s) => /^(?:```|#{1,6}\s|>\s|\*\*|\*[^\s]|[-*+]\s|\d+\.\s|---|\|)/.test(s);

        const lines = html.split('\n');
        const out = [];
        let depth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Count opens & closes contributed by this line
            const opens = (line.match(openPat) || []).length;
            const closes = (line.match(closePat) || []).length;

            if (depth > 0 && trimmed === '') {
                // Peek ahead: if the NEXT non-blank line is markdown, keep the blank
                let nextNonBlank = '';
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim()) { nextNonBlank = lines[j].trim(); break; }
                }
                if (isMdLine(nextNonBlank)) {
                    // Preserve blank — the following markdown needs breathing room
                    out.push(line);
                }
                // Otherwise suppress blank (stay in HTML-block mode)
                depth = Math.max(0, depth + opens - closes);
                continue;
            }

            out.push(line);
            depth = Math.max(0, depth + opens - closes);
        }

        return out.join('\n');
    }

    // ─── Universal HTML line balancer (leaf-level only) ───
    // Counts net open HTML tags per line. If unbalanced, joins subsequent lines.
    // IMPORTANT: Only operates on LEAF-LEVEL tags — those that should never
    // contain block-level content or markdown. Skips layout containers (div,
    // section, article) since those legitimately span many lines with markdown.
    _balanceHTMLLines(html) {
        // Tags where multi-line content breaks MDX parsing
        const LEAF_TAGS = new Set([
            'p', 'summary', 'caption', 'dt', 'dd', 'label', 'button',
            'option', 'figcaption', 'legend', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            // Table row/cell elements
            'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
            // Definition list
            'li'
        ]);

        // Void elements — never need a closing tag
        const VOID = new Set([
            'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
            'link', 'meta', 'param', 'source', 'track', 'wbr'
        ]);

        // Count net LEAF open tags on a single line
        const netLeafTags = (line) => {
            let opens = 0;
            let closes = 0;
            // Opening non-void, non-self-closing tags that are in LEAF_TAGS
            for (const m of line.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?>(?!\/)/g)) {
                const tag = m[1].toLowerCase();
                if (LEAF_TAGS.has(tag) && !VOID.has(tag)) opens++;
            }
            // Closing tags that are in LEAF_TAGS
            for (const m of line.matchAll(/<\/([a-zA-Z][a-zA-Z0-9]*)>/g)) {
                const tag = m[1].toLowerCase();
                if (LEAF_TAGS.has(tag)) closes++;
            }
            return opens - closes;
        };

        const isMdOnlyLine = (s) =>
            /^(?:```|#{1,6}\s|\*\*|\*[^\s*]|>\s|[-*+]\s|\d+\.\s|---$|\|)/.test(s);

        const lines = html.split('\n');
        const out = [];
        let inMermaid = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Track mermaid fences — don't touch content inside
            if (trimmed.startsWith('```')) {
                inMermaid = !inMermaid;
                out.push(line);
                continue;
            }
            if (inMermaid || trimmed === '' || isMdOnlyLine(trimmed)) {
                out.push(line);
                continue;
            }

            // Count net LEAF tags on this line
            let net = netLeafTags(line);

            if (net <= 0) {
                // Balanced or more closes (fine, just emit)
                out.push(line);
                continue;
            }

            // Line has unbalanced opens — absorb subsequent lines until balanced.
            // STOP at: blank lines, code fence boundaries, pure-markdown lines.
            const merged = [line];
            while (net > 0 && i + 1 < lines.length) {
                const peek = lines[i + 1];
                const peekTrimmed = peek.trim();

                // Hard stops — never absorb past these boundaries
                if (peekTrimmed === '' || peekTrimmed.startsWith('```') || isMdOnlyLine(peekTrimmed)) {
                    break;  // emit what we have and stop merging
                }

                i++;
                merged.push(peekTrimmed);
                net += netLeafTags(peek);
            }
            out.push(merged.join(' ').replace(/\s{2,}/g, ' '));

        }

        return out.join('\n');
    }

    // ─── Flatten <li>...</li> blocks to single lines ───
    // Scans line by line, joining all content within <li>...</li> onto one line.
    // Handles nested <li> correctly by counting depth.
    _flattenListItems(html) {
        const lines = html.split('\n');
        const out = [];
        let liDepth = 0;      // current <li> nesting depth
        let liBuffer = [];     // lines collected for the current <li>

        const countTag = (line, tag) => {
            const opens = (line.match(new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'gi')) || []).length;
            const closes = (line.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
            return opens - closes;
        };

        for (const line of lines) {
            const liDelta = countTag(line, 'li');

            if (liDepth === 0 && liDelta > 0) {
                // Opening a new top-level <li> — start buffering
                liBuffer = [line];
                liDepth += liDelta;
            } else if (liDepth > 0) {
                liBuffer.push(line);
                liDepth = Math.max(0, liDepth + liDelta);

                if (liDepth === 0) {
                    // Closing the last open <li> — flush buffer as one line
                    out.push(liBuffer.map(l => l.trim()).join(' ').replace(/\s+/g, ' '));
                    liBuffer = [];
                }
            } else {
                out.push(line);
            }
        }

        // Flush any unclosed buffer
        if (liBuffer.length) out.push(liBuffer.map(l => l.trim()).join(' '));

        return out.join('\n');
    }
    // ─── Convert <pre class="mermaid"> → ```mermaid ───
    _convertMermaidPreBlocks(html) {
        // Pattern 1: Full wrapper with title + pre.mermaid + caption
        let r = html.replace(
            /<div\s+class="diagram-wrapper">\s*(?:<(?:div|p)\s+class="diagram-title"[^>]*>([\s\S]*?)<\/(?:div|p)>\s*)?<pre\s+class="mermaid">([\s\S]*?)<\/pre>\s*(?:<(?:div|p|figcaption)\s+class="diagram-caption"[^>]*>([\s\S]*?)<\/(?:div|p|figcaption)>\s*)?<\/div>/gi,
            (_, rawTitle, rawMermaid, rawCaption) =>
                this._buildMermaidFence(rawTitle, rawMermaid, rawCaption)
        );

        // Pattern 2: Bare <pre class="mermaid"> without wrapper
        r = r.replace(
            /<pre\s+class="mermaid">([\s\S]*?)<\/pre>/gi,
            (_, rawMermaid) => this._buildMermaidFence(null, rawMermaid, null)
        );

        return r;
    }

    _buildMermaidFence(rawTitle, rawMermaid, rawCaption) {
        // Decode entities INSIDE mermaid content
        let code = this._decodeEntities(rawMermaid.trim());

        // Strip :::className (mindmap)
        code = code.replace(/:::[\w-]+/g, '');

        // Fix = in mindmap text
        code = code.replace(/^(\s{2,}\S.*?)\s+=\s+(.*)$/gm, '\$1 as \$2');

        // Fix comma before year in mindmap
        code = code.replace(/^(\s{2,}.*),\s+(\d{4})\s*$/gm, '\$1 \$2');

        // Fix \n → <br/> in flowchart nodes
        code = code.replace(/$$"([^"]*?)"$$/g, m => m.replace(/\\n/g, '<br/>'));
        code = code.replace(/$$([^$$"]*?\\n[^\]]*?)\]/g, m => m.replace(/\\n/g, '<br/>'));

        // Clean whitespace
        code = code.split('\n').map(l => l.trimEnd()).join('\n').trim();

        const parts = [];

        if (rawTitle) {
            const t = this._decodeEntities(rawTitle.replace(/<[^>]*>/g, '').trim());
            parts.push(`\n**${t}**\n`);
        }

        parts.push('```mermaid');
        parts.push(code);
        parts.push('```');

        if (rawCaption) {
            const cap = this._decodeEntities(rawCaption.replace(/<[^>]*>/g, '').trim());
            parts.push(`\n*${cap}*`);
        }

        return '\n' + parts.join('\n') + '\n';
    }

    // ─── Convert HTML headings → H tags with id= (MDX-safe) ───
    _convertHTMLHeadings(html) {
        let r = html;

        // Helper: strip tags, normalize whitespace, decode entities
        const cleanHeadingText = (raw) =>
            this._decodeEntities(
                raw.replace(/<[^>]*>/g, ' ')   // replace tags with space (not empty) to preserve word boundaries
                    .replace(/\s+/g, ' ')        // collapse all whitespace incl. newlines
                    .trim()
            );

        // <h2 class="section-title"><span class="num">N</span> Title</h2>
        // → ## N. Title  (no id needed, section already has id)
        r = r.replace(
            /<h2\s+class="section-title">\s*<span\s+class="num">(.*?)<\/span>\s*([\s\S]*?)\s*<\/h2>/gi,
            (_, num, title) => {
                const numClean = cleanHeadingText(num);
                const clean = cleanHeadingText(title);
                return `\n## ${numClean}. ${clean}\n`;
            }
        );

        // <h2 id="..."> (without section-title class) — keep as HTML to avoid breaking nav/details
        r = r.replace(
            /<h2(\s[^>]*)?>([\\s\\S]*?)<\/h2>/gi,
            (match, attrs, content) => {
                // Already replaced section-title h2s above; skip those (they become ## markdown)
                if (attrs && /class\s*=\s*["'][^"']*section-title[^"']*["']/i.test(attrs)) return match;
                const idMatch = attrs ? attrs.match(/id="([^"]*)"/) : null;
                const clean = cleanHeadingText(content);
                if (!clean) return '';
                // Keep as HTML h2 — safe in all contexts (nav, details, section...)
                return idMatch
                    ? `\n<h2 id="${idMatch[1]}">${clean}</h2>\n`
                    : `\n<h2>${clean}</h2>\n`;
            }
        );

        // <h3 ...>content</h3> → <h3 id="...">content</h3> (keep as HTML for MDX anchor support)
        r = r.replace(
            /<h3((?:\s+[^>]*?)?)>([\s\S]*?)<\/h3>/gi,
            (_, attrs, content) => {
                const idMatch = attrs.match(/id="([^"]*)"/i);
                const clean = cleanHeadingText(content);
                if (!clean) return '';
                if (idMatch) {
                    // Keep as HTML element so the id= attribute is preserved correctly in MDX
                    return `\n<h3 id="${idMatch[1]}">${clean}</h3>\n`;
                }
                return `\n### ${clean}\n`;
            }
        );

        // <h4>content</h4> → #### content
        r = r.replace(
            /<h4((?:\s+[^>]*)?)>([\s\S]*?)<\/h4>/gi,
            (_, attrs, content) => {
                const idMatch = attrs.match(/id="([^"]*)"/i);
                const clean = cleanHeadingText(content);
                if (!clean) return '';
                return idMatch
                    ? `\n<h4 id="${idMatch[1]}">${clean}</h4>\n`
                    : `\n#### ${clean}\n`;
            }
        );

        return r;
    }

    // ─── Map HTML classes to site CSS equivalents ───
    _mapHTMLClasses(html) {
        let r = html;

        // Adjust these mappings to match YOUR global.css!
        const classMap = {
            'card accent-right': 'card right',
            'card accent-primary': 'card primary',
            'card accent-green': 'card accent',
            'card accent-gold': 'card gold',
        };

        for (const [from, to] of Object.entries(classMap)) {
            r = r.replaceAll(`class="${from}"`, `class="${to}"`);
        }

        // Wave cards → card (preserve border style)
        r = r.replace(/<div\s+class="wave-card"/gi, '<div class="card"');

        // Remove wave-num (heading already has the number)
        r = r.replace(/<div\s+class="wave-num"[^>]*>.*?<\/div>/gi, '');

        return r;
    }

    // ─── HTML Entity Decoder ───
    static _ENTITY_MAP = {
        '&hellip;': '…', '&mdash;': '—', '&ndash;': '–', '&laquo;': '«', '&raquo;': '»',
        '&bull;': '•', '&middot;': '·', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
        '&lsquo;': '\u2018', '&rsquo;': '\u2019',
        '&nbsp;': '\u00A0', '&zwnj;': '\u200C', '&zwj;': '\u200D',
        '&thinsp;': '\u2009', '&ensp;': '\u2002', '&emsp;': '\u2003',
        '&rarr;': '→', '&larr;': '←', '&darr;': '↓', '&uarr;': '↑', '&harr;': '↔',
        '&eacute;': 'é', '&Eacute;': 'É', '&egrave;': 'è', '&Egrave;': 'È',
        '&ecirc;': 'ê', '&Ecirc;': 'Ê', '&euml;': 'ë',
        '&aacute;': 'á', '&agrave;': 'à', '&acirc;': 'â', '&auml;': 'ä', '&Auml;': 'Ä',
        '&ouml;': 'ö', '&Ouml;': 'Ö', '&uuml;': 'ü', '&Uuml;': 'Ü',
        '&icirc;': 'î', '&ccedil;': 'ç', '&scaron;': 'š', '&szlig;': 'ß',
        '&oslash;': 'ø', '&Oslash;': 'Ø', '&aring;': 'å', '&Aring;': 'Å',
        '&aelig;': 'æ', '&AElig;': 'Æ', '&ntilde;': 'ñ',
        '&times;': '×', '&divide;': '÷', '&copy;': '©', '&reg;': '®',
        '&trade;': '™', '&deg;': '°', '&para;': '¶', '&sect;': '§',
    };

    _decodeEntities(text) {
        if (!text) return '';
        let r = text;

        for (const [entity, char] of Object.entries(ContentPipeline._ENTITY_MAP)) {
            r = r.replaceAll(entity, char);
        }

        // Numeric decimal: &#128214;
        r = r.replace(/&#(\d+);/g, (_, c) => {
            try { return String.fromCodePoint(parseInt(c, 10)); }
            catch { return `&#${c};`; }
        });

        // Numeric hex: &#x02BB;
        r = r.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
            try { return String.fromCodePoint(parseInt(h, 16)); }
            catch { return `&#x${h};`; }
        });

        // &amp; last (avoid creating new entities)
        r = r.replace(/&amp;(?!#?\w+;)/g, '&');

        return r;
    }

    // ─── Decode entities but skip inside mermaid code fences ───
    _decodeEntitiesSelective(content) {
        let inMermaid = false;
        return content.split('\n').map(line => {
            if (line.trim() === '```mermaid') { inMermaid = true; return line; }
            if (inMermaid && line.trim() === '```') { inMermaid = false; return line; }
            if (inMermaid) return line; // Already decoded in _buildMermaidFence
            return this._decodeEntities(line);
        }).join('\n');
    }
    /*
    async processHTML(filePath, options = {}) {
        console.log(`   🌐 پردازش HTML...`);
        let content = await fs.readFile(filePath, 'utf-8');

        // FIRST: Remove ALL HTML comments using the robust function
        content = removeAllHtmlComments(content);

        // Parse HTML for metadata
        const $ = cheerio.load(content);

        // Extract metadata from HTML
        const title = $('title').text() ||
            $('h1').first().text() ||
            path.basename(filePath, path.extname(filePath));
        const description = $('meta[name="description"]').attr('content') || '';

        // Extract body content
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let bodyContent = bodyMatch ? bodyMatch[1] : content;

        // Clean up: remove external scripts and style tags
        const $body = cheerio.load(bodyContent);
        $body('script[src]').remove(); // Remove external scripts
        $body('link[rel="stylesheet"]').remove(); // Remove external stylesheets

        // Remove first <h1> to avoid duplication with ArticleLayout title
        $body('h1').first().remove();

        // Remove subtitle and meta paragraphs if they exist right after h1
        $body('.subtitle, .meta').remove();

        // Get the cleaned HTML
        bodyContent = $body.html() || '';

        // Convert HTML cleanly to MDX using Turndown
        const turndownService = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '*'
        });

        // Enable GitHub Flavored Markdown (tables, strikethrough, etc.)
        turndownService.use(gfm);

        // Custom rule to retain/convert mermaid diagrams
        turndownService.addRule('mermaid', {
            filter: function (node, options) {
                return (
                    (node.nodeName === 'PRE' || node.nodeName === 'DIV') &&
                    ((node.classList && node.classList.contains('mermaid')) ||
                        (node.className && typeof node.className === 'string' && node.className.includes('mermaid')))
                );
            },
            replacement: function (content, node) {
                // If it contains a code tag, unwrap it. Sometimes <pre><code class="mermaid">...
                let cleanCode = node.textContent || '';
                cleanCode = cleanCode.replace(/<[^>]*>/g, '').trim();
                return '\n\n```mermaid\n' + cleanCode + '\n```\n\n';
            }
        });

        // Convert body content to Markdown
        let markdownContent = turndownService.turndown(bodyContent);

        const prefix = path.basename(filePath, path.extname(filePath));

        // Process Mermaid diagrams explicitly using our mermaid processor if needed
        const processedContent = await this.mermaidProcessor.process(markdownContent, { prefix });

        return {
            type: 'html',
            source: filePath,
            title,
            content: processedContent,
            metadata: { description }
        };
    }
    */
    async processZipBook(zipPath, options = {}) {
        if (!this.bookStructureProcessor) {
            throw new Error('پشتیبانی ZIP نصب نشده. npm install adm-zip');
        }
        return this.bookStructureProcessor.processFromZip(zipPath, options);
    }

    async enrichWithAI(result, lang = 'fa') {
        if (!this.aiTagger) return result;
        console.log(`   🤖 تحلیل AI...`);
        const aiResult = await this.aiTagger.analyze(result.content, { title: result.title, lang });
        return { ...result, ai: aiResult };
    }

    async processAllDiagrams(content, config, prefix) {
        const tikzRegex = /\\begin\{tikzpicture\}($$[\s\S]*?$$)?([\s\S]*?)\\end\{tikzpicture\}/g;
        const matches = [...content.matchAll(tikzRegex)];

        if (matches.length > 0) console.log(`   📊 نمودارهای TikZ: ${matches.length}`);

        let counter = 0;
        for (const match of matches) {
            counter++;
            const tikzCode = match[0];
            const name = `${prefix}-tikz-${counter}`;

            const result = await this.renderer.render(tikzCode, config, { name });

            if (result.success) {
                const relativePath = `/diagrams/${path.basename(result.path)}`;
                content = content.replace(tikzCode, `\n\n![نمودار ${counter}](${relativePath}){.tikz-diagram}\n\n`);
            } else {
                content = content.replace(tikzCode, `\n\n{/* TIKZ_ERROR: ${name} */}\n\n`);
            }
        }

        return content;
    }

    preProcessLaTeX(content) {
        return content
            .replace(/\\begin\{tcolorbox\}$$([^$$]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g,
                (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`)
            .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '')
            .replace(/\\setcounter\{[^}]*\}\{[^}]*\}/g, '');
    }

    async convertWithPandoc(content) {
        const tempDir = path.join(CONFIG.cacheDir, 'temp');
        await fs.mkdir(tempDir, { recursive: true });

        const timestamp = Date.now();
        const inputFile = path.join(tempDir, `input-${timestamp}.tex`);
        const outputFile = path.join(tempDir, `output-${timestamp}.md`);

        await fs.writeFile(inputFile, content, 'utf-8');
        try {
            await execAsync(`pandoc "${inputFile}" -o "${outputFile}" --wrap=none --columns=1000`, { timeout: 60000 });
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('not recognized')) {
                throw new Error('Pandoc is NOT installed on this system. Please install Pandoc (https://pandoc.org/) to convert LaTeX files.');
            }
            throw error;
        }

        const result = await fs.readFile(outputFile, 'utf-8');

        await fs.unlink(inputFile).catch(() => { });
        await fs.unlink(outputFile).catch(() => { });

        return result;
    }

    postProcessMarkdown(markdown, config = {}) {
        let result = markdown;

        // 0. Remove all HTML comments (MDX doesn't like them)
        result = removeAllHtmlComments(result);

        // 1. Remove Pandoc's header and link attributes: {#id .class} or {reference-type="..."}
        // These crash MDX because it tries to parse them as JSX
        result = result.replace(/\{#[\S]+\s+\.[^}]+\}/g, '');
        result = result.replace(/\{#[\S]+\}/g, '');
        result = result.replace(/\{[\w-]+="[^"]*"\s*[^}]*\}/g, ''); // Handles {key="value"}
        result = result.replace(/\{reference-type=[^}]+\}/g, ''); // Specific handle for refs


        // 2. Convert Pandoc's container blocks: ::: class ... :::
        result = result.replace(/^:{3,}\s*([\w-]+)\s*$/gm, '<div class="$1">');
        result = result.replace(/^:{3,}\s*$/gm, '</div>');

        // 3. Convert Pandoc's span attributes: [text]{style="color: NAME"}
        result = result.replace(/\[([^\]]+)\]\{style="color: ([^"]+)"\}/g, (match, text, colorName) => {
            const kebabColor = colorName.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[_\s]+/g, '-').toLowerCase();
            const colorExpr = (config.colors && config.colors[colorName]) ? `var(--color-${kebabColor})` : colorName;
            return `<span style="color: ${colorExpr}">${text}</span>`;
        });

        return result
            // Clean up TikZ artifacts
            .replace(/\$\$node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
            .replace(/\\node[\s\S]*?;/g, '')
            .replace(/\\draw[\s\S]*?;/g, '')
            .replace(/\[.*?$$\s*\(.*?\)\s*\{[\s\S]*?\};?/g, '')
            // Clean up extra newlines
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    escapeForMDX(content) {
        if (!content) return '';
        let result = content;

        // ─── Step 1: Protect code/mermaid fences ───────────────────────
        const codeBlocks = [];
        result = result.replace(/```[\s\S]*?```/g, match => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // ─── Step 2: Protect HTML tags (complete tags including attributes) ───
        // Use a more robust matcher that handles multiline attributes
        const htmlTags = [];
        result = result.replace(/<(?:[a-zA-Z][a-zA-Z0-9]*|\/?[a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, match => {
            htmlTags.push(match);
            return `__HTML_TAG_${htmlTags.length - 1}__`;
        });

        // ─── Step 3: Protect MDX-safe curly-brace patterns ───────────────
        const safePatterns = [];

        // 3a. Protect markdown heading anchor {#id} (MDX remark-slug syntax)
        result = result.replace(/\{#[\w-]+\}/g, match => {
            safePatterns.push(match);
            return `__SAFE_PAT_${safePatterns.length - 1}__`;
        });

        // 3b. Protect var(--css-var) references
        result = result.replace(/var\(--[\w-]+(?:\s*,\s*[^)]+)?\)/g, match => {
            safePatterns.push(match);
            return `__SAFE_PAT_${safePatterns.length - 1}__`;
        });

        // 3c. Protect numeric/hex HTML entities (already-escaped, must not be double-escaped)
        result = result.replace(/&#(?:\d+|x[0-9a-fA-F]+);/g, match => {
            safePatterns.push(match);
            return `__SAFE_PAT_${safePatterns.length - 1}__`;
        });

        // ─── Step 4: Escape bare { and } that remain ────────────────────
        result = result.replace(/\{/g, '&#123;');
        result = result.replace(/\}/g, '&#125;');

        // ─── Step 5: Escape dangerous backslash sequences ───────────────
        result = result.replace(/\\([uxUX])/g, '&#92;$1');

        // ─── Step 6: Restore all protected tokens (reverse order) ────────
        result = result.replace(/__SAFE_PAT_(\d+)__/g, (_, idx) => safePatterns[+idx]);
        result = result.replace(/__HTML_TAG_(\d+)__/g, (_, idx) => htmlTags[+idx]);
        result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[+idx]);

        return result;
    }

    extractTitle(content) {
        const match = content.match(/^#\s+(.+)$/m);
        return match ? match[1].trim() : null;
    }

    hasPersianCharacters(text) {
        if (!text) return false;
        const persianRegex = /[\u0600-\u06FF]/;
        return persianRegex.test(text);
    }

    detectLanguage(filePath, content = null) {
        // First priority: explicit path indicators
        if (filePath.includes('/en/') || filePath.includes('\\en\\')) return 'en';
        if (filePath.includes('/fa/') || filePath.includes('\\fa\\')) return 'fa';

        // Second priority: content heuristic (if content provided or file can be read)
        if (content && this.hasPersianCharacters(content)) return 'fa';

        // Default to 'fa' for this project as requested, or 'en' if preferred.
        // But let's try reading a bit of the file if content wasn't provided.
        return 'fa';
    }

    buildFrontmatter(result) {
        // Start with existing frontmatter (for MDX files) or empty object
        const existing = result.frontmatter || {};

        // Determine language
        const lang = existing.lang || result.metadata?.lang || 'fa';

        // Default author based on language
        const defaultAuthor = lang === 'en' ? 'Mahdi Salem' : 'مهدی سالم';

        // Build base frontmatter with existing values taking priority
        const fm = {
            title: existing.title || result.title,
            description: existing.description || result.ai?.description || result.ai?.summary?.slice(0, 160) || result.metadata?.description || '',
            lang: lang,
            publishDate: existing.publishDate || existing.date || new Date().toISOString().split('T')[0],
            author: existing.author || result.metadata?.author || defaultAuthor,
            sourceType: existing.sourceType || result.type,
            interface: existing.interface || (result.metadata?.bookSlug ? 'iran' : undefined)
        };

        // Preserve all existing frontmatter fields to avoid data loss
        for (const [key, value] of Object.entries(existing)) {
            if (!fm.hasOwnProperty(key)) {
                fm[key] = value;
            }
        }

        // Add AI-generated fields only if not already present
        if (result.ai) {
            if (!fm.tags && result.ai.tags?.length) fm.tags = result.ai.tags;
            if (!fm.category && result.ai.category?.primary) fm.category = result.ai.category.primary;
            if (!fm.keywords && result.ai.keywords?.length) fm.keywords = result.ai.keywords;
            if (!existing.readingTime && result.ai.readingTime) fm.readingTime = result.ai.readingTime;
            if (!existing.difficulty && result.ai.difficulty) fm.difficulty = result.ai.difficulty;
            if (!existing.summary && result.ai.summary) fm.summary = result.ai.summary;
        }

        // Add book metadata
        if (result.metadata?.bookSlug) fm.book = result.metadata.bookSlug;
        if (result.metadata?.chapterNumber) fm.chapterNumber = result.metadata.chapterNumber;

        // Add PDF metadata
        if (result.metadata?.pdfUrl || result.pdfUrl) fm.pdfUrl = result.metadata?.pdfUrl || result.pdfUrl;
        if (result.metadata?.pdfOnly || result.pdfOnly) fm.pdfOnly = result.metadata?.pdfOnly || result.pdfOnly;
        if (result.metadata?.showPdfViewer || result.showPdfViewer) fm.showPdfViewer = result.metadata?.showPdfViewer || result.showPdfViewer;

        // Preserve manual overrides from existing frontmatter
        if (existing.pdfUrl) fm.pdfUrl = existing.pdfUrl;
        if (existing.pdfOnly !== undefined) fm.pdfOnly = existing.pdfOnly;
        if (existing.showPdfViewer !== undefined) fm.showPdfViewer = existing.showPdfViewer;

        return fm;
    }

    stringifyYaml(obj) {
        const lines = [];
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === null) continue;
            if (Array.isArray(value)) {
                lines.push(`${key}:`);
                value.forEach(item => lines.push(`  - "${String(item).replace(/"/g, '\\"')}"`));
            } else if (value instanceof Date) {
                lines.push(`${key}: ${value.toISOString().split('T')[0]}`);
            } else if (typeof value === 'string') {
                lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
            } else {
                lines.push(`${key}: ${value}`);
            }
        }
        return lines.join('\n');
    }

    async saveResult(result, outputDir, customFileName = null) {
        await fs.mkdir(outputDir, { recursive: true });

        // Handle PDF source (copy to public)
        if (result.type === 'pdf') {
            const pdfName = path.basename(result.source);
            // Determine subfolder based on outputDir (books or articles)
            const typeDir = outputDir.includes('books') ? 'books' : 'articles';
            const pubDocsDir = path.join(process.cwd(), 'public', 'documents', typeDir);
            await fs.mkdir(pubDocsDir, { recursive: true });

            const pdfDest = path.join(pubDocsDir, pdfName);
            await fs.copyFile(result.source, pdfDest);

            result.pdfUrl = `/documents/${typeDir}/${pdfName}`;
            result.showPdfViewer = true;
            result.pdfOnly = true;
        }

        const frontmatter = this.buildFrontmatter(result);

        // Escape content to prevent MDX build failures
        const escapedContent = this.escapeForMDX(result.content);
        const finalContent = `---\n${this.stringifyYaml(frontmatter)}\n---\n\n${escapedContent}`;

        const baseName = customFileName || path.basename(result.source, path.extname(result.source));

        // Default to .mdx extension for all content files
        const extension = '.mdx';
        const outputPath = path.join(outputDir, `${baseName}${extension}`);

        await fs.writeFile(outputPath, finalContent, 'utf-8');
        console.log(`   💾 ذخیره: ${path.basename(outputPath)}`);

        return outputPath;
    }

    async findChapters(bookDir) {
        const patterns = [
            path.join(bookDir, 'chapters', '*.tex'),
            path.join(bookDir, 'ch*.tex'),
            path.join(bookDir, 'chapter*.tex'),
        ];

        let chapters = await globby(patterns);
        chapters = chapters.filter(f => {
            const name = path.basename(f).toLowerCase();
            return !['main.tex', 'book.tex', 'index.tex', 'preamble.tex'].includes(name);
        });

        chapters.sort((a, b) => {
            const numA = parseInt(path.basename(a).match(/\d+/)?.[0] || '0');
            const numB = parseInt(path.basename(b).match(/\d+/)?.[0] || '0');
            return numA - numB;
        });

        return chapters;
    }

    async processBook(bookPath, options = {}) {
        const stats = await fs.stat(bookPath);
        const isDir = stats.isDirectory();
        const ext = path.extname(bookPath).toLowerCase();

        // Skip language directories that don't directly contain books but only house book directories
        if (isDir && (path.basename(bookPath) === 'fa' || path.basename(bookPath) === 'en')) {
            const hasTexFiles = (await globby(`${bookPath}/*.tex`)).length > 0;
            if (!hasTexFiles) return; // Not a book, just a language wrapper
        }

        const bookSlug = options.slug || path.basename(bookPath, ext);
        let lang = options.lang || this.detectLanguage(bookPath);

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`📚 کتاب: ${bookSlug}`);
        console.log(`${'═'.repeat(60)}`);

        let config;
        let chapters = [];
        let pdfSource = null;

        if (isDir) {
            try {
                config = await this.parser.analyzeProject(bookPath);
                this.configCache.set(bookSlug, config);
                await this.styleGen.generateCSS(config, bookSlug);
            } catch {
                config = await this.parser.getDefaultConfig();
            }
            chapters = await this.findChapters(bookPath);
            pdfSource = await this.findRelatedPDF(bookPath);
        } else {
            config = await this.parser.getDefaultConfig();
            if (CONFIG.supportedFormats.latex.includes(ext)) {
                chapters = [bookPath];
            } else if (CONFIG.supportedFormats.pdf.includes(ext)) {
                pdfSource = bookPath;
            }
            // Check for related PDF for standalone tex
            if (!pdfSource) pdfSource = await this.findRelatedPDF(bookPath);
        }

        console.log(`   📑 فصل‌ها: ${chapters.length}`);

        const outputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
        await fs.mkdir(outputDir, { recursive: true });

        // Calculate a composite hash
        const allRelevantFiles = [...chapters];
        if (pdfSource) allRelevantFiles.push(pdfSource);
        if (isDir) {
            const mainFile = path.join(bookPath, 'main.tex');
            if (await fs.access(mainFile).then(() => true).catch(() => false)) {
                allRelevantFiles.push(mainFile);
            }
        }

        let compositeString = '';
        for (const f of allRelevantFiles) {
            const h = await this.getFileHash(f);
            if (h) compositeString += h;
        }

        const bookHash = compositeString ? crypto.createHash('md5').update(compositeString).digest('hex') : null;

        // Skip check
        const indexPath = path.join(outputDir, 'index.mdx');
        const bookExists = await fs.access(indexPath).then(() => true).catch(() => false);

        if (!options.force && bookHash && this.hashes[bookPath] === bookHash && bookExists) {
            console.log(`   ⏩ مستندات تغییر نکرده‌اند. صرف‌نظر: ${bookSlug}`);
            this.stats.skipped = (this.stats.skipped || 0) + 1;
            return;
        }

        // Handle PDF associated with the book
        let pdfUrl = undefined;
        let showPdfViewer = undefined;

        if (pdfSource) {
            const pdfName = path.basename(pdfSource);
            const pubDocsDir = path.join(process.cwd(), 'public', 'documents', 'books');
            await fs.mkdir(pubDocsDir, { recursive: true });

            const pdfDest = path.join(pubDocsDir, pdfName);
            await fs.copyFile(pdfSource, pdfDest);

            pdfUrl = `/documents/books/${pdfName}`;
            showPdfViewer = true;
            console.log(`   📄 پی دی اف ذخیره شد: ${pdfName}`);
        }

        let combinedContent = '';
        let commonMetadata = null;
        let conversionFailed = false;

        // Process chapters
        for (let i = 0; i < chapters.length; i++) {
            const chapterPath = chapters[i];
            const chapterNumber = i + 1;

            try {
                const result = await this.processFile(chapterPath, { bookSlug, chapterNumber, config, lang });

                if (result) {
                    if (!commonMetadata) commonMetadata = result;
                    if (chapters.length > 1) {
                        const chapterName = path.basename(chapterPath, path.extname(chapterPath));
                        combinedContent += `\n\n## فصل ${chapterNumber}: ${result.title || chapterName}\n\n`;
                    }
                    combinedContent += result.content;
                }
            } catch (error) {
                console.error(`   ❌ فصل ${chapterNumber}: ${error.message}`);
                conversionFailed = true;
            }
        }

        // Fallback to PDF-only if conversion failed or no chapters, and we have a PDF
        if ((conversionFailed || !combinedContent) && pdfSource) {
            console.log(`   💡 استفاده از نسخه PDF به عنوان محتوای اصلی...`);
            const pdfResult = await this.processPDF(pdfSource, { lang });
            commonMetadata = pdfResult;
            combinedContent = pdfResult.content;
            // Mark as PDF-only to bypass MDX rendering in frontend
            commonMetadata.metadata = { ...commonMetadata.metadata, pdfOnly: true, showPdfViewer: true };
        }

        if (combinedContent && commonMetadata) {
            // Heuristic for language if not explicitly set
            if (!options.lang && this.hasPersianCharacters(combinedContent)) {
                lang = 'fa';
            }

            const bookResult = {
                ...commonMetadata,
                title: bookSlug.replace(/-/g, ' '),
                content: combinedContent,
                metadata: {
                    ...commonMetadata.metadata,
                    bookSlug,
                    lang,
                    chapterNumber: undefined,
                    ...(pdfUrl ? { pdfUrl, showPdfViewer } : {})
                }
            };

            // Re-calculate final output path in case lang changed
            const finalOutputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
            await this.saveResult(bookResult, finalOutputDir, 'index');
            console.log(`   ✅ کتاب ${bookSlug} کامل شد و در index.mdx ترکیب شد!`);

            if (bookHash) {
                this.hashes[bookPath] = bookHash;
            }
        } else {
            console.log(`   ⚠️ کتاب ${bookSlug} فاقد محتوای معتبر بود.`);
        }
    }

    async findRelatedPDF(itemPath) {
        const isDir = (await fs.stat(itemPath)).isDirectory();
        const baseDir = isDir ? itemPath : path.dirname(itemPath);
        const fileName = isDir ? path.basename(itemPath) : path.basename(itemPath, path.extname(itemPath));

        // 1. Same name in same folder (for standalone files)
        const candidates = [
            path.join(baseDir, `${fileName}.pdf`),
            path.join(baseDir, `${fileName}.PDF`)
        ];

        // 2. Any PDF inside the folder (for book folders)
        if (isDir) {
            const pdfs = await globby(`${itemPath}/*.pdf`, { nocase: true });
            if (pdfs.length > 0) return pdfs[0];
        }

        for (const candidate of candidates) {
            try {
                await fs.access(candidate);
                return candidate;
            } catch { }
        }

        return null;
    }

    async generateBookIndex(bookSlug, chapters, outputDir, lang) {
        const content = `---
title: "${bookSlug}"
description: "فهرست فصول"
lang: ${lang}
type: book-index
---

# فهرست فصول

${chapters.map((ch, i) => {
            const baseName = path.basename(ch, '.tex');
            const num = i + 1;
            return `${num}. [فصل ${num}](./ch${String(num).padStart(2, '0')}-${baseName})`;
        }).join('\n')}
`;
        await fs.writeFile(path.join(outputDir, 'index.md'), content, 'utf-8');
    }

    async processAll(options = {}) {
        console.log('🚀 شروع پردازش همه محتوا...\n');

        await this.loadHashes();

        // 1. Find all potential book items
        const bookPatterns = [
            `${CONFIG.sourceDir}/books/*`,
            ...Object.values(CONFIG.supportedFormats).flat().map(ext => `${CONFIG.sourceDir}/books/*${ext}`),
            `${CONFIG.sourceDir}/books/*/*`,
            ...Object.values(CONFIG.supportedFormats).flat().map(ext => `${CONFIG.sourceDir}/books/*/*${ext}`)
        ];

        const allItems = await globby(bookPatterns, { expandDirectories: false });
        const uniqueItems = [...new Set(allItems)].filter(i =>
            !i.includes('.content-cache') &&
            !i.includes('/Archive/') &&
            !i.startsWith('Archive/')
        );

        console.log(`📚 موارد پیدا شده در بخش کتاب‌ها: ${uniqueItems.length}`);

        const processedPaths = new Set();

        // Process Books
        for (const itemPath of uniqueItems) {
            if (processedPaths.has(itemPath)) continue;

            const isDir = (await fs.stat(itemPath)).isDirectory();
            const ext = path.extname(itemPath).toLowerCase();

            try {
                if (isDir) {
                    // It's a directory, treat as a book
                    await this.processBook(itemPath, options);
                    processedPaths.add(itemPath);

                    // Mark associated PDFs as processed
                    const companionPdf = await this.findRelatedPDF(itemPath);
                    if (companionPdf) processedPaths.add(companionPdf);
                } else if (CONFIG.supportedFormats.zip.includes(ext)) {
                    await this.processZipBook(itemPath, options);
                    processedPaths.add(itemPath);
                } else if (CONFIG.supportedFormats.latex.includes(ext)) {
                    await this.processBook(itemPath, options);
                    processedPaths.add(itemPath);

                    const companionPdf = await this.findRelatedPDF(itemPath);
                    if (companionPdf) processedPaths.add(companionPdf);
                } else if (CONFIG.supportedFormats.pdf.includes(ext)) {
                    // Only process as book if it's not a companion to anything else
                    // (But we iterate through all items, so we'll check later if it was already processed)
                    await this.processBook(itemPath, options);
                    processedPaths.add(itemPath);
                }

                // If it was a directory or file and processed successfully, we might archive it.
                // For books, we should be careful. Usually archiving the whole folder or specific files.
                // Let's archive based on user preference, but here we'll archive the processed item.
                if (processedPaths.has(itemPath)) {
                    // If it's a directory, archive its contents or just move it? 
                    // Better to archive as is.
                    await this.archiveProcessedFile(itemPath);
                }
            } catch (error) {
                console.error(`❌ خطا در پردازش ${path.basename(itemPath)}: ${error.message}`);
            }
        }

        const articlePatterns = Object.values(CONFIG.supportedFormats).flat()
            .filter(ext => ext !== '.zip')
            .map(ext => `${CONFIG.sourceDir}/articles/**/*${ext}`);
        let articleFiles = await globby(articlePatterns);
        articleFiles = articleFiles.filter(i => !i.includes('/Archive/') && !i.startsWith('Archive/'));
        console.log(`\n📄 مقالات: ${articleFiles.length}`);

        for (const file of articleFiles) {
            const lang = this.detectLanguage(file);
            const outputDir = path.join(CONFIG.outputDir, 'articles', lang);
            const baseName = path.basename(file, path.extname(file));
            const outputFile = path.join(outputDir, `${baseName}.mdx`);

            try {
                const currentHash = await this.getFileHash(file);
                const fileExists = await fs.access(outputFile).then(() => true).catch(() => false);

                const result_temp = await fs.readFile(file, 'utf-8');
                const hasForceTag = result_temp.includes('force: true') || result_temp.includes('reprocess: true');

                if (!options.force && !hasForceTag && currentHash && this.hashes[file] === currentHash && fileExists) {
                    console.log(`⏩ صرف‌نظر: ${path.basename(file)} (بدون تغییر)`);
                    this.stats.skipped = (this.stats.skipped || 0) + 1;
                    continue;
                }

                const result = await this.processFile(file, { lang });
                if (result) {
                    await this.saveResult({ ...result, metadata: { ...result.metadata, lang } }, outputDir);
                    if (currentHash) {
                        this.hashes[file] = currentHash;
                    }
                    // Archive the file after successful processing
                    await this.archiveProcessedFile(file);
                }
            } catch (error) {
                console.error(`❌ خطا در ${path.basename(file)}: ${error.message}`);
            }
        }

        await this.saveHashes();
        this.printFinalReport();
        return this.stats;
    }

    printFinalReport() {
        const mermaidStats = this.mermaidProcessor.getStats();

        console.log(`\n${'═'.repeat(60)}`);
        console.log('📊 گزارش نهایی');
        console.log('═'.repeat(60));
        console.log(`   📄 LaTeX: ${this.stats.latex}`);
        console.log(`   📝 Markdown: ${this.stats.markdown}`);
        console.log(`   🌐 HTML: ${this.stats.html || 0}`);    // 🟢 NEW
        console.log(`   📑 PDF: ${this.stats.pdf}`);
        console.log(`   📃 Word: ${this.stats.word}`);
        console.log(`   🤖 AI: ${this.stats.aiTagged}`);
        console.log(`   📊 Mermaid: ${mermaidStats.processed} (کش: ${mermaidStats.cached})`);
        console.log(`   ❌ خطا: ${this.stats.errors}`);
        console.log('═'.repeat(60) + '\n');
    }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);

    const options = {
        aiEnabled: !args.includes('--no-ai'),
        aiProvider: args.find(a => a.startsWith('--ai-provider='))?.split('=')[1],
        lang: args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'fa',
        slug: args.find(a => a.startsWith('--slug='))?.split('=')[1],
        mermaidRenderMode: args.find(a => a.startsWith('--mermaid='))?.split('=')[1] || 'client',
        force: args.includes('--force')
    };

    const pipeline = new ContentPipeline(options);

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
📘 Content Pipeline v2.1

دستورات:
  --all              پردازش همه محتوا
  --book <path>      پردازش کتاب (پوشه)
  --zip <file>       پردازش کتاب از ZIP
  --file <path>      پردازش یک فایل
  --force            اجبار به پردازش مجدد (نادیده گرفتن هش)

گزینه‌ها:
  --no-ai            غیرفعال کردن AI
  --lang=fa|en       زبان
  --slug=name        نام کتاب
  --mermaid=client   حالت رندر Mermaid (client|server)
`);
        return;
    }

    if (args.includes('--zip')) {
        const zipPath = args[args.indexOf('--zip') + 1];
        if (zipPath) await pipeline.processZipBook(zipPath, options);
        return;
    }

    if (args.includes('--all') || args.length === 0) {
        await pipeline.processAll(options);
    } else if (args.includes('--book')) {
        const bookDir = args[args.indexOf('--book') + 1];
        if (bookDir) await pipeline.processBook(bookDir, options);
    } else if (args.includes('--file')) {
        const filePath = args[args.indexOf('--file') + 1];
        const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || `src/content/articles/${options.lang}`;
        if (filePath) {
            const result = await pipeline.processFile(filePath, options);
            if (result) await pipeline.saveResult(result, outputDir);
        }
    } else if (args[0] && !args[0].startsWith('--')) {
        const result = await pipeline.processFile(args[0], options);
        const outputDir = args[1] || `src/content/articles/${options.lang}`;
        if (result) await pipeline.saveResult(result, outputDir);
    }
}

main().catch(error => {
    console.error('❌ خطا:', error);
    process.exit(1);
});