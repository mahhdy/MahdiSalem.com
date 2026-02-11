#!/usr/bin/env node
/**
 * سیستم Watch برای پردازش خودکار
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { ContentPipeline } from './process-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let chokidar;
try {
    chokidar = (await import('chokidar')).default;
} catch {
    console.error('❌ لطفاً chokidar نصب کنید: npm install -D chokidar');
    process.exit(1);
}

const CONFIG = {
    watchPaths: [
        'content-source/**/*.tex',
        'content-source/**/*.md',
        'content-source/**/*.mdx',
        'content-source/**/*.pdf',
        'content-source/**/*.docx'
    ],
    ignorePaths: ['**/node_modules/**', '**/.git/**', '**/*.aux', '**/*.log', '**/*.out', '**/.content-cache/**'],
    sourceDir: 'content-source',
    outputDir: 'src/content',
    debounceDelay: 500
};

const COLORS = {
    reset: '\x1b[0m', bright: '\x1b[1m', dim: '\x1b[2m',
    red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
    blue: '\x1b[34m', cyan: '\x1b[36m', bgBlue: '\x1b[44m', white: '\x1b[37m'
};

class Logger {
    timestamp() { return new Date().toLocaleTimeString('fa-IR', { hour12: false }); }

    log(icon, msg, color = COLORS.white) {
        console.log(`${COLORS.dim}[${this.timestamp()}]${COLORS.reset} ${icon} ${color}${msg}${COLORS.reset}`);
    }

    info(msg) { this.log('ℹ️', msg, COLORS.blue); }
    success(msg) { this.log('✅', msg, COLORS.green); }
    warn(msg) { this.log('⚠️', msg, COLORS.yellow); }
    error(msg) { this.log('❌', msg, COLORS.red); }

    file(action, filePath) {
        const icons = { change: '✏️', add: '➕', unlink: '🗑️', process: '⚙️', done: '✅' };
        const colors = { change: COLORS.yellow, add: COLORS.green, unlink: COLORS.red, process: COLORS.cyan, done: COLORS.green };
        console.log(
            `${COLORS.dim}[${this.timestamp()}]${COLORS.reset} ` +
            `${icons[action] || '•'} ` +
            `${colors[action] || COLORS.white}${action.toUpperCase().padEnd(8)}${COLORS.reset} ` +
            `${COLORS.bright}${path.basename(filePath)}${COLORS.reset}`
        );
    }

    banner() {
        console.log('\n' + '═'.repeat(60));
        console.log(`${COLORS.bgBlue}${COLORS.white}${COLORS.bright}   👁️ Content Watcher - پردازش خودکار   ${COLORS.reset}`);
        console.log('═'.repeat(60) + '\n');
    }

    ready() {
        console.log(`\n${COLORS.green}${COLORS.bright}✨ آماده! منتظر تغییرات...${COLORS.reset}`);
        console.log(`${COLORS.dim}   Ctrl+C برای خروج${COLORS.reset}\n`);
    }

    stats(s) {
        console.log(`\n${COLORS.dim}${'─'.repeat(40)}${COLORS.reset}`);
        console.log(`${COLORS.cyan}📊 آمار: LaTeX:${s.latex} MD:${s.markdown} PDF:${s.pdf} AI:${s.aiTagged} خطا:${s.errors}${COLORS.reset}`);
    }
}

class ContentWatcher {
    constructor(options = {}) {
        this.logger = new Logger();
        this.pipeline = new ContentPipeline({
            aiEnabled: options.aiEnabled ?? (process.env.AI_ENABLED !== 'false'),
            aiProvider: options.aiProvider || process.env.AI_PROVIDER
        });

        this.debounceTimers = new Map();
        this.queue = [];
        this.isProcessing = false;
        this.stats = { latex: 0, markdown: 0, pdf: 0, word: 0, aiTagged: 0, errors: 0 };
    }

    async start() {
        this.logger.banner();

        this.watcher = chokidar.watch(CONFIG.watchPaths, {
            ignored: CONFIG.ignorePaths,
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
            usePolling: process.platform === 'win32',
            interval: 300
        });

        this.watcher
            .on('ready', () => { this.logger.info('مانیتور فعال'); this.logger.ready(); })
            .on('change', fp => this.onFileChange(fp, 'change'))
            .on('add', fp => this.onFileChange(fp, 'add'))
            .on('unlink', fp => this.logger.file('unlink', fp))
            .on('error', err => this.logger.error(err.message));

        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
    }

    onFileChange(filePath, action) {
        filePath = path.normalize(filePath);
        this.logger.file(action, filePath);

        const existing = this.debounceTimers.get(filePath);
        if (existing) clearTimeout(existing);

        const timer = setTimeout(() => {
            this.debounceTimers.delete(filePath);
            this.queue.push(filePath);
            this.processQueue();
        }, CONFIG.debounceDelay);

        this.debounceTimers.set(filePath, timer);
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const filePath = this.queue.shift();
            await this.processFile(filePath);
        }

        this.isProcessing = false;
    }

    async processFile(filePath) {
        const startTime = Date.now();
        this.logger.file('process', filePath);

        try {
            const fileInfo = this.analyzeFilePath(filePath);
            const outputDir = this.getOutputDir(fileInfo);

            const result = await this.pipeline.processFile(filePath, fileInfo);

            if (result) {
                let outputFileName = null;
                if (fileInfo.chapterNumber) {
                    const baseName = path.basename(filePath, path.extname(filePath));
                    outputFileName = `ch${String(fileInfo.chapterNumber).padStart(2, '0')}-${baseName}`;
                }
                await this.pipeline.saveResult(result, outputDir, outputFileName);
            }

            this.updateStats(fileInfo.type);
            this.logger.file('done', filePath);
            this.logger.info(`زمان: ${Date.now() - startTime}ms`);

        } catch (error) {
            this.stats.errors++;
            this.logger.error(`${path.basename(filePath)}: ${error.message}`);
        }
    }

    analyzeFilePath(filePath) {
        const relativePath = path.relative(CONFIG.sourceDir, filePath);
        const parts = relativePath.split(path.sep);
        const ext = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath, ext);

        let type = 'unknown';
        if (['.tex'].includes(ext)) type = 'latex';
        else if (['.md', '.mdx'].includes(ext)) type = 'markdown';
        else if (['.pdf'].includes(ext)) type = 'pdf';
        else if (['.docx', '.doc'].includes(ext)) type = 'word';

        let bookSlug = null, chapterNumber = null;
        if (parts[0] === 'books' && parts.length >= 2) {
            bookSlug = parts[1];
            const numMatch = fileName.match(/(\d+)/);
            chapterNumber = numMatch ? parseInt(numMatch[1]) : null;
        }

        const lang = (filePath.includes('/en/') || filePath.includes('\\en\\')) ? 'en' : 'fa';

        return { type, bookSlug, chapterNumber, lang, fileName, filePath };
    }

    getOutputDir(fileInfo) {
        if (fileInfo.bookSlug) {
            return path.join(CONFIG.outputDir, 'books', fileInfo.lang, fileInfo.bookSlug);
        }
        return path.join(CONFIG.outputDir, 'articles', fileInfo.lang);
    }

    updateStats(type) {
        if (type === 'latex') this.stats.latex++;
        else if (type === 'markdown') this.stats.markdown++;
        else if (type === 'pdf') this.stats.pdf++;
        else if (type === 'word') this.stats.word++;
        if (process.env.AI_ENABLED !== 'false') this.stats.aiTagged++;
    }

    async stop() {
        console.log('\n');
        this.logger.info('در حال توقف...');
        if (this.watcher) await this.watcher.close();
        this.logger.stats(this.stats);
        process.exit(0);
    }
}

const args = process.argv.slice(2);
const watcher = new ContentWatcher({
    aiEnabled: !args.includes('--no-ai'),
    aiProvider: args.find(a => a.startsWith('--ai-provider='))?.split('=')[1]
});
watcher.start().catch(err => { console.error('❌', err); process.exit(1); });

export { ContentWatcher };
