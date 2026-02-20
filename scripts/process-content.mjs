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

let globby, matter, cheerio;
try {
    globby = (await import('globby')).globby;
    matter = (await import('gray-matter')).default;
    cheerio = await import('cheerio');
} catch {
    console.error('❌ لطفاً وابستگی‌ها را نصب کنید: npm install');
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

        // Extract body content using regex (more reliable for large files)
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        let bodyContent = bodyMatch ? bodyMatch[1] : content;

        // Clean up: remove external scripts and style tags
        const $body = cheerio.load(bodyContent);
        $body('script[src]').remove(); // Remove external scripts
        $body('link[rel="stylesheet"]').remove(); // Remove external stylesheets

        // Keep inline styles and scripts (for Mermaid, etc.)
        bodyContent = $body.html();

        // Additional cleanup for MDX compatibility
        if (bodyContent) {
            // Remove any stray <html>, <head>, <body> tags that might have been nested
            bodyContent = bodyContent.replace(/<\/?html[^>]*>/gi, '');
            bodyContent = bodyContent.replace(/<\/?head[^>]*>/gi, '');
            bodyContent = bodyContent.replace(/<\/?body[^>]*>/gi, '');

            // Remove first <h1> to avoid duplication with ArticleLayout title
            bodyContent = bodyContent.replace(/<h1[^>]*>.*?<\/h1>/, '');

            // Remove subtitle and meta paragraphs if they exist right after h1
            bodyContent = bodyContent.replace(/<p\s+className="subtitle"[^>]*>.*?<\/p>/i, '');
            bodyContent = bodyContent.replace(/<p\s+className="meta"[^>]*>.*?<\/p>/i, '');

            // Convert class to className for JSX
            bodyContent = bodyContent.replace(/class=/g, 'className=');

            // Make HTML void tags JSX-safe for MDX
            bodyContent = bodyContent.replace(/<br(\s*?)>/gi, '<br />');
            bodyContent = bodyContent.replace(/<hr(\s*?)>/gi, '<hr />');
            bodyContent = bodyContent.replace(/<img([^>]*?)(?<!\/)\s*>/gi, '<img$1 />');
            bodyContent = bodyContent.replace(/<input([^>]*?)(?<!\/)\s*>/gi, '<input$1 />');
            bodyContent = bodyContent.replace(/<meta([^>]*?)(?<!\/)\s*>/gi, '<meta$1 />');
            bodyContent = bodyContent.replace(/<link([^>]*?)(?<!\/)\s*>/gi, '<link$1 />');

            // Remove empty table header/data cells that can break MDX JSX parsing
            bodyContent = bodyContent.replace(/<th>\s*<\/th>/gi, '');
            bodyContent = bodyContent.replace(/<td>\s*<\/td>/gi, '');

            // Clean up excessive whitespace
            bodyContent = bodyContent.replace(/\n\s*\n\s*\n/g, '\n\n');
        }

        // Process Mermaid diagrams
        // Convert HTML <pre class="mermaid"> or <div class="mermaid"> blocks to fenced code blocks.
        // We use a general regex to catch various patterns before MDX conversion.
        if (bodyContent) {
            const mermaidRegex = /<(pre|div)[^>]*class(?:Name)?=["']mermaid["'][^>]*>([\s\S]*?)<\/\1>/gi;
            bodyContent = bodyContent.replace(mermaidRegex, (_, tag, mermaidCode) => {
                // Remove internal HTML tags if any (sometimes mermaid is wrapped in <code>)
                const cleanCode = mermaidCode.replace(/<[^>]*>/g, '').trim();
                return `\n\n\`\`\`mermaid\n${cleanCode}\n\`\`\`\n\n`;
            });
        }

        const prefix = path.basename(filePath, path.extname(filePath));
        const processedContent = await this.mermaidProcessor.process(bodyContent, { prefix });

        return {
            type: 'html',
            source: filePath,
            title,
            content: processedContent,
            metadata: { description }
        };
    }

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
                content = content.replace(tikzCode, `\n\n<!-- TIKZ_ERROR: ${name} -->\n\n`);
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

        // 1. Remove Pandoc's header attributes: {#id .class}
        // Use a broader regex to include Persian characters in IDs
        result = result.replace(/\{#[\S]+\s+\.[^}]+\}/g, '');
        result = result.replace(/\{#[\S]+\}/g, '');

        // 2. Convert Pandoc's container blocks: ::: class ... :::
        result = result.replace(/^:::\s*([\w-]+)\s*$/gm, '<div class="$1">');
        result = result.replace(/^:::\s*$/gm, '</div>');

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
        let result = content;

        // MDX is strict about < and {
        const codeBlocks = [];
        result = result.replace(/```[\s\S]*?```/g, match => {
            codeBlocks.push(match);
            return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
        });

        // Escape < that is not an HTML tag
        result = result.replace(/<([^a-zA-Z\/!\?{])/g, '&lt;$1');

        // Escape { and } if they are not part of an HTML attribute or tag
        // Lone { and } in text will crash MDX
        // But we must be careful not to break the <span style="..."> we just added
        // A simple way is to escape { } that are surrounded by spaces or at word boundaries in text
        result = result.replace(/ ([{}]) /g, ' {"$1"} ');

        // If the content has Persian numbers followed by < or {
        // (Just a safe fallback for the user's specific content)
        result = result.replace(/([۰-۹])([<{])/g, '$1 $2');

        result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, idx) => codeBlocks[idx]);

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
            publishDate: existing.publishDate || new Date().toISOString().split('T')[0],
            author: existing.author || defaultAuthor,
            sourceType: existing.sourceType || result.type,
            interface: existing.interface || (result.metadata?.bookSlug ? 'iran' : undefined)
        };

        // Preserve existing frontmatter fields
        if (existing.tags?.length) fm.tags = existing.tags;
        if (existing.category) fm.category = existing.category;
        if (existing.keywords?.length) fm.keywords = existing.keywords;
        if (existing.draft !== undefined) fm.draft = existing.draft;
        if (existing.order !== undefined) fm.order = existing.order;
        if (existing.aiGenerated !== undefined) fm.aiGenerated = existing.aiGenerated;

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
        const uniqueItems = [...new Set(allItems)].filter(i => !i.includes('.content-cache'));

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
        const articleFiles = await globby(articlePatterns);
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