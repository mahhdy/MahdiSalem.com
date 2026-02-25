/**
 * siteConfig routes — read and write src/config/site.ts
 * Parses the TypeScript file as text, surgically replaces known fields.
 */

import { Hono } from 'hono';
import path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { PROJECT_ROOT } from '../index.js';

export const siteConfigRoutes = new Hono();

const CONFIG_PATH = () => path.join(PROJECT_ROOT, 'src', 'config', 'site.ts');

/** GET /api/site-config — return current config as JSON */
siteConfigRoutes.get('/', async (c) => {
    try {
        const raw = await readFile(CONFIG_PATH(), 'utf-8');

        // Extract telegramView
        const tvMatch = raw.match(/telegramView:\s*['"](\w+)['"]/);
        const tlMatch = raw.match(/telegramHomeLimit:\s*(\d+)/);
        const alcMatch = raw.match(/articleListColumns:\s*(\d+)/);

        // Extract social handles
        const socialMatch = (key: string) => {
            const m = raw.match(new RegExp(`${key}:\\s*['"]([^'"]*)['"]`));
            return m ? m[1] : '';
        };

        // Extract feedLimits
        const flMatch = (key: string) => {
            const m = raw.match(new RegExp(`${key}:\\s*(\\d+)`, 'm'));
            return m ? parseInt(m[1]) : 10;
        };

        // Extract feedUrls
        const fuMatch = (key: string) => {
            const m = raw.match(new RegExp(`${key}:\\s*['"]([^'"]*)['"]`, 'm'));
            return m ? m[1] : '';
        };

        return c.json({
            telegramView: tvMatch ? tvMatch[1] : 'full',
            telegramHomeLimit: tlMatch ? parseInt(tlMatch[1]) : 5,
            articleListColumns: alcMatch ? (parseInt(alcMatch[1]) as 1 | 2) : 2,
            social: {
                telegram: socialMatch('telegram'),
                x: socialMatch('x'),
                instagram: socialMatch('instagram'),
                facebook: socialMatch('facebook'),
                linkedin: socialMatch('linkedin'),
            },
            feedLimits: {
                telegram: flMatch('telegram'),
                x: flMatch('x'),
                instagram: flMatch('instagram'),
            },
            feedUrls: {
                instagram: fuMatch('instagram'),
                x: fuMatch('x'),
            },
        });
    } catch (e) {
        return c.json({ error: String(e) }, 500);
    }
});

/** PUT /api/site-config — update config fields */
siteConfigRoutes.put('/', async (c) => {
    try {
        const updates = await c.req.json<{
            telegramView?: 'full' | 'compact';
            telegramHomeLimit?: number;
            articleListColumns?: 1 | 2;
            social?: Record<string, string>;
            feedLimits?: Record<string, number>;
            feedUrls?: Record<string, string>;
        }>();

        let raw = await readFile(CONFIG_PATH(), 'utf-8');
        const bakPath = CONFIG_PATH() + '.bak';
        await writeFile(bakPath, raw, 'utf-8');

        if (updates.telegramView) {
            raw = raw.replace(
                /telegramView:\s*['"][^'"]*['"]\s*as\s*['"]full['"]\s*\|\s*['"]compact['"]/,
                `telegramView: '${updates.telegramView}' as 'full' | 'compact'`
            );
        }

        if (updates.telegramHomeLimit !== undefined) {
            raw = raw.replace(
                /telegramHomeLimit:\s*\d+/,
                `telegramHomeLimit: ${updates.telegramHomeLimit}`
            );
        }

        if (updates.articleListColumns !== undefined) {
            raw = raw.replace(
                /articleListColumns:\s*\d+/,
                `articleListColumns: ${updates.articleListColumns}`
            );
        }

        if (updates.social) {
            for (const [key, val] of Object.entries(updates.social)) {
                raw = raw.replace(
                    new RegExp(`(${key}:\\s*)['"][^'"]*['"]`),
                    `$1'${val}'`
                );
            }
        }

        if (updates.feedLimits) {
            for (const [key, val] of Object.entries(updates.feedLimits)) {
                // Ensure we only replace the digits, not the whole line
                raw = raw.replace(
                    new RegExp(`(${key}:\\s*)\\d+`),
                    `$1${val}`
                );
            }
        }

        if (updates.feedUrls) {
            for (const [key, val] of Object.entries(updates.feedUrls)) {
                raw = raw.replace(
                    new RegExp(`(${key}:\\s*)['"][^'"]*['"]`),
                    `$1'${val}'`
                );
            }
        }

        await writeFile(CONFIG_PATH(), raw, 'utf-8');
        return c.json({ success: true });
    } catch (e) {
        return c.json({ error: String(e) }, 500);
    }
});
