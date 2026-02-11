/**
 * تولیدکننده CSS از تنظیمات LaTeX
 */

import fs from 'fs/promises';
import path from 'path';

export class StyleGenerator {
    constructor(outputDir = 'src/styles/book-themes') {
        this.outputDir = outputDir;
    }

    async generateCSS(config, bookSlug) {
        const css = this.buildCSS(config, bookSlug);
        await fs.mkdir(this.outputDir, { recursive: true });
        const outputPath = path.join(this.outputDir, `${bookSlug}.css`);
        await fs.writeFile(outputPath, css, 'utf-8');
        console.log(`   🎨 CSS تولید شد: ${outputPath}`);
        return outputPath;
    }

    buildCSS(config, bookSlug) {
        const lines = [];
        lines.push(`/* تم خودکار: ${bookSlug} */\n`);
        lines.push(`.book-${bookSlug} {`);

        for (const [name, color] of Object.entries(config.colors)) {
            if (color.css) lines.push(`  --color-${this.kebabCase(name)}: ${color.css};`);
        }

        if (config.fonts.main) lines.push(`  --font-main: '${config.fonts.main.name}', serif;`);
        lines.push(`}\n`);
        lines.push(this.generateBaseStyles(bookSlug));
        return lines.join('\n');
    }

    generateBaseStyles(bookSlug) {
        return `
.book-${bookSlug} { font-family: var(--font-main, 'Vazirmatn', serif); }
.book-${bookSlug} .tikz-diagram { max-width: 100%; height: auto; margin: 2rem auto; display: block; }
.book-${bookSlug} figure.tikz-figure { text-align: center; margin: 2rem 0; }
`;
    }

    kebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[_\s]+/g, '-').toLowerCase();
    }
}

export default StyleGenerator;
