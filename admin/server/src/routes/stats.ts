/**
 * Stats route — collection counts, draft counts, health overview
 */

import { Hono } from 'hono';
import path from 'node:path';
import { scanContentDir, type ContentMeta } from '../lib/frontmatter.js';
import { PROJECT_ROOT } from '../index.js';

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
