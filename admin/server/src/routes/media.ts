/**
 * Media routes — manage files in public/
 */

import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from '../index.js';

export const mediaRoutes = new Hono();

const PUBLIC_DIR = () => path.join(PROJECT_ROOT, 'public');

/**
 * GET / — list all files in public/ (with basic metadata)
 */
mediaRoutes.get('/', async (c) => {
    const subdir = c.req.query('dir') || '';
    const targetDir = path.join(PUBLIC_DIR(), subdir);

    try {
        const entries = await fs.readdir(targetDir, { withFileTypes: true });
        const items = await Promise.all(
            entries.map(async (entry) => {
                const fullPath = path.join(targetDir, entry.name);
                const relativePath = path.relative(PUBLIC_DIR(), fullPath).replace(/\\/g, '/');
                const stat = await fs.stat(fullPath);

                return {
                    name: entry.name,
                    path: '/' + relativePath,
                    isDirectory: entry.isDirectory(),
                    size: stat.size,
                    modifiedAt: stat.mtime.toISOString(),
                    type: entry.isDirectory() ? 'directory' : getFileType(entry.name),
                };
            })
        );

        return c.json({
            directory: '/' + (subdir || ''),
            items: items.sort((a, b) => {
                // Directories first, then files
                if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
                return a.name.localeCompare(b.name);
            }),
            count: items.length,
        });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

// Upload and delete — Phase 5
mediaRoutes.post('/upload', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 5' }, 501);
});

mediaRoutes.delete('/:path{.*}', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 5' }, 501);
});

// --- Helpers ---

function getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.avif'];
    const videoExts = ['.mp4', '.webm', '.ogg'];
    const audioExts = ['.mp3', '.wav', '.flac', '.ogg'];
    const docExts = ['.pdf', '.doc', '.docx'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (docExts.includes(ext)) return 'document';
    return 'file';
}
