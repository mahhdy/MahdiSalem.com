#!/usr/bin/env node
/**
 * سیستم جامع پردازش محتوا - نسخه ۲.۱
 * با پشتیبانی از Mermaid
 */

import fs from 'fs/promises';
import path from 'path';
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
        this.stats = { latex: 0, markdown: 0, pdf: 0, word: 0, aiTagged: 0, errors: 0 };
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
        markdown = this.postProcessMarkdown(markdown);

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

        return { type: 'pdf', source: filePath, title, content: extracted.markdown, pdfMetadata: extracted.metadata, metadata: {} };
    }

    async processWord(filePath, options = {}) {
        console.log(`   📝 استخراج از Word...`);
        const extracted = await this.universalExtractor.extract(filePath);
        const title = this.extractTitle(extracted.markdown) || path.basename(filePath, '.docx');

        return { type: 'word', source: filePath, title, content: extracted.markdown, metadata: {} };
    }

    async processHTML(filePath, options = {}) {
        console.log(`   🌐 پردازش HTML...`);
        const content = await fs.readFile(filePath, 'utf-8');

        // Parse HTML
        const $ = cheerio.load(content);

        // Extract metadata from HTML
        const title = $('title').text() ||
                     $('h1').first().text() ||
                     path.basename(filePath, path.extname(filePath));
        const description = $('meta[name="description"]').attr('content') || '';

        // Extract body content only (remove <html>, <head>, scripts, etc.)
        let bodyContent = $('body').html() || content;

        // Clean up: remove external scripts and style tags
        const $body = cheerio.load(bodyContent);
        $body('script[src]').remove(); // Remove external scripts
        $body('link[rel="stylesheet"]').remove(); // Remove external stylesheets

        // Keep inline styles and scripts (for Mermaid, etc.)
        bodyContent = $body.html();

        // Process Mermaid diagrams
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
        await execAsync(`pandoc "${inputFile}" -o "${outputFile}" --wrap=none --columns=1000`, { timeout: 60000 });

        const result = await fs.readFile(outputFile, 'utf-8');

        await fs.unlink(inputFile).catch(() => { });
        await fs.unlink(outputFile).catch(() => { });

        return result;
    }

    postProcessMarkdown(markdown) {
        return markdown
            // پاکسازی کدهای TikZ باقی‌مانده
            .replace(/$$node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
            .replace(/\\node[\s\S]*?;/g, '')
            .replace(/\\draw[\s\S]*?;/g, '')
            .replace(/\[.*?$$\s*\(.*?\)\s*\{[\s\S]*?\};?/g, '')
            // پاکسازی خطوط خالی اضافی
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    extractTitle(content) {
        const match = content.match(/^#\s+(.+)$/m);
        return match ? match[1].trim() : null;
    }

    detectLanguage(filePath) {
        return (filePath.includes('/en/') || filePath.includes('\\en\\')) ? 'en' : 'fa';
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
            sourceType: existing.sourceType || result.type
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

        const frontmatter = this.buildFrontmatter(result);
        const finalContent = `---\n${this.stringifyYaml(frontmatter)}\n---\n\n${result.content}`;

        const baseName = customFileName || path.basename(result.source, path.extname(result.source));

        // Use .mdx extension for HTML sources (they contain JSX/HTML)
        const extension = result.type === 'html' ? '.mdx' : '.md';
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

    async processBook(bookDir, options = {}) {
        const bookSlug = options.slug || path.basename(bookDir);
        const lang = options.lang || this.detectLanguage(bookDir) || 'fa';

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`📚 کتاب: ${bookSlug}`);
        console.log(`${'═'.repeat(60)}`);

        let config;
        try {
            config = await this.parser.analyzeProject(bookDir);
            this.configCache.set(bookSlug, config);
            await this.styleGen.generateCSS(config, bookSlug);
        } catch {
            config = await this.parser.getDefaultConfig();
        }

        const chapters = await this.findChapters(bookDir);
        console.log(`   📑 فصل‌ها: ${chapters.length}`);

        const outputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
        await fs.mkdir(outputDir, { recursive: true });

        for (let i = 0; i < chapters.length; i++) {
            const chapterPath = chapters[i];
            const chapterNumber = i + 1;

            try {
                const result = await this.processFile(chapterPath, { bookSlug, chapterNumber, config, lang });

                if (result) {
                    const baseName = path.basename(chapterPath, '.tex');
                    const outputFileName = `ch${String(chapterNumber).padStart(2, '0')}-${baseName}`;
                    await this.saveResult({ ...result, metadata: { ...result.metadata, bookSlug, chapterNumber, lang } }, outputDir, outputFileName);
                }
            } catch (error) {
                console.error(`   ❌ فصل ${chapterNumber}: ${error.message}`);
            }
        }

        await this.generateBookIndex(bookSlug, chapters, outputDir, lang);
        console.log(`   ✅ کتاب ${bookSlug} کامل شد!`);
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

        const bookDirs = await globby(`${CONFIG.sourceDir}/books/*`, { onlyDirectories: true });
        console.log(`📚 کتاب‌ها: ${bookDirs.length}`);

        for (const bookDir of bookDirs) {
            try {
                await this.processBook(bookDir, options);
            } catch (error) {
                console.error(`❌ خطا در ${path.basename(bookDir)}: ${error.message}`);
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

            try {
                const result = await this.processFile(file, { lang });
                if (result) await this.saveResult({ ...result, metadata: { ...result.metadata, lang } }, outputDir);
            } catch (error) {
                console.error(`❌ خطا در ${path.basename(file)}: ${error.message}`);
            }
        }

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
        mermaidRenderMode: args.find(a => a.startsWith('--mermaid='))?.split('=')[1] || 'client'
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