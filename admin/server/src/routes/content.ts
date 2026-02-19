/**
 * Content routes — list, read, create, update, delete content files
 */

import { Hono } from 'hono';
import path from 'node:path';
import {
    scanContentDir,
    readContentFile,
    writeContentFile,
    softDeleteContentFile,
} from '../lib/frontmatter.js';
import { PROJECT_ROOT } from '../index.js';

export const contentRoutes = new Hono();

const CONTENT_DIR = () => path.join(PROJECT_ROOT, 'src', 'content');

/**
 * GET / — list all content files (metadata only)
 */
contentRoutes.get('/', async (c) => {
    const collection = c.req.query('collection');
    const lang = c.req.query('lang');
    const draft = c.req.query('draft');

    let items = await scanContentDir(CONTENT_DIR());

    if (collection) items = items.filter((i) => i.collection === collection);
    if (lang) items = items.filter((i) => i.lang === lang);
    if (draft === 'true') items = items.filter((i) => i.draft);
    if (draft === 'false') items = items.filter((i) => !i.draft);

    return c.json({ items, count: items.length });
});

/**
 * GET /:collection/:slug — read single file (frontmatter + body)
 */
contentRoutes.get('/:collection/:slug{.*}', async (c) => {
    const collection = c.req.param('collection');
    const slug = c.req.param('slug');

    // Try both .md and .mdx
    const basePath = path.join(CONTENT_DIR(), collection, slug);
    const candidates = [`${basePath}.md`, `${basePath}.mdx`];

    for (const filePath of candidates) {
        const file = await readContentFile(filePath);
        if (file) return c.json(file);
    }

    return c.json({ error: 'File not found' }, 404);
});

/**
 * POST /:collection — create a new content file
 */
contentRoutes.post('/:collection', async (c) => {
    const collection = c.req.param('collection');
    const body = await c.req.json<{
        slug: string;
        frontmatter: Record<string, unknown>;
        body?: string;
    }>();

    const filePath = path.join(CONTENT_DIR(), collection, `${body.slug}.md`);

    // Check if file already exists
    try {
        const { readFile } = await import('node:fs/promises');
        await readFile(filePath);
        return c.json({ error: 'File already exists' }, 409);
    } catch {
        // Good — file doesn't exist
    }

    await writeContentFile(filePath, body.frontmatter, body.body || '');
    return c.json({ success: true, filePath }, 201);
});

/**
 * PUT /:collection/:slug — update frontmatter and/or body
 */
contentRoutes.put('/:collection/:slug{.*}', async (c) => {
    const collection = c.req.param('collection');
    const slug = c.req.param('slug');
    const updates = await c.req.json<{
        frontmatter?: Record<string, unknown>;
        body?: string;
    }>();

    const basePath = path.join(CONTENT_DIR(), collection, slug);
    const candidates = [`${basePath}.md`, `${basePath}.mdx`];

    for (const filePath of candidates) {
        const existing = await readContentFile(filePath);
        if (existing) {
            const newFrontmatter = { ...existing.frontmatter, ...(updates.frontmatter || {}) };
            const newBody = updates.body !== undefined ? updates.body : existing.body;
            await writeContentFile(filePath, newFrontmatter, newBody);
            return c.json({ success: true, filePath });
        }
    }

    return c.json({ error: 'File not found' }, 404);
});

/**
 * DELETE /:collection/:slug — soft-delete
 */
contentRoutes.delete('/:collection/:slug{.*}', async (c) => {
    const collection = c.req.param('collection');
    const slug = c.req.param('slug');

    const basePath = path.join(CONTENT_DIR(), collection, slug);
    const candidates = [`${basePath}.md`, `${basePath}.mdx`];

    for (const filePath of candidates) {
        try {
            await softDeleteContentFile(filePath);
            return c.json({ success: true, deleted: filePath });
        } catch {
            // Try next candidate
        }
    }

    return c.json({ error: 'File not found' }, 404);
});
