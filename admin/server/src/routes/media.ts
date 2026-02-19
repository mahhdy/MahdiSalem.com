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
    try {
        const body = await c.req.parseBody();
        const file = body.file;
        const subdir = (body.dir as string) || '';

        if (!(file instanceof File)) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        const targetDir = path.join(PUBLIC_DIR(), subdir);
        await fs.mkdir(targetDir, { recursive: true });

        const filePath = path.join(targetDir, file.name);

        // Check if file exists - add timestamp if it does to avoid overwrite
        let finalPath = filePath;
        try {
            await fs.access(filePath);
            const ext = path.extname(file.name);
            const base = path.basename(file.name, ext);
            finalPath = path.join(targetDir, `${base}-${Date.now()}${ext}`);
        } catch {
            // File doesn't exist, use original name
        }

        const arrayBuffer = await file.arrayBuffer();
        await fs.writeFile(finalPath, Buffer.from(arrayBuffer));

        return c.json({
            success: true,
            filename: path.basename(finalPath),
            path: '/' + path.relative(PUBLIC_DIR(), finalPath).replace(/\\/g, '/')
        }, 201);
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

mediaRoutes.delete('/:path{.*}', async (c) => {
    const relativePath = c.req.param('path');
    const fullPath = path.join(PUBLIC_DIR(), relativePath);

    try {
        await fs.access(fullPath);

        // Soft delete: rename to .deleted
        const deletedPath = fullPath + '.deleted';
        await fs.rename(fullPath, deletedPath);

        return c.json({ success: true, message: `File soft-deleted: ${relativePath}` });
    } catch (err) {
        return c.json({ error: 'File not found or could not be deleted' }, 404);
    }
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
