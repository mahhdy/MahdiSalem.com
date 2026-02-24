/**
 * Admin Server — Hono entry point
 * Runs on localhost:3334, provides REST API for the admin SPA.
 * Reads/writes flat files in the MahdiSalem.com project.
 */

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { contentRoutes } from './routes/content.js';
import { statsRoutes } from './routes/stats.js';
import { categoriesRoutes } from './routes/categories.js';
import { tagsRoutes } from './routes/tags.js';
import { i18nRoutes } from './routes/i18n.js';
import { mediaRoutes } from './routes/media.js';
import { scriptsRoutes } from './routes/scripts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 3 levels up: admin/server/src -> admin/server -> admin -> project
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

const app = new Hono();

// Middleware
app.use('*', cors({ origin: 'http://localhost:3333' }));
app.use('*', logger());

// Basic info at root
app.get('/', (c) => c.html(`
    <body style="font-family: sans-serif; background: #0f1117; color: #e8eaf0; padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh;">
        <h1 style="color: #638cff;">🔧 MahdiSalem Admin API</h1>
        <p style="color: #8b8fa3;">The server is running correctly.</p>
        <div style="background: #1c1f2e; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-top: 20px;">
            <p>Access the Admin UI at: <a href="http://localhost:3333" style="color: #638cff; font-weight: bold; text-decoration: none;">http://localhost:3333</a></p>
        </div>
        <p style="margin-top: 20px; font-size: 0.8rem; color: #5c6078;">Project Root: ${PROJECT_ROOT}</p>
    </body>
`));

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', projectRoot: PROJECT_ROOT }));

import { aiRoutes } from './routes/ai.js';
import { siteConfigRoutes } from './routes/siteConfig.js';
import { bulkContentRoutes } from './routes/bulkContent.js';
import { backupsRoutes } from './routes/backups.js';

// ... (in routes section)
app.route('/api/stats', statsRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/categories', categoriesRoutes);
app.route('/api/tags', tagsRoutes);
app.route('/api/i18n', i18nRoutes);
app.route('/api/media', mediaRoutes);
app.route('/api/scripts', scriptsRoutes);
app.route('/api/ai', aiRoutes);
app.route('/api/site-config', siteConfigRoutes);
app.route('/api/bulk-content', bulkContentRoutes);
app.route('/api/backups', backupsRoutes);

const PORT = 3334;

console.log(`\n🔧 Admin Server starting...`);
console.log(`   Project root: ${PROJECT_ROOT}`);
console.log(`   Listening on: http://localhost:${PORT}\n`);

serve({ fetch: app.fetch, port: PORT });
