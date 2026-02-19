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

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', projectRoot: PROJECT_ROOT }));

// Mount route groups
app.route('/api/stats', statsRoutes);
app.route('/api/content', contentRoutes);
app.route('/api/categories', categoriesRoutes);
app.route('/api/tags', tagsRoutes);
app.route('/api/i18n', i18nRoutes);
app.route('/api/media', mediaRoutes);
app.route('/api/scripts', scriptsRoutes);

const PORT = 3334;

console.log(`\n🔧 Admin Server starting...`);
console.log(`   Project root: ${PROJECT_ROOT}`);
console.log(`   Listening on: http://localhost:${PORT}\n`);

serve({ fetch: app.fetch, port: PORT });
