/**
 * Stats route — collection counts, draft counts, health overview
 */

import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { scanContentDir, type ContentMeta } from '../lib/frontmatter.js';
import { PROJECT_ROOT } from '../index.js';
import matter from 'gray-matter';

export const statsRoutes = new Hono();

statsRoutes.get('/', async (c) => {
    const contentDir = path.join(PROJECT_ROOT, 'src', 'content');
    const allContent = await scanContentDir(contentDir);

    // Group by collection
    const collections: Record<string, { total: number; drafts: number; languages: Record<string, number> }> = {};

    for (const item of allContent) {
        if (!collections[item.collection]) {
            collections[item.collection] = { total: 0, drafts: 0, languages: {} };
        }
        collections[item.collection].total++;
        if (item.draft) collections[item.collection].drafts++;
        collections[item.collection].languages[item.lang] =
            (collections[item.collection].languages[item.lang] || 0) + 1;
    }

    const totalItems = allContent.length;
    const totalDrafts = allContent.filter((i) => i.draft).length;

    // Items missing metadata
    const missingCover = allContent.filter((i) => {
        const fm = i as Record<string, unknown>;
        return !fm.category && !fm.interface;
    }).length;

    return c.json({
        totalItems,
        totalDrafts,
        collections,
        missingTaxonomy: missingCover,
        generatedAt: new Date().toISOString(),
    });
});

/**
 * GET /api/stats/drafts — list all draft items
 */
statsRoutes.get('/drafts', async (c) => {
    const contentDir = path.join(PROJECT_ROOT, 'src', 'content');
    const allContent = await scanContentDir(contentDir);
    const drafts = allContent.filter((i) => i.draft);

    return c.json({ drafts, count: drafts.length });
});

/**
 * GET /api/stats/recent — list recently modified content files
 */
statsRoutes.get('/recent', async (c) => {
    const contentDir = path.join(PROJECT_ROOT, 'src', 'content');
    const limit = Number(c.req.query('limit') || 15);

    // Walk all .md/.mdx files and get mtime
    const results: { file: string; collection: string; slug: string; title: string; modifiedAt: string }[] = [];

    async function walkDir(dir: string, collection: string) {
        let entries;
        try {
            entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
            return;
        }
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                await walkDir(full, collection);
            } else if (/\.(md|mdx)$/.test(entry.name)) {
                try {
                    const stat = await fs.stat(full);
                    const raw = await fs.readFile(full, 'utf-8');
                    const { data } = matter(raw);
                    const rel = path.relative(path.join(contentDir, collection), full);
                    const slug = rel.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
                    results.push({
                        file: full,
                        collection,
                        slug,
                        title: String(data.title || slug),
                        modifiedAt: stat.mtime.toISOString(),
                    });
                } catch {
                    // skip unreadable files
                }
            }
        }
    }

    // Get collection directories
    let collections: string[] = [];
    try {
        const entries = await fs.readdir(contentDir, { withFileTypes: true });
        collections = entries
            .filter((e) => e.isDirectory() && e.name !== 'Archive' && e.name !== 'pdfs')
            .map((e) => e.name);
    } catch {
        return c.json({ items: [] });
    }

    await Promise.all(collections.map((col) => walkDir(path.join(contentDir, col), col)));

    // Sort by modification time descending, take top N
    results.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    const items = results.slice(0, limit);

    return c.json({ items });
});
