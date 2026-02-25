import { Hono } from 'hono';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT } from '../index.js';
// @ts-ignore
import AdmZip from 'adm-zip';
import { globby } from 'globby';
import matter from 'gray-matter';

export const backupsRoutes = new Hono();

// GET /api/backups - List all .bak files and content-source/Archive files
backupsRoutes.get('/', async (c) => {
    try {
        const bakPattern = path.posix.join(PROJECT_ROOT.replace(/\\/g, '/'), 'src', 'content', '**', '*.bak');
        const archivePattern = path.posix.join(PROJECT_ROOT.replace(/\\/g, '/'), 'content-source', 'Archive', '**', '*.*');

        const [bakFiles, archiveFiles] = await Promise.all([
            globby(bakPattern, { onlyFiles: true }),
            globby(archivePattern, { onlyFiles: true })
        ]);

        const items = await Promise.all([
            ...bakFiles.map(async f => {
                const stat = await fs.stat(f);
                let frontmatter = null;
                try {
                    const parsed = matter.read(f);
                    if (parsed.data && Object.keys(parsed.data).length > 0) {
                        frontmatter = parsed.data;
                    }
                } catch (e) { }

                return {
                    path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
                    name: path.basename(f),
                    type: 'bak',
                    size: stat.size,
                    modifiedAt: stat.mtime.toISOString(),
                    frontmatter,
                };
            }),
            ...archiveFiles.map(async f => {
                const stat = await fs.stat(f);
                let frontmatter = null;
                if (f.endsWith('.mdx') || f.endsWith('.md')) {
                    try {
                        const parsed = matter.read(f);
                        if (parsed.data && Object.keys(parsed.data).length > 0) {
                            frontmatter = parsed.data;
                        }
                    } catch (e) { }
                }

                return {
                    path: path.relative(PROJECT_ROOT, f).replace(/\\/g, '/'),
                    name: path.basename(f),
                    type: 'archive',
                    size: stat.size,
                    modifiedAt: stat.mtime.toISOString(),
                    frontmatter,
                };
            }),
        ]);

        items.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

        return c.json({ items });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// DELETE /api/backups - Delete selected files
backupsRoutes.delete('/', async (c) => {
    try {
        const body = await c.req.json();
        const files: string[] = body.files || [];

        const deleted = [];
        const errors = [];

        for (const file of files) {
            try {
                // simple security check
                if (file.includes('..') || (!file.startsWith('src/content/') && !file.startsWith('content-source/Archive/'))) {
                    throw new Error('Invalid file path');
                }
                const fullPath = path.join(PROJECT_ROOT, file);
                await fs.unlink(fullPath);
                deleted.push(file);
            } catch (err: any) {
                errors.push({ file, error: err.message });
            }
        }

        return c.json({ deleted, errors });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});

// POST /api/backups/download - Zip and download files
backupsRoutes.post('/download', async (c) => {
    try {
        const body = await c.req.json();
        const files: string[] = body.files || [];

        if (files.length === 0) {
            return c.json({ error: 'No files selected' }, 400);
        }

        const zip = new AdmZip();

        for (const file of files) {
            if (file.includes('..') || (!file.startsWith('src/content/') && !file.startsWith('content-source/Archive/'))) {
                continue;
            }
            const fullPath = path.join(PROJECT_ROOT, file);
            try {
                await fs.access(fullPath); // check exists
                // Add file to ZIP at the same relative path
                zip.addLocalFile(fullPath, path.dirname(file));
            } catch {
                // ignore missing
            }
        }

        const zipBuffer = zip.toBuffer();

        return new Response(zipBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': 'attachment; filename="backups.zip"',
                'Content-Length': zipBuffer.length.toString(),
            }
        });
    } catch (err: any) {
        return c.json({ error: err.message }, 500);
    }
});
