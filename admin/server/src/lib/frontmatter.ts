/**
 * Frontmatter utilities — read/write markdown files with gray-matter
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export interface ContentFile {
    collection: string;
    slug: string;
    filePath: string;
    frontmatter: Record<string, unknown>;
    body: string;
}

export interface ContentMeta {
    collection: string;
    slug: string;
    filePath: string;
    title: string;
    lang: string;
    draft: boolean;
    publishDate?: string;
    updatedDate?: string;
    category?: string | string[];
    tags?: string[];
    interface?: string;
    frontmatter: Record<string, unknown>;
}

/**
 * Scan a content directory and return metadata for all .md/.mdx files
 */
export async function scanContentDir(contentDir: string): Promise<ContentMeta[]> {
    const results: ContentMeta[] = [];
    const collections = await getSubdirectories(contentDir);

    for (const collection of collections) {
        // Skip Archive and other non-collection dirs
        if (collection === 'Archive' || collection === 'pdfs') continue;

        const collDir = path.join(contentDir, collection);
        const files = await findMarkdownFiles(collDir);

        for (const filePath of files) {
            try {
                const raw = await fs.readFile(filePath, 'utf-8');
                const { data } = matter(raw);
                const relativePath = path.relative(collDir, filePath);
                const slug = relativePath.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');

                results.push({
                    collection,
                    slug,
                    filePath,
                    title: String(data.title || slug),
                    lang: String(data.lang || 'fa'),
                    draft: Boolean(data.draft),
                    publishDate: data.publishDate ? String(data.publishDate) : undefined,
                    updatedDate: data.updatedDate ? String(data.updatedDate) : undefined,
                    category: data.category || data.categories,
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    interface: data.interface,
                    frontmatter: data,
                });
            } catch (err) {
                console.warn(`⚠️  Failed to parse ${filePath}:`, (err as Error).message);
            }
        }
    }

    return results;
}

/**
 * Read a single content file (frontmatter + body)
 */
export async function readContentFile(filePath: string): Promise<ContentFile | null> {
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        const { data, content } = matter(raw);
        const parts = filePath.replace(/\\/g, '/').split('/');
        const contentIdx = parts.indexOf('content');
        const collection = contentIdx >= 0 ? parts[contentIdx + 1] : 'unknown';
        const slug = parts.slice(contentIdx + 2).join('/').replace(/\.(md|mdx)$/, '');

        return {
            collection,
            slug,
            filePath,
            frontmatter: data,
            body: content,
        };
    } catch {
        return null;
    }
}

/**
 * Write a content file (frontmatter + body), creating a .bak backup first
 */
export async function writeContentFile(
    filePath: string,
    frontmatter: Record<string, unknown>,
    body: string
): Promise<void> {
    // Create backup
    try {
        const existing = await fs.readFile(filePath, 'utf-8');
        await fs.writeFile(filePath + '.bak', existing, 'utf-8');
    } catch {
        // File doesn't exist yet — no backup needed
    }

    const output = matter.stringify(body, frontmatter);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, output, 'utf-8');
}

/**
 * Soft-delete a content file (rename to .deleted)
 */
export async function softDeleteContentFile(filePath: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const deletedPath = `${filePath}.deleted-${timestamp}`;
    await fs.rename(filePath, deletedPath);
}

// --- Helpers ---

async function getSubdirectories(dir: string): Promise<string[]> {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
        return [];
    }
}

async function findMarkdownFiles(dir: string): Promise<string[]> {
    const results: string[] = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                results.push(...(await findMarkdownFiles(full)));
            } else if (/\.(md|mdx)$/.test(entry.name)) {
                results.push(full);
            }
        }
    } catch {
        // Dir doesn't exist or isn't readable
    }
    return results;
}
