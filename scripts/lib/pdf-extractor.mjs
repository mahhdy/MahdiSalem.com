/**
 * استخراج‌کننده محتوای PDF
 */

import fs from 'fs/promises';
import path from 'path';

export class PDFExtractor {
    constructor(options = {}) {
        this.imageOutputDir = options.imageOutputDir || 'public/images/extracted';
    }

    async extract(pdfPath, options = {}) {
        console.log(`   📄 استخراج PDF: ${path.basename(pdfPath)}`);

        const dataBuffer = await fs.readFile(pdfPath);

        let pdfParse;
        try {
            pdfParse = (await import('pdf-parse')).default;
        } catch {
            console.warn('   ⚠️ pdf-parse نصب نیست');
            return { metadata: {}, content: { text: '', structure: [] }, images: [], tables: [] };
        }

        const data = await pdfParse(dataBuffer);

        return {
            metadata: {
                title: data.info?.Title || null,
                author: data.info?.Author || null,
                pageCount: data.numpages
            },
            content: {
                text: data.text,
                structure: this.analyzeStructure(data.text)
            },
            images: [],
            tables: []
        };
    }

    analyzeStructure(text) {
        const structure = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const heading = this.detectHeading(trimmed);
            if (heading) {
                structure.push({ type: 'heading', level: heading.level, text: heading.text });
            } else {
                structure.push({ type: 'paragraph', content: trimmed });
            }
        }

        return structure;
    }

    detectHeading(line) {
        const patterns = [
            { regex: /^فصل\s+[\u06F0-\u06F9۰-۹\d]+[:\s]+(.+)$/i, level: 1 },
            { regex: /^بخش\s+[\u06F0-\u06F9۰-۹\d]+[:\s]+(.+)$/i, level: 1 },
            { regex: /^Chapter\s+\d+[:\s]+(.+)$/i, level: 1 },
            { regex: /^\d+\.\s+(.+)$/, level: 2 },
        ];

        for (const pattern of patterns) {
            const match = line.match(pattern.regex);
            if (match) return { level: pattern.level, text: match[1] || line };
        }
        return null;
    }

    async toMarkdown(pdfPath, options = {}) {
        const data = await this.extract(pdfPath, options);

        let markdown = '';
        if (data.metadata.title) markdown += `# ${data.metadata.title}\n\n`;

        for (const item of data.content.structure) {
            if (item.type === 'heading') {
                markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
            } else {
                markdown += `${item.content}\n\n`;
            }
        }

        return { markdown, metadata: data.metadata, images: data.images };
    }
}

export class WordExtractor {
    async extract(docxPath) {
        console.log(`   📝 استخراج Word: ${path.basename(docxPath)}`);

        let mammoth;
        try {
            mammoth = (await import('mammoth')).default;
        } catch {
            console.warn('   ⚠️ mammoth نصب نیست');
            return { markdown: '', html: '' };
        }

        const result = await mammoth.convertToHtml({ path: docxPath });
        const mdResult = await mammoth.extractRawText({ path: docxPath });

        return { html: result.value, markdown: mdResult.value };
    }
}

export class UniversalExtractor {
    constructor(options = {}) {
        this.pdfExtractor = new PDFExtractor(options);
        this.wordExtractor = new WordExtractor();
    }

    async extract(filePath, options = {}) {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.pdf') return this.pdfExtractor.toMarkdown(filePath, options);
        if (ext === '.docx' || ext === '.doc') return this.wordExtractor.extract(filePath);

        throw new Error(`فرمت پشتیبانی نمی‌شود: ${ext}`);
    }
}

export default PDFExtractor;
