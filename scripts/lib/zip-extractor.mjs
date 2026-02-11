/**
 * استخراج و پردازش فایل‌های ZIP کتاب - نسخه اصلاح‌شده
 */

import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const CONFIG = {
    extractDir: '.content-cache/extracted',
    bookStructure: {
        chapters: ['chapters', 'chapter', 'فصل', 'فصل‌ها'],
        appendices: ['appendices', 'appendix', 'پیوست', 'پیوست‌ها'],
        frontmatter: ['frontmatter', 'front', 'مقدمات'],
        backmatter: ['backmatter', 'back', 'انتها'],
        images: ['images', 'figures', 'img', 'تصاویر'],
        styles: ['styles', 'sty', 'استایل']
    },
    chapterPatterns: [
        /^ch(?:apter)?[-_]?(\d+)/i,
        /^(\d+)[-_]/,
        /^فصل[-_]?(\d+)/,
        /^بخش[-_]?(\d+)/
    ],
    appendixPatterns: [
        /^app(?:endix)?[-_]?([a-z]|\d+)/i,
        /^پیوست[-_]?([آ-ی]|\d+)/
    ]
};

export class ZipExtractor {
    constructor(options = {}) {
        this.extractDir = options.extractDir || CONFIG.extractDir;
        this.AdmZip = null;
    }

    async initialize() {
        if (!this.AdmZip) {
            try {
                this.AdmZip = require('adm-zip');
            } catch {
                throw new Error('لطفاً adm-zip را نصب کنید: npm install adm-zip');
            }
        }
    }

    async extract(zipPath, options = {}) {
        await this.initialize();

        const { targetDir, bookSlug } = options;
        const slug = bookSlug || path.basename(zipPath, '.zip');
        const outputDir = targetDir || path.join(this.extractDir, slug);

        console.log(`\n📦 استخراج ZIP: ${path.basename(zipPath)}`);

        const zip = new this.AdmZip(zipPath);
        zip.extractAllTo(outputDir, true);

        console.log(`   📁 استخراج به: ${outputDir}`);

        const structure = await this.analyzeStructure(outputDir);

        console.log(`   📊 ساختار شناسایی شد:`);
        console.log(`      فصل‌ها: ${structure.chapters.length}`);
        console.log(`      پیوست‌ها: ${structure.appendices.length}`);
        console.log(`      مقدمات: ${structure.frontmatter.length}`);
        console.log(`      پایانی: ${structure.backmatter.length}`);

        return { extractedPath: outputDir, slug, structure };
    }

    async analyzeStructure(bookDir) {
        const structure = {
            mainFile: null,
            preambleFile: null,
            chapters: [],
            appendices: [],
            frontmatter: [],
            backmatter: [],
            images: [],
            otherFiles: []
        };

        structure.mainFile = await this.findMainFile(bookDir);
        structure.preambleFile = await this.findPreambleFile(bookDir);

        await this.scanDirectory(bookDir, structure, bookDir);

        structure.chapters = this.sortByNumber(structure.chapters);
        structure.appendices = this.sortByNumber(structure.appendices);

        return structure;
    }

    async findMainFile(bookDir) {
        const candidates = ['main.tex', 'book.tex', 'index.tex', 'document.tex'];

        for (const candidate of candidates) {
            const filePath = path.join(bookDir, candidate);
            try {
                await fs.access(filePath);
                return filePath;
            } catch { }
        }

        const texFiles = await this.findFiles(bookDir, '.tex');
        for (const file of texFiles) {
            const content = await fs.readFile(file, 'utf-8');
            if (content.includes('\\documentclass')) {
                return file;
            }
        }

        return null;
    }

    async findPreambleFile(bookDir) {
        const candidates = ['preamble.tex', 'header.tex', 'packages.tex', 'settings.tex'];

        for (const candidate of candidates) {
            const filePath = path.join(bookDir, candidate);
            try {
                await fs.access(filePath);
                return filePath;
            } catch { }
        }

        return null;
    }

    async scanDirectory(dir, structure, rootDir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const relativePath = path.relative(rootDir, dir);

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await this.scanDirectory(fullPath, structure, rootDir);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();

                if (ext === '.tex') {
                    this.categorizeTexFile(fullPath, entry.name, relativePath, structure);
                } else if (['.png', '.jpg', '.jpeg', '.pdf', '.svg', '.eps'].includes(ext)) {
                    structure.images.push(fullPath);
                }
            }
        }
    }

    categorizeTexFile(fullPath, fileName, relativePath, structure) {
        const name = fileName.toLowerCase();
        const dirName = relativePath.toLowerCase();

        if (fullPath === structure.mainFile || fullPath === structure.preambleFile) {
            return;
        }

        if (this.matchesPatterns(dirName, CONFIG.bookStructure.chapters)) {
            structure.chapters.push(this.createFileInfo(fullPath, 'chapter'));
            return;
        }

        if (this.matchesPatterns(dirName, CONFIG.bookStructure.appendices)) {
            structure.appendices.push(this.createFileInfo(fullPath, 'appendix'));
            return;
        }

        if (this.matchesPatterns(dirName, CONFIG.bookStructure.frontmatter)) {
            structure.frontmatter.push(this.createFileInfo(fullPath, 'frontmatter'));
            return;
        }

        if (this.matchesPatterns(dirName, CONFIG.bookStructure.backmatter)) {
            structure.backmatter.push(this.createFileInfo(fullPath, 'backmatter'));
            return;
        }

        if (this.isChapterFile(name)) {
            structure.chapters.push(this.createFileInfo(fullPath, 'chapter'));
            return;
        }

        if (this.isAppendixFile(name)) {
            structure.appendices.push(this.createFileInfo(fullPath, 'appendix'));
            return;
        }

        structure.otherFiles.push(this.createFileInfo(fullPath, 'other'));
    }

    createFileInfo(fullPath, type) {
        const fileName = path.basename(fullPath, '.tex');
        const number = this.extractNumber(fileName, type);
        const cleanName = this.extractCleanName(fileName, type);

        return {
            path: fullPath,
            fileName,
            cleanName,
            type,
            number,
            order: number || 999
        };
    }

    extractCleanName(fileName, type) {
        let cleanName = fileName;

        cleanName = cleanName
            .replace(/^ch(?:apter)?[-_]?\d+[-_]?/i, '')
            .replace(/^app(?:endix)?[-_]?[a-z][-_]?/i, '')
            .replace(/^\d+[-_]/, '')
            .replace(/^فصل[-_]?\d+[-_]?/, '')
            .replace(/^پیوست[-_]?[آ-ی][-_]?/, '');

        return cleanName || fileName;
    }

    extractNumber(fileName, type) {
        const patterns = type === 'appendix' ? CONFIG.appendixPatterns : CONFIG.chapterPatterns;

        for (const pattern of patterns) {
            const match = fileName.match(pattern);
            if (match) {
                const num = match[1];
                if (/^[a-z]$/i.test(num)) {
                    return num.toLowerCase().charCodeAt(0) - 96;
                }
                if (/^[آ-ی]$/.test(num)) {
                    const persianLetters = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
                    return persianLetters.indexOf(num) + 1;
                }
                return parseInt(num);
            }
        }

        return null;
    }

    isChapterFile(fileName) {
        return CONFIG.chapterPatterns.some(p => p.test(fileName));
    }

    isAppendixFile(fileName) {
        return CONFIG.appendixPatterns.some(p => p.test(fileName)) ||
            fileName.includes('appendix') ||
            fileName.includes('پیوست');
    }

    matchesPatterns(text, patterns) {
        return patterns.some(p => text.includes(p.toLowerCase()));
    }

    sortByNumber(files) {
        return files.sort((a, b) => (a.order || 999) - (b.order || 999));
    }

    async findFiles(dir, extension) {
        const files = [];
        const scan = async (currentDir) => {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    await scan(fullPath);
                } else if (entry.isFile() && entry.name.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        };
        await scan(dir);
        return files;
    }

    async cleanup(extractedPath) {
        try {
            await fs.rm(extractedPath, { recursive: true, force: true });
            console.log(`   🗑️ پاکسازی: ${extractedPath}`);
        } catch { }
    }
}

// ═══════════════════════════════════════════════════════════════
// کلاس BookStructureProcessor
// ═══════════════════════════════════════════════════════════════

export class BookStructureProcessor {
    constructor(pipeline) {
        this.pipeline = pipeline;
        this.zipExtractor = new ZipExtractor();
    }

    async processFromZip(zipPath, options = {}) {
        const { lang = 'fa', slug } = options;
        const bookSlug = slug || path.basename(zipPath, '.zip');

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`📚 پردازش کتاب از ZIP: ${bookSlug}`);
        console.log(`${'═'.repeat(60)}`);

        const { extractedPath, structure } = await this.zipExtractor.extract(zipPath, { bookSlug });

        try {
            await this.processBookStructure(extractedPath, structure, { ...options, slug: bookSlug, lang });
            console.log(`\n✅ کتاب ${bookSlug} با موفقیت پردازش شد!`);
        } finally {
            if (options.cleanup !== false) {
                // await this.zipExtractor.cleanup(extractedPath);
            }
        }
    }

    async processBookStructure(bookDir, structure, options = {}) {
        const { slug, lang = 'fa' } = options;

        // ✅ همه فایل‌ها در یک پوشه flat
        const outputBaseDir = path.join('src/content/books', lang, slug);

        let config;
        try {
            config = await this.pipeline.parser.analyzeProject(bookDir);
            await this.pipeline.styleGen.generateCSS(config, slug);
        } catch {
            config = await this.pipeline.parser.getDefaultConfig();
        }

        await fs.mkdir(outputBaseDir, { recursive: true });

        const processedChapters = [];
        const processedAppendices = [];

        // پردازش مقدمات
        if (structure.frontmatter.length > 0) {
            console.log(`\n📖 پردازش مقدمات...`);
            for (const file of structure.frontmatter) {
                await this.processSection(file, config, outputBaseDir, 'frontmatter', options);
            }
        }

        // ✅ پردازش فصل‌ها در root
        if (structure.chapters.length > 0) {
            console.log(`\n📑 پردازش فصل‌ها...`);
            for (let i = 0; i < structure.chapters.length; i++) {
                const file = structure.chapters[i];
                const chapterNumber = file.number || (i + 1);

                const processed = await this.processSection(
                    file, config,
                    outputBaseDir,
                    'chapter',
                    { ...options, chapterNumber, totalChapters: structure.chapters.length }
                );

                if (processed) {
                    processedChapters.push(processed);
                }
            }
        }

        // ✅ پردازش پیوست‌ها در root
        if (structure.appendices.length > 0) {
            console.log(`\n📎 پردازش پیوست‌ها...`);
            for (let i = 0; i < structure.appendices.length; i++) {
                const file = structure.appendices[i];
                const appendixNumber = file.number || (i + 1);
                const appendixLetter = String.fromCharCode(64 + appendixNumber);

                const processed = await this.processSection(
                    file, config,
                    outputBaseDir,
                    'appendix',
                    { ...options, appendixNumber, appendixLetter, totalAppendices: structure.appendices.length }
                );

                if (processed) {
                    processedAppendices.push(processed);
                }
            }
        }

        // پردازش بخش پایانی
        if (structure.backmatter.length > 0) {
            console.log(`\n📚 پردازش بخش پایانی...`);
            for (const file of structure.backmatter) {
                await this.processSection(file, config, outputBaseDir, 'backmatter', options);
            }
        }

        await this.generateBookIndex(structure, outputBaseDir, options, processedChapters, processedAppendices);
    }

    async processSection(fileInfo, config, outputDir, sectionType, options = {}) {
        const { slug, lang, chapterNumber, appendixNumber, appendixLetter } = options;

        try {
            console.log(`   📄 ${fileInfo.fileName}...`);

            const result = await this.pipeline.processFile(fileInfo.path, {
                config,
                bookSlug: slug,
                chapterNumber: sectionType === 'chapter' ? chapterNumber : undefined,
                lang
            });

            if (!result) return null;

            // ✅ استخراج عنوان واقعی
            const extractedTitle = this.extractTitleFromContent(result.content);
            const finalTitle = extractedTitle || result.title || fileInfo.cleanName;

            // ✅ نام فایل ساده و تمیز
            let outputFileName;

            if (sectionType === 'chapter') {
                outputFileName = `ch${String(chapterNumber).padStart(2, '0')}-${fileInfo.cleanName}`;
            } else if (sectionType === 'appendix') {
                outputFileName = `appendix-${appendixLetter.toLowerCase()}-${fileInfo.cleanName}`;
            } else {
                outputFileName = fileInfo.cleanName;
            }

            const frontmatter = this.buildSectionFrontmatter(result, {
                sectionType,
                chapterNumber,
                appendixNumber,
                appendixLetter,
                title: finalTitle,
                ...options
            });

            const finalContent = `---\n${this.pipeline.stringifyYaml(frontmatter)}\n---\n\n${result.content}`;
            const outputPath = path.join(outputDir, `${outputFileName}.md`);
            await fs.writeFile(outputPath, finalContent, 'utf-8');

            console.log(`      ✅ ${outputFileName}.md`);

            return {
                fileName: outputFileName,
                title: finalTitle,
                chapterNumber,
                appendixNumber,
                appendixLetter,
                cleanName: fileInfo.cleanName
            };

        } catch (error) {
            console.error(`      ❌ ${fileInfo.fileName}: ${error.message}`);
            return null;
        }
    }

    extractTitleFromContent(content) {
        const h1Match = content.match(/^#\s+(.+)$/m);
        if (h1Match) {
            return h1Match[1].trim();
        }

        const chapterMatch = content.match(/\\chapter\{([^}]+)\}/);
        if (chapterMatch) {
            return chapterMatch[1].trim();
        }

        return null;
    }

    buildSectionFrontmatter(result, options) {
        const { sectionType, chapterNumber, appendixNumber, appendixLetter, slug, lang, title } = options;

        const fm = {
            title: title || result.title,
            description: result.ai?.description || result.ai?.summary?.slice(0, 160) || '',
            lang: lang || 'fa',
            book: slug,
            bookSlug: slug,
            sectionType
        };

        if (sectionType === 'chapter') {
            fm.chapterNumber = chapterNumber;
            fm.order = chapterNumber;
        } else if (sectionType === 'appendix') {
            fm.appendixNumber = appendixNumber;
            fm.appendixLetter = appendixLetter;
            fm.order = 1000 + appendixNumber;
        } else if (sectionType === 'frontmatter') {
            fm.order = -100;
        } else if (sectionType === 'backmatter') {
            fm.order = 2000;
        }

        if (result.ai) {
            if (result.ai.tags?.length) fm.tags = result.ai.tags;
            if (result.ai.readingTime) fm.readingTime = result.ai.readingTime;
        }

        return fm;
    }

    async generateBookIndex(structure, outputDir, options, processedChapters = [], processedAppendices = []) {
        const { slug, lang = 'fa' } = options;

        let content = `---
title: "${slug}"
description: "فهرست کتاب"
lang: "${lang}"
type: "book-index"
book: "${slug}"
bookSlug: "${slug}"
---

# فهرست مطالب

`;

        // مقدمات
        if (structure.frontmatter.length > 0) {
            content += `## مقدمات\n\n`;
            for (const file of structure.frontmatter) {
                content += `- [${file.cleanName}](./${file.cleanName})\n`;
            }
            content += '\n';
        }

        // ✅ فصل‌ها - لینک‌های ساده
        if (processedChapters.length > 0) {
            content += `## فصل‌ها\n\n`;
            for (const ch of processedChapters) {
                const displayTitle = ch.title || ch.cleanName;
                content += `${ch.chapterNumber}. [${displayTitle}](./${ch.fileName})\n`;
            }
            content += '\n';
        }

        // ✅ پیوست‌ها - لینک‌های ساده
        if (processedAppendices.length > 0) {
            content += `## پیوست‌ها\n\n`;
            for (const app of processedAppendices) {
                const displayTitle = app.title || app.cleanName;
                content += `- [پیوست ${app.appendixLetter}: ${displayTitle}](./${app.fileName})\n`;
            }
            content += '\n';
        }

        // بخش پایانی
        if (structure.backmatter.length > 0) {
            content += `## منابع و نمایه\n\n`;
            for (const file of structure.backmatter) {
                content += `- [${file.cleanName}](./${file.cleanName})\n`;
            }
        }

        await fs.writeFile(path.join(outputDir, 'index.md'), content, 'utf-8');
        console.log(`\n   📋 فهرست کتاب ایجاد شد`);
    }
}

export default ZipExtractor;