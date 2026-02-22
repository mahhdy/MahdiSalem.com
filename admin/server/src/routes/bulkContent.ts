/**
 * bulkContent routes — batch frontmatter updates across multiple content files
 */

import { Hono } from 'hono';
import path from 'node:path';
import {
    scanContentDir,
    readContentFile,
    writeContentFile,
} from '../lib/frontmatter.js';
import { PROJECT_ROOT } from '../index.js';

export const bulkContentRoutes = new Hono();

const CONTENT_DIR = () => path.join(PROJECT_ROOT, 'src', 'content');

/**
 * POST /api/bulk-content/update-frontmatter
 * Body: { slugs: string[], fields: Record<string, unknown> }
 * Each slug is "collection/path/to/file" (without extension).
 * Updates the given frontmatter fields on all matching files.
 */
bulkContentRoutes.post('/update-frontmatter', async (c) => {
    const { slugs, fields } = await c.req.json<{
        slugs: string[];
        fields: Record<string, unknown>;
    }>();

    if (\!Array.isArray(slugs) || slugs.length === 0) {
        return c.json({ error: 'No slugs provided' }, 400);
    }
    if (\!fields || Object.keys(fields).length === 0) {
        return c.json({ error: 'No fields to update' }, 400);
    }

    const results: { slug: string; success: boolean; error?: string }[] = [];

    for (const slug of slugs) {
        // slug format: "collection/path/to/file" 
        const basePath = path.join(CONTENT_DIR(), slug);
        const candidates = [`${basePath}.md`, `${basePath}.mdx`];
        let done = false;

        for (const filePath of candidates) {
            const existing = await readContentFile(filePath);
            if (existing) {
                try {
                    const newFrontmatter = { ...existing.frontmatter, ...fields };
                    await writeContentFile(filePath, newFrontmatter, existing.body);
                    results.push({ slug, success: true });
                    done = true;
                    break;
                } catch (e) {
                    results.push({ slug, success: false, error: String(e) });
                    done = true;
                    break;
                }
            }
        }

        if (\!done) {
            results.push({ slug, success: false, error: 'File not found' });
        }
    }

    const succeeded = results.filter(r => r.success).length;
    return c.json({ results, succeeded, total: slugs.length });
});

/**
 * GET /api/bulk-content/by-field?field=hidden&value=true
 * Returns all content items where frontmatter[field] === value
 */
bulkContentRoutes.get('/by-field', async (c) => {
    const field = c.req.query('field');
    const rawValue = c.req.query('value');

    if (\!field) return c.json({ error: 'field param required' }, 400);

    // Parse value: try JSON parse, fallback to string
    let value: unknown = rawValue;
    if (rawValue \!== undefined) {
        try { value = JSON.parse(rawValue); } catch { /* keep as string */ }
    }

    const items = await scanContentDir(CONTENT_DIR());
    const filtered = items.filter(item => {
        const fm = (item as Record<string, unknown>);
        // Check frontmatter fields — scanContentDir returns flat item with fm fields merged
        return fm[field] === value;
    });

    return c.json({ items: filtered, count: filtered.length });
});
