/**
 * i18n routes — read/write en.json and fa.json
 */

import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PROJECT_ROOT } from '../index.js';

export const i18nRoutes = new Hono();

const I18N_DIR = () => path.join(PROJECT_ROOT, 'src', 'i18n');

async function readLang(lang: string): Promise<Record<string, unknown>> {
    const filePath = path.join(I18N_DIR(), `${lang}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
}

async function writeLang(lang: string, data: Record<string, unknown>): Promise<void> {
    const filePath = path.join(I18N_DIR(), `${lang}.json`);
    // Create backup
    const existing = await fs.readFile(filePath, 'utf-8');
    await fs.writeFile(filePath + '.bak', existing, 'utf-8');
    // Write new content (pretty-printed for readability)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Set a nested key on an object. "nav.home" → obj.nav.home = value
 */
function setNestedKey(obj: Record<string, unknown>, key: string, value: unknown): void {
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {};
        }
        current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
}

/**
 * Delete a nested key from an object
 */
function deleteNestedKey(obj: Record<string, unknown>, key: string): boolean {
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
            return false;
        }
        current = current[parts[i]] as Record<string, unknown>;
    }
    const lastKey = parts[parts.length - 1];
    if (lastKey in current) {
        delete current[lastKey];
        return true;
    }
    return false;
}

/**
 * GET /:lang — return the full i18n JSON for a language
 */
i18nRoutes.get('/:lang', async (c) => {
    const lang = c.req.param('lang');
    if (lang !== 'en' && lang !== 'fa') {
        return c.json({ error: 'Invalid language. Use "en" or "fa".' }, 400);
    }

    try {
        const data = await readLang(lang);
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
        const en = await readLang('en');
        const fa = await readLang('fa');

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

/**
 * PUT /:lang/:key — update a translation key
 * The key supports dot notation for nested paths
 */
i18nRoutes.put('/:lang/*', async (c) => {
    const lang = c.req.param('lang');
    const key = c.req.path.split(`/i18n/${lang}/`)[1];

    if (lang !== 'en' && lang !== 'fa') {
        return c.json({ error: 'Invalid language' }, 400);
    }

    try {
        const { value } = await c.req.json<{ value: string }>();
        const data = await readLang(lang);
        setNestedKey(data, key, value);
        await writeLang(lang, data);
        return c.json({ success: true, lang, key, value });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

/**
 * POST /key — add a key to BOTH languages atomically
 */
i18nRoutes.post('/key', async (c) => {
    try {
        const { key, en: enValue, fa: faValue } = await c.req.json<{
            key: string;
            en: string;
            fa: string;
        }>();

        if (!key || !key.trim()) {
            return c.json({ error: 'Key is required' }, 400);
        }

        const enData = await readLang('en');
        const faData = await readLang('fa');

        setNestedKey(enData, key, enValue || '');
        setNestedKey(faData, key, faValue || '');

        await writeLang('en', enData);
        await writeLang('fa', faData);

        return c.json({ success: true, key, en: enValue, fa: faValue });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

/**
 * DELETE /key/:key — delete a key from BOTH languages
 */
i18nRoutes.delete('/key/*', async (c) => {
    const key = c.req.path.split('/i18n/key/')[1];

    try {
        const enData = await readLang('en');
        const faData = await readLang('fa');

        const deletedEn = deleteNestedKey(enData, key);
        const deletedFa = deleteNestedKey(faData, key);

        if (!deletedEn && !deletedFa) {
            return c.json({ error: `Key "${key}" not found in either language` }, 404);
        }

        await writeLang('en', enData);
        await writeLang('fa', faData);

        return c.json({ success: true, key, deletedFromEn: deletedEn, deletedFromFa: deletedFa });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
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
