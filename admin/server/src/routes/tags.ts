/**
 * Tags routes — scan all frontmatter for tags, rename/merge/delete
 */

import { Hono } from 'hono';
import path from 'node:path';
import { scanContentDir } from '../lib/frontmatter.js';
import { PROJECT_ROOT } from '../index.js';

export const tagsRoutes = new Hono();

/**
 * GET / — return canonical tag list with usage counts
 */
tagsRoutes.get('/', async (c) => {
    const contentDir = path.join(PROJECT_ROOT, 'src', 'content');
    const allContent = await scanContentDir(contentDir);

    const tagMap: Record<string, { count: number; collections: Set<string> }> = {};

    for (const item of allContent) {
        if (item.tags) {
            for (const tag of item.tags) {
                if (!tagMap[tag]) tagMap[tag] = { count: 0, collections: new Set() };
                tagMap[tag].count++;
                tagMap[tag].collections.add(item.collection);
            }
        }
    }

    const tags = Object.entries(tagMap)
        .map(([name, data]) => ({
            name,
            count: data.count,
            collections: Array.from(data.collections),
        }))
        .sort((a, b) => b.count - a.count);

    return c.json({ tags, count: tags.length });
});

// Rename and delete will be implemented in Phase 3
tagsRoutes.put('/:tag/rename', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 3' }, 501);
});

tagsRoutes.delete('/:tag', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 3' }, 501);
});
