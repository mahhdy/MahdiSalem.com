/**
 * تگ‌گذاری با AI
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CONFIG = {
    provider: process.env.AI_PROVIDER || 'openai',
    cacheDir: '.content-cache/ai',
    cacheEnabled: true
};

class AIProvider {
    constructor(providerName) {
        this.providerName = providerName;
        this.client = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        if (this.providerName === 'openai' && process.env.OPENAI_API_KEY) {
            const OpenAI = (await import('openai')).default;
            this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        } else if (this.providerName === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
            const Anthropic = (await import('@anthropic-ai/sdk')).default;
            this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        }

        this.initialized = true;
    }

    async complete(prompt, options = {}) {
        await this.initialize();
        if (!this.client) return null;

        try {
            if (this.providerName === 'openai') {
                const response = await this.client.chat.completions.create({
                    model: options.model || 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
                        { role: 'user', content: prompt }
                    ],
                    max_tokens: options.maxTokens || 2000,
                    temperature: options.temperature || 0.3
                });
                return response.choices[0].message.content;
            } else if (this.providerName === 'anthropic') {
                const response = await this.client.messages.create({
                    model: options.model || 'claude-sonnet-4-20250514',
                    max_tokens: options.maxTokens || 2000,
                    system: options.systemPrompt || 'You are a helpful assistant.',
                    messages: [{ role: 'user', content: prompt }]
                });
                return response.content[0].text;
            }
        } catch (error) {
            console.error(`   ⚠️ خطای AI: ${error.message}`);
            return null;
        }
    }
}

export class AITagger {
    constructor(options = {}) {
        this.provider = new AIProvider(options.provider || CONFIG.provider);
        this.cacheEnabled = options.cacheEnabled ?? CONFIG.cacheEnabled;
        this.cacheDir = options.cacheDir || CONFIG.cacheDir;
        this.stats = { processed: 0, cached: 0, failed: 0 };
    }

    async analyze(content, options = {}) {
        const { title, forceRefresh = false, lang = 'fa', availableCategories } = options;

        const cacheKey = this.getCacheKey(content, title);
        if (this.cacheEnabled && !forceRefresh) {
            const cached = await this.getFromCache(cacheKey);
            if (cached) { this.stats.cached++; return cached; }
        }

        console.log(`   🤖 تحلیل AI...`);

        try {
            const result = await this.performAnalysis(content, title, lang, availableCategories);
            if (this.cacheEnabled && result) await this.saveToCache(cacheKey, result);
            this.stats.processed++;
            return result;
        } catch (error) {
            this.stats.failed++;
            return this.getDefaultResult(title, lang);
        }
    }

    async performAnalysis(content, title, lang, availableCategories) {
        const prompt = this.buildPrompt(title, content.slice(0, 4000), lang, availableCategories);
        const response = await this.provider.complete(prompt, {
            systemPrompt: this.getSystemPrompt(lang),
            temperature: 0.3
        });

        if (!response) return this.getDefaultResult(title, lang);

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return this.validateResult(JSON.parse(jsonMatch[0]), lang);
        } catch { }

        return this.getDefaultResult(title, lang);
    }

    getSystemPrompt(lang) {
        return lang === 'fa'
            ? 'تو یک سیستم تحلیل محتوای فارسی هستی. همیشه JSON معتبر برگردان.'
            : 'You are a content analysis system. Always return valid JSON.';
    }

    buildPrompt(title, content, lang, availableCategories) {
        const catStrFa = availableCategories ? `\n\n📌 توجه: دسته (category.primary) باید حتما یکی از این مقادیر باشد: ${availableCategories.join(', ')}` : '';
        const catStrEn = availableCategories ? `\n\n📌 NOTE: The category (category.primary) MUST be strictly one of these values: ${availableCategories.join(', ')}` : '';

        if (lang === 'fa') {
            return `عنوان: ${title || 'بدون عنوان'}\n\nمتن:\n${content}\n\n---\n\nJSON با این ساختار برگردان:\n{"tags":["تگ۱","تگ۲"],"category":{"primary":"دسته","secondary":[]},"summary":"خلاصه","description":"توضیح","keywords":["کلید۱"],"readingTime":5,"difficulty":"متوسط"}${catStrFa}`;
        }
        return `Title: ${title || 'Untitled'}\n\nContent:\n${content}\n\n---\n\nReturn JSON: {"tags":["tag1"],"category":{"primary":"cat","secondary":[]},"summary":"summary","description":"desc","keywords":["key"],"readingTime":5,"difficulty":"intermediate"}${catStrEn}`;
    }

    validateResult(result, lang) {
        return {
            tags: Array.isArray(result.tags) ? result.tags.slice(0, 10) : [],
            category: result.category || { primary: lang === 'fa' ? 'متفرقه' : 'Misc', secondary: [] },
            summary: result.summary || '',
            description: result.description || '',
            keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 10) : [],
            readingTime: typeof result.readingTime === 'number' ? result.readingTime : 5,
            difficulty: result.difficulty || (lang === 'fa' ? 'متوسط' : 'intermediate'),
            _analyzed: new Date().toISOString()
        };
    }

    getDefaultResult(title, lang) {
        return {
            tags: [],
            category: { primary: lang === 'fa' ? 'متفرقه' : 'Misc', secondary: [] },
            summary: '',
            description: '',
            keywords: title ? title.split(/\s+/).slice(0, 5) : [],
            readingTime: 5,
            difficulty: lang === 'fa' ? 'متوسط' : 'intermediate',
            _analyzed: new Date().toISOString(),
            _fallback: true
        };
    }

    getCacheKey(content, title) {
        return crypto.createHash('md5').update(content.slice(0, 1000) + (title || '')).digest('hex');
    }

    async getFromCache(key) {
        try {
            const data = await fs.readFile(path.join(this.cacheDir, `${key}.json`), 'utf-8');
            return JSON.parse(data);
        } catch { return null; }
    }

    async saveToCache(key, data) {
        await fs.mkdir(this.cacheDir, { recursive: true });
        await fs.writeFile(path.join(this.cacheDir, `${key}.json`), JSON.stringify(data, null, 2));
    }

    getStats() { return { ...this.stats }; }
}

export default AITagger;
