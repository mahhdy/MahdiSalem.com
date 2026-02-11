/**
 * پردازشگر نمودارهای Mermaid
 * دو حالت: رندر سرور (SVG) یا آماده‌سازی برای کلاینت
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import crypto from 'crypto';

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
    outputDir: 'public/diagrams',
    cacheDir: '.content-cache/mermaid',

    // حالت رندر: 'server' (تبدیل به SVG) یا 'client' (برای مرورگر)
    renderMode: process.env.MERMAID_RENDER_MODE || 'client',

    // تنظیمات Mermaid
    mermaidConfig: {
        theme: 'neutral',
        fontFamily: 'Vazirmatn, sans-serif',
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
        }
    },

    // الگوهای تشخیص Mermaid
    patterns: {
        // بلوک کد Markdown
        codeBlock: /```mermaid\s*\n([\s\S]*?)```/g,

        // بدون fence (خام)
        rawFlowchart: /^(flowchart\s+(?:TB|TD|BT|RL|LR)\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawSequence: /^(sequenceDiagram\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawGantt: /^(gantt\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawPie: /^(pie\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawMindmap: /^(mindmap\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawClassDiagram: /^(classDiagram\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawStateDiagram: /^(stateDiagram(?:-v2)?\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
        rawErDiagram: /^(erDiagram\s*\n(?:[\s\S]*?)(?=\n\n|\n#|$))/gm,
    }
};

// ═══════════════════════════════════════════════════════════════
// کلاس MermaidProcessor
// ═══════════════════════════════════════════════════════════════

export class MermaidProcessor {
    constructor(options = {}) {
        this.outputDir = options.outputDir || CONFIG.outputDir;
        this.cacheDir = options.cacheDir || CONFIG.cacheDir;
        this.renderMode = options.renderMode || CONFIG.renderMode;
        this.mermaidCliAvailable = null;

        this.stats = {
            processed: 0,
            cached: 0,
            failed: 0
        };
    }

    /**
     * بررسی نصب mermaid-cli
     */
    async checkMermaidCli() {
        if (this.mermaidCliAvailable !== null) {
            return this.mermaidCliAvailable;
        }

        try {
            await execAsync('mmdc --version', { timeout: 5000 });
            this.mermaidCliAvailable = true;
        } catch {
            this.mermaidCliAvailable = false;
        }

        return this.mermaidCliAvailable;
    }

    /**
     * پردازش محتوا و یافتن/تبدیل نمودارهای Mermaid
     */
    async process(content, options = {}) {
        const { prefix = 'diagram' } = options;

        // ابتدا بلوک‌های کد مارک‌داون را پردازش کن
        content = await this.processCodeBlocks(content, prefix);

        // سپس نمودارهای خام (بدون fence) را پیدا و wrap کن
        content = await this.processRawDiagrams(content, prefix);

        return content;
    }

    /**
     * پردازش بلوک‌های کد ```mermaid
     */
    async processCodeBlocks(content, prefix) {
        const regex = new RegExp(CONFIG.patterns.codeBlock.source, 'g');
        const matches = [...content.matchAll(regex)];

        if (matches.length === 0) return content;

        console.log(`   📊 نمودارهای Mermaid (code block): ${matches.length}`);

        let counter = 0;
        for (const match of matches) {
            counter++;
            const fullMatch = match[0];
            const mermaidCode = match[1].trim();
            const name = `${prefix}-mermaid-${counter}`;

            const replacement = await this.renderOrWrap(mermaidCode, name);
            content = content.replace(fullMatch, replacement);
        }

        return content;
    }

    /**
     * پردازش نمودارهای خام (بدون fence)
     */
    async processRawDiagrams(content, prefix) {
        const diagramTypes = [
            { name: 'flowchart', pattern: CONFIG.patterns.rawFlowchart },
            { name: 'sequence', pattern: CONFIG.patterns.rawSequence },
            { name: 'gantt', pattern: CONFIG.patterns.rawGantt },
            { name: 'pie', pattern: CONFIG.patterns.rawPie },
            { name: 'mindmap', pattern: CONFIG.patterns.rawMindmap },
            { name: 'class', pattern: CONFIG.patterns.rawClassDiagram },
            { name: 'state', pattern: CONFIG.patterns.rawStateDiagram },
            { name: 'er', pattern: CONFIG.patterns.rawErDiagram },
        ];

        let totalRaw = 0;
        let counter = 0;

        for (const { name: typeName, pattern } of diagramTypes) {
            const regex = new RegExp(pattern.source, 'gm');
            const matches = [...content.matchAll(regex)];

            if (matches.length === 0) continue;

            totalRaw += matches.length;

            for (const match of matches) {
                counter++;
                const fullMatch = match[0];
                const mermaidCode = match[1].trim();
                const name = `${prefix}-mermaid-raw-${counter}`;

                const replacement = await this.renderOrWrap(mermaidCode, name);
                content = content.replace(fullMatch, '\n\n' + replacement + '\n\n');
            }
        }

        if (totalRaw > 0) {
            console.log(`   📊 نمودارهای Mermaid (خام): ${totalRaw}`);
        }

        return content;
    }

    /**
     * رندر سرور یا wrap برای کلاینت
     */
    async renderOrWrap(mermaidCode, name) {
        if (this.renderMode === 'server') {
            return this.renderToSVG(mermaidCode, name);
        } else {
            return this.wrapForClient(mermaidCode, name);
        }
    }

    /**
     * Wrap برای رندر کلاینت (مرورگر)
     */
    wrapForClient(mermaidCode, name) {
        this.stats.processed++;

        // استفاده از pre.mermaid که Mermaid.js آن را تشخیص می‌دهد
        return `
<div class="mermaid-wrapper" id="${name}">
<pre class="mermaid">
${mermaidCode}
</pre>
</div>
`;
    }

    /**
     * رندر به SVG (سمت سرور)
     */
    async renderToSVG(mermaidCode, name) {
        // بررسی کش
        const hash = crypto.createHash('md5').update(mermaidCode).digest('hex').slice(0, 10);
        const svgFileName = `${name}-${hash}.svg`;
        const svgPath = path.join(this.outputDir, svgFileName);

        try {
            await fs.access(svgPath);
            this.stats.cached++;
            console.log(`      ⚡ کش: ${name}`);
            return `\n\n![${name}](/diagrams/${svgFileName}){.mermaid-diagram}\n\n`;
        } catch { }

        // بررسی mermaid-cli
        const cliAvailable = await this.checkMermaidCli();

        if (!cliAvailable) {
            console.log(`      ⚠️ mermaid-cli نصب نیست، استفاده از حالت کلاینت`);
            return this.wrapForClient(mermaidCode, name);
        }

        try {
            await fs.mkdir(this.outputDir, { recursive: true });
            await fs.mkdir(this.cacheDir, { recursive: true });

            // ذخیره کد موقت
            const tempFile = path.join(this.cacheDir, `${name}.mmd`);
            await fs.writeFile(tempFile, mermaidCode, 'utf-8');

            // رندر با mmdc
            console.log(`      🔄 رندر: ${name}...`);
            await execAsync(
                `mmdc -i "${tempFile}" -o "${svgPath}" -t neutral -b transparent`,
                { timeout: 30000 }
            );

            this.stats.processed++;
            console.log(`      ✅ تولید: ${svgFileName}`);

            return `\n\n![${name}](/diagrams/${svgFileName}){.mermaid-diagram}\n\n`;

        } catch (error) {
            this.stats.failed++;
            console.error(`      ❌ خطا در ${name}: ${error.message}`);
            // Fallback به حالت کلاینت
            return this.wrapForClient(mermaidCode, name);
        }
    }

    getStats() {
        return { ...this.stats };
    }
}

export default MermaidProcessor;