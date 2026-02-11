/**
 * رندرر TikZ به SVG/PNG - نسخه با پشتیبانی کامل فارسی
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export class SmartRenderer {
    constructor(options = {}) {
        this.tempDir = options.tempDir || path.join(process.env.TEMP || '/tmp', 'tikz-renderer');
        this.outputDir = options.outputDir || 'public/diagrams';
        this.cacheDir = options.cacheDir || '.content-cache/diagrams';
        this.isWindows = process.platform === 'win32';
        this.stats = { rendered: 0, cached: 0, failed: 0 };

        // ✅ انتخاب فرمت خروجی: 'svg' یا 'png'
        this.outputFormat = options.outputFormat || 'svg';
    }

    /**
     * نرمال‌سازی مقدار RGB به محدوده 0-255
     */
    normalizeRGBValue(value) {
        if (value === undefined || value === null) return 0;
        if (value > 255) {
            value = Math.round(value / 255);
        }
        if (value >= 0 && value <= 1 && value !== Math.floor(value)) {
            value = Math.round(value * 255);
        }
        return Math.min(255, Math.max(0, Math.round(value)));
    }

    /**
     * ✅ ساخت تمپلیت LaTeX با پشتیبانی کامل فارسی
     */
    buildDynamicTemplate(tikzCode, config) {
        const lines = [
            '\\documentclass[tikz,border=15pt]{standalone}',
            '\\usepackage{fontspec}',
            '\\usepackage{xcolor}',
            '\\usepackage{tikz}',
            '\\usepackage{pgfplots}',
            '\\pgfplotsset{compat=1.18}',
            ''
        ];

        // کتابخانه‌های TikZ
        if (config.tikz?.libraries?.length > 0) {
            lines.push(`\\usetikzlibrary{${config.tikz.libraries.join(',')}}`);
        }

        lines.push('');

        // رنگ‌ها (قبل از xepersian)
        for (const [name, color] of Object.entries(config.colors || {})) {
            if (color.type === 'rgb' && color.r !== undefined) {
                const r = this.normalizeRGBValue(color.r);
                const g = this.normalizeRGBValue(color.g);
                const b = this.normalizeRGBValue(color.b);
                lines.push(`\\definecolor{${name}}{RGB}{${r},${g},${b}}`);
            } else if (color.type === 'hex' && color.css) {
                lines.push(`\\definecolor{${name}}{HTML}{${color.css.replace('#', '')}}`);
            }
        }

        lines.push('');

        // ✅ پشتیبانی فارسی - باید آخرین پکیج باشد
        lines.push('% پشتیبانی فارسی');
        lines.push('\\usepackage{xepersian}');

        // تنظیم فونت
        const fontName = config.fonts?.main?.name || 'Vazirmatn';
        lines.push(`\\settextfont{${fontName}}`);
        lines.push('');

        lines.push('\\begin{document}');
        lines.push(tikzCode);
        lines.push('\\end{document}');

        return lines.join('\n');
    }

    async render(tikzCode, config, options = {}) {
        const { name = 'diagram', forceRender = false } = options;

        const contentHash = crypto.createHash('md5')
            .update(tikzCode + JSON.stringify(config.colors || {}))
            .digest('hex').slice(0, 12);

        const outputName = `${name}-${contentHash}`;
        const ext = this.outputFormat;
        const outputPath = path.join(this.outputDir, `${outputName}.${ext}`);

        // چک کش
        if (!forceRender) {
            try {
                await fs.access(outputPath);
                this.stats.cached++;
                console.log(`      ⚡ کش: ${outputName}`);
                return { success: true, path: outputPath, cached: true };
            } catch { }
        }

        await fs.mkdir(this.tempDir, { recursive: true });
        await fs.mkdir(this.outputDir, { recursive: true });

        const texContent = this.buildDynamicTemplate(tikzCode, config);
        const texFile = path.join(this.tempDir, `${outputName}.tex`);
        const pdfFile = path.join(this.tempDir, `${outputName}.pdf`);

        try {
            await fs.writeFile(texFile, texContent, 'utf-8');
            console.log(`      🔄 رندر: ${outputName}...`);

            // مرحله ۱: کامپایل با XeLaTeX
            const compileCmd = this.isWindows
                ? `cd /d "${this.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`
                : `cd "${this.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`;

            await execAsync(compileCmd, {
                timeout: 120000,
                shell: this.isWindows ? 'cmd.exe' : '/bin/sh'
            });

            // مرحله ۲: تبدیل به فرمت نهایی
            if (this.outputFormat === 'svg') {
                await this.convertToSVG(pdfFile, outputPath, outputName);
            } else {
                await this.convertToPNG(pdfFile, outputPath);
            }

            this.stats.rendered++;
            console.log(`      ✅ تولید: ${outputName}.${ext}`);
            return { success: true, path: outputPath, cached: false };

        } catch (error) {
            this.stats.failed++;

            // ذخیره log برای دیباگ
            await this.saveErrorLog(outputName, error.message);

            console.error(`      ❌ خطا: ${outputName} - ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✅ تبدیل PDF به SVG با Inkscape
     */
    async convertToSVG(pdfPath, svgPath, name) {
        // Inkscape برای تبدیل PDF به SVG (بهتر از dvisvgm برای فارسی)
        const cmd = this.isWindows
            ? `inkscape "${pdfPath}" --export-filename="${svgPath}" --export-type=svg --export-text-to-path`
            : `inkscape "${pdfPath}" --export-filename="${svgPath}" --export-type=svg --export-text-to-path`;

        await execAsync(cmd, { timeout: 60000 });

        // بهینه‌سازی SVG
        await this.optimizeSVG(svgPath, name);
    }

    /**
     * تبدیل PDF به PNG
     */
    async convertToPNG(pdfPath, pngPath) {
        // استفاده از Inkscape برای PNG هم
        const cmd = `inkscape "${pdfPath}" --export-filename="${pngPath}" --export-type=png --export-dpi=300`;
        await execAsync(cmd, { timeout: 60000 });
    }

    /**
     * بهینه‌سازی SVG
     */
    async optimizeSVG(svgPath, name) {
        try {
            let content = await fs.readFile(svgPath, 'utf-8');

            // حذف کامنت‌ها
            content = content.replace(/<!--[\s\S]*?-->/g, '');

            // اضافه کردن کلاس
            content = content.replace(
                '<svg',
                `<svg class="tikz-diagram" id="${name}"`
            );

            await fs.writeFile(svgPath, content, 'utf-8');
        } catch (error) {
            console.error(`      ⚠️ خطا در بهینه‌سازی SVG: ${error.message}`);
        }
    }

    /**
     * ذخیره log خطا برای دیباگ
     */
    async saveErrorLog(name, errorMessage) {
        try {
            const logFile = path.join(this.tempDir, `${name}.log`);
            const logContent = await fs.readFile(logFile, 'utf-8').catch(() => 'Log not found');

            const errorLogPath = path.join(this.cacheDir, 'errors', `${name}-error.log`);
            await fs.mkdir(path.dirname(errorLogPath), { recursive: true });

            await fs.writeFile(errorLogPath, `
Error: ${errorMessage}

=== LaTeX Log ===
${logContent}
            `, 'utf-8');
        } catch { }
    }

    /**
     * پاکسازی فایل‌های موقت
     */
    async cleanup() {
        try {
            const files = await fs.readdir(this.tempDir);
            const extensions = ['.aux', '.log', '.pdf', '.xdv'];

            for (const file of files) {
                if (extensions.some(ext => file.endsWith(ext))) {
                    await fs.unlink(path.join(this.tempDir, file)).catch(() => { });
                }
            }
        } catch { }
    }

    getStats() {
        return { ...this.stats };
    }
}

export default SmartRenderer;