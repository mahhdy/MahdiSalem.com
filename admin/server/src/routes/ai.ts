import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from '../index.js';

export const aiRoutes = new Hono();

const CATEGORIES_FILE = () => path.join(PROJECT_ROOT, 'src', 'data', 'categories.ts');
const AI_TAGGER_SCRIPT = () => path.join(PROJECT_ROOT, 'scripts', 'lib', 'ai-tagger.mjs');

aiRoutes.post('/tag', async (c) => {
    try {
        const body = await c.req.json();
        const { text, title, lang } = body;

        if (!text) {
            return c.json({ error: 'Text content is required' }, 400);
        }

        // Parse categories dynamically to pass to AI tagger
        const rawCats = await fs.readFile(CATEGORIES_FILE(), 'utf-8');
        const categoryRegex = /\{\s*slug:\s*'([^']+)'/g;
        const availableCategories: string[] = [];
        let m;
        while ((m = categoryRegex.exec(rawCats)) !== null) {
            availableCategories.push(m[1]);
        }

        // Dynamically import AITagger from the project root scripts
        const { AITagger } = await import(AI_TAGGER_SCRIPT());
        const tagger = new AITagger({ provider: process.env.AI_PROVIDER || 'openai' });

        const result = await tagger.analyze(text, {
            title,
            lang: lang || 'fa',
            forceRefresh: true, // we want fresh tags for the UI request
            availableCategories
        });

        return c.json({ success: true, result });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});
