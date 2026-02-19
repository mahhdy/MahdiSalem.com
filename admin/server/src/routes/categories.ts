/**
 * Categories routes — read/write src/data/categories.ts
 */

import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from '../index.js';

export const categoriesRoutes = new Hono();

const CATEGORIES_FILE = () => path.join(PROJECT_ROOT, 'src', 'data', 'categories.ts');

/**
 * GET / — parse and return the categories array
 */
categoriesRoutes.get('/', async (c) => {
    try {
        const raw = await fs.readFile(CATEGORIES_FILE(), 'utf-8');

        // Extract the array literal from the TypeScript file
        const match = raw.match(/export const categories:\s*Category\[\]\s*=\s*(\[[\s\S]*?\n\];)/);
        if (!match) {
            return c.json({ error: 'Could not parse categories file' }, 500);
        }

        // Use a simple eval-like parse (safe for local-only usage)
        // Convert the TS array literal to JSON-ish format
        let arrStr = match[1];
        // Remove trailing commas before ] or }
        arrStr = arrStr.replace(/,(\s*[}\]])/g, '$1');
        // Wrap unquoted keys in quotes
        arrStr = arrStr.replace(/(\s)(\w+):/g, '$1"$2":');
        // Replace single quotes with double quotes
        arrStr = arrStr.replace(/'/g, '"');

        try {
            const categories = JSON.parse(arrStr);
            return c.json({ categories, count: categories.length });
        } catch {
            // Fallback: regex extraction for individual categories
            const categoryRegex = /\{\s*slug:\s*'([^']+)'[\s\S]*?nameFa:\s*'([^']+)'[\s\S]*?nameEn:\s*'([^']+)'[\s\S]*?\}/g;
            const categories = [];
            let m;
            while ((m = categoryRegex.exec(raw)) !== null) {
                categories.push({ slug: m[1], nameFa: m[2], nameEn: m[3] });
            }
            return c.json({ categories, count: categories.length, parseMode: 'fallback' });
        }
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

// PUT and POST will be implemented in Phase 3
categoriesRoutes.post('/', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 3' }, 501);
});

categoriesRoutes.put('/:slug', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 3' }, 501);
});

categoriesRoutes.delete('/:slug', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 3' }, 501);
});
