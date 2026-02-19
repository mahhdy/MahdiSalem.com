/**
 * i18n routes — read/write en.json and fa.json
 */

import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from '../index.js';

export const i18nRoutes = new Hono();

const I18N_DIR = () => path.join(PROJECT_ROOT, 'src', 'i18n');

/**
 * GET /:lang — return the full i18n JSON for a language
 */
i18nRoutes.get('/:lang', async (c) => {
    const lang = c.req.param('lang');
    if (lang !== 'en' && lang !== 'fa') {
        return c.json({ error: 'Invalid language. Use "en" or "fa".' }, 400);
    }

    try {
        const filePath = path.join(I18N_DIR(), `${lang}.json`);
        const raw = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(raw);
        return c.json({ lang, keys: Object.keys(data).length, data });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

/**
 * GET /parity — show keys present in one lang but not the other
 */
i18nRoutes.get('/check/parity', async (c) => {
    try {
        const enRaw = await fs.readFile(path.join(I18N_DIR(), 'en.json'), 'utf-8');
        const faRaw = await fs.readFile(path.join(I18N_DIR(), 'fa.json'), 'utf-8');
        const en = JSON.parse(enRaw);
        const fa = JSON.parse(faRaw);

        const enKeys = new Set(Object.keys(flattenObject(en)));
        const faKeys = new Set(Object.keys(flattenObject(fa)));

        const missingInEn = [...faKeys].filter((k) => !enKeys.has(k));
        const missingInFa = [...enKeys].filter((k) => !faKeys.has(k));

        return c.json({
            enKeyCount: enKeys.size,
            faKeyCount: faKeys.size,
            missingInEn,
            missingInFa,
            inSync: missingInEn.length === 0 && missingInFa.length === 0,
        });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

// Write operations — Phase 4
i18nRoutes.put('/:lang/:key', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 4' }, 501);
});

i18nRoutes.post('/key', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 4' }, 501);
});

i18nRoutes.delete('/key/:key', async (c) => {
    return c.json({ error: 'Not yet implemented — Phase 4' }, 501);
});

// --- Helpers ---

function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}
