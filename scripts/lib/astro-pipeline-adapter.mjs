/** 
 * Astro Pipeline Adapter - Integration layer for enhanced MDX conversion
 * Bridges existing ContentPipeline with new AstroMDXConverter
 * 
 * وسیله‌ی پل برای اتصال ContentPipeline به AstroMDXConverter
 */

import { AstroMDXConverter } from './astro-mdx-converter.mjs';
import { ContentValidator } from './astro-content-schema.mjs';
import { ImageOptimizer } from './image-optimizer.mjs';
import { LinkNormalizer } from './link-normalizer.mjs';

export class AstroPipelineAdapter {
    constructor(options = {}) {
        this.converter = new AstroMDXConverter({
            strict: options.strict ?? false,
            autoFixFrontmatter: options.autoFixFrontmatter ?? true,
            processImages: options.processImages ?? true,
            processLinks: options.processLinks ?? true,
            htmlEscape: options.htmlEscape ?? true,
        });

        this.validator = ContentValidator;
        this.imageOptimizer = new ImageOptimizer();
        this.linkNormalizer = new LinkNormalizer();
        
        this.stats = {
            enhanced: 0,
            validated: 0,
            failed: 0,
            warnings: [],
            errors: []
        };
    }

    /**
     * Enhance برای تبدیل محتوای تولید شده به Astro-compatible MDX
     * 
     * @param {Object} pipelineResult - نتیجه ContentPipeline
     * @param {Object} options - خیارها
     * @returns {Promise<Object>} نتیجه بهبود یافته
     */
    async enhance(pipelineResult, options = {}) {
        try {
            const { sourceFile, markdown = '' } = options;
            
            // بخش ۱: Frontmatter validation و enhancement
            const enhancedFrontmatter = this.enhanceFrontmatter(
                pipelineResult,
                options
            );

            // بخش ۲: محتوا کو AstroMDXConverter میں پاس کریں
            let mdxContent = pipelineResult.content || markdown;
            
            // Create valid MDX with frontmatter
            const withFrontmatter = `---
${this.stringifyYaml(enhancedFrontmatter)}
---

${mdxContent}`;

            // بخش ۳: استفاده از converter برای نرمال‌سازی
            const convertResult = await this.converter.convert(withFrontmatter, {
                sourceFile: sourceFile || pipelineResult.source
            });

            if (!convertResult.success) {
                this.stats.failed++;
                console.warn(`   ⚠️ Partial conversion: ${convertResult.error}`);
            }

            // بخش ۴: نتیجه نهایی
            const enhanced = {
                ...pipelineResult,
                content: convertResult.content,
                frontmatter: convertResult.frontmatter,
                isAstroEnhanced: true,
                astroMetadata: {
                    images: this.extractImages(mdxContent),
                    links: this.extractLinks(mdxContent),
                    codeBlocks: this.countCodeBlocks(mdxContent),
                    headings: this.getHeadings(mdxContent)
                }
            };

            this.stats.enhanced++;
            return enhanced;

        } catch (error) {
            this.stats.errors.push({
                file: pipelineResult.source,
                error: error.message
            });
            
            console.error(`   ❌ Enhancement failed: ${error.message}`);
            return pipelineResult; // fallback به original
        }
    }

    /**
     * بهبود frontmatter با تعریف‌های Astro
     */
    enhanceFrontmatter(pipelineResult, options = {}) {
        const existing = pipelineResult.frontmatter || {};
        const ai = pipelineResult.ai || {};
        
        const lang = options.lang || existing.lang || 'fa';
        
        // Base frontmatter
        const enhanced = {
            title: existing.title || pipelineResult.title || 'Untitled',
            description: existing.description || ai.description || ai.summary?.slice(0, 150) || '',
            lang: lang,
            publishDate: existing.publishDate || new Date().toISOString().split('T')[0],
            author: existing.author || this.getDefaultAuthor(lang),
            
            // Astro-specific
            layout: options.layout || 'ArticleLayout',
            draft: existing.draft ?? false,
        };

        // Optional fields
        if (ai.tags?.length) enhanced.tags = existing.tags || ai.tags;
        if (ai.category?.primary) enhanced.categories = existing.categories || [ai.category.primary];
        if (ai.keywords?.length) enhanced.keywords = existing.keywords || ai.keywords;
        if (ai.readingTime) enhanced.readingTime = ai.readingTime;
        if (ai.difficulty) enhanced.difficulty = ai.difficulty;
        
        // Metadata
        if (pipelineResult.sourceType) enhanced.sourceType = pipelineResult.sourceType;
        if (pipelineResult.metadata?.bookSlug) enhanced.book = pipelineResult.metadata.bookSlug;
        if (pipelineResult.metadata?.chapterNumber) enhanced.chapter = pipelineResult.metadata.chapterNumber;
        
        // Interface-specific (برای سایت‌های خاص)
        if (existing.interface) enhanced.interface = existing.interface;
        
        return enhanced;
    }

    /**
     * تخلیص محتوا از تصاویر
     */
    extractImages(content) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const images = [];
        let match;
        
        while ((match = imageRegex.exec(content)) !== null) {
            images.push({
                alt: match[1],
                src: match[2]
            });
        }
        
        return images;
    }

    /**
     * تخلیص لینک‌ها از محتوا
     */
    extractLinks(content) {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = [];
        let match;
        
        while ((match = linkRegex.exec(content)) !== null) {
            if (!match[2].startsWith('!')) { // Skip image syntax
                links.push({
                    text: match[1],
                    href: match[2]
                });
            }
        }
        
        return links;
    }

    /**
     * شمارش بلاک‌های کد
     */
    countCodeBlocks(content) {
        const codeRegex = /```[\s\S]*?```/g;
        const matches = content.match(codeRegex);
        return matches ? matches.length : 0;
    }

    /**
     * استخراج heading‌ها
     */
    getHeadings(content) {
        const headingRegex = /^#{1,6}\s+(.+)$/gm;
        const headings = [];
        let match;
        
        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[0].match(/^#+/)[0].length;
            headings.push({
                level,
                text: match[1]
            });
        }
        
        return headings;
    }

    /**
     * نویسنده‌ی پیش‌فرض بر اساس زبان
     */
    getDefaultAuthor(lang) {
        return lang === 'en' ? 'Mahdi Salem' : 'مهدی سالم';
    }

    /**
     * تبدیل object به YAML string
     */
    stringifyYaml(obj) {
        const lines = [];
        for (const [key, value] of Object.entries(obj)) {
            if (value === undefined || value === null) continue;
            
            if (Array.isArray(value)) {
                lines.push(`${key}:`);
                value.forEach(item => {
                    lines.push(`  - "${String(item).replace(/"/g, '\\"')}"`);
                });
            } else if (typeof value === 'string') {
                // اگر مقدار شامل quote است، quoted کنید
                const needsQuotes = value.includes(':') || value.includes('"') || value.includes('\n');
                if (needsQuotes) {
                    lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
                } else {
                    lines.push(`${key}: ${value}`);
                }
            } else if (typeof value === 'object') {
                lines.push(`${key}:`);
                for (const [k, v] of Object.entries(value)) {
                    lines.push(`  ${k}: ${JSON.stringify(v)}`);
                }
            } else {
                lines.push(`${key}: ${value}`);
            }
        }
        return lines.join('\n');
    }

    /**
     * Batch enhance تعدادی نتایج
     */
    async enhanceBatch(results, options = {}) {
        const enhanced = [];
        
        for (const result of results) {
            const enhanced_result = await this.enhance(result, options);
            enhanced.push(enhanced_result);
        }
        
        return enhanced;
    }

    /**
     * دریافت آمار enhancement
     */
    getStats() {
        return {
            ...this.stats,
            converter: this.converter.getStats()
        };
    }

    /**
     * بازنشانی stats
     */
    reset() {
        this.stats = {
            enhanced: 0,
            validated: 0,
            failed: 0,
            warnings: [],
            errors: []
        };
    }
}

export default AstroPipelineAdapter;
