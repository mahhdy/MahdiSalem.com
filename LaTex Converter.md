
من خروجی نامطلوب را به مدل زبانی مورد اعتماد خودم نشان دادم! 

# خلاصه راه حل و توضیحات آن
# سیستم خودکار تبدیل محتوا با تحلیل هوشمند Preamble

## 🎯 درک دقیق نیاز شما

```
┌─────────────────────────────────────────────────────────────────┐
│                    چالش واقعی                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📚 کتاب A          📚 کتاب B          📚 کتاب C               │
│  ├─ فونت: Vazir     ├─ فونت: Sahel     ├─ فونت: Samim         │
│  ├─ رنگ: آبی/قرمز   ├─ رنگ: سبز/طلایی  ├─ رنگ: بنفش/نارنجی   │
│  └─ استایل TikZ A   └─ استایل TikZ B   └─ استایل TikZ C       │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                            ▼                                     │
│              ┌─────────────────────────┐                        │
│              │  سیستم هوشمند تبدیل    │                        │
│              │  (خودکار و بدون نیاز   │                        │
│              │   به تنظیم دستی)       │                        │
│              └─────────────────────────┘                        │
│                            │                                     │
│                            ▼                                     │
│              ┌─────────────────────────┐                        │
│              │     وب‌سایت یکپارچه     │                        │
│              └─────────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ معماری سیستم هوشمند

```
┌─────────────────────────────────────────────────────────────────┐
│                    معماری Content Pipeline                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────┐                                                │
│   │ منبع محتوا  │ ← LaTeX, Markdown, PDF                        │
│   └──────┬──────┘                                                │
│          │                                                        │
│          ▼                                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │         ۱. Content Analyzer             │                   │
│   │  ┌─────────────┐  ┌─────────────────┐  │                   │
│   │  │  Preamble   │  │   Style         │  │                   │
│   │  │  Parser     │  │   Extractor     │  │                   │
│   │  └─────────────┘  └─────────────────┘  │                   │
│   └──────────────────┬──────────────────────┘                   │
│                      │                                           │
│                      ▼                                           │
│   ┌─────────────────────────────────────────┐                   │
│   │         ۲. Config Generator             │                   │
│   │  • تولید خودکار تنظیمات هر کتاب        │                   │
│   │  • نگاشت رنگ‌ها به CSS                  │                   │
│   │  • تشخیص فونت‌ها                        │                   │
│   └──────────────────┬──────────────────────┘                   │
│                      │                                           │
│                      ▼                                           │
│   ┌─────────────────────────────────────────┐                   │
│   │         ۳. Smart Renderer               │                   │
│   │  • TikZ → SVG (با استایل صحیح)         │                   │
│   │  • Tables → HTML                        │                   │
│   │  • Math → KaTeX                         │                   │
│   └──────────────────┬──────────────────────┘                   │
│                      │                                           │
│                      ▼                                           │
│   ┌─────────────────────────────────────────┐                   │
│   │         ۴. Output Generator             │                   │
│   │  • Markdown + Frontmatter               │                   │
│   │  • CSS Variables                        │                   │
│   │  • Asset Management                     │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ساختار پروژه کامل

```
your-site/
├── content-source/                    # منابع اصلی (دست نزنید!)
│   ├── books/
│   │   ├── transition-guide/
│   │   │   ├── main.tex              # فایل اصلی با preamble
│   │   │   ├── preamble.tex          # یا preamble جداگانه
│   │   │   ├── chapters/
│   │   │   │   ├── ch01.tex
│   │   │   │   └── ch02.tex
│   │   │   └── images/
│   │   └── another-book/
│   │       └── ...
│   └── articles/
│       ├── article1.tex
│       └── article2.md               # Markdown هم پشتیبانی شود
│
├── scripts/
│   ├── lib/                          # کتابخانه‌های اصلی
│   │   ├── preamble-parser.mjs       # تحلیل preamble
│   │   ├── style-extractor.mjs       # استخراج استایل‌ها
│   │   ├── tikz-renderer.mjs         # رندر نمودارها
│   │   ├── markdown-processor.mjs    # پردازش Markdown
│   │   └── config-generator.mjs      # تولید تنظیمات
│   │
│   ├── process-content.mjs           # اسکریپت اصلی
│   └── watch-content.mjs             # مانیتور تغییرات
│
├── .content-cache/                    # کش خودکار
│   ├── configs/                      # تنظیمات استخراج‌شده
│   │   ├── transition-guide.json
│   │   └── another-book.json
│   ├── diagrams/                     # SVG های تولیدشده
│   └── checksums.json                # برای تشخیص تغییرات
│
├── src/
│   ├── content/                      # خروجی تولیدشده
│   │   ├── books/
│   │   └── articles/
│   ├── styles/
│   │   └── book-themes/              # CSS هر کتاب (خودکار)
│   │       ├── transition-guide.css
│   │       └── another-book.css
│   └── ...
│
└── package.json
```

---

## 🧠 ماژول ۱: Preamble Parser

**فایل `scripts/lib/preamble-parser.mjs`:**

```javascript
/**
 * تحلیلگر هوشمند Preamble
 * استخراج خودکار تنظیمات از فایل‌های LaTeX
 */

import fs from 'fs/promises';
import path from 'path';

export class PreambleParser {
  constructor() {
    // الگوهای Regex برای استخراج
    this.patterns = {
      // رنگ‌ها
      defineColor: /\\definecolor\{(\w+)\}\{(\w+)\}\{([^}]+)\}/g,
      colorlet: /\\colorlet\{(\w+)\}\{([^}]+)\}/g,
      
      // فونت‌ها
      setMainFont: /\\setmainfont(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      setFont: /\\set(\w+)font(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      newFontFamily: /\\newfontfamily\\(\w+)(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      
      // کتابخانه‌های TikZ
      tikzLibrary: /\\usetikzlibrary\{([^}]+)\}/g,
      pgfplotsLibrary: /\\usepgfplotslibrary\{([^}]+)\}/g,
      
      // استایل‌های TikZ
      tikzStyle: /\\tikzstyle\{(\w+)\}\s*=\s*\[([^\]]+)\]/g,
      tikzSet: /\\tikzset\{([^}]+)\}/g,
      
      // پکیج‌ها
      usePackage: /\\usepackage(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      
      // متغیرهای سفارشی
      newCommand: /\\newcommand\{\\(\w+)\}(?:\[(\d+)\])?\{([^}]+)\}/g,
      renewCommand: /\\renewcommand\{\\(\w+)\}(?:\[(\d+)\])?\{([^}]+)\}/g,
      
      // input/include
      input: /\\input\{([^}]+)\}/g,
      include: /\\include\{([^}]+)\}/g,
    };
  }

  /**
   * تحلیل کامل یک پروژه LaTeX
   */
  async analyzeProject(projectDir) {
    console.log(`\n🔍 تحلیل پروژه: ${projectDir}`);
    
    const config = {
      projectDir,
      colors: {},
      fonts: {
        main: null,
        sans: null,
        mono: null,
        custom: {}
      },
      tikz: {
        libraries: new Set(),
        styles: {},
        pgfplotsLibraries: new Set()
      },
      packages: [],
      customCommands: {},
      dependencies: []
    };

    // یافتن فایل اصلی
    const mainFile = await this.findMainFile(projectDir);
    if (!mainFile) {
      throw new Error(`فایل اصلی LaTeX در ${projectDir} یافت نشد`);
    }

    console.log(`   📄 فایل اصلی: ${mainFile}`);

    // تحلیل بازگشتی
    await this.parseFileRecursive(mainFile, config, new Set());

    // نرمال‌سازی
    config.tikz.libraries = Array.from(config.tikz.libraries);
    config.tikz.pgfplotsLibraries = Array.from(config.tikz.pgfplotsLibraries);

    console.log(`   🎨 رنگ‌ها: ${Object.keys(config.colors).length}`);
    console.log(`   🔤 فونت‌ها: ${Object.keys(config.fonts.custom).length + (config.fonts.main ? 1 : 0)}`);
    console.log(`   📊 کتابخانه‌های TikZ: ${config.tikz.libraries.length}`);

    return config;
  }

  /**
   * یافتن فایل اصلی پروژه
   */
  async findMainFile(projectDir) {
    const candidates = [
      'main.tex',
      'book.tex', 
      'index.tex',
      'document.tex'
    ];

    // جستجوی مستقیم
    for (const candidate of candidates) {
      const filePath = path.join(projectDir, candidate);
      try {
        await fs.access(filePath);
        return filePath;
      } catch {}
    }

    // جستجوی فایل با \documentclass
    const texFiles = await this.findTexFiles(projectDir);
    for (const file of texFiles) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes('\\documentclass')) {
        return file;
      }
    }

    return null;
  }

  /**
   * یافتن همه فایل‌های .tex
   */
  async findTexFiles(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        files.push(...await this.findTexFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.tex')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * تحلیل بازگشتی فایل‌ها
   */
  async parseFileRecursive(filePath, config, visited) {
    // جلوگیری از حلقه بی‌نهایت
    const absPath = path.resolve(filePath);
    if (visited.has(absPath)) return;
    visited.add(absPath);

    let content;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.warn(`   ⚠️ نمی‌توان خواند: ${filePath}`);
      return;
    }

    const baseDir = path.dirname(filePath);

    // استخراج اطلاعات
    this.extractColors(content, config);
    this.extractFonts(content, config);
    this.extractTikzConfig(content, config);
    this.extractPackages(content, config);
    this.extractCustomCommands(content, config);

    // پیگیری فایل‌های وابسته
    const dependencies = this.extractDependencies(content, baseDir);
    for (const dep of dependencies) {
      config.dependencies.push(dep);
      await this.parseFileRecursive(dep, config, visited);
    }
  }

  /**
   * استخراج تعریف رنگ‌ها
   */
  extractColors(content, config) {
    // \definecolor{name}{model}{spec}
    let match;
    const defineColorRegex = new RegExp(this.patterns.defineColor.source, 'g');
    while ((match = defineColorRegex.exec(content)) !== null) {
      const [, name, model, spec] = match;
      config.colors[name] = this.parseColor(model, spec);
    }

    // \colorlet{name}{color}
    const colorletRegex = new RegExp(this.patterns.colorlet.source, 'g');
    while ((match = colorletRegex.exec(content)) !== null) {
      const [, name, baseColor] = match;
      config.colors[name] = { type: 'reference', base: baseColor };
    }
  }

  /**
   * تبدیل رنگ LaTeX به CSS
   */
  parseColor(model, spec) {
    switch (model.toLowerCase()) {
      case 'rgb':
        // RGB با مقادیر 0-1
        const rgbParts = spec.split(',').map(v => Math.round(parseFloat(v.trim()) * 255));
        return {
          type: 'rgb',
          r: rgbParts[0],
          g: rgbParts[1],
          b: rgbParts[2],
          css: `rgb(${rgbParts.join(', ')})`
        };
      
      case 'RGB':
        // RGB با مقادیر 0-255
        const RGBParts = spec.split(',').map(v => parseInt(v.trim()));
        return {
          type: 'rgb',
          r: RGBParts[0],
          g: RGBParts[1],
          b: RGBParts[2],
          css: `rgb(${RGBParts.join(', ')})`
        };
      
      case 'HTML':
      case 'hex':
        return {
          type: 'hex',
          css: `#${spec.replace('#', '')}`
        };
      
      case 'cmyk':
        const cmykParts = spec.split(',').map(v => parseFloat(v.trim()));
        const rgb = this.cmykToRgb(...cmykParts);
        return {
          type: 'cmyk',
          original: spec,
          css: `rgb(${rgb.join(', ')})`
        };
      
      default:
        return { type: 'named', name: spec, css: spec };
    }
  }

  /**
   * تبدیل CMYK به RGB
   */
  cmykToRgb(c, m, y, k) {
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    return [r, g, b];
  }

  /**
   * استخراج تنظیمات فونت
   */
  extractFonts(content, config) {
    let match;

    // \setmainfont
    const mainFontRegex = new RegExp(this.patterns.setMainFont.source, 'g');
    while ((match = mainFontRegex.exec(content)) !== null) {
      const [, options, fontName] = match;
      config.fonts.main = {
        name: fontName,
        options: this.parseOptions(options)
      };
    }

    // \setsansfont, \setmonofont
    const setFontRegex = new RegExp(this.patterns.setFont.source, 'g');
    while ((match = setFontRegex.exec(content)) !== null) {
      const [, type, options, fontName] = match;
      const key = type.toLowerCase();
      if (key === 'sans' || key === 'mono') {
        config.fonts[key] = {
          name: fontName,
          options: this.parseOptions(options)
        };
      }
    }

    // \newfontfamily
    const newFontRegex = new RegExp(this.patterns.newFontFamily.source, 'g');
    while ((match = newFontRegex.exec(content)) !== null) {
      const [, commandName, options, fontName] = match;
      config.fonts.custom[commandName] = {
        name: fontName,
        options: this.parseOptions(options)
      };
    }
  }

  /**
   * استخراج تنظیمات TikZ
   */
  extractTikzConfig(content, config) {
    let match;

    // کتابخانه‌های TikZ
    const tikzLibRegex = new RegExp(this.patterns.tikzLibrary.source, 'g');
    while ((match = tikzLibRegex.exec(content)) !== null) {
      const libs = match[1].split(',').map(l => l.trim());
      libs.forEach(lib => config.tikz.libraries.add(lib));
    }

    // کتابخانه‌های pgfplots
    const pgfLibRegex = new RegExp(this.patterns.pgfplotsLibrary.source, 'g');
    while ((match = pgfLibRegex.exec(content)) !== null) {
      const libs = match[1].split(',').map(l => l.trim());
      libs.forEach(lib => config.tikz.pgfplotsLibraries.add(lib));
    }

    // استایل‌های TikZ - روش قدیمی
    const tikzStyleRegex = new RegExp(this.patterns.tikzStyle.source, 'g');
    while ((match = tikzStyleRegex.exec(content)) !== null) {
      const [, name, definition] = match;
      config.tikz.styles[name] = definition;
    }

    // \tikzset
    const tikzSetRegex = new RegExp(this.patterns.tikzSet.source, 'g');
    while ((match = tikzSetRegex.exec(content)) !== null) {
      const definitions = match[1];
      this.parseTikzSet(definitions, config.tikz.styles);
    }
  }

  /**
   * تحلیل \tikzset
   */
  parseTikzSet(definitions, styles) {
    // تحلیل ساده - می‌توان پیچیده‌تر کرد
    const styleRegex = /(\w+)\/\.style\s*=\s*\{([^}]+)\}/g;
    let match;
    while ((match = styleRegex.exec(definitions)) !== null) {
      styles[match[1]] = match[2];
    }
  }

  /**
   * استخراج پکیج‌ها
   */
  extractPackages(content, config) {
    const packageRegex = new RegExp(this.patterns.usePackage.source, 'g');
    let match;
    while ((match = packageRegex.exec(content)) !== null) {
      const [, options, packages] = match;
      const pkgList = packages.split(',').map(p => p.trim());
      for (const pkg of pkgList) {
        config.packages.push({
          name: pkg,
          options: options ? options.split(',').map(o => o.trim()) : []
        });
      }
    }
  }

  /**
   * استخراج دستورات سفارشی
   */
  extractCustomCommands(content, config) {
    const patterns = [this.patterns.newCommand, this.patterns.renewCommand];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        const [, name, numArgs, definition] = match;
        config.customCommands[name] = {
          args: numArgs ? parseInt(numArgs) : 0,
          definition: definition
        };
      }
    }
  }

  /**
   * استخراج وابستگی‌ها
   */
  extractDependencies(content, baseDir) {
    const deps = [];
    const patterns = [this.patterns.input, this.patterns.include];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, 'g');
      let match;
      while ((match = regex.exec(content)) !== null) {
        let depPath = match[1];
        if (!depPath.endsWith('.tex')) {
          depPath += '.tex';
        }
        deps.push(path.resolve(baseDir, depPath));
      }
    }
    
    return deps;
  }

  /**
   * تحلیل options
   */
  parseOptions(optionsStr) {
    if (!optionsStr) return {};
    
    const options = {};
    const parts = optionsStr.split(',');
    
    for (const part of parts) {
      const [key, value] = part.split('=').map(s => s.trim());
      options[key] = value || true;
    }
    
    return options;
  }
}

export default PreambleParser;
```

---

## 🎨 ماژول ۲: CSS Generator

**فایل `scripts/lib/style-generator.mjs`:**

```javascript
/**
 * تولیدکننده خودکار CSS از تنظیمات LaTeX
 */

import fs from 'fs/promises';
import path from 'path';

export class StyleGenerator {
  constructor(outputDir = 'src/styles/book-themes') {
    this.outputDir = outputDir;
  }

  /**
   * تولید فایل CSS برای یک کتاب
   */
  async generateCSS(config, bookSlug) {
    const css = this.buildCSS(config, bookSlug);
    
    await fs.mkdir(this.outputDir, { recursive: true });
    const outputPath = path.join(this.outputDir, `${bookSlug}.css`);
    await fs.writeFile(outputPath, css, 'utf-8');
    
    console.log(`   🎨 CSS تولید شد: ${outputPath}`);
    return outputPath;
  }

  /**
   * ساخت محتوای CSS
   */
  buildCSS(config, bookSlug) {
    const lines = [];
    
    lines.push(`/**`);
    lines.push(` * تم خودکار تولیدشده برای: ${bookSlug}`);
    lines.push(` * تاریخ: ${new Date().toISOString()}`);
    lines.push(` */\n`);

    // CSS Variables برای رنگ‌ها
    lines.push(`/* ═══ رنگ‌ها ═══ */`);
    lines.push(`.book-${bookSlug} {`);
    
    for (const [name, color] of Object.entries(config.colors)) {
      if (color.css) {
        lines.push(`  --color-${this.kebabCase(name)}: ${color.css};`);
      }
    }
    
    // فونت‌ها
    lines.push(`\n  /* فونت‌ها */`);
    if (config.fonts.main) {
      lines.push(`  --font-main: '${config.fonts.main.name}', serif;`);
    }
    if (config.fonts.sans) {
      lines.push(`  --font-sans: '${config.fonts.sans.name}', sans-serif;`);
    }
    if (config.fonts.mono) {
      lines.push(`  --font-mono: '${config.fonts.mono.name}', monospace;`);
    }
    
    lines.push(`}\n`);

    // استایل‌های TikZ به کلاس CSS
    lines.push(`/* ═══ استایل‌های نمودار ═══ */`);
    for (const [styleName, definition] of Object.entries(config.tikz.styles)) {
      lines.push(this.tikzStyleToCSS(styleName, definition, bookSlug));
    }

    // استایل‌های پایه
    lines.push(`\n/* ═══ استایل‌های پایه ═══ */`);
    lines.push(this.generateBaseStyles(bookSlug));

    return lines.join('\n');
  }

  /**
   * تبدیل استایل TikZ به CSS
   */
  tikzStyleToCSS(name, definition, bookSlug) {
    // تبدیل ساده - می‌توان پیچیده‌تر کرد
    const cssProps = [];
    
    // fill
    const fillMatch = definition.match(/fill=([^,\]]+)/);
    if (fillMatch) {
      const color = fillMatch[1].trim();
      cssProps.push(`  background-color: var(--color-${this.kebabCase(color)}, ${color});`);
    }
    
    // draw
    const drawMatch = definition.match(/draw=([^,\]]+)/);
    if (drawMatch) {
      const color = drawMatch[1].trim();
      cssProps.push(`  border-color: var(--color-${this.kebabCase(color)}, ${color});`);
    }
    
    // rounded corners
    if (definition.includes('rounded corners')) {
      const radiusMatch = definition.match(/rounded corners=(\d+)pt/);
      const radius = radiusMatch ? radiusMatch[1] : '8';
      cssProps.push(`  border-radius: ${radius}px;`);
    }
    
    if (cssProps.length === 0) return '';
    
    return `.book-${bookSlug} .tikz-style-${this.kebabCase(name)} {\n${cssProps.join('\n')}\n}\n`;
  }

  /**
   * استایل‌های پایه
   */
  generateBaseStyles(bookSlug) {
    return `
.book-${bookSlug} {
  font-family: var(--font-main, 'Vazirmatn', serif);
}

.book-${bookSlug} h1,
.book-${bookSlug} h2,
.book-${bookSlug} h3 {
  font-family: var(--font-main, 'Vazirmatn', serif);
}

.book-${bookSlug} code,
.book-${bookSlug} pre {
  font-family: var(--font-mono, 'Fira Code', monospace);
}

.book-${bookSlug} .tikz-diagram {
  max-width: 100%;
  height: auto;
  margin: 2rem auto;
  display: block;
}

.book-${bookSlug} figure.tikz-figure {
  text-align: center;
  margin: 2rem 0;
}

.book-${bookSlug} figure.tikz-figure figcaption {
  font-size: 0.9rem;
  color: var(--color-gris, #666);
  margin-top: 0.5rem;
}
`;
  }

  /**
   * تبدیل به kebab-case
   */
  kebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  }
}

export default StyleGenerator;
```

---

## 🔧 ماژول ۳: Smart Renderer

**فایل `scripts/lib/smart-renderer.mjs`:**

```javascript
/**
 * رندرر هوشمند TikZ با تنظیمات پویا
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export class SmartRenderer {
  constructor(options = {}) {
    this.tempDir = options.tempDir || path.join(process.env.TEMP || '/tmp', 'smart-renderer');
    this.outputDir = options.outputDir || 'public/diagrams';
    this.cacheDir = options.cacheDir || '.content-cache/diagrams';
    this.isWindows = process.platform === 'win32';
    
    this.stats = {
      rendered: 0,
      cached: 0,
      failed: 0
    };
  }

  /**
   * ساخت Template پویا بر اساس config
   */
  buildDynamicTemplate(tikzCode, config) {
    const lines = [];
    
    // Document class
    lines.push('\\documentclass[tikz,border=15pt]{standalone}');
    lines.push('');
    
    // پکیج‌های پایه
    lines.push('\\usepackage{fontspec}');
    lines.push('\\usepackage{xcolor}');
    lines.push('\\usepackage{tikz}');
    lines.push('\\usepackage{pgfplots}');
    lines.push('\\pgfplotsset{compat=1.18}');
    lines.push('');
    
    // کتابخانه‌های TikZ - از config
    if (config.tikz.libraries.length > 0) {
      lines.push(`\\usetikzlibrary{${config.tikz.libraries.join(',')}}`);
    }
    if (config.tikz.pgfplotsLibraries.length > 0) {
      lines.push(`\\usepgfplotslibrary{${config.tikz.pgfplotsLibraries.join(',')}}`);
    }
    lines.push('');
    
    // فونت - از config
    if (config.fonts.main) {
      const fontName = config.fonts.main.name;
      const options = config.fonts.main.options;
      const optStr = Object.entries(options)
        .map(([k, v]) => v === true ? k : `${k}=${v}`)
        .join(',');
      lines.push(`\\setmainfont${optStr ? `[${optStr}]` : ''}{${fontName}}`);
    } else {
      lines.push('\\setmainfont{Vazirmatn}');
    }
    lines.push('');
    
    // رنگ‌ها - از config
    lines.push('% رنگ‌های پروژه');
    for (const [name, color] of Object.entries(config.colors)) {
      if (color.type === 'rgb') {
        lines.push(`\\definecolor{${name}}{RGB}{${color.r},${color.g},${color.b}}`);
      } else if (color.type === 'hex') {
        lines.push(`\\definecolor{${name}}{HTML}{${color.css.replace('#', '')}}`);
      } else if (color.type === 'reference') {
        lines.push(`\\colorlet{${name}}{${color.base}}`);
      }
    }
    lines.push('');
    
    // استایل‌های TikZ - از config
    if (Object.keys(config.tikz.styles).length > 0) {
      lines.push('% استایل‌های TikZ');
      lines.push('\\tikzset{');
      const styleEntries = Object.entries(config.tikz.styles);
      styleEntries.forEach(([name, def], i) => {
        const comma = i < styleEntries.length - 1 ? ',' : '';
        lines.push(`  ${name}/.style={${def}}${comma}`);
      });
      lines.push('}');
    }
    lines.push('');
    
    // Document
    lines.push('\\begin{document}');
    lines.push(tikzCode);
    lines.push('\\end{document}');
    
    return lines.join('\n');
  }

  /**
   * رندر TikZ به SVG
   */
  async render(tikzCode, config, options = {}) {
    const { name = 'diagram', forceRender = false } = options;
    
    // تولید hash یکتا
    const contentHash = crypto
      .createHash('md5')
      .update(tikzCode + JSON.stringify(config.colors) + JSON.stringify(config.tikz))
      .digest('hex')
      .slice(0, 12);
    
    const outputName = `${name}-${contentHash}`;
    const svgPath = path.join(this.outputDir, `${outputName}.svg`);
    
    // بررسی کش
    if (!forceRender) {
      try {
        await fs.access(svgPath);
        this.stats.cached++;
        console.log(`   ⚡ کش: ${outputName}`);
        return { success: true, path: svgPath, cached: true };
      } catch {}
    }
    
    // ساخت دایرکتوری‌ها
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // ساخت template پویا
    const texContent = this.buildDynamicTemplate(tikzCode, config);
    const texFile = path.join(this.tempDir, `${outputName}.tex`);
    const pdfFile = path.join(this.tempDir, `${outputName}.pdf`);
    
    try {
      // نوشتن فایل
      await fs.writeFile(texFile, texContent, 'utf-8');
      
      // کامپایل
      console.log(`   🔄 رندر: ${outputName}...`);
      
      const compileCmd = this.isWindows
        ? `cd /d "${this.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`
        : `cd "${this.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`;
      
      await execAsync(compileCmd, {
        timeout: 120000,
        shell: this.isWindows ? 'cmd.exe' : '/bin/sh'
      });
      
      // PDF → SVG
      await this.convertToSVG(pdfFile, svgPath);
      
      // بهینه‌سازی
      await this.optimizeSVG(svgPath, outputName);
      
      this.stats.rendered++;
      console.log(`   ✅ تولید: ${outputName}`);
      
      return { success: true, path: svgPath, cached: false };
      
    } catch (error) {
      this.stats.failed++;
      console.error(`   ❌ خطا: ${outputName}`);
      
      // ذخیره لاگ خطا
      await this.saveErrorLog(outputName, error);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * تبدیل PDF به SVG
   */
  async convertToSVG(pdfPath, svgPath) {
    if (this.isWindows) {
      // استفاده از Inkscape در ویندوز
      await execAsync(
        `inkscape "${pdfPath}" --export-filename="${svgPath}" --export-type=svg`,
        { timeout: 60000 }
      );
    } else {
      // استفاده از pdf2svg در لینوکس/مک
      await execAsync(`pdf2svg "${pdfPath}" "${svgPath}"`);
    }
  }

  /**
   * بهینه‌سازی SVG
   */
  async optimizeSVG(svgPath, name) {
    let content = await fs.readFile(svgPath, 'utf-8');
    
    content = content
      // حذف کامنت‌ها
      .replace(/<!--[\s\S]*?-->/g, '')
      // اضافه کردن کلاس
      .replace('<svg', `<svg class="tikz-diagram" id="${name}"`)
      // پشتیبانی Dark mode
      .replace('</svg>', `
<style>
  @media (prefers-color-scheme: dark) {
    #${name} { filter: invert(0.88) hue-rotate(180deg); }
  }
</style>
</svg>`);
    
    await fs.writeFile(svgPath, content, 'utf-8');
  }

  /**
   * ذخیره لاگ خطا
   */
  async saveErrorLog(name, error) {
    const logDir = path.join(this.cacheDir, 'errors');
    await fs.mkdir(logDir, { recursive: true });
    
    const logContent = {
      name,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    await fs.writeFile(
      path.join(logDir, `${name}.json`),
      JSON.stringify(logContent, null, 2)
    );
  }

  /**
   * گزارش آمار
   */
  getStats() {
    return {
      ...this.stats,
      total: this.stats.rendered + this.stats.cached + this.stats.failed
    };
  }
}

export default SmartRenderer;
```

---

## 🚀 اسکریپت اصلی یکپارچه

**فایل `scripts/process-content.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * سیستم خودکار پردازش محتوا
 * تحلیل هوشمند، تبدیل و تولید خروجی وب
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

import { PreambleParser } from './lib/preamble-parser.mjs';
import { StyleGenerator } from './lib/style-generator.mjs';
import { SmartRenderer } from './lib/smart-renderer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  sourceDir: 'content-source',
  outputDir: 'src/content',
  cacheDir: '.content-cache',
  stylesDir: 'src/styles/book-themes',
  diagramsDir: 'public/diagrams'
};

// ═══════════════════════════════════════════════════════════════
// کلاس اصلی Pipeline
// ═══════════════════════════════════════════════════════════════

class ContentPipeline {
  constructor() {
    this.parser = new PreambleParser();
    this.styleGen = new StyleGenerator(CONFIG.stylesDir);
    this.renderer = new SmartRenderer({
      outputDir: CONFIG.diagramsDir,
      cacheDir: CONFIG.cacheDir
    });
    
    this.configCache = new Map();
  }

  /**
   * پردازش یک کتاب
   */
  async processBook(bookDir, options = {}) {
    const { lang = 'fa', slug } = options;
    const bookSlug = slug || path.basename(bookDir);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📚 پردازش کتاب: ${bookSlug}`);
    console.log(`${'═'.repeat(60)}`);
    
    // ۱. تحلیل پروژه
    console.log('\n📋 مرحله ۱: تحلیل پروژه...');
    const config = await this.parser.analyzeProject(bookDir);
    
    // ذخیره config برای استفاده بعدی
    await this.saveConfig(bookSlug, config);
    this.configCache.set(bookSlug, config);
    
    // ۲. تولید CSS
    console.log('\n🎨 مرحله ۲: تولید CSS...');
    await this.styleGen.generateCSS(config, bookSlug);
    
    // ۳. یافتن فصل‌ها
    const chapters = await this.findChapters(bookDir);
    console.log(`\n📑 یافت شد: ${chapters.length} فصل`);
    
    // ۴. پردازش هر فصل
    const outputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
    await fs.mkdir(outputDir, { recursive: true });
    
    for (let i = 0; i < chapters.length; i++) {
      await this.processChapter(chapters[i], {
        config,
        bookSlug,
        chapterNumber: i + 1,
        outputDir,
        lang
      });
    }
    
    // ۵. ایجاد index
    await this.generateBookIndex(bookSlug, chapters, outputDir, lang);
    
    // ۶. گزارش
    const stats = this.renderer.getStats();
    console.log(`\n✅ کتاب ${bookSlug} کامل شد!`);
    console.log(`   📊 نمودارها: ${stats.rendered} رندر، ${stats.cached} کش، ${stats.failed} خطا`);
    
    return { bookSlug, chapters: chapters.length, stats };
  }

  /**
   * یافتن فصل‌های کتاب
   */
  async findChapters(bookDir) {
    const patterns = [
      path.join(bookDir, 'chapters', '*.tex'),
      path.join(bookDir, 'ch*.tex'),
      path.join(bookDir, 'chapter*.tex'),
      path.join(bookDir, 'فصل*.tex')
    ];
    
    let chapters = await globby(patterns);
    
    // مرتب‌سازی
    chapters.sort((a, b) => {
      const numA = parseInt(path.basename(a).match(/\d+/)?.[0] || '0');
      const numB = parseInt(path.basename(b).match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
    
    return chapters;
  }

  /**
   * پردازش یک فصل
   */
  async processChapter(chapterPath, options) {
    const { config, bookSlug, chapterNumber, outputDir, lang } = options;
    
    console.log(`\n   📄 فصل ${chapterNumber}: ${path.basename(chapterPath)}`);
    
    // خواندن محتوا
    let content = await fs.readFile(chapterPath, 'utf-8');
    
    // استخراج و رندر نمودارها
    content = await this.processAllDiagrams(content, config, `${bookSlug}-ch${chapterNumber}`);
    
    // پیش‌پردازش
    content = this.preProcess(content);
    
    // تبدیل با Pandoc
    const markdown = await this.convertWithPandoc(content);
    
    // پس‌پردازش
    const finalMd = this.postProcess(markdown, { bookSlug, chapterNumber, lang });
    
    // ذخیره
    const outputFileName = `ch${String(chapterNumber).padStart(2, '0')}-${path.basename(chapterPath, '.tex')}.md`;
    const outputPath = path.join(outputDir, outputFileName);
    await fs.writeFile(outputPath, finalMd, 'utf-8');
    
    console.log(`      ✅ ${outputFileName}`);
  }

  /**
   * پردازش همه نمودارها
   */
  async processAllDiagrams(content, config, prefix) {
    const tikzRegex = /\\begin\{tikzpicture\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{tikzpicture\}/g;
    
    const matches = [...content.matchAll(tikzRegex)];
    console.log(`      📊 نمودارها: ${matches.length}`);
    
    let counter = 0;
    for (const match of matches) {
      counter++;
      const tikzCode = match[0];
      const name = `${prefix}-${counter}`;
      
      const result = await this.renderer.render(tikzCode, config, { name });
      
      if (result.success) {
        const relativePath = `/diagrams/${path.basename(result.path)}`;
        const replacement = `\n\n![نمودار ${counter}](${relativePath}){.tikz-diagram}\n\n`;
        content = content.replace(tikzCode, replacement);
      } else {
        content = content.replace(tikzCode, `\n\n<!-- DIAGRAM_ERROR: ${name} -->\n\n`);
      }
    }
    
    return content;
  }

  /**
   * پیش‌پردازش
   */
  preProcess(content) {
    return content
      // تبدیل tcolorbox
      .replace(
        /\\begin\{tcolorbox\}\[([^\]]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g,
        (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`
      )
      // حذف کامندهای اضافی
      .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '')
      .replace(/\\setcounter\{[^}]*\}\{[^}]*\}/g, '');
  }

  /**
   * تبدیل با Pandoc
   */
  async convertWithPandoc(content) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const tempDir = path.join(CONFIG.cacheDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputFile = path.join(tempDir, 'input.tex');
    const outputFile = path.join(tempDir, 'output.md');
    
    await fs.writeFile(inputFile, content, 'utf-8');
    
    const cmd = `pandoc "${inputFile}" -o "${outputFile}" --wrap=none --columns=1000`;
    await execAsync(cmd, { timeout: 60000 });
    
    return fs.readFile(outputFile, 'utf-8');
  }

  /**
   * پس‌پردازش
   */
  postProcess(markdown, options) {
    const { bookSlug, chapterNumber, lang } = options;
    
    // پاکسازی
    let result = markdown
      .replace(/\[node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\\node[\s\S]*?;/g, '')
      .replace(/\\draw[\s\S]*?;/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // استخراج عنوان
    const titleMatch = result.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `فصل ${chapterNumber}`;
    
    // Frontmatter
    const frontmatter = `---
title: "${title}"
description: "${title}"
lang: ${lang}
chapterNumber: ${chapterNumber}
book: "${bookSlug}"
---

`;
    
    return frontmatter + result;
  }

  /**
   * ذخیره تنظیمات
   */
  async saveConfig(bookSlug, config) {
    const configDir = path.join(CONFIG.cacheDir, 'configs');
    await fs.mkdir(configDir, { recursive: true });
    
    await fs.writeFile(
      path.join(configDir, `${bookSlug}.json`),
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  /**
   * ایجاد index کتاب
   */
  async generateBookIndex(bookSlug, chapters, outputDir, lang) {
    const content = `---
title: "${bookSlug}"
description: "فهرست فصول"
lang: ${lang}
---

# فهرست فصول

${chapters.map((ch, i) => {
  const baseName = path.basename(ch, '.tex');
  return `${i + 1}. [فصل ${i + 1}](./ch${String(i + 1).padStart(2, '0')}-${baseName})`;
}).join('\n')}
`;
    
    await fs.writeFile(path.join(outputDir, 'index.md'), content, 'utf-8');
  }

  /**
   * پردازش همه محتوا
   */
  async processAll() {
    console.log('🚀 شروع پردازش همه محتوا...\n');
    
    // یافتن کتاب‌ها
    const bookDirs = await globby(path.join(CONFIG.sourceDir, 'books', '*'), {
      onlyDirectories: true
    });
    
    console.log(`📚 یافت شد: ${bookDirs.length} کتاب\n`);
    
    const results = [];
    for (const bookDir of bookDirs) {
      try {
        const result = await this.processBook(bookDir);
        results.push(result);
      } catch (error) {
        console.error(`❌ خطا در ${path.basename(bookDir)}:`, error.message);
      }
    }
    
    // گزارش نهایی
    console.log('\n' + '═'.repeat(60));
    console.log('📊 گزارش نهایی:');
    console.log('═'.repeat(60));
    results.forEach(r => {
      console.log(`   📚 ${r.bookSlug}: ${r.chapters} فصل`);
    });
    
    return results;
  }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const pipeline = new ContentPipeline();
  
  if (args.length === 0 || args.includes('--all')) {
    await pipeline.processAll();
  } else if (args.includes('--book')) {
    const bookDir = args[args.indexOf('--book') + 1];
    const slug = args.find(a => a.startsWith('--slug='))?.split('=')[1];
    const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'fa';
    
    await pipeline.processBook(bookDir, { slug, lang });
  } else {
    console.log(`
📘 راهنما:

  پردازش همه:
    node scripts/process-content.mjs --all
  
  پردازش یک کتاب:
    node scripts/process-content.mjs --book content-source/books/my-book --slug=my-book --lang=fa
`);
  }
}

main().catch(console.error);

export { ContentPipeline };
```

---

## 📦 به‌روزرسانی package.json

```json
{
  "name": "your-site",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "npm run content:all && astro build",
    "preview": "astro preview",
    
    "content:all": "node scripts/process-content.mjs --all",
    "content:book": "node scripts/process-content.mjs --book",
    "content:watch": "node scripts/watch-content.mjs",
    
    "clean": "rm -rf .content-cache public/diagrams src/styles/book-themes"
  },
  "devDependencies": {
    "globby": "^14.0.0",
    "gray-matter": "^4.0.3",
    "chokidar": "^3.5.3"
  }
}
```

---

## 🎯 خلاصه راه‌حل

```
┌─────────────────────────────────────────────────────────────────┐
│              سیستم هوشمند - چگونه کار می‌کند؟                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ۱. تحلیل خودکار:                                                │
│     • خواندن main.tex و preamble.tex                            │
│     • استخراج \definecolor → رنگ‌های CSS                        │
│     • استخراج \setmainfont → فونت‌ها                            │
│     • استخراج \tikzstyle → استایل‌های نمودار                    │
│     • استخراج \usetikzlibrary → کتابخانه‌های لازم              │
│                                                                   │
│  ۲. تولید پویا:                                                  │
│     • CSS Variables برای هر کتاب                                │
│     • Template اختصاصی برای رندر TikZ                          │
│                                                                   │
│  ۳. کش هوشمند:                                                   │
│     • نمودارهای بدون تغییر دوباره رندر نمی‌شوند                 │
│     • تنظیمات هر کتاب ذخیره می‌شود                              │
│                                                                   │
│  ۴. یک دستور برای همه:                                          │
│     npm run content:all                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

آیا می‌خواهید:
1. **اسکریپت watch** برای پردازش خودکار تغییرات؟
2. **پشتیبانی از PDF** ورودی؟
3. **یکپارچه‌سازی با AI** برای تگ‌گذاری خودکار؟


# اسکریپت Watch برای پردازش خودکار تغییرات

## 🔄 معماری سیستم Watch

```
┌─────────────────────────────────────────────────────────────────┐
│                    سیستم Watch هوشمند                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────────┐                                            │
│   │  content-source │                                            │
│   │  ├── books/     │ ◄─────────────┐                           │
│   │  └── articles/  │               │                           │
│   └────────┬────────┘               │                           │
│            │                         │                           │
│            ▼                         │ chokidar                  │
│   ┌─────────────────┐               │ (File Watcher)            │
│   │   تغییر فایل   │───────────────┘                           │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │    Debounce     │ ← جلوگیری از پردازش مکرر                  │
│   │   (500ms)       │                                            │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │  تشخیص نوع     │                                            │
│   │  ├── Book?     │                                            │
│   │  ├── Chapter?  │                                            │
│   │  └── Article?  │                                            │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │ پردازش هوشمند  │                                            │
│   │ (فقط فایل      │                                            │
│   │  تغییریافته)   │                                            │
│   └────────┬────────┘                                            │
│            │                                                      │
│            ▼                                                      │
│   ┌─────────────────┐                                            │
│   │  src/content/   │ ← خروجی به‌روز شده                        │
│   └─────────────────┘                                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 اسکریپت Watch

**فایل `scripts/watch-content.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * سیستم Watch هوشمند برای پردازش خودکار تغییرات
 * 
 * ویژگی‌ها:
 * - مانیتور تغییرات فایل‌های LaTeX و Markdown
 * - پردازش هوشمند فقط فایل‌های تغییر یافته
 * - Debounce برای جلوگیری از پردازش مکرر
 * - پشتیبانی از ویندوز
 * - گزارش‌دهی زنده
 */

import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

// Import pipeline
import { ContentPipeline } from './process-content.mjs';
import { PreambleParser } from './lib/preamble-parser.mjs';
import { StyleGenerator } from './lib/style-generator.mjs';
import { SmartRenderer } from './lib/smart-renderer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // پوشه‌های منبع برای watch
  watchPaths: [
    'content-source/**/*.tex',
    'content-source/**/*.md',
    'content-source/**/*.mdx'
  ],
  
  // فایل‌هایی که نادیده گرفته شوند
  ignorePaths: [
    '**/node_modules/**',
    '**/.git/**',
    '**/build/**',
    '**/*.aux',
    '**/*.log',
    '**/*.out',
    '**/*.toc',
    '**/*.synctex.gz'
  ],
  
  // تنظیمات
  sourceDir: 'content-source',
  outputDir: 'src/content',
  cacheDir: '.content-cache',
  stylesDir: 'src/styles/book-themes',
  diagramsDir: 'public/diagrams',
  
  // Debounce (میلی‌ثانیه)
  debounceDelay: 500,
  
  // تعداد تلاش مجدد در صورت خطا
  maxRetries: 2,
  
  // رنگ‌ها برای ترمینال (ANSI)
  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgRed: '\x1b[41m'
  }
};

// ═══════════════════════════════════════════════════════════════
// کلاس Logger
// ═══════════════════════════════════════════════════════════════

class Logger {
  constructor() {
    this.c = CONFIG.colors;
  }

  timestamp() {
    return new Date().toLocaleTimeString('fa-IR', { hour12: false });
  }

  info(msg) {
    console.log(`${this.c.dim}[${this.timestamp()}]${this.c.reset} ${this.c.blue}ℹ${this.c.reset} ${msg}`);
  }

  success(msg) {
    console.log(`${this.c.dim}[${this.timestamp()}]${this.c.reset} ${this.c.green}✓${this.c.reset} ${msg}`);
  }

  warn(msg) {
    console.log(`${this.c.dim}[${this.timestamp()}]${this.c.reset} ${this.c.yellow}⚠${this.c.reset} ${msg}`);
  }

  error(msg) {
    console.log(`${this.c.dim}[${this.timestamp()}]${this.c.reset} ${this.c.red}✗${this.c.reset} ${msg}`);
  }

  file(action, filePath) {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);
    
    const actionColors = {
      'change': this.c.yellow,
      'add': this.c.green,
      'unlink': this.c.red,
      'processing': this.c.cyan,
      'done': this.c.green
    };
    
    const color = actionColors[action] || this.c.white;
    const icons = {
      'change': '📝',
      'add': '➕',
      'unlink': '🗑️',
      'processing': '⚙️',
      'done': '✅'
    };
    
    console.log(
      `${this.c.dim}[${this.timestamp()}]${this.c.reset} ` +
      `${icons[action] || '•'} ` +
      `${color}${action.toUpperCase().padEnd(10)}${this.c.reset} ` +
      `${this.c.bright}${fileName}${this.c.reset} ` +
      `${this.c.dim}(${dirName})${this.c.reset}`
    );
  }

  banner() {
    console.log('\n' + '═'.repeat(60));
    console.log(`${this.c.bgBlue}${this.c.white}${this.c.bright}    👁️  Content Watcher - سیستم پردازش خودکار    ${this.c.reset}`);
    console.log('═'.repeat(60) + '\n');
  }

  ready() {
    console.log(`\n${this.c.green}${this.c.bright}✨ آماده! منتظر تغییرات...${this.c.reset}`);
    console.log(`${this.c.dim}   برای خروج: Ctrl+C${this.c.reset}\n`);
  }

  stats(stats) {
    console.log(`\n${this.c.dim}─────────────────────────────────${this.c.reset}`);
    console.log(`${this.c.cyan}📊 آمار این جلسه:${this.c.reset}`);
    console.log(`   ${this.c.green}✓ موفق: ${stats.success}${this.c.reset}`);
    console.log(`   ${this.c.red}✗ خطا: ${stats.failed}${this.c.reset}`);
    console.log(`   ${this.c.yellow}⏱ از کش: ${stats.cached}${this.c.reset}`);
    console.log(`${this.c.dim}─────────────────────────────────${this.c.reset}\n`);
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس ContentWatcher
// ═══════════════════════════════════════════════════════════════

class ContentWatcher extends EventEmitter {
  constructor() {
    super();
    
    this.logger = new Logger();
    this.pipeline = new ContentPipeline();
    this.parser = new PreambleParser();
    this.styleGen = new StyleGenerator(CONFIG.stylesDir);
    this.renderer = new SmartRenderer({
      outputDir: CONFIG.diagramsDir,
      cacheDir: CONFIG.cacheDir
    });
    
    // کش تنظیمات کتاب‌ها
    this.bookConfigs = new Map();
    
    // صف پردازش با debounce
    this.pendingFiles = new Map();
    this.debounceTimers = new Map();
    
    // آمار
    this.stats = {
      success: 0,
      failed: 0,
      cached: 0,
      totalTime: 0
    };
    
    // وضعیت
    this.isProcessing = false;
    this.queue = [];
  }

  /**
   * شروع watch
   */
  async start() {
    this.logger.banner();
    
    // بارگذاری تنظیمات موجود
    await this.loadExistingConfigs();
    
    // راه‌اندازی watcher
    this.watcher = chokidar.watch(CONFIG.watchPaths, {
      ignored: CONFIG.ignorePaths,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      },
      // تنظیمات ویندوز
      usePolling: process.platform === 'win32',
      interval: 300
    });

    // Event handlers
    this.watcher
      .on('ready', () => this.onReady())
      .on('change', (filePath) => this.onFileChange(filePath, 'change'))
      .on('add', (filePath) => this.onFileChange(filePath, 'add'))
      .on('unlink', (filePath) => this.onFileDelete(filePath))
      .on('error', (error) => this.onError(error));

    // Handle Ctrl+C
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  /**
   * بارگذاری تنظیمات موجود
   */
  async loadExistingConfigs() {
    const configDir = path.join(CONFIG.cacheDir, 'configs');
    
    try {
      const files = await fs.readdir(configDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const bookSlug = path.basename(file, '.json');
          const configPath = path.join(configDir, file);
          const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
          this.bookConfigs.set(bookSlug, config);
          this.logger.info(`تنظیمات بارگذاری شد: ${bookSlug}`);
        }
      }
    } catch {
      // پوشه وجود ندارد - اولین اجرا
    }
  }

  /**
   * Event: آماده
   */
  onReady() {
    this.logger.info(`در حال مانیتور: ${CONFIG.watchPaths.join(', ')}`);
    this.logger.ready();
  }

  /**
   * Event: تغییر فایل
   */
  onFileChange(filePath, action) {
    // نرمال‌سازی مسیر
    filePath = path.normalize(filePath);
    
    this.logger.file(action, filePath);
    
    // Debounce
    const existing = this.debounceTimers.get(filePath);
    if (existing) {
      clearTimeout(existing);
    }
    
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this.queueFile(filePath);
    }, CONFIG.debounceDelay);
    
    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Event: حذف فایل
   */
  async onFileDelete(filePath) {
    filePath = path.normalize(filePath);
    this.logger.file('unlink', filePath);
    
    // پیدا کردن و حذف فایل خروجی متناظر
    const outputPath = this.getOutputPath(filePath);
    if (outputPath) {
      try {
        await fs.unlink(outputPath);
        this.logger.success(`حذف شد: ${path.basename(outputPath)}`);
      } catch {
        // فایل وجود نداشت
      }
    }
  }

  /**
   * Event: خطا
   */
  onError(error) {
    this.logger.error(`خطای Watcher: ${error.message}`);
  }

  /**
   * اضافه کردن به صف پردازش
   */
  queueFile(filePath) {
    this.queue.push(filePath);
    this.processQueue();
  }

  /**
   * پردازش صف
   */
  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.queue.length > 0) {
      const filePath = this.queue.shift();
      await this.processFile(filePath);
    }
    
    this.isProcessing = false;
  }

  /**
   * پردازش یک فایل
   */
  async processFile(filePath, retryCount = 0) {
    const startTime = Date.now();
    this.logger.file('processing', filePath);
    
    try {
      const fileInfo = this.analyzeFilePath(filePath);
      
      switch (fileInfo.type) {
        case 'preamble':
          await this.processPreambleChange(fileInfo);
          break;
        
        case 'chapter':
          await this.processChapter(fileInfo);
          break;
        
        case 'article':
          await this.processArticle(fileInfo);
          break;
        
        case 'book-main':
          await this.processBookMain(fileInfo);
          break;
        
        default:
          this.logger.warn(`نوع فایل ناشناخته: ${filePath}`);
          return;
      }
      
      const elapsed = Date.now() - startTime;
      this.stats.success++;
      this.stats.totalTime += elapsed;
      
      this.logger.file('done', filePath);
      this.logger.info(`زمان: ${elapsed}ms`);
      
    } catch (error) {
      if (retryCount < CONFIG.maxRetries) {
        this.logger.warn(`تلاش مجدد (${retryCount + 1}/${CONFIG.maxRetries})...`);
        await this.delay(1000);
        return this.processFile(filePath, retryCount + 1);
      }
      
      this.stats.failed++;
      this.logger.error(`خطا در پردازش: ${error.message}`);
      
      // ذخیره لاگ خطا
      await this.saveErrorLog(filePath, error);
    }
  }

  /**
   * تحلیل مسیر فایل
   */
  analyzeFilePath(filePath) {
    const relativePath = path.relative(CONFIG.sourceDir, filePath);
    const parts = relativePath.split(path.sep);
    const fileName = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    
    // تشخیص نوع فایل
    if (parts[0] === 'books' && parts.length >= 2) {
      const bookSlug = parts[1];
      
      // preamble
      if (fileName === 'preamble' || fileName.includes('preamble')) {
        return {
          type: 'preamble',
          bookSlug,
          filePath,
          lang: this.detectLanguage(filePath)
        };
      }
      
      // main.tex
      if (fileName === 'main' || fileName === 'book' || fileName === 'index') {
        return {
          type: 'book-main',
          bookSlug,
          filePath,
          lang: this.detectLanguage(filePath)
        };
      }
      
      // chapter
      return {
        type: 'chapter',
        bookSlug,
        chapterFile: filePath,
        fileName,
        lang: this.detectLanguage(filePath)
      };
    }
    
    if (parts[0] === 'articles') {
      return {
        type: 'article',
        filePath,
        fileName,
        lang: this.detectLanguage(filePath)
      };
    }
    
    return { type: 'unknown', filePath };
  }

  /**
   * تشخیص زبان
   */
  detectLanguage(filePath) {
    if (filePath.includes('/en/') || filePath.includes('\\en\\')) {
      return 'en';
    }
    return 'fa';
  }

  /**
   * پردازش تغییر preamble
   */
  async processPreambleChange(fileInfo) {
    const { bookSlug, lang } = fileInfo;
    
    this.logger.info(`تغییر Preamble - نیاز به پردازش مجدد کل کتاب: ${bookSlug}`);
    
    // تحلیل مجدد پروژه
    const bookDir = path.join(CONFIG.sourceDir, 'books', bookSlug);
    const config = await this.parser.analyzeProject(bookDir);
    
    // ذخیره config جدید
    this.bookConfigs.set(bookSlug, config);
    await this.saveConfig(bookSlug, config);
    
    // تولید CSS جدید
    await this.styleGen.generateCSS(config, bookSlug);
    
    // پردازش مجدد همه فصل‌ها
    await this.pipeline.processBook(bookDir, { slug: bookSlug, lang });
  }

  /**
   * پردازش تغییر فصل
   */
  async processChapter(fileInfo) {
    const { bookSlug, chapterFile, fileName, lang } = fileInfo;
    
    // دریافت config کتاب
    let config = this.bookConfigs.get(bookSlug);
    
    if (!config) {
      // اگر config نداریم، کل کتاب را پردازش کنیم
      const bookDir = path.join(CONFIG.sourceDir, 'books', bookSlug);
      config = await this.parser.analyzeProject(bookDir);
      this.bookConfigs.set(bookSlug, config);
      await this.saveConfig(bookSlug, config);
    }
    
    // تشخیص شماره فصل
    const chapterNumber = this.extractChapterNumber(fileName);
    
    // پردازش این فصل
    await this.processSingleChapter(chapterFile, {
      config,
      bookSlug,
      chapterNumber,
      lang
    });
  }

  /**
   * پردازش یک فصل
   */
  async processSingleChapter(chapterPath, options) {
    const { config, bookSlug, chapterNumber, lang } = options;
    
    // خواندن محتوا
    let content = await fs.readFile(chapterPath, 'utf-8');
    
    // استخراج و رندر نمودارها
    content = await this.processAllDiagrams(content, config, `${bookSlug}-ch${chapterNumber}`);
    
    // پیش‌پردازش
    content = this.preProcess(content);
    
    // تبدیل با Pandoc
    const markdown = await this.convertWithPandoc(content);
    
    // پس‌پردازش
    const finalMd = this.postProcess(markdown, { bookSlug, chapterNumber, lang });
    
    // ذخیره
    const outputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
    await fs.mkdir(outputDir, { recursive: true });
    
    const baseName = path.basename(chapterPath, '.tex');
    const outputFileName = `ch${String(chapterNumber).padStart(2, '0')}-${baseName}.md`;
    const outputPath = path.join(outputDir, outputFileName);
    
    await fs.writeFile(outputPath, finalMd, 'utf-8');
    this.logger.success(`ذخیره: ${outputFileName}`);
  }

  /**
   * پردازش مقاله
   */
  async processArticle(fileInfo) {
    const { filePath, fileName, lang } = fileInfo;
    const ext = path.extname(filePath);
    
    const outputDir = path.join(CONFIG.outputDir, 'articles', lang);
    await fs.mkdir(outputDir, { recursive: true });
    
    if (ext === '.md' || ext === '.mdx') {
      // فایل Markdown - کپی مستقیم
      const outputPath = path.join(outputDir, path.basename(filePath));
      await fs.copyFile(filePath, outputPath);
      this.logger.success(`کپی: ${path.basename(filePath)}`);
    } else if (ext === '.tex') {
      // فایل LaTeX - پردازش
      let content = await fs.readFile(filePath, 'utf-8');
      
      // config پیش‌فرض برای مقالات
      const defaultConfig = await this.getDefaultConfig();
      
      content = await this.processAllDiagrams(content, defaultConfig, fileName);
      content = this.preProcess(content);
      const markdown = await this.convertWithPandoc(content);
      const finalMd = this.postProcess(markdown, { lang });
      
      const outputPath = path.join(outputDir, `${fileName}.md`);
      await fs.writeFile(outputPath, finalMd, 'utf-8');
      this.logger.success(`ذخیره: ${fileName}.md`);
    }
  }

  /**
   * پردازش فایل اصلی کتاب
   */
  async processBookMain(fileInfo) {
    const { bookSlug, lang } = fileInfo;
    
    this.logger.info(`تغییر فایل اصلی - پردازش کامل کتاب: ${bookSlug}`);
    
    const bookDir = path.join(CONFIG.sourceDir, 'books', bookSlug);
    await this.pipeline.processBook(bookDir, { slug: bookSlug, lang });
  }

  /**
   * پردازش نمودارها
   */
  async processAllDiagrams(content, config, prefix) {
    const tikzRegex = /\\begin\{tikzpicture\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{tikzpicture\}/g;
    
    const matches = [...content.matchAll(tikzRegex)];
    
    let counter = 0;
    for (const match of matches) {
      counter++;
      const tikzCode = match[0];
      const name = `${prefix}-${counter}`;
      
      const result = await this.renderer.render(tikzCode, config, { name });
      
      if (result.success) {
        if (result.cached) {
          this.stats.cached++;
        }
        const relativePath = `/diagrams/${path.basename(result.path)}`;
        const replacement = `\n\n![نمودار ${counter}](${relativePath}){.tikz-diagram}\n\n`;
        content = content.replace(tikzCode, replacement);
      } else {
        content = content.replace(tikzCode, `\n\n<!-- DIAGRAM_ERROR: ${name} -->\n\n`);
      }
    }
    
    return content;
  }

  /**
   * پیش‌پردازش
   */
  preProcess(content) {
    return content
      .replace(
        /\\begin\{tcolorbox\}\[([^\]]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g,
        (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`
      )
      .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '')
      .replace(/\\setcounter\{[^}]*\}\{[^}]*\}/g, '');
  }

  /**
   * تبدیل با Pandoc
   */
  async convertWithPandoc(content) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const tempDir = path.join(CONFIG.cacheDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputFile = path.join(tempDir, `input-${Date.now()}.tex`);
    const outputFile = path.join(tempDir, `output-${Date.now()}.md`);
    
    await fs.writeFile(inputFile, content, 'utf-8');
    
    const cmd = `pandoc "${inputFile}" -o "${outputFile}" --wrap=none --columns=1000`;
    await execAsync(cmd, { timeout: 60000 });
    
    const result = await fs.readFile(outputFile, 'utf-8');
    
    // پاکسازی فایل‌های موقت
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
    
    return result;
  }

  /**
   * پس‌پردازش
   */
  postProcess(markdown, options = {}) {
    const { bookSlug, chapterNumber, lang = 'fa' } = options;
    
    let result = markdown
      .replace(/\[node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\\node[\s\S]*?;/g, '')
      .replace(/\\draw[\s\S]*?;/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    const titleMatch = result.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : (chapterNumber ? `فصل ${chapterNumber}` : 'مقاله');
    
    let frontmatter = `---
title: "${title}"
description: "${title}"
lang: ${lang}
`;
    
    if (chapterNumber) {
      frontmatter += `chapterNumber: ${chapterNumber}\n`;
    }
    if (bookSlug) {
      frontmatter += `book: "${bookSlug}"\n`;
    }
    
    frontmatter += `---\n\n`;
    
    return frontmatter + result;
  }

  /**
   * استخراج شماره فصل
   */
  extractChapterNumber(fileName) {
    const match = fileName.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  /**
   * config پیش‌فرض
   */
  async getDefaultConfig() {
    return {
      colors: {
        bleurepublique: { css: 'rgb(26, 115, 232)' },
        bleulight: { css: 'rgb(232, 244, 248)' },
        vertnapoleon: { css: 'rgb(52, 168, 83)' },
        rougerevolution: { css: 'rgb(234, 67, 53)' },
        gris: { css: 'rgb(95, 99, 104)' }
      },
      fonts: {
        main: { name: 'Vazirmatn' }
      },
      tikz: {
        libraries: ['shapes.geometric', 'arrows.meta', 'positioning', 'calc', 'backgrounds'],
        styles: {},
        pgfplotsLibraries: []
      }
    };
  }

  /**
   * ذخیره config
   */
  async saveConfig(bookSlug, config) {
    const configDir = path.join(CONFIG.cacheDir, 'configs');
    await fs.mkdir(configDir, { recursive: true });
    
    await fs.writeFile(
      path.join(configDir, `${bookSlug}.json`),
      JSON.stringify(config, null, 2),
      'utf-8'
    );
  }

  /**
   * ذخیره لاگ خطا
   */
  async saveErrorLog(filePath, error) {
    const logDir = path.join(CONFIG.cacheDir, 'errors');
    await fs.mkdir(logDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logContent = {
      file: filePath,
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    };
    
    await fs.writeFile(
      path.join(logDir, `error-${timestamp}.json`),
      JSON.stringify(logContent, null, 2)
    );
  }

  /**
   * مسیر خروجی
   */
  getOutputPath(inputPath) {
    const fileInfo = this.analyzeFilePath(inputPath);
    
    if (fileInfo.type === 'chapter') {
      const { bookSlug, fileName, lang } = fileInfo;
      const chapterNumber = this.extractChapterNumber(fileName);
      return path.join(
        CONFIG.outputDir, 
        'books', 
        lang, 
        bookSlug, 
        `ch${String(chapterNumber).padStart(2, '0')}-${fileName}.md`
      );
    }
    
    if (fileInfo.type === 'article') {
      const { fileName, lang } = fileInfo;
      return path.join(CONFIG.outputDir, 'articles', lang, `${fileName}.md`);
    }
    
    return null;
  }

  /**
   * تأخیر
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * توقف
   */
  async stop() {
    console.log('\n');
    this.logger.info('در حال توقف...');
    
    if (this.watcher) {
      await this.watcher.close();
    }
    
    // نمایش آمار نهایی
    this.logger.stats(this.stats);
    
    process.exit(0);
  }
}

// ═══════════════════════════════════════════════════════════════
// اجرا
// ═══════════════════════════════════════════════════════════════

async function main() {
  const watcher = new ContentWatcher();
  await watcher.start();
}

main().catch(error => {
  console.error('❌ خطای بحرانی:', error);
  process.exit(1);
});

export { ContentWatcher };
```

---

## 📦 به‌روزرسانی package.json

```json
{
  "name": "your-site",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "dev:watch": "npm-run-all --parallel dev content:watch",
    "build": "npm run content:all && astro build",
    "preview": "astro preview",
    
    "content:all": "node scripts/process-content.mjs --all",
    "content:book": "node scripts/process-content.mjs --book",
    "content:watch": "node scripts/watch-content.mjs",
    
    "clean": "rimraf .content-cache public/diagrams src/styles/book-themes"
  },
  "devDependencies": {
    "chokidar": "^3.6.0",
    "globby": "^14.0.0",
    "gray-matter": "^4.0.3",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.5"
  }
}
```

---

## 🔧 نصب وابستگی‌های جدید

```powershell
# نصب پکیج‌های لازم
npm install -D chokidar npm-run-all rimraf
```

---

## 🚀 نحوه استفاده

### اجرای Watch به تنهایی:

```powershell
npm run content:watch
```

### اجرای Watch همراه با Astro Dev:

```powershell
npm run dev:watch
```

### خروجی نمونه:

```
═══════════════════════════════════════════════════════
    👁️  Content Watcher - سیستم پردازش خودکار    
═══════════════════════════════════════════════════════

[14:32:15] ℹ تنظیمات بارگذاری شد: transition-guide
[14:32:15] ℹ در حال مانیتور: content-source/**/*.tex, content-source/**/*.md

✨ آماده! منتظر تغییرات...
   برای خروج: Ctrl+C

[14:33:22] 📝 CHANGE     chapter1.tex (content-source\books\transition-guide\chapters)
[14:33:22] ⚙️ PROCESSING chapter1.tex (content-source\books\transition-guide\chapters)
[14:33:22]    📊 نمودارها: 5
[14:33:23]    ⚡ کش: transition-guide-ch1-1
[14:33:23]    ⚡ کش: transition-guide-ch1-2
[14:33:24]    🔄 رندر: transition-guide-ch1-3...
[14:33:26]    ✅ تولید: transition-guide-ch1-3
[14:33:26]    ⚡ کش: transition-guide-ch1-4
[14:33:26]    ⚡ کش: transition-guide-ch1-5
[14:33:27] ✅ DONE       chapter1.tex (content-source\books\transition-guide\chapters)
[14:33:27] ℹ زمان: 4823ms
```

---

## 🎯 خلاصه قابلیت‌ها

```
┌─────────────────────────────────────────────────────────────────┐
│                  ویژگی‌های Watch هوشمند                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ مانیتور خودکار                                               │
│     • فایل‌های .tex, .md, .mdx                                   │
│     • تشخیص نوع فایل (کتاب/فصل/مقاله/preamble)                 │
│                                                                   │
│  ✅ پردازش هوشمند                                                │
│     • فقط فایل تغییریافته پردازش می‌شود                         │
│     • تغییر preamble → پردازش کل کتاب                          │
│     • تغییر فصل → فقط همان فصل                                  │
│                                                                   │
│  ✅ کش هوشمند                                                    │
│     • نمودارهای بدون تغییر از کش خوانده می‌شوند                 │
│     • تنظیمات کتاب‌ها ذخیره می‌شود                               │
│                                                                   │
│  ✅ Debounce                                                     │
│     • ذخیره‌های متعدد سریع = یک پردازش                          │
│     • جلوگیری از مصرف منابع اضافی                               │
│                                                                   │
│  ✅ گزارش‌دهی زنده                                               │
│     • وضعیت هر فایل با رنگ و آیکون                              │
│     • آمار جلسه                                                  │
│     • لاگ خطاها                                                  │
│                                                                   │
│  ✅ سازگار با ویندوز                                             │
│     • استفاده از polling در ویندوز                               │
│     • مسیرهای صحیح                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

آیا می‌خواهید مورد ۲ (پشتیبانی از PDF ورودی) یا مورد ۳ (یکپارچه‌سازی با AI برای تگ‌گذاری) را هم اضافه کنیم؟


# پشتیبانی از PDF و یکپارچه‌سازی AI

## 🏗️ معماری کامل سیستم

```
┌─────────────────────────────────────────────────────────────────┐
│                 معماری کامل Content Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    منابع ورودی                           │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│   │  │  LaTeX  │  │Markdown │  │   PDF   │  │  Word   │    │   │
│   │  │  .tex   │  │ .md/.mdx│  │  .pdf   │  │  .docx  │    │   │
│   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│   └───────┼────────────┼────────────┼────────────┼──────────┘   │
│           │            │            │            │               │
│           ▼            ▼            ▼            ▼               │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              ۱. Content Analyzer                         │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│   │  │   Preamble   │  │     PDF      │  │   Format     │   │   │
│   │  │   Parser     │  │   Extractor  │  │   Detector   │   │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              ۲. AI Processing Layer                      │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│   │  │   Auto       │  │   Content    │  │   Smart      │   │   │
│   │  │   Tagger     │  │   Summarizer │  │   Categorize │   │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              ۳. Rendering Engine                         │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│   │  │   TikZ→SVG   │  │   Tables→    │  │   Math→      │   │   │
│   │  │   Renderer   │  │   HTML       │  │   KaTeX      │   │   │
│   │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              ۴. Output Generator                         │   │
│   │  • Markdown + Frontmatter (با تگ‌های AI)                │   │
│   │  • CSS Variables                                         │   │
│   │  • SEO Metadata                                          │   │
│   │  • Search Index                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📄 بخش ۱: پردازشگر PDF

### ۱.۱ نصب وابستگی‌ها

```powershell
# پکیج‌های Node برای PDF
npm install -D pdf-parse pdf2pic sharp mammoth

# ابزارهای سیستمی (اختیاری - برای کیفیت بهتر)
# Windows - با Chocolatey:
choco install poppler ghostscript -y

# یا دانلود مستقیم:
# Poppler: https://github.com/oschwartz10612/poppler-windows/releases
# Ghostscript: https://ghostscript.com/releases/gsdnld.html
```

### ۱.۲ ماژول PDF Extractor

**فایل `scripts/lib/pdf-extractor.mjs`:**

```javascript
/**
 * استخراج‌کننده هوشمند محتوای PDF
 * 
 * قابلیت‌ها:
 * - استخراج متن با حفظ ساختار
 * - استخراج تصاویر
 * - تشخیص جداول
 * - استخراج metadata
 * - پشتیبانی از فارسی/RTL
 */

import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  tempDir: process.env.TEMP || '/tmp',
  imageOutputDir: 'public/images/extracted',
  imageQuality: 90,
  imageDPI: 150,
  maxImageWidth: 1200,
  supportedFormats: ['.pdf', '.docx', '.doc']
};

// ═══════════════════════════════════════════════════════════════
// کلاس PDFExtractor
// ═══════════════════════════════════════════════════════════════

export class PDFExtractor {
  constructor(options = {}) {
    this.options = { ...CONFIG, ...options };
    this.stats = {
      pagesProcessed: 0,
      imagesExtracted: 0,
      tablesDetected: 0
    };
  }

  /**
   * استخراج محتوای PDF
   */
  async extract(pdfPath, options = {}) {
    const { extractImages = true, extractTables = true } = options;
    
    console.log(`\n📄 استخراج PDF: ${path.basename(pdfPath)}`);
    
    // بررسی وجود فایل
    await fs.access(pdfPath);
    
    // خواندن فایل
    const dataBuffer = await fs.readFile(pdfPath);
    
    // استخراج با pdf-parse
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(dataBuffer, {
      // تنظیمات سفارشی
      pagerender: this.renderPage.bind(this)
    });
    
    const result = {
      metadata: this.extractMetadata(data),
      content: {
        text: data.text,
        pages: [],
        structure: []
      },
      images: [],
      tables: []
    };
    
    // پردازش ساختار
    result.content.structure = this.analyzeStructure(data.text);
    
    // استخراج تصاویر
    if (extractImages) {
      result.images = await this.extractImages(pdfPath, options.outputDir);
    }
    
    // تشخیص جداول (ساده)
    if (extractTables) {
      result.tables = this.detectTables(data.text);
    }
    
    console.log(`   📊 صفحات: ${data.numpages}`);
    console.log(`   🖼️ تصاویر: ${result.images.length}`);
    console.log(`   📋 جداول: ${result.tables.length}`);
    
    return result;
  }

  /**
   * استخراج metadata
   */
  extractMetadata(data) {
    return {
      title: data.info?.Title || null,
      author: data.info?.Author || null,
      subject: data.info?.Subject || null,
      keywords: data.info?.Keywords?.split(',').map(k => k.trim()) || [],
      creator: data.info?.Creator || null,
      producer: data.info?.Producer || null,
      creationDate: data.info?.CreationDate || null,
      modificationDate: data.info?.ModDate || null,
      pageCount: data.numpages,
      version: data.version
    };
  }

  /**
   * تحلیل ساختار متن
   */
  analyzeStructure(text) {
    const structure = [];
    const lines = text.split('\n');
    
    let currentSection = null;
    let currentContent = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // تشخیص عناوین (ساده)
      const headingMatch = this.detectHeading(trimmed);
      
      if (headingMatch) {
        // ذخیره بخش قبلی
        if (currentSection) {
          currentSection.content = currentContent.join('\n');
          structure.push(currentSection);
        }
        
        currentSection = {
          type: 'heading',
          level: headingMatch.level,
          text: headingMatch.text,
          content: ''
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(trimmed);
      } else {
        // محتوای قبل از اولین عنوان
        structure.push({
          type: 'paragraph',
          content: trimmed
        });
      }
    }
    
    // ذخیره آخرین بخش
    if (currentSection) {
      currentSection.content = currentContent.join('\n');
      structure.push(currentSection);
    }
    
    return structure;
  }

  /**
   * تشخیص عنوان
   */
  detectHeading(line) {
    // الگوهای فارسی
    const persianPatterns = [
      { regex: /^فصل\s+[\u06F0-\u06F9۰-۹\d]+[:\s]+(.+)$/i, level: 1 },
      { regex: /^بخش\s+[\u06F0-\u06F9۰-۹\d]+[:\s]+(.+)$/i, level: 1 },
      { regex: /^[\u06F0-\u06F9۰-۹\d]+[-–.]\s*[\u06F0-\u06F9۰-۹\d]*[-–.]?\s*(.+)$/, level: 2 },
      { regex: /^[الف-ی]\)\s*(.+)$/, level: 3 },
    ];
    
    // الگوهای انگلیسی
    const englishPatterns = [
      { regex: /^Chapter\s+\d+[:\s]+(.+)$/i, level: 1 },
      { regex: /^Section\s+[\d.]+[:\s]+(.+)$/i, level: 2 },
      { regex: /^\d+\.\s+(.+)$/, level: 2 },
      { regex: /^\d+\.\d+\s+(.+)$/, level: 3 },
    ];
    
    const allPatterns = [...persianPatterns, ...englishPatterns];
    
    for (const pattern of allPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        return { level: pattern.level, text: match[1] || line };
      }
    }
    
    // تشخیص بر اساس طول و فرمت
    if (line.length < 100 && !line.endsWith('.') && !line.endsWith('؟')) {
      const words = line.split(/\s+/);
      if (words.length <= 10) {
        // احتمالاً عنوان
        return { level: 2, text: line };
      }
    }
    
    return null;
  }

  /**
   * استخراج تصاویر از PDF
   */
  async extractImages(pdfPath, outputDir) {
    const images = [];
    
    try {
      // استفاده از pdf2pic برای تبدیل صفحات به تصویر
      const { fromPath } = require('pdf2pic');
      
      const outputPath = outputDir || path.join(this.options.imageOutputDir, path.basename(pdfPath, '.pdf'));
      await fs.mkdir(outputPath, { recursive: true });
      
      const options = {
        density: this.options.imageDPI,
        saveFilename: 'page',
        savePath: outputPath,
        format: 'png',
        width: this.options.maxImageWidth
      };
      
      const converter = fromPath(pdfPath, options);
      
      // تبدیل همه صفحات
      const pdfParse = require('pdf-parse');
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdfParse(dataBuffer);
      
      for (let i = 1; i <= data.numpages; i++) {
        try {
          const result = await converter(i);
          if (result.path) {
            images.push({
              page: i,
              path: result.path,
              name: result.name
            });
            this.stats.imagesExtracted++;
          }
        } catch (err) {
          console.warn(`   ⚠️ خطا در استخراج صفحه ${i}`);
        }
      }
      
    } catch (error) {
      console.warn(`   ⚠️ استخراج تصاویر ممکن نشد: ${error.message}`);
    }
    
    return images;
  }

  /**
   * تشخیص جداول (ساده)
   */
  detectTables(text) {
    const tables = [];
    const lines = text.split('\n');
    
    let inTable = false;
    let currentTable = [];
    
    for (const line of lines) {
      // تشخیص خطوط جدول‌مانند
      const isTableLine = this.isTableLine(line);
      
      if (isTableLine) {
        if (!inTable) {
          inTable = true;
          currentTable = [];
        }
        currentTable.push(this.parseTableRow(line));
      } else if (inTable) {
        if (currentTable.length >= 2) {
          tables.push({
            rows: currentTable,
            markdown: this.tableToMarkdown(currentTable)
          });
          this.stats.tablesDetected++;
        }
        inTable = false;
        currentTable = [];
      }
    }
    
    return tables;
  }

  /**
   * تشخیص خط جدول
   */
  isTableLine(line) {
    // خطوط با تب یا چند فاصله متوالی
    const tabCount = (line.match(/\t/g) || []).length;
    const multiSpaceCount = (line.match(/\s{3,}/g) || []).length;
    
    return tabCount >= 2 || multiSpaceCount >= 2;
  }

  /**
   * پارس ردیف جدول
   */
  parseTableRow(line) {
    // تقسیم بر اساس تب یا چند فاصله
    return line.split(/\t|\s{3,}/).map(cell => cell.trim()).filter(Boolean);
  }

  /**
   * تبدیل جدول به Markdown
   */
  tableToMarkdown(rows) {
    if (rows.length === 0) return '';
    
    const maxCols = Math.max(...rows.map(r => r.length));
    
    // هدر
    const header = rows[0].map(cell => cell || '').concat(Array(maxCols - rows[0].length).fill(''));
    const separator = Array(maxCols).fill('---');
    
    let md = `| ${header.join(' | ')} |\n`;
    md += `| ${separator.join(' | ')} |\n`;
    
    // ردیف‌ها
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].concat(Array(maxCols - rows[i].length).fill(''));
      md += `| ${row.join(' | ')} |\n`;
    }
    
    return md;
  }

  /**
   * رندر صفحه (callback برای pdf-parse)
   */
  renderPage(pageData) {
    return pageData.getTextContent().then(textContent => {
      let text = '';
      let lastY = null;
      
      for (const item of textContent.items) {
        if (lastY !== null && Math.abs(lastY - item.transform[5]) > 5) {
          text += '\n';
        }
        text += item.str;
        lastY = item.transform[5];
      }
      
      return text;
    });
  }

  /**
   * تبدیل PDF به Markdown
   */
  async toMarkdown(pdfPath, options = {}) {
    const data = await this.extract(pdfPath, options);
    
    let markdown = '';
    
    // عنوان از metadata
    if (data.metadata.title) {
      markdown += `# ${data.metadata.title}\n\n`;
    }
    
    // ساختار به Markdown
    for (const item of data.content.structure) {
      if (item.type === 'heading') {
        markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
        if (item.content) {
          markdown += `${item.content}\n\n`;
        }
      } else if (item.type === 'paragraph') {
        markdown += `${item.content}\n\n`;
      }
    }
    
    // جداول
    for (const table of data.tables) {
      markdown += `\n${table.markdown}\n`;
    }
    
    return {
      markdown,
      metadata: data.metadata,
      images: data.images
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس WordExtractor (برای .docx)
// ═══════════════════════════════════════════════════════════════

export class WordExtractor {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * استخراج محتوای Word
   */
  async extract(docxPath) {
    const mammoth = require('mammoth');
    
    console.log(`\n📝 استخراج Word: ${path.basename(docxPath)}`);
    
    // تبدیل به HTML
    const result = await mammoth.convertToHtml({ path: docxPath });
    
    // تبدیل به Markdown
    const markdown = await mammoth.convertToMarkdown({ path: docxPath });
    
    return {
      html: result.value,
      markdown: markdown.value,
      messages: result.messages
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس UniversalExtractor
// ═══════════════════════════════════════════════════════════════

export class UniversalExtractor {
  constructor(options = {}) {
    this.pdfExtractor = new PDFExtractor(options);
    this.wordExtractor = new WordExtractor(options);
  }

  /**
   * استخراج از هر فرمت
   */
  async extract(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return this.pdfExtractor.toMarkdown(filePath, options);
      
      case '.docx':
      case '.doc':
        return this.wordExtractor.extract(filePath);
      
      default:
        throw new Error(`فرمت پشتیبانی نمی‌شود: ${ext}`);
    }
  }
}

export default PDFExtractor;
```

---

## 🤖 بخش ۲: یکپارچه‌سازی AI

### ۲.۱ نصب وابستگی‌ها

```powershell
# برای استفاده از OpenAI یا Claude
npm install -D openai @anthropic-ai/sdk

# برای اجرای محلی (Ollama)
# نصب Ollama از: https://ollama.ai/download
# سپس:
# ollama pull llama3
# ollama pull mistral
```

### ۲.۲ ماژول AI Tagger

**فایل `scripts/lib/ai-tagger.mjs`:**

```javascript
/**
 * سیستم هوشمند تگ‌گذاری و دسته‌بندی با AI
 * 
 * قابلیت‌ها:
 * - تگ‌گذاری خودکار
 * - پیشنهاد دسته‌بندی
 * - تولید خلاصه
 * - استخراج کلیدواژه
 * - تشخیص زبان
 * - تخمین زمان مطالعه
 * - تحلیل سطح دشواری
 */

import fs from 'fs/promises';
import path from 'path';

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // انتخاب Provider
  provider: process.env.AI_PROVIDER || 'openai', // 'openai', 'anthropic', 'ollama'
  
  // تنظیمات OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini', // یا 'gpt-4o' برای کیفیت بهتر
    maxTokens: 2000
  },
  
  // تنظیمات Anthropic (Claude)
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-sonnet-4-20250514',
    maxTokens: 2000
  },
  
  // تنظیمات Ollama (محلی)
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3'
  },
  
  // کش
  cacheDir: '.content-cache/ai',
  cacheEnabled: true,
  
  // دسته‌بندی‌های از پیش تعریف شده
  predefinedCategories: {
    fa: [
      'سیاست', 'اقتصاد', 'جامعه', 'فرهنگ', 'تاریخ',
      'فناوری', 'علم', 'هنر', 'ورزش', 'سلامت',
      'آموزش', 'محیط زیست', 'حقوق', 'فلسفه', 'دین'
    ],
    en: [
      'Politics', 'Economy', 'Society', 'Culture', 'History',
      'Technology', 'Science', 'Art', 'Sports', 'Health',
      'Education', 'Environment', 'Law', 'Philosophy', 'Religion'
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// کلاس AIProvider - رابط یکپارچه
// ═══════════════════════════════════════════════════════════════

class AIProvider {
  constructor(providerName) {
    this.providerName = providerName;
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    switch (this.providerName) {
      case 'openai':
        const OpenAI = (await import('openai')).default;
        this.client = new OpenAI({ apiKey: CONFIG.openai.apiKey });
        break;
      
      case 'anthropic':
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        this.client = new Anthropic({ apiKey: CONFIG.anthropic.apiKey });
        break;
      
      case 'ollama':
        // Ollama از HTTP API استفاده می‌کند
        this.client = {
          baseUrl: CONFIG.ollama.baseUrl,
          model: CONFIG.ollama.model
        };
        break;
      
      default:
        throw new Error(`Provider ناشناخته: ${this.providerName}`);
    }

    this.initialized = true;
  }

  async complete(prompt, options = {}) {
    await this.initialize();

    switch (this.providerName) {
      case 'openai':
        return this.completeOpenAI(prompt, options);
      
      case 'anthropic':
        return this.completeAnthropic(prompt, options);
      
      case 'ollama':
        return this.completeOllama(prompt, options);
    }
  }

  async completeOpenAI(prompt, options = {}) {
    const response = await this.client.chat.completions.create({
      model: options.model || CONFIG.openai.model,
      messages: [
        { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: options.maxTokens || CONFIG.openai.maxTokens,
      temperature: options.temperature || 0.3,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined
    });

    return response.choices[0].message.content;
  }

  async completeAnthropic(prompt, options = {}) {
    const response = await this.client.messages.create({
      model: options.model || CONFIG.anthropic.model,
      max_tokens: options.maxTokens || CONFIG.anthropic.maxTokens,
      system: options.systemPrompt || 'You are a helpful assistant.',
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    return response.content[0].text;
  }

  async completeOllama(prompt, options = {}) {
    const response = await fetch(`${this.client.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.client.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.3
        }
      })
    });

    const data = await response.json();
    return data.response;
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس AITagger
// ═══════════════════════════════════════════════════════════════

export class AITagger {
  constructor(options = {}) {
    this.provider = new AIProvider(options.provider || CONFIG.provider);
    this.cacheEnabled = options.cacheEnabled ?? CONFIG.cacheEnabled;
    this.cacheDir = options.cacheDir || CONFIG.cacheDir;
    this.stats = {
      processed: 0,
      cached: 0,
      failed: 0
    };
  }

  /**
   * تحلیل کامل محتوا
   */
  async analyze(content, options = {}) {
    const { title, forceRefresh = false, lang = 'fa' } = options;
    
    // بررسی کش
    const cacheKey = this.getCacheKey(content, title);
    if (this.cacheEnabled && !forceRefresh) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        this.stats.cached++;
        return cached;
      }
    }
    
    console.log(`   🤖 تحلیل AI...`);
    
    try {
      // تحلیل اصلی
      const result = await this.performAnalysis(content, title, lang);
      
      // ذخیره در کش
      if (this.cacheEnabled) {
        await this.saveToCache(cacheKey, result);
      }
      
      this.stats.processed++;
      return result;
      
    } catch (error) {
      console.error(`   ❌ خطای AI: ${error.message}`);
      this.stats.failed++;
      
      // برگرداندن نتیجه پیش‌فرض
      return this.getDefaultResult(title, lang);
    }
  }

  /**
   * انجام تحلیل
   */
  async performAnalysis(content, title, lang) {
    const truncatedContent = content.slice(0, 4000); // محدودیت توکن
    
    const prompt = this.buildPrompt(title, truncatedContent, lang);
    
    const response = await this.provider.complete(prompt, {
      systemPrompt: this.getSystemPrompt(lang),
      jsonMode: true,
      temperature: 0.3
    });
    
    // پارس JSON
    try {
      const result = JSON.parse(response);
      return this.validateAndEnrich(result, lang);
    } catch {
      // تلاش برای استخراج JSON از متن
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return this.validateAndEnrich(JSON.parse(jsonMatch[0]), lang);
      }
      throw new Error('پاسخ AI قابل پارس نیست');
    }
  }

  /**
   * System Prompt
   */
  getSystemPrompt(lang) {
    if (lang === 'fa') {
      return `تو یک سیستم تحلیل محتوای فارسی هستی. وظیفه تو:
1. استخراج تگ‌های مرتبط
2. تعیین دسته‌بندی موضوعی
3. نوشتن خلاصه کوتاه
4. تخمین زمان مطالعه
5. تعیین سطح دشواری
6. استخراج کلیدواژه‌های مهم

همیشه پاسخ را به صورت JSON معتبر برگردان.`;
    }
    
    return `You are a content analysis system. Your tasks:
1. Extract relevant tags
2. Determine topic category
3. Write a brief summary
4. Estimate reading time
5. Determine difficulty level
6. Extract important keywords

Always return valid JSON.`;
  }

  /**
   * ساخت Prompt
   */
  buildPrompt(title, content, lang) {
    const categories = CONFIG.predefinedCategories[lang] || CONFIG.predefinedCategories.en;
    
    if (lang === 'fa') {
      return `
عنوان: ${title || 'بدون عنوان'}

متن:
${content}

---

لطفاً این متن را تحلیل کن و نتیجه را به صورت JSON با ساختار زیر برگردان:

{
  "tags": ["تگ۱", "تگ۲", "تگ۳", "تگ۴", "تگ۵"],
  "category": {
    "primary": "دسته اصلی",
    "secondary": ["دسته فرعی ۱", "دسته فرعی ۲"]
  },
  "summary": "خلاصه ۲-۳ جمله‌ای",
  "description": "توضیح یک جمله‌ای برای SEO",
  "keywords": ["کلیدواژه۱", "کلیدواژه۲", "کلیدواژه۳"],
  "readingTime": 5,
  "difficulty": "متوسط",
  "audience": ["مخاطب۱", "مخاطب۲"],
  "sentiment": "خنثی",
  "language": "fa",
  "topics": ["موضوع مرتبط ۱", "موضوع مرتبط ۲"]
}

دسته‌بندی‌های مجاز: ${categories.join('، ')}
سطوح دشواری: مبتدی، متوسط، پیشرفته، تخصصی
احساس: مثبت، منفی، خنثی، تحلیلی، انتقادی`;
    }
    
    return `
Title: ${title || 'Untitled'}

Content:
${content}

---

Analyze this text and return JSON with this structure:

{
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": {
    "primary": "main category",
    "secondary": ["sub1", "sub2"]
  },
  "summary": "2-3 sentence summary",
  "description": "One sentence SEO description",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "readingTime": 5,
  "difficulty": "intermediate",
  "audience": ["audience1", "audience2"],
  "sentiment": "neutral",
  "language": "en",
  "topics": ["related topic 1", "related topic 2"]
}

Allowed categories: ${categories.join(', ')}
Difficulty levels: beginner, intermediate, advanced, expert
Sentiment: positive, negative, neutral, analytical, critical`;
  }

  /**
   * اعتبارسنجی و غنی‌سازی نتیجه
   */
  validateAndEnrich(result, lang) {
    // اطمینان از وجود فیلدهای الزامی
    const validated = {
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 10) : [],
      category: result.category || { primary: lang === 'fa' ? 'متفرقه' : 'Miscellaneous', secondary: [] },
      summary: result.summary || '',
      description: result.description || result.summary?.slice(0, 160) || '',
      keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 10) : [],
      readingTime: typeof result.readingTime === 'number' ? result.readingTime : 5,
      difficulty: result.difficulty || (lang === 'fa' ? 'متوسط' : 'intermediate'),
      audience: Array.isArray(result.audience) ? result.audience : [],
      sentiment: result.sentiment || (lang === 'fa' ? 'خنثی' : 'neutral'),
      language: result.language || lang,
      topics: Array.isArray(result.topics) ? result.topics : [],
      
      // متادیتای اضافی
      _analyzed: new Date().toISOString(),
      _provider: this.provider.providerName
    };
    
    return validated;
  }

  /**
   * نتیجه پیش‌فرض
   */
  getDefaultResult(title, lang) {
    return {
      tags: [],
      category: { primary: lang === 'fa' ? 'متفرقه' : 'Miscellaneous', secondary: [] },
      summary: '',
      description: '',
      keywords: title ? title.split(/\s+/).slice(0, 5) : [],
      readingTime: 5,
      difficulty: lang === 'fa' ? 'متوسط' : 'intermediate',
      audience: [],
      sentiment: lang === 'fa' ? 'خنثی' : 'neutral',
      language: lang,
      topics: [],
      _analyzed: new Date().toISOString(),
      _provider: 'fallback'
    };
  }

  /**
   * تولید خلاصه
   */
  async generateSummary(content, options = {}) {
    const { maxLength = 200, lang = 'fa' } = options;
    
    const prompt = lang === 'fa'
      ? `این متن را در حداکثر ${maxLength} کلمه خلاصه کن:\n\n${content.slice(0, 3000)}`
      : `Summarize this text in maximum ${maxLength} words:\n\n${content.slice(0, 3000)}`;
    
    const response = await this.provider.complete(prompt, {
      temperature: 0.5,
      maxTokens: 500
    });
    
    return response.trim();
  }

  /**
   * پیشنهاد عناوین مرتبط
   */
  async suggestRelatedTopics(content, options = {}) {
    const { count = 5, lang = 'fa' } = options;
    
    const prompt = lang === 'fa'
      ? `بر اساس این متن، ${count} موضوع مرتبط پیشنهاد بده (فقط لیست، بدون توضیح):\n\n${content.slice(0, 2000)}`
      : `Based on this text, suggest ${count} related topics (list only, no explanations):\n\n${content.slice(0, 2000)}`;
    
    const response = await this.provider.complete(prompt, {
      temperature: 0.7
    });
    
    // پارس لیست
    return response
      .split('\n')
      .map(line => line.replace(/^[\d\-\*\.]+\s*/, '').trim())
      .filter(Boolean)
      .slice(0, count);
  }

  /**
   * تشخیص زبان
   */
  detectLanguage(text) {
    // تشخیص ساده بر اساس کاراکترها
    const persianChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
    
    if (persianChars > latinChars * 0.3) {
      return 'fa';
    }
    return 'en';
  }

  /**
   * تخمین زمان مطالعه
   */
  estimateReadingTime(content, lang = 'fa') {
    const words = content.split(/\s+/).length;
    
    // سرعت خواندن (کلمه در دقیقه)
    const wpm = lang === 'fa' ? 150 : 200;
    
    return Math.max(1, Math.ceil(words / wpm));
  }

  /**
   * کش
   */
  getCacheKey(content, title) {
    const crypto = require('crypto');
    const hash = crypto
      .createHash('md5')
      .update(content.slice(0, 1000) + (title || ''))
      .digest('hex');
    return hash;
  }

  async getFromCache(key) {
    try {
      const cachePath = path.join(this.cacheDir, `${key}.json`);
      const data = await fs.readFile(cachePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async saveToCache(key, data) {
    await fs.mkdir(this.cacheDir, { recursive: true });
    const cachePath = path.join(this.cacheDir, `${key}.json`);
    await fs.writeFile(cachePath, JSON.stringify(data, null, 2));
  }

  /**
   * آمار
   */
  getStats() {
    return { ...this.stats };
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس BatchProcessor
// ═══════════════════════════════════════════════════════════════

export class AIBatchProcessor {
  constructor(options = {}) {
    this.tagger = new AITagger(options);
    this.concurrency = options.concurrency || 3;
    this.delayBetweenRequests = options.delay || 1000;
  }

  /**
   * پردازش دسته‌ای
   */
  async processBatch(items, options = {}) {
    const results = [];
    const queue = [...items];
    
    console.log(`\n🤖 پردازش دسته‌ای: ${items.length} آیتم`);
    
    while (queue.length > 0) {
      const batch = queue.splice(0, this.concurrency);
      
      const batchResults = await Promise.all(
        batch.map(async (item, index) => {
          // تأخیر برای جلوگیری از rate limiting
          if (index > 0) {
            await this.delay(this.delayBetweenRequests);
          }
          
          try {
            const result = await this.tagger.analyze(item.content, {
              title: item.title,
              lang: item.lang || 'fa'
            });
            
            return { ...item, ai: result, success: true };
          } catch (error) {
            return { ...item, error: error.message, success: false };
          }
        })
      );
      
      results.push(...batchResults);
      
      const progress = Math.round((results.length / items.length) * 100);
      console.log(`   📊 پیشرفت: ${progress}%`);
    }
    
    const stats = this.tagger.getStats();
    console.log(`\n✅ پردازش کامل شد!`);
    console.log(`   موفق: ${stats.processed}, کش: ${stats.cached}, خطا: ${stats.failed}`);
    
    return results;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default AITagger;
```

---

## 🔗 یکپارچه‌سازی با Pipeline اصلی

### ۳.۱ به‌روزرسانی `process-content.mjs`

**فایل `scripts/process-content.mjs` (به‌روزشده):**

```javascript
#!/usr/bin/env node
/**
 * سیستم جامع پردازش محتوا
 * نسخه ۲.۰ - با پشتیبانی PDF و AI
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

// ماژول‌های داخلی
import { PreambleParser } from './lib/preamble-parser.mjs';
import { StyleGenerator } from './lib/style-generator.mjs';
import { SmartRenderer } from './lib/smart-renderer.mjs';
import { PDFExtractor, UniversalExtractor } from './lib/pdf-extractor.mjs';
import { AITagger, AIBatchProcessor } from './lib/ai-tagger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  sourceDir: 'content-source',
  outputDir: 'src/content',
  cacheDir: '.content-cache',
  stylesDir: 'src/styles/book-themes',
  diagramsDir: 'public/diagrams',
  imagesDir: 'public/images/extracted',
  
  // فرمت‌های پشتیبانی شده
  supportedFormats: {
    latex: ['.tex'],
    markdown: ['.md', '.mdx'],
    pdf: ['.pdf'],
    word: ['.docx', '.doc']
  },
  
  // AI
  ai: {
    enabled: process.env.AI_ENABLED !== 'false',
    provider: process.env.AI_PROVIDER || 'openai'
  }
};

// ═══════════════════════════════════════════════════════════════
// کلاس ContentPipeline (نسخه ۲)
// ═══════════════════════════════════════════════════════════════

export class ContentPipeline {
  constructor(options = {}) {
    // پردازشگرهای پایه
    this.parser = new PreambleParser();
    this.styleGen = new StyleGenerator(CONFIG.stylesDir);
    this.renderer = new SmartRenderer({
      outputDir: CONFIG.diagramsDir,
      cacheDir: CONFIG.cacheDir
    });
    
    // پردازشگرهای جدید
    this.pdfExtractor = new PDFExtractor({
      imageOutputDir: CONFIG.imagesDir
    });
    this.universalExtractor = new UniversalExtractor();
    
    // AI
    this.aiEnabled = options.aiEnabled ?? CONFIG.ai.enabled;
    if (this.aiEnabled) {
      this.aiTagger = new AITagger({
        provider: options.aiProvider || CONFIG.ai.provider
      });
    }
    
    // کش
    this.configCache = new Map();
    
    // آمار
    this.stats = {
      latex: 0,
      markdown: 0,
      pdf: 0,
      word: 0,
      aiTagged: 0,
      errors: 0
    };
  }

  /**
   * پردازش یک فایل (هر فرمتی)
   */
  async processFile(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    const { lang = this.detectLanguage(filePath), outputDir } = options;
    
    console.log(`\n📄 پردازش: ${path.basename(filePath)}`);
    
    try {
      let result;
      
      // تشخیص نوع و پردازش
      if (CONFIG.supportedFormats.latex.includes(ext)) {
        result = await this.processLaTeX(filePath, options);
        this.stats.latex++;
      } 
      else if (CONFIG.supportedFormats.markdown.includes(ext)) {
        result = await this.processMarkdown(filePath, options);
        this.stats.markdown++;
      }
      else if (CONFIG.supportedFormats.pdf.includes(ext)) {
        result = await this.processPDF(filePath, options);
        this.stats.pdf++;
      }
      else if (CONFIG.supportedFormats.word.includes(ext)) {
        result = await this.processWord(filePath, options);
        this.stats.word++;
      }
      else {
        throw new Error(`فرمت پشتیبانی نمی‌شود: ${ext}`);
      }
      
      // تگ‌گذاری AI
      if (this.aiEnabled && result) {
        result = await this.enrichWithAI(result, lang);
        this.stats.aiTagged++;
      }
      
      // ذخیره
      if (result && outputDir) {
        await this.saveResult(result, outputDir);
      }
      
      return result;
      
    } catch (error) {
      this.stats.errors++;
      console.error(`   ❌ خطا: ${error.message}`);
      throw error;
    }
  }

  /**
   * پردازش فایل LaTeX
   */
  async processLaTeX(filePath, options = {}) {
    const { bookSlug, chapterNumber, config } = options;
    
    let content = await fs.readFile(filePath, 'utf-8');
    
    // دریافت یا ساخت config
    const finalConfig = config || await this.getDefaultConfig();
    
    // رندر نمودارها
    const prefix = bookSlug ? `${bookSlug}-ch${chapterNumber || 0}` : path.basename(filePath, '.tex');
    content = await this.processAllDiagrams(content, finalConfig, prefix);
    
    // پیش‌پردازش
    content = this.preProcessLaTeX(content);
    
    // تبدیل با Pandoc
    const markdown = await this.convertWithPandoc(content);
    
    // استخراج عنوان
    const title = this.extractTitle(markdown) || path.basename(filePath, '.tex');
    
    return {
      type: 'latex',
      source: filePath,
      title,
      content: markdown,
      metadata: { bookSlug, chapterNumber }
    };
  }

  /**
   * پردازش Markdown
   */
  async processMarkdown(filePath, options = {}) {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // جدا کردن frontmatter
    const { data: frontmatter, content: body } = await this.parseFrontmatter(content);
    
    const title = frontmatter.title || this.extractTitle(body) || path.basename(filePath, '.md');
    
    return {
      type: 'markdown',
      source: filePath,
      title,
      content: body,
      frontmatter,
      metadata: {}
    };
  }

  /**
   * پردازش PDF
   */
  async processPDF(filePath, options = {}) {
    console.log(`   📄 استخراج از PDF...`);
    
    const extracted = await this.pdfExtractor.toMarkdown(filePath, {
      outputDir: path.join(CONFIG.imagesDir, path.basename(filePath, '.pdf'))
    });
    
    const title = extracted.metadata.title || path.basename(filePath, '.pdf');
    
    return {
      type: 'pdf',
      source: filePath,
      title,
      content: extracted.markdown,
      pdfMetadata: extracted.metadata,
      images: extracted.images,
      metadata: {}
    };
  }

  /**
   * پردازش Word
   */
  async processWord(filePath, options = {}) {
    console.log(`   📝 استخراج از Word...`);
    
    const extracted = await this.universalExtractor.extract(filePath);
    
    const title = this.extractTitle(extracted.markdown) || path.basename(filePath, '.docx');
    
    return {
      type: 'word',
      source: filePath,
      title,
      content: extracted.markdown,
      metadata: {}
    };
  }

  /**
   * غنی‌سازی با AI
   */
  async enrichWithAI(result, lang = 'fa') {
    if (!this.aiTagger) return result;
    
    console.log(`   🤖 تحلیل AI...`);
    
    const aiResult = await this.aiTagger.analyze(result.content, {
      title: result.title,
      lang
    });
    
    return {
      ...result,
      ai: aiResult
    };
  }

  /**
   * ذخیره نتیجه
   */
  async saveResult(result, outputDir) {
    await fs.mkdir(outputDir, { recursive: true });
    
    // ساخت frontmatter
    const frontmatter = this.buildFrontmatter(result);
    
    // محتوای نهایی
    const finalContent = `---\n${this.stringifyYaml(frontmatter)}\n---\n\n${result.content}`;
    
    // نام فایل
    const baseName = path.basename(result.source, path.extname(result.source));
    const outputPath = path.join(outputDir, `${baseName}.md`);
    
    await fs.writeFile(outputPath, finalContent, 'utf-8');
    console.log(`   💾 ذخیره: ${path.basename(outputPath)}`);
    
    return outputPath;
  }

  /**
   * ساخت frontmatter
   */
  buildFrontmatter(result) {
    const fm = {
      title: result.title,
      description: result.ai?.description || result.ai?.summary?.slice(0, 160) || '',
      lang: result.metadata?.lang || 'fa',
      publishDate: new Date().toISOString().split('T')[0]
    };
    
    // از AI
    if (result.ai) {
      if (result.ai.tags?.length) fm.tags = result.ai.tags;
      if (result.ai.category?.primary) fm.category = result.ai.category.primary;
      if (result.ai.keywords?.length) fm.keywords = result.ai.keywords;
      if (result.ai.readingTime) fm.readingTime = result.ai.readingTime;
      if (result.ai.difficulty) fm.difficulty = result.ai.difficulty;
      if (result.ai.summary) fm.summary = result.ai.summary;
    }
    
    // متادیتای خاص
    if (result.metadata?.bookSlug) {
      fm.book = result.metadata.bookSlug;
    }
    if (result.metadata?.chapterNumber) {
      fm.chapterNumber = result.metadata.chapterNumber;
    }
    
    // نوع منبع
    fm.sourceType = result.type;
    
    return fm;
  }

  /**
   * تبدیل به YAML
   */
  stringifyYaml(obj) {
    const lines = [];
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      
      if (Array.isArray(value)) {
        lines.push(`${key}:`);
        value.forEach(item => lines.push(`  - "${item}"`));
      } else if (typeof value === 'object') {
        lines.push(`${key}:`);
        for (const [k, v] of Object.entries(value)) {
          lines.push(`  ${k}: "${v}"`);
        }
      } else if (typeof value === 'string' && value.includes('\n')) {
        lines.push(`${key}: |`);
        value.split('\n').forEach(line => lines.push(`  ${line}`));
      } else if (typeof value === 'string') {
        lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * پردازش نمودارها
   */
  async processAllDiagrams(content, config, prefix) {
    const tikzRegex = /\\begin\{tikzpicture\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{tikzpicture\}/g;
    const matches = [...content.matchAll(tikzRegex)];
    
    if (matches.length > 0) {
      console.log(`   📊 نمودارها: ${matches.length}`);
    }
    
    let counter = 0;
    for (const match of matches) {
      counter++;
      const tikzCode = match[0];
      const name = `${prefix}-${counter}`;
      
      const result = await this.renderer.render(tikzCode, config, { name });
      
      if (result.success) {
        const relativePath = `/diagrams/${path.basename(result.path)}`;
        const replacement = `\n\n![نمودار ${counter}](${relativePath}){.tikz-diagram}\n\n`;
        content = content.replace(tikzCode, replacement);
      } else {
        content = content.replace(tikzCode, `\n\n<!-- DIAGRAM_ERROR: ${name} -->\n\n`);
      }
    }
    
    return content;
  }

  /**
   * پیش‌پردازش LaTeX
   */
  preProcessLaTeX(content) {
    return content
      .replace(
        /\\begin\{tcolorbox\}\[([^\]]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g,
        (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`
      )
      .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '')
      .replace(/\\setcounter\{[^}]*\}\{[^}]*\}/g, '');
  }

  /**
   * تبدیل با Pandoc
   */
  async convertWithPandoc(content) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const tempDir = path.join(CONFIG.cacheDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `input-${timestamp}.tex`);
    const outputFile = path.join(tempDir, `output-${timestamp}.md`);
    
    await fs.writeFile(inputFile, content, 'utf-8');
    
    await execAsync(`pandoc "${inputFile}" -o "${outputFile}" --wrap=none --columns=1000`, {
      timeout: 60000
    });
    
    const result = await fs.readFile(outputFile, 'utf-8');
    
    // پاکسازی
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
    
    return this.postProcessMarkdown(result);
  }

  /**
   * پس‌پردازش Markdown
   */
  postProcessMarkdown(markdown) {
    return markdown
      .replace(/\[node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\\node[\s\S]*?;/g, '')
      .replace(/\\draw[\s\S]*?;/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * استخراج عنوان
   */
  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  /**
   * پارس frontmatter
   */
  async parseFrontmatter(content) {
    const matter = (await import('gray-matter')).default;
    return matter(content);
  }

  /**
   * تشخیص زبان از مسیر
   */
  detectLanguage(filePath) {
    if (filePath.includes('/en/') || filePath.includes('\\en\\')) {
      return 'en';
    }
    return 'fa';
  }

  /**
   * config پیش‌فرض
   */
  async getDefaultConfig() {
    return {
      colors: {
        bleurepublique: { r: 26, g: 115, b: 232, css: 'rgb(26, 115, 232)' },
        bleulight: { css: 'rgb(232, 244, 248)' },
        vertnapoleon: { css: 'rgb(52, 168, 83)' },
        rougerevolution: { css: 'rgb(234, 67, 53)' },
        gris: { css: 'rgb(95, 99, 104)' }
      },
      fonts: { main: { name: 'Vazirmatn' } },
      tikz: {
        libraries: ['shapes.geometric', 'arrows.meta', 'positioning', 'calc', 'backgrounds'],
        styles: {},
        pgfplotsLibraries: []
      }
    };
  }

    /**
   * پردازش همه محتوا
   */
  async processAll(options = {}) {
    console.log('🚀 شروع پردازش همه محتوا...\n');
    
    const allFormats = Object.values(CONFIG.supportedFormats).flat();
    const patterns = allFormats.map(ext => `${CONFIG.sourceDir}/**/*${ext}`);
    
    // یافتن همه فایل‌ها
    const files = await globby(patterns, {
      ignore: ['**/node_modules/**', '**/.git/**']
    });
    
    console.log(`📁 یافت شد: ${files.length} فایل\n`);
    
    // گروه‌بندی بر اساس نوع
    const grouped = this.groupFilesByType(files);
    
    // نمایش آمار
    console.log('📊 تفکیک فایل‌ها:');
    Object.entries(grouped).forEach(([type, list]) => {
      console.log(`   ${type}: ${list.length}`);
    });
    console.log('');
    
    // پردازش کتاب‌ها
    const bookDirs = await globby(`${CONFIG.sourceDir}/books/*`, { onlyDirectories: true });
    for (const bookDir of bookDirs) {
      await this.processBook(bookDir, options);
    }
    
    // پردازش مقالات
    const articleFiles = [
      ...grouped.latex.filter(f => f.includes('/articles/')),
      ...grouped.markdown.filter(f => f.includes('/articles/')),
      ...grouped.pdf.filter(f => f.includes('/articles/')),
      ...grouped.word.filter(f => f.includes('/articles/'))
    ];
    
    for (const file of articleFiles) {
      const lang = this.detectLanguage(file);
      const outputDir = path.join(CONFIG.outputDir, 'articles', lang);
      
      try {
        await this.processFile(file, { lang, outputDir });
      } catch (error) {
        console.error(`   ❌ خطا در ${path.basename(file)}: ${error.message}`);
      }
    }
    
    // گزارش نهایی
    this.printFinalReport();
    
    return this.stats;
  }

  /**
   * گروه‌بندی فایل‌ها
   */
  groupFilesByType(files) {
    const grouped = {
      latex: [],
      markdown: [],
      pdf: [],
      word: []
    };
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      if (CONFIG.supportedFormats.latex.includes(ext)) {
        grouped.latex.push(file);
      } else if (CONFIG.supportedFormats.markdown.includes(ext)) {
        grouped.markdown.push(file);
      } else if (CONFIG.supportedFormats.pdf.includes(ext)) {
        grouped.pdf.push(file);
      } else if (CONFIG.supportedFormats.word.includes(ext)) {
        grouped.word.push(file);
      }
    }
    
    return grouped;
  }

  /**
   * پردازش یک کتاب
   */
  async processBook(bookDir, options = {}) {
    const bookSlug = path.basename(bookDir);
    const lang = options.lang || this.detectLanguage(bookDir) || 'fa';
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📚 کتاب: ${bookSlug}`);
    console.log(`${'═'.repeat(60)}`);
    
    // تحلیل پروژه
    let config;
    try {
      config = await this.parser.analyzeProject(bookDir);
      this.configCache.set(bookSlug, config);
      
      // تولید CSS
      await this.styleGen.generateCSS(config, bookSlug);
    } catch {
      config = await this.getDefaultConfig();
    }
    
    // یافتن فصل‌ها
    const chapters = await this.findChapters(bookDir);
    console.log(`   📑 فصل‌ها: ${chapters.length}`);
    
    const outputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
    await fs.mkdir(outputDir, { recursive: true });
    
    // پردازش هر فصل
    for (let i = 0; i < chapters.length; i++) {
      const chapterPath = chapters[i];
      const chapterNumber = i + 1;
      
      try {
        const result = await this.processFile(chapterPath, {
          bookSlug,
          chapterNumber,
          config,
          lang
        });
        
        if (result) {
          // نام فایل خروجی
          const baseName = path.basename(chapterPath, path.extname(chapterPath));
          const outputFileName = `ch${String(chapterNumber).padStart(2, '0')}-${baseName}.md`;
          const outputPath = path.join(outputDir, outputFileName);
          
          // ساخت frontmatter
          const frontmatter = this.buildFrontmatter({
            ...result,
            metadata: { ...result.metadata, bookSlug, chapterNumber, lang }
          });
          
          const finalContent = `---\n${this.stringifyYaml(frontmatter)}\n---\n\n${result.content}`;
          await fs.writeFile(outputPath, finalContent, 'utf-8');
          
          console.log(`   ✅ فصل ${chapterNumber}: ${outputFileName}`);
        }
      } catch (error) {
        console.error(`   ❌ فصل ${chapterNumber}: ${error.message}`);
      }
    }
    
    // ایجاد index.md
    await this.generateBookIndex(bookSlug, chapters, outputDir, lang);
    
    console.log(`   ✅ کتاب ${bookSlug} کامل شد!`);
  }

  /**
   * یافتن فصل‌های کتاب
   */
  async findChapters(bookDir) {
    const patterns = [
      path.join(bookDir, 'chapters', '*.tex'),
      path.join(bookDir, 'chapters', '*.md'),
      path.join(bookDir, 'ch*.tex'),
      path.join(bookDir, 'chapter*.tex'),
      path.join(bookDir, '*.pdf'), // PDF هم می‌تواند فصل باشد
    ];
    
    let chapters = await globby(patterns);
    
    // فیلتر فایل‌های اصلی
    chapters = chapters.filter(f => {
      const name = path.basename(f).toLowerCase();
      return !['main.tex', 'book.tex', 'index.tex', 'preamble.tex'].includes(name);
    });
    
    // مرتب‌سازی
    chapters.sort((a, b) => {
      const numA = parseInt(path.basename(a).match(/\d+/)?.[0] || '0');
      const numB = parseInt(path.basename(b).match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
    
    return chapters;
  }

  /**
   * ایجاد index کتاب
   */
  async generateBookIndex(bookSlug, chapters, outputDir, lang) {
    const indexContent = `---
title: "${bookSlug}"
description: "فهرست فصول"
lang: ${lang}
type: book-index
---

# فهرست فصول

${chapters.map((ch, i) => {
  const baseName = path.basename(ch, path.extname(ch));
  const num = i + 1;
  return `${num}. [فصل ${num}](./ch${String(num).padStart(2, '0')}-${baseName})`;
}).join('\n')}
`;
    
    await fs.writeFile(path.join(outputDir, 'index.md'), indexContent, 'utf-8');
  }

  /**
   * گزارش نهایی
   */
  printFinalReport() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 گزارش نهایی');
    console.log('═'.repeat(60));
    console.log(`   📄 LaTeX: ${this.stats.latex}`);
    console.log(`   📝 Markdown: ${this.stats.markdown}`);
    console.log(`   📑 PDF: ${this.stats.pdf}`);
    console.log(`   📃 Word: ${this.stats.word}`);
    console.log(`   🤖 تگ‌گذاری AI: ${this.stats.aiTagged}`);
    console.log(`   ❌ خطاها: ${this.stats.errors}`);
    console.log('═'.repeat(60) + '\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  // پارس آرگومان‌ها
  const options = {
    aiEnabled: !args.includes('--no-ai'),
    aiProvider: args.find(a => a.startsWith('--ai-provider='))?.split('=')[1],
    lang: args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'fa'
  };
  
  const pipeline = new ContentPipeline(options);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }
  
  if (args.includes('--all') || args.length === 0) {
    await pipeline.processAll(options);
  } 
  else if (args.includes('--book')) {
    const bookDir = args[args.indexOf('--book') + 1];
    if (!bookDir) {
      console.error('❌ مسیر کتاب را مشخص کنید');
      process.exit(1);
    }
    await pipeline.processBook(bookDir, options);
  }
  else if (args.includes('--file')) {
    const filePath = args[args.indexOf('--file') + 1];
    const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || 'src/content/articles/fa';
    
    if (!filePath) {
      console.error('❌ مسیر فایل را مشخص کنید');
      process.exit(1);
    }
    
    await pipeline.processFile(filePath, { outputDir, lang: options.lang });
  }
  else {
    // فرض: اولین آرگومان مسیر فایل است
    const filePath = args[0];
    const outputDir = args[1] || 'src/content/articles/fa';
    
    await pipeline.processFile(filePath, { outputDir, lang: options.lang });
  }
}

function printHelp() {
  console.log(`
📘 راهنمای استفاده از Content Pipeline

دستورات:
  node scripts/process-content.mjs --all              پردازش همه محتوا
  node scripts/process-content.mjs --book <path>      پردازش یک کتاب
  node scripts/process-content.mjs --file <path>      پردازش یک فایل
  node scripts/process-content.mjs <file> [output]    پردازش سریع

گزینه‌ها:
  --no-ai                    غیرفعال کردن AI
  --ai-provider=<name>       انتخاب provider (openai, anthropic, ollama)
  --lang=<code>              زبان (fa, en)
  --output=<dir>             پوشه خروجی

فرمت‌های پشتیبانی شده:
  • LaTeX (.tex)
  • Markdown (.md, .mdx)
  • PDF (.pdf)
  • Word (.docx, .doc)

مثال‌ها:
  node scripts/process-content.mjs --all
  node scripts/process-content.mjs --book content-source/books/my-book
  node scripts/process-content.mjs --file document.pdf --output=src/content/articles/fa
  node scripts/process-content.mjs document.tex
`);
}

main().catch(error => {
  console.error('❌ خطای بحرانی:', error);
  process.exit(1);
});

export { ContentPipeline };

```
----
## 🔄 به‌روزرسانی Watch برای فرمت‌های جدید

**فایل `scripts/watch-content.mjs` (به‌روزشده):**

```javascript
#!/usr/bin/env node
/**
 * سیستم Watch هوشمند - نسخه ۲
 * پشتیبانی از PDF، Word و AI
 */

import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';

import { ContentPipeline } from './process-content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  watchPaths: [
    'content-source/**/*.tex',
    'content-source/**/*.md',
    'content-source/**/*.mdx',
    'content-source/**/*.pdf',
    'content-source/**/*.docx'
  ],
  
  ignorePaths: [
    '**/node_modules/**',
    '**/.git/**',
    '**/*.aux',
    '**/*.log',
    '**/*.out',
    '**/*.toc',
    '**/*.synctex.gz',
    '**/.content-cache/**'
  ],
  
  sourceDir: 'content-source',
  outputDir: 'src/content',
  
  debounceDelay: 500,
  maxRetries: 2,
  
  // AI
  ai: {
    enabled: process.env.AI_ENABLED !== 'false',
    provider: process.env.AI_PROVIDER || 'openai'
  }
};

// ═══════════════════════════════════════════════════════════════
// Logger با رنگ و آیکون
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m'
};

const ICONS = {
  tex: '📄',
  md: '📝',
  pdf: '📑',
  docx: '📃',
  change: '✏️',
  add: '➕',
  delete: '🗑️',
  process: '⚙️',
  done: '✅',
  error: '❌',
  ai: '🤖',
  cache: '💾',
  watch: '👁️'
};

class Logger {
  timestamp() {
    return new Date().toLocaleTimeString('fa-IR', { hour12: false });
  }

  log(level, icon, msg, color = COLORS.white) {
    const time = `${COLORS.dim}[${this.timestamp()}]${COLORS.reset}`;
    console.log(`${time} ${icon} ${color}${msg}${COLORS.reset}`);
  }

  info(msg) { this.log('info', 'ℹ️', msg, COLORS.blue); }
  success(msg) { this.log('success', '✅', msg, COLORS.green); }
  warn(msg) { this.log('warn', '⚠️', msg, COLORS.yellow); }
  error(msg) { this.log('error', '❌', msg, COLORS.red); }
  
  file(action, filePath, extra = '') {
    const ext = path.extname(filePath).slice(1) || 'file';
    const icon = ICONS[ext] || '📄';
    const actionIcon = ICONS[action] || '•';
    const name = path.basename(filePath);
    const dir = path.dirname(filePath);
    
    const colors = {
      change: COLORS.yellow,
      add: COLORS.green,
      unlink: COLORS.red,
      process: COLORS.cyan,
      done: COLORS.green
    };
    
    console.log(
      `${COLORS.dim}[${this.timestamp()}]${COLORS.reset} ` +
      `${icon} ${actionIcon} ` +
      `${colors[action] || COLORS.white}${action.toUpperCase().padEnd(8)}${COLORS.reset} ` +
      `${COLORS.bright}${name}${COLORS.reset} ` +
      `${COLORS.dim}(${dir})${COLORS.reset}` +
      (extra ? ` ${extra}` : '')
    );
  }

  banner() {
    console.log('\n' + '═'.repeat(65));
    console.log(`${COLORS.bgBlue}${COLORS.white}${COLORS.bright}   ${ICONS.watch} Content Watcher v2 - پردازش خودکار با پشتیبانی AI   ${COLORS.reset}`);
    console.log('═'.repeat(65));
    console.log(`${COLORS.dim}   فرمت‌ها: LaTeX | Markdown | PDF | Word${COLORS.reset}`);
    console.log(`${COLORS.dim}   AI: ${CONFIG.ai.enabled ? '✅ فعال' : '❌ غیرفعال'}${COLORS.reset}`);
    console.log('═'.repeat(65) + '\n');
  }

  ready() {
    console.log(`\n${COLORS.green}${COLORS.bright}✨ آماده! منتظر تغییرات...${COLORS.reset}`);
    console.log(`${COLORS.dim}   Ctrl+C برای خروج${COLORS.reset}\n`);
  }

  stats(stats) {
    console.log(`\n${COLORS.dim}${'─'.repeat(40)}${COLORS.reset}`);
    console.log(`${COLORS.cyan}📊 آمار این جلسه:${COLORS.reset}`);
    console.log(`   ${ICONS.tex} LaTeX: ${stats.latex}`);
    console.log(`   ${ICONS.md} Markdown: ${stats.markdown}`);
    console.log(`   ${ICONS.pdf} PDF: ${stats.pdf}`);
    console.log(`   ${ICONS.docx} Word: ${stats.word}`);
    console.log(`   ${ICONS.ai} AI: ${stats.aiTagged}`);
    console.log(`   ${ICONS.error} خطا: ${stats.errors}`);
    console.log(`${COLORS.dim}${'─'.repeat(40)}${COLORS.reset}\n`);
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس ContentWatcher نسخه ۲
// ═══════════════════════════════════════════════════════════════

class ContentWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.logger = new Logger();
    this.pipeline = new ContentPipeline({
      aiEnabled: options.aiEnabled ?? CONFIG.ai.enabled,
      aiProvider: options.aiProvider || CONFIG.ai.provider
    });
    
    this.debounceTimers = new Map();
    this.queue = [];
    this.isProcessing = false;
    
    this.stats = {
      latex: 0,
      markdown: 0,
      pdf: 0,
      word: 0,
      aiTagged: 0,
      errors: 0
    };
  }

  /**
   * شروع watch
   */
  async start() {
    this.logger.banner();
    
    this.watcher = chokidar.watch(CONFIG.watchPaths, {
      ignored: CONFIG.ignorePaths,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      },
      usePolling: process.platform === 'win32',
      interval: 300
    });

    this.watcher
      .on('ready', () => this.onReady())
      .on('change', (fp) => this.onFileChange(fp, 'change'))
      .on('add', (fp) => this.onFileChange(fp, 'add'))
      .on('unlink', (fp) => this.onFileDelete(fp))
      .on('error', (err) => this.logger.error(err.message));

    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  onReady() {
    this.logger.info('مانیتور فعال شد');
    this.logger.ready();
  }

  onFileChange(filePath, action) {
    filePath = path.normalize(filePath);
    this.logger.file(action, filePath);
    
    // Debounce
    const existing = this.debounceTimers.get(filePath);
    if (existing) clearTimeout(existing);
    
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filePath);
      this.queueFile(filePath);
    }, CONFIG.debounceDelay);
    
    this.debounceTimers.set(filePath, timer);
  }

  async onFileDelete(filePath) {
    filePath = path.normalize(filePath);
    this.logger.file('unlink', filePath);
    
    // حذف فایل خروجی
    const outputPath = this.getOutputPath(filePath);
    if (outputPath) {
      try {
        await fs.unlink(outputPath);
        this.logger.success(`حذف شد: ${path.basename(outputPath)}`);
      } catch {}
    }
  }

  queueFile(filePath) {
    this.queue.push(filePath);
    this.processQueue();
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

  async processFile(filePath, retryCount = 0) {
    const startTime = Date.now();
    this.logger.file('process', filePath);
    
    try {
      const fileInfo = this.analyzeFilePath(filePath);
      const outputDir = this.getOutputDir(fileInfo);
      
      await this.pipeline.processFile(filePath, {
        ...fileInfo,
        outputDir
      });
      
      // به‌روزرسانی آمار
      this.updateStats(fileInfo.type);
      
      const elapsed = Date.now() - startTime;
      this.logger.file('done', filePath, `${COLORS.dim}(${elapsed}ms)${COLORS.reset}`);
      
    } catch (error) {
      if (retryCount < CONFIG.maxRetries) {
        this.logger.warn(`تلاش مجدد... (${retryCount + 1})`);
        await new Promise(r => setTimeout(r, 1000));
        return this.processFile(filePath, retryCount + 1);
      }
      
      this.stats.errors++;
      this.logger.error(`${path.basename(filePath)}: ${error.message}`);
    }
  }

  analyzeFilePath(filePath) {
    const relativePath = path.relative(CONFIG.sourceDir, filePath);
    const parts = relativePath.split(path.sep);
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath, ext);
    
    // تشخیص نوع فایل
    let type = 'unknown';
    if (['.tex'].includes(ext)) type = 'latex';
    else if (['.md', '.mdx'].includes(ext)) type = 'markdown';
    else if (['.pdf'].includes(ext)) type = 'pdf';
    else if (['.docx', '.doc'].includes(ext)) type = 'word';
    
    // تشخیص context
    let context = 'article';
    let bookSlug = null;
    let chapterNumber = null;
    
    if (parts[0] === 'books' && parts.length >= 2) {
      context = 'book';
      bookSlug = parts[1];
      
      // تشخیص شماره فصل
      const numMatch = fileName.match(/(\d+)/);
      chapterNumber = numMatch ? parseInt(numMatch[1]) : null;
    }
    
    // تشخیص زبان
    const lang = filePath.includes('/en/') || filePath.includes('\\en\\') ? 'en' : 'fa';
    
    return {
      type,
      context,
      bookSlug,
      chapterNumber,
      lang,
      fileName,
      filePath
    };
  }

  getOutputDir(fileInfo) {
    const { context, bookSlug, lang } = fileInfo;
    
    if (context === 'book' && bookSlug) {
      return path.join(CONFIG.outputDir, 'books', lang, bookSlug);
    }
    
    return path.join(CONFIG.outputDir, 'articles', lang);
  }

  getOutputPath(inputPath) {
    const fileInfo = this.analyzeFilePath(inputPath);
    const outputDir = this.getOutputDir(fileInfo);
    
    let outputName = fileInfo.fileName;
    if (fileInfo.chapterNumber) {
      outputName = `ch${String(fileInfo.chapterNumber).padStart(2, '0')}-${fileInfo.fileName}`;
    }
    
    return path.join(outputDir, `${outputName}.md`);
  }

  updateStats(type) {
    if (type === 'latex') this.stats.latex++;
    else if (type === 'markdown') this.stats.markdown++;
    else if (type === 'pdf') this.stats.pdf++;
    else if (type === 'word') this.stats.word++;
    
    if (CONFIG.ai.enabled) this.stats.aiTagged++;
  }

  async stop() {
    console.log('\n');
    this.logger.info('در حال توقف...');
    
    if (this.watcher) {
      await this.watcher.close();
    }
    
    this.logger.stats(this.stats);
    process.exit(0);
  }
}

// ═══════════════════════════════════════════════════════════════
// اجرا
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    aiEnabled: !args.includes('--no-ai'),
    aiProvider: args.find(a => a.startsWith('--ai-provider='))?.split('=')[1]
  };
  
  const watcher = new ContentWatcher(options);
  await watcher.start();
}

main().catch(error => {
  console.error('❌ خطای بحرانی:', error);
  process.exit(1);
});

export { ContentWatcher };
```

---

## 📦 فایل `package.json` نهایی

```json
{
  "name": "content-site",
  "type": "module",
  "version": "2.0.0",
  "scripts": {
    "dev": "astro dev",
    "dev:watch": "npm-run-all --parallel dev content:watch",
    "build": "npm run content:all && astro build",
    "preview": "astro preview",
    
    "content:all": "node scripts/process-content.mjs --all",
    "content:book": "node scripts/process-content.mjs --book",
    "content:file": "node scripts/process-content.mjs --file",
    "content:watch": "node scripts/watch-content.mjs",
    "content:watch:no-ai": "node scripts/watch-content.mjs --no-ai",
    
    "clean": "rimraf .content-cache public/diagrams public/images/extracted src/styles/book-themes"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/mdx": "^2.0.0"
  },
  "devDependencies": {
    "chokidar": "^3.6.0",
    "globby": "^14.0.0",
    "gray-matter": "^4.0.3",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.5",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "sharp": "^0.33.0",
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.10.0"
  }
}
```

---

## ⚙️ فایل `.env`

```env
# AI Settings
AI_ENABLED=true
AI_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# Ollama (Local)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## 🚀 راهنمای استفاده نهایی

```powershell
# ═══════════════════════════════════════════════════════════════
# نصب
# ═══════════════════════════════════════════════════════════════

npm install

# ═══════════════════════════════════════════════════════════════
# پردازش همه محتوا
# ═══════════════════════════════════════════════════════════════

npm run content:all

# ═══════════════════════════════════════════════════════════════
# پردازش یک فایل خاص
# ═══════════════════════════════════════════════════════════════

# فایل LaTeX
npm run content:file -- content-source/articles/my-article.tex

# فایل PDF
npm run content:file -- content-source/articles/document.pdf

# فایل Word
npm run content:file -- content-source/articles/report.docx

# ═══════════════════════════════════════════════════════════════
# پردازش یک کتاب
# ═══════════════════════════════════════════════════════════════

npm run content:book -- content-source/books/my-book

# ═══════════════════════════════════════════════════════════════
# Watch Mode (با AI)
# ═══════════════════════════════════════════════════════════════

npm run content:watch

# Watch بدون AI (سریع‌تر)
npm run content:watch:no-ai

# ═══════════════════════════════════════════════════════════════
# توسعه (Astro + Watch همزمان)
# ═══════════════════════════════════════════════════════════════

npm run dev:watch

# ═══════════════════════════════════════════════════════════════
# Build نهایی
# ═══════════════════════════════════════════════════════════════

npm run build
```

---

## 📊 خلاصه قابلیت‌های نهایی

```
┌─────────────────────────────────────────────────────────────────┐
│              سیستم جامع پردازش محتوا v2.0                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📄 فرمت‌های ورودی:                                              │
│     ✅ LaTeX (.tex) - با پشتیبانی TikZ                          │
│     ✅ Markdown (.md, .mdx)                                      │
│     ✅ PDF (.pdf) - استخراج متن و تصاویر                        │
│     ✅ Word (.docx, .doc)                                        │
│                                                                   │
│  🤖 قابلیت‌های AI:                                               │
│     ✅ تگ‌گذاری خودکار                                           │
│     ✅ پیشنهاد دسته‌بندی                                         │
│     ✅ تولید خلاصه                                               │
│     ✅ استخراج کلیدواژه                                          │
│     ✅ تخمین زمان مطالعه                                         │
│     ✅ تحلیل سطح دشواری                                          │
│                                                                   │
│  🔄 Watch Mode:                                                  │
│     ✅ مانیتور خودکار تغییرات                                    │
│     ✅ پردازش فقط فایل‌های تغییریافته                            │
│     ✅ Debounce هوشمند                                           │
│     ✅ کش نمودارها                                               │
│                                                                   │
│  📊 خروجی:                                                       │
│     ✅ Markdown با Frontmatter کامل                              │
│     ✅ نمودارهای SVG                                             │
│     ✅ CSS اختصاصی هر کتاب                                       │
│     ✅ متادیتای SEO                                              │
│                                                                   │
│  🔧 Providers AI:                                                │
│     • OpenAI (GPT-4)                                             │
│     • Anthropic (Claude)                                         │
│     • Ollama (محلی)                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

آیا سوالی دارید یا نیاز به توضیحات بیشتر در مورد بخش خاصی دارید؟
# راهنمای نصب کامل برای ویندوز ۱۱

## 🖥️ پیش‌نیازهای سیستم
┌─────────────────────────────────────────────────────────────────┐
│                    نیازمندی‌های ویندوز ۱۱                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ Windows 11 (یا Windows 10 نسخه 1903+)                       │
│  ✅ حداقل 8GB RAM (16GB توصیه می‌شود)                           │
│  ✅ حداقل 10GB فضای خالی دیسک                                   │
│  ✅ دسترسی Administrator                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 روش ۱: نصب با Package Manager (توصیه‌شده)

### گام ۱.۱: نصب Winget (اگر ندارید)

Winget معمولاً در ویندوز ۱۱ از پیش نصب است. برای بررسی:

```powershell
# در PowerShell (Run as Administrator)
winget --version
```

اگر نصب نیست، از Microsoft Store برنامه "App Installer" را نصب کنید.

### گام ۱.۲: نصب Chocolatey (جایگزین)

```powershell
# در PowerShell (Run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# بستن و باز کردن مجدد PowerShell
# سپس بررسی نصب:
choco --version
```

---

## 🔧 گام ۲: نصب وابستگی‌های اصلی

### ۲.۱ نصب Node.js

```powershell
# با Winget
winget install OpenJS.NodeJS.LTS

# یا با Chocolatey
choco install nodejs-lts -y

# بررسی نصب (پس از باز کردن مجدد ترمینال)
node --version
npm --version
```

### ۲.۲ نصب Git

```powershell
# با Winget
winget install Git.Git

# یا با Chocolatey
choco install git -y

# بررسی
git --version
```

### ۲.۳ نصب MiKTeX (توزیع LaTeX برای ویندوز)

**روش ۱: دانلود مستقیم (توصیه‌شده)**

1. برو به: https://miktex.org/download
2. دانلود "MiKTeX Installer" برای ویندوز
3. اجرا و نصب با تنظیمات پیش‌فرض
4. ✅ حتماً گزینه "Install missing packages on-the-fly: Yes" را انتخاب کنید

**روش ۲: با Chocolatey**

```powershell
# در PowerShell (Administrator)
choco install miktex -y
```

**پس از نصب MiKTeX:**

```powershell
# باز کردن MiKTeX Console
# Start Menu → MiKTeX Console

# در MiKTeX Console:
# 1. به Updates بروید و همه را آپدیت کنید
# 2. به Packages بروید و این پکیج‌ها را نصب کنید:
#    - xetex
#    - fontspec
#    - tikz (pgf)
#    - xcolor
#    - standalone
#    - pgfplots
```

### ۲.۴ نصب pdf2svg برای ویندوز

**روش ۱: با Chocolatey**

```powershell
choco install pdf2svg -y
```

**روش ۲: نصب دستی**

1. دانلود از: https://github.com/jalios/pdf2svg-windows/releases
2. Extract به `C:\Program Files\pdf2svg\`
3. اضافه کردن به PATH (توضیح در پایین)

**روش ۳: استفاده از Inkscape به جای pdf2svg**

```powershell
# نصب Inkscape
winget install Inkscape.Inkscape

# یا
choco install inkscape -y
```

### ۲.۵ نصب فونت Vazirmatn

```powershell
# دانلود فونت
Invoke-WebRequest -Uri "https://github.com/rastikerdar/vazirmatn/releases/download/v33.003/Vazirmatn-v33.003.zip" -OutFile "$env:TEMP\vazirmatn.zip"

# استخراج
Expand-Archive -Path "$env:TEMP\vazirmatn.zip" -DestinationPath "$env:TEMP\vazirmatn"

# نصب فونت‌ها (کپی به پوشه فونت‌های ویندوز)
Copy-Item "$env:TEMP\vazirmatn\fonts\ttf\*.ttf" -Destination "$env:WINDIR\Fonts" -Force

# یا نصب دستی:
# 1. برو به پوشه استخراج شده
# 2. فایل‌های .ttf را انتخاب کن
# 3. راست کلیک → Install for all users
```

---

## ⚙️ گام ۳: تنظیم متغیرهای محیطی (PATH)

### ۳.۱ اضافه کردن به PATH

```powershell
# در PowerShell (Administrator)

# بررسی PATH فعلی
$env:PATH -split ';'

# اضافه کردن MiKTeX به PATH (اگر خودکار نشده)
$miktexPath = "C:\Program Files\MiKTeX\miktex\bin\x64"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$miktexPath", "Machine")

# اضافه کردن pdf2svg (اگر نصب دستی کردید)
$pdf2svgPath = "C:\Program Files\pdf2svg"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";$pdf2svgPath", "Machine")
```

### ۳.۲ بررسی نصب صحیح

```powershell
# بستن و باز کردن مجدد PowerShell، سپس:

# بررسی XeLaTeX
xelatex --version

# بررسی pdf2svg
pdf2svg

# بررسی Node
node --version

# بررسی npm
npm --version
```

---

## 📁 گام ۴: راه‌اندازی پروژه

### ۴.۱ Clone یا ایجاد پروژه

```powershell
# رفتن به پوشه پروژه‌ها
cd C:\Users\YourUsername\Projects

# اگر پروژه موجود دارید
cd your-existing-site

# یا clone از GitHub
git clone https://github.com/your-username/your-site.git
cd your-site
```

### ۴.۲ نصب وابستگی‌های Node

```powershell
npm install
```

### ۴.۳ ایجاد ساختار پوشه‌ها

```powershell
# ایجاد پوشه‌های لازم
New-Item -ItemType Directory -Force -Path "scripts"
New-Item -ItemType Directory -Force -Path "content-source\books"
New-Item -ItemType Directory -Force -Path "content-source\articles"
New-Item -ItemType Directory -Force -Path "public\diagrams"
```

### ۴.۴ نصب پکیج‌های اضافی npm

```powershell
npm install -D globby gray-matter
```

---

## 📝 گام ۵: ایجاد فایل‌های اسکریپت (نسخه ویندوز)

### ۵.۱ فایل تعریف رنگ‌ها

**ایجاد فایل `scripts/color-definitions.tex`:**

```powershell
# ایجاد فایل
New-Item -ItemType File -Path "scripts\color-definitions.tex" -Force
```

محتوای فایل (با Notepad یا VS Code باز کنید):

```latex
% ═══════════════════════════════════════════════════════════════
% تعریف رنگ‌های سفارشی پروژه
% ═══════════════════════════════════════════════════════════════

\usepackage{xcolor}

% رنگ‌های آبی
\definecolor{bleurepublique}{RGB}{26, 115, 232}
\definecolor{bleulight}{RGB}{232, 244, 248}

% رنگ‌های سبز
\definecolor{vertnapoleon}{RGB}{52, 168, 83}
\definecolor{vertlight}{RGB}{232, 248, 237}

% رنگ‌های بنفش
\definecolor{violetempire}{RGB}{142, 68, 173}
\definecolor{violetlight}{RGB}{245, 238, 248}

% رنگ‌های قرمز
\definecolor{rougerevolution}{RGB}{234, 67, 53}
\definecolor{rougelight}{RGB}{252, 237, 236}

% رنگ‌های طلایی/نارنجی
\definecolor{orroyal}{RGB}{251, 188, 4}
\definecolor{orroyaldark}{RGB}{230, 150, 0}

% رنگ‌های خاکستری
\definecolor{gris}{RGB}{95, 99, 104}
\definecolor{grisclair}{RGB}{218, 220, 224}
\definecolor{grislight}{RGB}{248, 249, 250}

% رنگ‌های سناریو
\definecolor{scenario1}{RGB}{66, 133, 244}
\definecolor{scenario2}{RGB}{52, 168, 83}
\definecolor{scenario3}{RGB}{251, 188, 4}
\definecolor{scenario4}{RGB}{234, 67, 53}
```

### ۵.۲ اسکریپت اصلی پردازش (نسخه ویندوز)

**ایجاد فایل `scripts/process-book.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * پردازش کتاب‌های LaTeX و تبدیل به Markdown
 * نسخه سازگار با ویندوز
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
// تنظیمات - سازگار با ویندوز
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  // استفاده از پوشه temp ویندوز
  tempDir: path.join(process.env.TEMP || 'C:\\Temp', 'latex-processor'),
  outputDiagramsDir: './public/diagrams',
  colorDefsFile: path.join(__dirname, 'color-definitions.tex'),
  
  // تنظیمات برای ویندوز
  isWindows: process.platform === 'win32',
  
  // استفاده از Inkscape به جای pdf2svg در ویندوز
  useInkscape: true,
};

// ═══════════════════════════════════════════════════════════════
// کلاس پردازشگر TikZ
// ═══════════════════════════════════════════════════════════════

class TikZProcessor {
  constructor() {
    this.processedCount = 0;
    this.failedCount = 0;
    this.cache = new Map();
  }

  generateHash(code) {
    return crypto.createHash('md5').update(code).digest('hex').slice(0, 10);
  }

  buildStandaloneTeX(tikzCode, options = {}) {
    const { scale = 1, font = 'Vazirmatn' } = options;
    
    // مسیر فایل رنگ‌ها - تبدیل به فرمت ویندوز
    const colorDefPath = CONFIG.colorDefsFile.replace(/\\/g, '/');
    
    return `
\\documentclass[tikz,border=15pt]{standalone}

\\usepackage{fontspec}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

\\usetikzlibrary{
  shapes.geometric,
  shapes.misc,
  arrows.meta,
  positioning,
  calc,
  backgrounds,
  fit,
  decorations.pathreplacing,
  shadows,
  trees
}

\\setmainfont[Scale=${scale}]{${font}}

\\input{${colorDefPath}}

\\begin{document}
${tikzCode}
\\end{document}
`;
  }

  async pdfToSvg(pdfFile, svgFile) {
    if (CONFIG.useInkscape) {
      // استفاده از Inkscape
      await execAsync(
        `inkscape "${pdfFile}" --export-filename="${svgFile}" --export-type=svg`,
        { timeout: 60000 }
      );
    } else {
      // استفاده از pdf2svg
      await execAsync(`pdf2svg "${pdfFile}" "${svgFile}"`);
    }
  }

  async renderToSVG(tikzCode, outputName) {
    const hash = this.generateHash(tikzCode);
    const svgFileName = `${outputName}-${hash}.svg`;
    const svgPath = path.join(CONFIG.outputDiagramsDir, svgFileName);
    
    // بررسی کش
    if (this.cache.has(hash)) {
      console.log(`   ⚡ از کش: ${outputName}`);
      return this.cache.get(hash);
    }
    
    // بررسی فایل موجود
    try {
      await fs.access(svgPath);
      console.log(`   📁 موجود: ${outputName}`);
      this.cache.set(hash, svgPath);
      return svgPath;
    } catch {}
    
    // ساخت دایرکتوری‌ها
    await fs.mkdir(CONFIG.tempDir, { recursive: true });
    await fs.mkdir(CONFIG.outputDiagramsDir, { recursive: true });
    
    const texContent = this.buildStandaloneTeX(tikzCode);
    const texFile = path.join(CONFIG.tempDir, `${outputName}.tex`);
    const pdfFile = path.join(CONFIG.tempDir, `${outputName}.pdf`);
    
    try {
      // نوشتن فایل TeX
      await fs.writeFile(texFile, texContent, 'utf-8');
      
      // کامپایل با XeLaTeX
      console.log(`   🔄 کامپایل: ${outputName}...`);
      
      // تغییر دایرکتوری کاری برای XeLaTeX
      const xelatexCmd = CONFIG.isWindows
        ? `cd /d "${CONFIG.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`
        : `cd "${CONFIG.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`;
      
      await execAsync(xelatexCmd, { 
        timeout: 120000,
        shell: CONFIG.isWindows ? 'cmd.exe' : '/bin/sh'
      });
      
      // تبدیل PDF به SVG
      await this.pdfToSvg(pdfFile, svgPath);
      
      // بهینه‌سازی SVG
      let svgContent = await fs.readFile(svgPath, 'utf-8');
      svgContent = this.optimizeSVG(svgContent, outputName);
      await fs.writeFile(svgPath, svgContent, 'utf-8');
      
      console.log(`   ✅ تولید شد: ${outputName}`);
      this.processedCount++;
      this.cache.set(hash, svgPath);
      
      return svgPath;
      
    } catch (error) {
      console.error(`   ❌ خطا در ${outputName}:`, error.message);
      this.failedCount++;
      
      // نمایش لاگ خطا
      try {
        const logFile = path.join(CONFIG.tempDir, `${outputName}.log`);
        const logContent = await fs.readFile(logFile, 'utf-8');
        const errorLines = logContent.split('\n')
          .filter(l => l.includes('!') || l.includes('Error'))
          .slice(0, 5);
        if (errorLines.length > 0) {
          console.error(`   📋 جزئیات خطا:`);
          errorLines.forEach(line => console.error(`      ${line}`));
        }
      } catch {}
      
      return null;
    }
  }

  optimizeSVG(svgContent, name) {
    return svgContent
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(
        '<svg',
        `<svg class="tikz-diagram" id="diagram-${name}" role="img" aria-label="نمودار ${name}"`
      );
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس پردازشگر اصلی
// ═══════════════════════════════════════════════════════════════

class LaTeXToMarkdownProcessor {
  constructor() {
    this.tikzProcessor = new TikZProcessor();
    this.diagramCounter = 0;
  }

  extractTikZBlocks(content) {
    const blocks = [];
    
    const patterns = [
      /\\begin\{tikzpicture\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{tikzpicture\}/g,
      /\\begin\{forest\}([\s\S]*?)\\end\{forest\}/g,
    ];
    
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      
      while ((match = regex.exec(content)) !== null) {
        blocks.push({
          full: match[0],
          code: match[0],
          index: match.index,
          type: this.detectTikZType(match[0])
        });
      }
    }
    
    return blocks.sort((a, b) => b.index - a.index);
  }

  detectTikZType(code) {
    if (code.includes('\\begin{forest}')) return 'tree';
    if (code.includes('gantt')) return 'gantt';
    if (code.includes('axis') || code.includes('\\addplot')) return 'chart';
    if (code.includes('mindmap')) return 'mindmap';
    return 'diagram';
  }

  async processFile(inputPath, outputDir, options = {}) {
    const { bookSlug, chapterNumber, lang = 'fa' } = options;
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📄 پردازش: ${inputPath}`);
    console.log(`${'═'.repeat(60)}`);
    
    let content = await fs.readFile(inputPath, 'utf-8');
    
    // ۱. پردازش TikZ
    console.log('\n📊 مرحله ۱: پردازش نمودارها...');
    content = await this.processTikZBlocks(content, bookSlug || 'diagram');
    
    // ۲. پیش‌پردازش
    console.log('\n🔧 مرحله ۲: پیش‌پردازش...');
    content = this.preProcessForPandoc(content);
    
    // ۳. Pandoc
    console.log('\n📝 مرحله ۳: تبدیل با Pandoc...');
    await fs.mkdir(CONFIG.tempDir, { recursive: true });
    const tempTexFile = path.join(CONFIG.tempDir, 'processed.tex');
    await fs.writeFile(tempTexFile, content, 'utf-8');
    
    const tempMdFile = path.join(CONFIG.tempDir, 'output.md');
    
    // دستور Pandoc سازگار با ویندوز
    const pandocCmd = `pandoc "${tempTexFile}" -o "${tempMdFile}" --wrap=none --columns=1000`;
    await execAsync(pandocCmd, { 
      timeout: 60000,
      shell: CONFIG.isWindows ? 'cmd.exe' : '/bin/sh'
    });
    
    let markdown = await fs.readFile(tempMdFile, 'utf-8');
    
    // ۴. پس‌پردازش
    console.log('\n✨ مرحله ۴: پس‌پردازش...');
    markdown = this.postProcessMarkdown(markdown, { lang });
    
    // ۵. Frontmatter
    markdown = this.addFrontmatter(markdown, inputPath, options);
    
    // ۶. ذخیره
    await fs.mkdir(outputDir, { recursive: true });
    const outputFileName = this.generateOutputFileName(inputPath, options);
    const outputPath = path.join(outputDir, outputFileName);
    await fs.writeFile(outputPath, markdown, 'utf-8');
    
    console.log(`\n✅ خروجی: ${outputPath}`);
    console.log(`   📊 نمودارها: ${this.tikzProcessor.processedCount} موفق، ${this.tikzProcessor.failedCount} ناموفق`);
    
    return outputPath;
  }

  async processTikZBlocks(content, prefix) {
    const blocks = this.extractTikZBlocks(content);
    console.log(`   یافت شد: ${blocks.length} نمودار`);
    
    for (const block of blocks) {
      this.diagramCounter++;
      const diagramName = `${prefix}-${this.diagramCounter}-${block.type}`;
      
      const svgPath = await this.tikzProcessor.renderToSVG(block.code, diagramName);
      
      if (svgPath) {
        const relativePath = `/diagrams/${path.basename(svgPath)}`;
        const replacement = `\n\n![${block.type}](${relativePath}){.tikz-diagram}\n\n`;
        content = content.replace(block.full, replacement);
      } else {
        content = content.replace(block.full, `\n\n<!-- TIKZ_ERROR: ${diagramName} -->\n\n`);
      }
    }
    
    return content;
  }

  preProcessForPandoc(content) {
    return content
      .replace(/\\begin\{tcolorbox\}\[([^\]]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g, 
        (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`)
      .replace(/\\begin\{itemize\}\[([^\]]*)\]/g, '\\begin{itemize}')
      .replace(/\\begin\{enumerate\}\[([^\]]*)\]/g, '\\begin{enumerate}')
      .replace(/\n{4,}/g, '\n\n\n');
  }

  postProcessMarkdown(markdown, options = {}) {
    return markdown
      .replace(/\[node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\[scale[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\\node[\s\S]*?;/g, '')
      .replace(/\\draw[\s\S]*?;/g, '')
      .replace(/!\[(.*?)\]\((.+?)\)\{\.tikz-diagram\}/g, 
        '\n<figure class="tikz-figure">\n  <img src="$2" alt="$1" class="tikz-diagram" loading="lazy" />\n</figure>\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  addFrontmatter(markdown, inputPath, options = {}) {
    const { bookSlug, chapterNumber, lang = 'fa', title } = options;
    
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const extractedTitle = titleMatch ? titleMatch[1] : path.basename(inputPath, '.tex');
    
    return `---
title: "${title || extractedTitle}"
description: "${title || extractedTitle}"
lang: ${lang}
${chapterNumber ? `chapterNumber: ${chapterNumber}` : ''}
${bookSlug ? `book: "${bookSlug}"` : ''}
---

${markdown}`;
  }

  generateOutputFileName(inputPath, options = {}) {
    const { chapterNumber } = options;
    const baseName = path.basename(inputPath, '.tex');
    
    if (chapterNumber) {
      return `ch${String(chapterNumber).padStart(2, '0')}-${baseName}.md`;
    }
    return `${baseName}.md`;
  }
}

// ═══════════════════════════════════════════════════════════════
// اجرا
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📘 راهنمای استفاده:

  پردازش یک فایل:
    node scripts/process-book.mjs <input.tex> [output-dir]
  
  پردازش کتاب:
    node scripts/process-book.mjs <book-dir> --book --slug=my-book --lang=fa

مثال:
    node scripts/process-book.mjs content-source\\books\\my-book\\chapter1.tex src\\content\\articles\\fa
`);
    process.exit(1);
  }
  
  const inputPath = args[0];
  const isBook = args.includes('--book');
  const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'fa';
  const slug = args.find(a => a.startsWith('--slug='))?.split('=')[1] || path.basename(inputPath, '.tex');
  
  const processor = new LaTeXToMarkdownProcessor();
  const outputDir = args[1] || `src/content/articles/${lang}`;
  
  await processor.processFile(inputPath, outputDir, { 
    lang, 
    bookSlug: isBook ? slug : undefined 
  });
}

main().catch(error => {
  console.error('❌ خطا:', error);
  process.exit(1);
});

export { LaTeXToMarkdownProcessor, TikZProcessor };
```

---

## 🧪 گام ۶: تست نصب

### ۶.۱ ایجاد فایل تست

**ایجاد فایل `content-source/test.tex`:**

```latex
\documentclass{article}
\usepackage{tikz}
\usetikzlibrary{positioning, shapes.geometric}

\begin{document}

\section{تست نمودار}

\begin{tikzpicture}[
    node distance=1.5cm,
    box/.style={rectangle, rounded corners, draw=blue!50, fill=blue!10, 
                minimum width=3cm, minimum height=1cm, align=center}
]
    \node[box] (a) {مرحله اول};
    \node[box, below=of a] (b) {مرحله دوم};
    \node[box, below=of b] (c) {مرحله سوم};
    
    \draw[->, thick] (a) -- (b);
    \draw[->, thick] (b) -- (c);
\end{tikzpicture}

\section{متن فارسی}

این یک متن آزمایشی به زبان فارسی است.

\end{document}
```

### ۶.۲ اجرای تست

```powershell
# در PowerShell
node scripts/process-book.mjs content-source/test.tex src/content/articles/fa/

# بررسی خروجی
Get-Content src/content/articles/fa/test.md

# بررسی نمودار
dir public/diagrams/
```

---

## 🚀 گام ۷: اجرای کامل

### ۷.۱ به‌روزرسانی package.json

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "npm run process:all && astro build",
    "preview": "astro preview",
    "process:all": "node scripts/process-book.mjs",
    "process:file": "node scripts/process-book.mjs"
  }
}
```

### ۷.۲ دستورات روزمره

```powershell
# پردازش یک فایل
npm run process:file content-source\books\my-book\chapter1.tex src\content\books\fa\my-book\

# اجرای سرور توسعه
npm run dev

# Build نهایی
npm run build
```

---

## 🔧 عیب‌یابی ویندوز

### مشکل ۱: xelatex یافت نشد

```powershell
# بررسی نصب
where xelatex

# اگر یافت نشد، MiKTeX را دوباره نصب کنید
# یا PATH را بررسی کنید:
$env:PATH -split ';' | Select-String -Pattern "miktex"
```

### مشکل ۲: خطای فونت

```powershell
# بررسی نصب فونت
Get-ChildItem "$env:WINDIR\Fonts" | Where-Object { $_.Name -like "*Vazir*" }

# اگر نصب نیست، فونت را دستی نصب کنید
```

### مشکل ۳: خطای Pandoc

```powershell
# نصب Pandoc
winget install JohnMacFarlane.Pandoc

# یا با Chocolatey
choco install pandoc -y

# بررسی
pandoc --version
```

### مشکل ۴: خطای Inkscape

```powershell
# بررسی نصب
where inkscape

# اگر PATH ندارد:
$inkscapePath = "C:\Program Files\Inkscape\bin"
$env:PATH += ";$inkscapePath"
```

---

## 📋 چک‌لیست نهایی

```
┌─────────────────────────────────────────────────────────────────┐
│                    چک‌لیست نصب ویندوز                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ☐ Node.js نصب شده     → node --version                        │
│  ☐ Git نصب شده         → git --version                         │
│  ☐ MiKTeX نصب شده      → xelatex --version                     │
│  ☐ Pandoc نصب شده      → pandoc --version                      │
│  ☐ Inkscape نصب شده    → inkscape --version                    │
│  ☐ فونت Vazirmatn نصب شده                                       │
│  ☐ پوشه scripts ایجاد شده                                       │
│  ☐ فایل color-definitions.tex ایجاد شده                        │
│  ☐ فایل process-book.mjs ایجاد شده                             │
│  ☐ npm install اجرا شده                                         │
│  ☐ تست موفقیت‌آمیز بود                                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

آیا سوالی درباره مراحل نصب دارید یا می‌خواهید یکی از مراحل را با جزئیات بیشتر توضیح دهم؟
# نمونه خروجی نامناسب
```markdown
---

title: "مقدمه: چرا این راهنما و چرا اکنون؟"

description: "مقدمه: چرا این راهنما و چرا اکنون؟"

lang: fa

order: 1

chapterNumber: 1

  

---

  
  
  

[خلاصه فصل]

این فصل به سه پرسش بنیادین پاسخ می‌دهد: چرا گذار از جمهوری اسلامی ضروری و فوری شده است؟ این راهنما برای چه کسانی و با چه رویکردی نوشته شده؟ و چگونه می‌توان از آن استفاده کرد؟ رویدادهای دی‌ماه ۱۴۰۴ نشان داد که وضعیت موجود نه برای مردم قابل تحمل است و نه برای نظام قابل ادامه. اما گذار بدون نقشه راه می‌تواند به فاجعه بینجامد.

  
  

%──────────────────────────────────────────────────────────────────────────────

## ضرورت و فوریت: چرا الان؟

%──────────────────────────────────────────────────────────────────────────────

  

### نقطه عطف دی‌ماه ۱۴۰۴

  

در دی‌ماه ۱۴۰۴، ایران شاهد بزرگ‌ترین خیزش مردمی تاریخ خود بود. آنچه با اعتراض بازاریان تهران به سیاست‌های اقتصادی آغاز شد، در عرض روزها به جنبشی فراگیر تبدیل شد که حدود ۳۰ میلیون نفر را در بیش از ۴۰۰ شهر به خیابان‌ها کشاند.

  
  
  

    % مقایسه جنبش‌ها - نمودار ستونی

        % محور عمودی

        [->, line width=1pt] (0,0) -- (0,7) node[above, font=] {میلیون نفر};

        % محور افقی

        [->, line width=1pt] (0,0) -- (11,0);

        % خطوط راهنما

          in {1,2,3,4,5,6} {

            [dashed, color=grisclair] (0,) -- (10.5,);

            [left, font=] at (0,) {};

        }

        % ستون‌ها

        [scenario1] (1,0) rectangle (2,0.6);

        [below, font=, align=center] at (1.5,-0.1) {انقلاب ۵۷\\(تخمین)};

        [above, font=] at (1.5,0.6) {۳};

        [scenario2] (3,0) rectangle (4,0.4);

        [below, font=, align=center] at (3.5,-0.1) {جنبش سبز\\۸۸};

        [above, font=] at (3.5,0.4) {۲};

        [scenario3] (5,0) rectangle (6,0.3);

        [below, font=, align=center] at (5.5,-0.1) {آبان\\۹۸};

        [above, font=] at (5.5,0.3) {۱.۵};

        [scenario4] (7,0) rectangle (8,1);

        [below, font=, align=center] at (7.5,-0.1) {مهسا\\۱۴۰۱};

        [above, font=] at (7.5,1) {۵};

        [rougerevolution] (9,0) rectangle (10,6);

        [below, font=, align=center] at (9.5,-0.1) {دی‌ماه\\۱۴۰۴};

        [above, font=, color=rougerevolution] at (9.5,6) {**۳۰**};

  
  
  

پاسخ نظام به این خیزش، بی‌سابقه‌ترین سرکوب در تاریخ جمهوری اسلامی بود:

  
  

{1.5}

{|>{}r|r|l|}

  
  

{**شاخص**} & {**برآورد**} & {**توضیح**} \\

  

کشته‌شدگان & ۱۲٬۰۰۰ - ۸۴٬۰۰۰ & عمدتاً با شلیک مستقیم گلوله جنگی \\

  

مجروحان & +۳۰۰٬۰۰۰ & بسیاری با جراحات دائمی \\

  

بازداشت‌شدگان & ده‌ها هزار & وضعیت بسیاری نامعلوم \\

  

شهرهای درگیر & +۴۰۰ & گستردگی جغرافیایی بی‌سابقه \\

  
  
  
  

[چرا این ارقام مهم است؟]

کشتار ۸۰٬۰۰۰ نفر در دو روز --- اگر برآورد بالا درست باشد --- این نظام را در ردیف خونین‌ترین سرکوب‌های تاریخ معاصر قرار می‌دهد. این سطح از خشونت نشان‌دهنده چند چیز است:

[rightmargin=2em]

    - نظام حاضر است برای بقا، هر قیمتی بپردازد

    - ظرفیت و آمادگی سرکوب فراتر از تصور بسیاری بود

    - پیوند عاطفی بین حکومت و مردم به‌طور بازگشت‌ناپذیر گسسته شده است

  
  
  

### چرا بازگشت به وضعیت قبل ممکن نیست؟

  
  

[

    node distance=1.5cm,

    factor/.style={

        rectangle,

        rounded corners=8pt,

        draw=bleurepublique,

        line width=1pt,

        fill=bleulight,

        minimum width=4cm,

        minimum height=1.2cm,

        align=center,

        font=

    },

    center/.style={

        ellipse,

        draw=rougerevolution,

        line width=2pt,

        fill=rougelight,

        minimum width=4cm,

        minimum height=2cm,

        align=center,

        font=

    },

    arrow/.style={

        ->,

        >=Stealth,

        line width=1pt,

        color=gris

    }

]

    % مرکز

    [center] (center) {

        {c}

        بازگشت‌ناپذیری\\

        وضعیت

    };

    % عوامل

    [factor, above=of center] (trauma) {تروما و خشم جمعی};

    [factor, below=of center] (econ) {فروپاشی اقتصادی};

    [factor, left=of center] (legit) {بحران مشروعیت};

    [factor, right=of center] (intl) {انزوای بین‌المللی};

    [factor, above left=1cm and 0.5cm of center] (youth) {گسست نسلی};

    [factor, above right=1cm and 0.5cm of center] (region) {ضعف منطقه‌ای};

    % پیکان‌ها

    [arrow] (trauma) -- (center);

    [arrow] (econ) -- (center);

    [arrow] (legit) -- (center);

    [arrow] (intl) -- (center);

    [arrow] (youth) -- (center);

    [arrow] (region) -- (center);

  
  
  

[label=**.**, rightmargin=2em]

    - **تروما و خشم جمعی:** خانواده‌های قربانیان، زخمی‌ها و شاهدان کشتار هرگز فراموش نخواهند کرد. این حافظه جمعی به نیروی محرکه مبارزه تبدیل شده است.

    - **گسست نسلی غیرقابل ترمیم:** نسل جوان ایران --- که اکثریت جمعیت را تشکیل می‌دهد --- هیچ پیوند هویتی یا ایدئولوژیک با نظام ندارد.

    - **فروپاشی اقتصادی:** تحریم‌ها، فساد سیستماتیک و ناکارآمدی، اقتصاد را به مرز فروپاشی رسانده است. نظام توانایی ارائه رفاه اقتصادی را از دست داده است.

    - **ضعف منطقه‌ای:** سقوط اسد در سوریه، ضربات سنگین به حزب‌الله و فشار بر شبکه نیابتی، عمق استراتژیک نظام را تضعیف کرده است.

    - **انزوای بین‌المللی:** تنش با غرب به اوج رسیده و حتی متحدان نظیر روسیه و چین در حال بازنگری رابطه هستند.

  
  

%──────────────────────────────────────────────────────────────────────────────

## این راهنما برای کیست؟

%──────────────────────────────────────────────────────────────────────────────

  

این سند برای طیف وسیعی از مخاطبان نوشته شده است:

  
  

[

    node distance=0.3cm,

    audience/.style={

        rectangle,

        rounded corners=5pt,

        draw=#1,

        line width=1.5pt,

        fill=#1!15,

        minimum width=12cm,

        minimum height=1.5cm,

        align=right,

        text width=11cm,

        font=

    }

]

    [audience=bleurepublique] (a1) {

        **فعالان سیاسی و مدنی داخل کشور:**

        کسانی که در خط مقدم مبارزه هستند و به راهبردهای عملی نیاز دارند

    };

    [audience=vertnapoleon, below=of a1] (a2) {

        **اپوزیسیون خارج از کشور:**

        جریان‌ها و شخصیت‌هایی که می‌خواهند نقش مؤثرتری ایفا کنند

    };

    [audience=violetempire, below=of a2] (a3) {

        **دیاسپورای ایرانی:**

        میلیون‌ها ایرانی خارج از کشور که می‌خواهند کمک کنند

    };

    [audience=orroyaldark, below=of a3] (a4) {

        **تحلیل‌گران و سیاست‌گذاران بین‌المللی:**

        کسانی که به درک عمیق‌تر از پویایی تحولات ایران نیاز دارند

    };

    [audience=gris, below=of a4] (a5) {

        **عموم علاقه‌مندان:**

        هر کسی که می‌خواهد بفهمد چه می‌گذرد و چه می‌توان کرد

    };

  
  
  

%──────────────────────────────────────────────────────────────────────────────

## رویکرد و روش‌شناسی

%──────────────────────────────────────────────────────────────────────────────

  

### اصول راهنما

  

[پنج اصل محوری این پژوهش]

[label=**.**, rightmargin=2em]

    - **عمل‌گرایی:** هدف انباشت دانش نظری نیست؛ هدف ارائه توصیه‌های قابل اجرا است.

    - **واقع‌بینی:** نه خوش‌بینی ساده‌لوحانه، نه بدبینی فلج‌کننده. ارزیابی صادقانه فرصت‌ها و محدودیت‌ها.

    - **فراگیری:** احترام به تنوع دیدگاه‌ها و تلاش برای یافتن حداقل مشترکات.

    - **مسئولیت:** آگاهی از پیامدهای احتمالی توصیه‌ها و اولویت دادن به حفظ جان انسان‌ها.

    - **یادگیری از تاریخ:** استفاده از تجربیات سایر کشورها، بدون کپی‌برداری مکانیکی.

  
  
  

### منابع و مبانی تحلیل

  

این راهنما بر سه پایه استوار است:

  
  

[scale=0.9]

    % سه ستون

    [

        rectangle,

        rounded corners=10pt,

        draw=bleurepublique,

        line width=1.5pt,

        fill=bleulight,

        minimum width=4.5cm,

        minimum height=5cm,

        align=center

    ] (col1) at (0,0) {};

    [

        rectangle,

        rounded corners=10pt,

        draw=vertnapoleon,

        line width=1.5pt,

        fill=vertlight,

        minimum width=4.5cm,

        minimum height=5cm,

        align=center

    ] (col2) at (5.5,0) {};

    [

        rectangle,

        rounded corners=10pt,

        draw=violetempire,

        line width=1.5pt,

        fill=violetlight,

        minimum width=4.5cm,

        minimum height=5cm,

        align=center

    ] (col3) at (11,0) {};

    % عناوین

    [font=, color=bleurepublique] at (0,2) {نظریه‌های گذار};

    [font=, color=vertnapoleon] at (5.5,2) {مطالعات موردی};

    [font=, color=violetempire] at (11,2) {تحلیل اختصاصی};

    % محتوا

    [align=center, text width=4cm, font=] at (0,0) {

        اسکاچپول\\

        تیلی\\

        جین شارپ\\

        نظریه گذار دموکراتیک\\

        (پیوست الف)

    };

    [align=center, text width=4cm, font=] at (5.5,0) {

        لهستان\\

        چکسلواکی\\

        آفریقای جنوبی\\

        رومانی\\

        سوریه (درس منفی)\\

        (پیوست ب)

    };

    [align=center, text width=4cm, font=] at (11,0) {

        ساختار قدرت ج.ا.\\

        طیف‌شناسی اپوزیسیون\\

        تحلیل داده‌های میدانی\\

        ارزیابی سناریوها\\

        (فصول اصلی)

    };

  
  
  

### تیم پژوهشی (چارچوب تحلیلی)

  

این سند از منظر یک تیم چندتخصصی فرضی نوشته شده که شامل:

  

[rightmargin=2em]

    - **تاریخ‌دان انقلاب‌ها:** تحلیل الگوها و چرخه‌های تاریخی

    - **جامعه‌شناس سیاسی:** بررسی جنبش‌ها، طبقات و بسیج اجتماعی

    - **روان‌شناس اجتماعی:** درک ذهنیت جمعی و فرهنگ سیاسی

    - **اقتصاددان سیاسی:** تحلیل منافع مادی و شبکه‌های رانتی

    - **استراتژیست نظامی:** ارزیابی توازن قوا و سناریوهای امنیتی

    - **حقوق‌دان بین‌الملل:** چارچوب‌های حقوقی و مکانیزم‌های بین‌المللی

  
  

%──────────────────────────────────────────────────────────────────────────────

## ساختار کتاب

%──────────────────────────────────────────────────────────────────────────────

  
  

[

    node distance=0.5cm,

    part/.style={

        rectangle,

        rounded corners=3pt,

        draw=#1,

        line width=1pt,

        fill=#1!10,

        minimum width=14cm,

        minimum height=0.8cm,

        align=right,

        text width=13.5cm,

        font=

    },

    title/.style={

        rectangle,

        rounded corners=5pt,

        draw=#1,

        line width=2pt,

        fill=#1!30,

        minimum width=14cm,

        minimum height=1cm,

        align=center,

        font=

    }

]

    % بخش اول

    [title=bleurepublique] (t1) {بخش اول: مبانی و وضعیت‌شناسی};

    [part=bleurepublique, below=of t1] (p1a) {فصل ۲: تشریح نظام حاکم --- ستون‌های قدرت، نقاط ضعف، ظرفیت سرکوب};

    % بخش دوم

    [title=vertnapoleon, below=0.8cm of p1a] (t2) {بخش دوم: بازیگران و نیروها};

    [part=vertnapoleon, below=of t2] (p2a) {فصل ۳: طیف‌شناسی اپوزیسیون --- نقشه جریانات، SWOT، پتانسیل ائتلاف};

    [part=vertnapoleon, below=of p2a] (p2b) {فصل ۵: بُعد بین‌المللی --- بازیگران، مداخله، دیپلماسی};

    % بخش سوم

    [title=violetempire, below=0.8cm of p2b] (t3) {بخش سوم: استراتژی‌ها و سناریوها};

    [part=violetempire, below=of t3] (p3a) {فصل ۴: سناریوهای گذار --- پنج مسیر با تحلیل هزینه-فایده};

    [part=violetempire, below=of p3a] (p3b) {فصل ۶: تقویت اپوزیسیون --- چگونه ما قوی‌تر و حکومت ضعیف‌تر شود};

    [part=violetempire, below=of p3b] (p3c) {فصل ۸: تحلیل ریسک --- ماتریس ریسک، سناریوهای بدترین حالت};

    % بخش چهارم

    [title=orroyaldark, below=0.8cm of p3c] (t4) {بخش چهارم: اجرا و آینده};

    [part=orroyaldark, below=of t4] (p4a) {فصل ۷: مدیریت دوره گذار --- چالش‌های روز بعد، جلوگیری از هرج‌ومرج};

    [part=orroyaldark, below=of p4a] (p4b) {فصل ۹: نقشه راه عملیاتی --- گام‌های مشخص، جدول زمانی};

    [part=orroyaldark, below=of p4b] (p4c) {فصل ۱۰: جمع‌بندی --- پیام‌های کلیدی، فراخوان عمل};

  
  
  

### پیوست‌ها: دانش تکمیلی

  

برای حفظ تمرکز فصول اصلی بر توصیه‌های عملی، مباحث نظری و اطلاعات تفصیلی در پیوست‌ها ارائه شده‌اند:

  
  

{1.5}

{|>{}c|r|p{8cm}|}

  
  

{**پیوست**} & {**عنوان**} & {**محتوا**} \\

  

الف & نظریه‌های انقلاب و گذار & اسکاچپول، تیلی، شارپ، نظریه گذار دموکراتیک \\

  

ب & مطالعات موردی & ۱۲ نمونه تاریخی با تحلیل تطبیقی \\

  

ج & ساختار قدرت ج.ا. & نمودار سازمانی، شبکه‌های قدرت، نقاط آسیب‌پذیر \\

  

د & تاریخ جنبش‌های ایران & از ۱۳۵۷ تا دی‌ماه ۱۴۰۴ \\

  

ه & آمار و داده‌ها & اقتصادی، جمعیتی، نظامی \\

  

و & مستندات حقوق بشری & کشتارها، زندانیان، گزارش‌های بین‌المللی \\

  

ز & کتاب‌شناسی تفصیلی & منابع فارسی و انگلیسی \\

  
  
  
  

%──────────────────────────────────────────────────────────────────────────────

## نحوه استفاده از این راهنما

%──────────────────────────────────────────────────────────────────────────────

  

### راهنمای خواندن

  

[کادرهای راهنما در سراسر کتاب]

در این کتاب از کادرهای رنگی مختلف استفاده شده است:

  
  

{1.4}

{|c|r|p{7cm}|}

  
  

{{0.4cm}} & **آبی** & خلاصه فصل و نکات کلیدی \\

  
  

{{0.4cm}} & **طلایی** & نقل‌قول‌ها و گفتارهای مهم \\

  
  

{{0.4cm}} & **سبز** & الگوها، درس‌ها و توصیه‌های مثبت \\

  
  

{{0.4cm}} & **قرمز** & هشدارها و ریسک‌ها \\

  
  

{{0.4cm}} & **بنفش** & نکات استراتژیک \\

  
  

{{0.4cm}} & **خاکستری** & توضیحات فنی و تکمیلی \\

  
  
  
  
  

### مسیرهای خواندن پیشنهادی

  

بسته به نیاز و زمان شما، سه مسیر خواندن پیشنهاد می‌شود:

  
  

[

    node distance=0.8cm,

    path/.style={

        rectangle,

        rounded corners=8pt,

        draw=#1,

        line width=2pt,

        fill=#1!15,

        minimum width=13cm,

        minimum height=2.5cm,

        align=right,

        text width=12.5cm

    }

]

    [path=bleurepublique] (fast) {

        ** مسیر سریع (۳۰ دقیقه)**\\[5pt]

        فقط خلاصه مدیریتی (فصل ۰) + کادرهای آبی هر فصل\\

        {مناسب برای: تصمیم‌گیران، افراد پرمشغله}

    };

    [path=vertnapoleon, below=of fast] (medium) {

        ** مسیر میانه (۳-۴ ساعت)**\\[5pt]

        فصول ۰ تا ۱۰ بدون پیوست‌ها\\

        {مناسب برای: فعالان، علاقه‌مندان جدی}

    };

    [path=violetempire, below=of medium] (full) {

        ** مسیر کامل (۱۰+ ساعت)**\\[5pt]

        تمام فصول + پیوست‌های مرتبط با حوزه کاری شما\\

        {مناسب برای: پژوهشگران، استراتژیست‌ها، رهبران جریانات}

    };

  
  
  

%──────────────────────────────────────────────────────────────────────────────

## محدودیت‌ها و هشدارها

%──────────────────────────────────────────────────────────────────────────────

  

[آنچه این راهنما نیست]

[rightmargin=2em]

    - **پیش‌بینی قطعی نیست:** هیچ‌کس نمی‌تواند آینده را با قطعیت پیش‌بینی کند. سناریوها احتمالات هستند، نه قطعیات.

    - **دستورالعمل نظامی نیست:** این سند راهنمای عملیات نظامی یا خشونت‌آمیز نیست و چنین توصیه‌ای ارائه نمی‌دهد.

    - **نسخه نهایی نیست:** شرایط به سرعت تغییر می‌کند. این سند باید به‌روزرسانی شود.

    - **جایگزین اجماع نیست:** توصیه‌ها نیاز به بحث، نقد و اجماع‌سازی دارند.

    - **بی‌طرف محض نیست:** این سند از موضع طرفداری از دموکراسی و حقوق بشر نوشته شده است.

  
  
  

[درباره امنیت]

**هشدار امنیتی:** اگر در داخل ایران هستید، لطفاً در نگهداری و اشتراک‌گذاری این سند احتیاط کنید. از ابزارهای ارتباطی امن استفاده کنید و هویت خود را محافظت کنید.

  
  

%──────────────────────────────────────────────────────────────────────────────

## یادداشت شخصی نویسنده

%──────────────────────────────────────────────────────────────────────────────

  

[چرا این کار را می‌کنم؟]

در روزهای دی‌ماه ۱۴۰۴، مثل میلیون‌ها ایرانی دیگر، با ناباوری و درد شاهد کشتار هم‌وطنانم بودم. سؤالی که ذهنم را رها نمی‌کرد این بود: «حالا چه باید کرد؟»

  

این سند تلاشی است برای پاسخ به این سؤال --- نه با شعار و احساسات، بلکه با تحلیل، مقایسه و برنامه‌ریزی. می‌دانم که ناقص است و می‌دانم که نقد خواهد شد. اما باور دارم که سکوت و انفعال بدتر از اقدام ناقص است.

  

این سند متعلق به هیچ جریان سیاسی خاصی نیست. متعلق به همه ایرانیانی است که آینده‌ای آزاد و دموکراتیک می‌خواهند.

  
  

 مهدی سالم

  

 ریچموندهیل، بهمن ۱۴۰۴

  
  

%──────────────────────────────────────────────────────────────────────────────

## خط زمانی: از انقلاب ۵۷ تا امروز

%──────────────────────────────────────────────────────────────────────────────

  

برای درک وضعیت کنونی، نگاهی گذرا به مسیر طی‌شده ضروری است:

  
  
  

[scale=0.75, transform shape]

    % خط اصلی

    [line width=4pt, color=bleurepublique] (0,0) -- (24,0);

    % دهه‌ها

     / in {0/۱۳۵۷, 6/۱۳۶۷, 12/۱۳۷۷, 18/۱۳۸۷, 24/۱۳۹۷} {

        [line width=2pt, color=bleurepublique] (,-0.3) -- (,0.3);

        [below=0.5cm, font=] at (,0) {};

    }

    % رویدادها - بالا

    [above=1cm, align=center, text width=2.5cm, font=] at (0,0) {

        **انقلاب ۵۷**\\

        سقوط پهلوی

    };

    [color=rougerevolution] (0,0) circle (0.25);

    [above=2.5cm, align=center, text width=2.5cm, font=] at (3,0) {

        **جنگ ۸ ساله**\\

        ۱۳۵۹-۱۳۶۷

    };

    [color=orroyaldark] (3,0) circle (0.2);

    [dashed, color=orroyaldark] (3,0) -- (3,2);

    [above=1cm, align=center, text width=2.5cm, font=] at (6,0) {

        **کشتار ۶۷**\\

        هزاران اعدام

    };

    [color=rougerevolution] (6,0) circle (0.25);

    [above=2.5cm, align=center, text width=2.5cm, font=] at (9,0) {

        **سازندگی**\\

        رفسنجانی

    };

    [color=gris] (9,0) circle (0.15);

    [dashed, color=gris] (9,0) -- (9,2);

    [above=1cm, align=center, text width=2.5cm, font=] at (12,0) {

        **اصلاحات**\\

        خاتمی

    };

    [color=vertnapoleon] (12,0) circle (0.2);

    [above=2.5cm, align=center, text width=2.5cm, font=] at (14,0) {

        **۱۸ تیر ۷۸**\\

        کوی دانشگاه

    };

    [color=scenario4] (14,0) circle (0.2);

    [dashed, color=scenario4] (14,0) -- (14,2);

    [above=1cm, align=center, text width=2.5cm, font=] at (18,0) {

        **جنبش سبز**\\

        ۱۳۸۸

    };

    [color=vertnapoleon] (18,0) circle (0.25);

    [above=2.5cm, align=center, text width=2.5cm, font=] at (20,0) {

        **دی ۹۶**\\

        اعتراضات

    };

    [color=scenario4] (20,0) circle (0.2);

    [dashed, color=scenario4] (20,0) -- (20,2);

    [above=1cm, align=center, text width=2.5cm, font=] at (22,0) {

        **آبان ۹۸**\\

        ۱۵۰۰ کشته

    };

    [color=rougerevolution] (22,0) circle (0.25);

    % رویدادهای اخیر - پایین

    [below=1.5cm, align=center, text width=2.8cm, font=] at (23,0) {

        **مهسا ۱۴۰۱**\\

        زن، زندگی، آزادی

    };

    [color=violetempire] (23,0) circle (0.25);

    [dashed, color=violetempire] (23,0) -- (23,-1);

    % نقطه عطف

    [below=3cm, align=center, text width=3cm, font=,

          fill=rougelight, draw=rougerevolution, rounded corners=5pt,

          line width=1.5pt, inner sep=5pt] at (24.5,0) {

        **دی ۱۴۰۴**\\

        ۳۰ میلیون نفر\\

        ده‌ها هزار کشته

    };

    [line width=2pt, color=rougerevolution, ->] (24,0) -- (24,-2.2);

    % راهنما

    [anchor=north west] at (0,-4) {

        {r@{ }l}

        [rougerevolution] (0,0) circle (0.15); & سرکوب خونین \\

        [vertnapoleon] (0,0) circle (0.15); & جنبش مردمی \\

        [orroyaldark] (0,0) circle (0.15); & بحران \\

        [gris] (0,0) circle (0.15); & تحول سیاسی \\

    };

  
  
  
  

%──────────────────────────────────────────────────────────────────────────────

## چارچوب تحلیلی: چهار سؤال بنیادین

%──────────────────────────────────────────────────────────────────────────────

  

تمام این راهنما حول چهار سؤال اساسی سازمان یافته است:

  
  

[

    node distance=2cm,

    question/.style={

        rectangle,

        rounded corners=10pt,

        draw=#1,

        line width=2pt,

        fill=#1!15,

        minimum width=6cm,

        minimum height=2cm,

        align=center,

        font=

    },

    answer/.style={

        rectangle,

        rounded corners=5pt,

        draw=gris,

        fill=grislight,

        minimum width=5.5cm,

        minimum height=1.2cm,

        align=center,

        font=

    }

]

    % سؤال‌ها

    [question=bleurepublique] (q1) at (0,4) {

        {c}

        ۱. وضعیت چیست؟\\

         (فصول ۲، ۳، ۵)

    };

    [question=vertnapoleon] (q2) at (8,4) {

        {c}

        ۲. چه می‌توان کرد؟\\

         (فصول ۴، ۶)

    };

    [question=violetempire] (q3) at (0,0) {

        {c}

        ۳. چه می‌تواند اشتباه شود؟\\

         (فصل ۸)

    };

    [question=orroyaldark] (q4) at (8,0) {

        {c}

        ۴. گام بعدی چیست؟\\

         (فصول ۷، ۹)

    };

    % مرکز

    [ellipse, draw=rougerevolution, line width=2pt, fill=rougelight,

          minimum width=3cm, minimum height=1.5cm] (center) at (4,2) {

        **گذار موفق**

    };

    % اتصالات

    [->, line width=1.5pt, color=bleurepublique] (q1) -- (center);

    [->, line width=1.5pt, color=vertnapoleon] (q2) -- (center);

    [->, line width=1.5pt, color=violetempire] (q3) -- (center);

    [->, line width=1.5pt, color=orroyaldark] (q4) -- (center);

  
  
  

%──────────────────────────────────────────────────────────────────────────────

## تعریف مفاهیم کلیدی

%──────────────────────────────────────────────────────────────────────────────

  

برای اجتناب از سوءتفاهم، تعریف دقیق برخی مفاهیم ضروری است:

  
  

{1.6}

{|>{}r|p{11cm}|}

  
  

{**مفهوم**} & {**تعریف در این سند**} \\

  
  
  
  

{**مفهوم**} & {**تعریف در این سند**} \\

  
  

گذار &

فرآیند تغییر نظام سیاسی از اقتدارگرایی به دموکراسی، صرف‌نظر از روش (انقلاب، اصلاح، مذاکره، فروپاشی) \\

  

سرنگونی &

پایان یافتن نظام جمهوری اسلامی به شکل فعلی، نه لزوماً با خشونت \\

  

فروپاشی &

از هم پاشیدن ساختار قدرت از درون، بدون فشار سازمان‌یافته بیرونی \\

  

انقلاب &

تغییر بنیادین در ساختار قدرت با مشارکت گسترده مردمی \\

  

کودتا &

تغییر قدرت توسط بخشی از نیروهای مسلح یا نخبگان حاکم \\

  

اپوزیسیون &

همه نیروها و افرادی که خواهان تغییر نظام سیاسی هستند \\

  

نافرمانی مدنی &

سرپیچی سازمان‌یافته و خشونت‌پرهیز از قوانین و دستورات حکومت \\

  

خشونت‌پرهیزی &

استراتژی مبارزه بدون استفاده از خشونت فیزیکی علیه انسان‌ها \\

  

ائتلاف &

همکاری جریانات مختلف حول اهداف مشترک، با حفظ استقلال هر جریان \\

  

عدالت انتقالی &

مکانیزم‌های پاسخگویی به نقض حقوق بشر گذشته، همراه با آشتی ملی \\

  
  
  
  

%──────────────────────────────────────────────────────────────────────────────

## پرسش‌های راهنما برای خواننده

%──────────────────────────────────────────────────────────────────────────────

  

در پایان هر فصل، پرسش‌هایی برای تأمل و بحث ارائه می‌شود. برای این فصل:

  

[پرسش‌هایی برای تأمل]

[label=**.**, rightmargin=2em]

    - آیا فکر می‌کنید وضعیت واقعاً «بازگشت‌ناپذیر» شده است؟ چرا؟

    - کدام مخاطب این سند هستید و چه انتظاری از آن دارید؟

    - در طیف «خوش‌بینی تا بدبینی» درباره امکان گذار، خود را کجا می‌بینید؟

    - چه اطلاعات یا تحلیل‌هایی در این سند انتظار دارید ببینید؟

    - اگر یک توصیه می‌توانستید به اپوزیسیون بدهید، چه بود؟

  
  
  

%──────────────────────────────────────────────────────────────────────────────

  

%──────────────────────────────────────────────────────────────────────────────

  

[rightmargin=2em, font=]

    - گزارش‌های سازمان‌های حقوق بشری درباره رویدادهای دی‌ماه ۱۴۰۴

    - تحلیل‌های مراکز پژوهشی بین‌المللی

    - مصاحبه‌ها و شهادت‌های شاهدان عینی

    - داده‌های آماری منابع مستقل

    - ادبیات نظری گذار دموکراتیک (تفصیل در پیوست الف)

  
  
  
  
  
  

    [line width=2pt, color=orroyal] (0,0) -- (12,0);

  
  
  
  
  
  

*در فصل بعد، به تشریح دقیق نظام حاکم می‌پردازیم: ستون‌های قدرت، نقاط ضعف و ظرفیت سرکوب.*

%══════════════════════════════════════════════════════════════════════════════

% فصل دوم: تشریح نظام حاکم

%══════════════════════════════════════════════════════════════════════════════
```

### # تشخیص دقیق و راه‌حل کامل

#  پاسخ ... 
## 🔍تشخیص مشکل

اکنون مشکل را دقیقاً می‌بینم! در نمونه‌ای که فرستادید:

```
┌─────────────────────────────────────────────────────────────────┐
│                    مشکل شناسایی‌شده                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  فایل LaTeX شما:                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │ \begin{tikzpicture}[...]                │                    │
│  │   \node[audience=bleurepublique] (a1)   │                    │
│  │   {...}                                  │                    │
│  │ \end{tikzpicture}                       │                    │
│  └─────────────────────────────────────────┘                    │
│                         │                                        │
│                         ▼ Pandoc                                │
│  ┌─────────────────────────────────────────┐                    │
│  │ [node distance=0.3cm,                   │  ❌ خروجی خراب     │
│  │ audience/.style={...}]                  │                    │
│  │ (a1) {...}                              │  ← بدون wrapper    │
│  └─────────────────────────────────────────┘    ← کدهای ناقص   │
│                                                                   │
│  ⚠️ Pandoc کامندهای TikZ را نمی‌فهمد و آنها را                  │
│     به صورت متن خام/ناقص در خروجی می‌گذارد                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

همچنین می‌بینم که از **رنگ‌های سفارشی** استفاده می‌کنید:
- `bleurepublique`, `bleulight`
- `vertnapoleon`, `vertlight`
- `violetempire`, `rougerevolution`
- `orroyaldark`, `gris`, `grisclair`

---

## 🛠️ راه‌حل کامل: Pipeline سه‌مرحله‌ای

```
┌─────────────────────────────────────────────────────────────────┐
│                Pipeline پردازش محتوا                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐ │
│  │  LaTeX   │────▶│   Pre-   │────▶│  Pandoc  │────▶│  Post- │ │
│  │  Source  │     │ Process  │     │          │     │ Process│ │
│  └──────────┘     └──────────┘     └──────────┘     └────────┘ │
│                        │                                 │      │
│                        ▼                                 ▼      │
│                 ┌──────────────┐                 ┌────────────┐ │
│                 │ TikZ → SVG   │                 │ Cleanup &  │ │
│                 │ + Placeholder│                 │ Fix RTL    │ │
│                 └──────────────┘                 └────────────┘ │
│                                                                   │
│                              ▼                                   │
│                     ┌────────────────┐                          │
│                     │  Clean .md     │                          │
│                     │  + SVG files   │                          │
│                     └────────────────┘                          │
│                              │                                   │
│                              ▼                                   │
│                     ┌────────────────┐                          │
│                     │     Astro      │                          │
│                     │     Build      │                          │
│                     └────────────────┘                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 ساختار پروژه جدید

```
your-site/
├── src/
│   ├── content/
│   │   ├── articles/
│   │   ├── books/
│   │   └── ...
│   ├── components/
│   │   ├── MermaidDiagram.astro    ← جدید
│   │   ├── TikzDiagram.astro       ← جدید
│   │   └── ...
│   └── layouts/
│       └── ArticleLayout.astro     ← به‌روز شده
├── scripts/                         ← پوشه جدید
│   ├── process-book.mjs            ← اسکریپت اصلی
│   ├── tikz-renderer.mjs           ← رندر TikZ
│   ├── color-definitions.tex       ← تعریف رنگ‌ها
│   └── post-process.mjs            ← پاکسازی
├── content-source/                  ← فایل‌های اصلی LaTeX
│   └── books/
│       └── transition-guide/
│           ├── main.tex
│           ├── chapter1.tex
│           └── ...
├── public/
│   └── diagrams/                    ← SVG های تولیدشده
└── package.json
```

---

## 📝 فایل‌های پروژه

### ۱. تعریف رنگ‌های سفارشی شما

**فایل `scripts/color-definitions.tex`:**

```latex
% ═══════════════════════════════════════════════════════════════
% تعریف رنگ‌های سفارشی پروژه
% ═══════════════════════════════════════════════════════════════

\usepackage{xcolor}

% رنگ‌های آبی
\definecolor{bleurepublique}{RGB}{26, 115, 232}
\definecolor{bleulight}{RGB}{232, 244, 248}

% رنگ‌های سبز
\definecolor{vertnapoleon}{RGB}{52, 168, 83}
\definecolor{vertlight}{RGB}{232, 248, 237}

% رنگ‌های بنفش
\definecolor{violetempire}{RGB}{142, 68, 173}
\definecolor{violetlight}{RGB}{245, 238, 248}

% رنگ‌های قرمز
\definecolor{rougerevolution}{RGB}{234, 67, 53}
\definecolor{rougelight}{RGB}{252, 237, 236}

% رنگ‌های طلایی/نارنجی
\definecolor{orroyal}{RGB}{251, 188, 4}
\definecolor{orroyaldark}{RGB}{230, 150, 0}

% رنگ‌های خاکستری
\definecolor{gris}{RGB}{95, 99, 104}
\definecolor{grisclair}{RGB}{218, 220, 224}
\definecolor{grislight}{RGB}{248, 249, 250}

% رنگ‌های سناریو
\definecolor{scenario1}{RGB}{66, 133, 244}
\definecolor{scenario2}{RGB}{52, 168, 83}
\definecolor{scenario3}{RGB}{251, 188, 4}
\definecolor{scenario4}{RGB}{234, 67, 53}
```

### ۲. اسکریپت اصلی پردازش

**فایل `scripts/process-book.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * پردازش کتاب‌های LaTeX و تبدیل به Markdown
 * 
 * استفاده:
 *   node scripts/process-book.mjs content-source/books/my-book/main.tex
 *   node scripts/process-book.mjs content-source/books/my-book/ --all-chapters
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { globby } from 'globby';

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════
// تنظیمات
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  tempDir: '/tmp/latex-processor',
  outputDiagramsDir: './public/diagrams',
  colorDefsFile: './scripts/color-definitions.tex',
  
  // الگوهای شناسایی بلوک‌های TikZ
  tikzPatterns: [
    // tikzpicture معمولی
    /\\begin\{tikzpicture\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{tikzpicture\}/g,
    // forest
    /\\begin\{forest\}([\s\S]*?)\\end\{forest\}/g,
    // ganttchart
    /\\begin\{ganttchart\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{ganttchart\}/g,
  ],
  
  // الگوهای جداول
  tablePatterns: [
    /\\begin\{tabular\}(\{[\s\S]*?\})([\s\S]*?)\\end\{tabular\}/g,
    /\\begin\{longtable\}(\{[\s\S]*?\})([\s\S]*?)\\end\{longtable\}/g,
  ],
};

// ═══════════════════════════════════════════════════════════════
// کلاس پردازشگر TikZ
// ═══════════════════════════════════════════════════════════════

class TikZProcessor {
  constructor() {
    this.processedCount = 0;
    this.failedCount = 0;
    this.cache = new Map();
  }

  /**
   * تولید هش یکتا برای کد TikZ
   */
  generateHash(code) {
    return crypto.createHash('md5').update(code).digest('hex').slice(0, 10);
  }

  /**
   * ساخت فایل LaTeX کامل برای یک نمودار
   */
  buildStandaloneTeX(tikzCode, options = {}) {
    const { scale = 1, font = 'Vazirmatn' } = options;
    
    return `
\\documentclass[tikz,border=15pt]{standalone}

% بسته‌های مورد نیاز
\\usepackage{fontspec}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}

% کتابخانه‌های TikZ
\\usetikzlibrary{
  shapes.geometric,
  shapes.misc,
  arrows.meta,
  positioning,
  calc,
  backgrounds,
  fit,
  decorations.pathreplacing,
  shadows,
  trees
}

% فونت فارسی
\\setmainfont[Script=Arabic,Scale=${scale}]{${font}}

% تعریف رنگ‌ها
\\input{${path.resolve(CONFIG.colorDefsFile)}}

\\begin{document}
${tikzCode}
\\end{document}
`;
  }

  /**
   * تبدیل کد TikZ به SVG
   */
  async renderToSVG(tikzCode, outputName) {
    const hash = this.generateHash(tikzCode);
    const svgPath = path.join(CONFIG.outputDiagramsDir, `${outputName}-${hash}.svg`);
    
    // بررسی کش
    if (this.cache.has(hash)) {
      console.log(`   ⚡ از کش: ${outputName}`);
      return this.cache.get(hash);
    }
    
    // بررسی فایل موجود
    try {
      await fs.access(svgPath);
      console.log(`   📁 موجود: ${outputName}`);
      this.cache.set(hash, svgPath);
      return svgPath;
    } catch {}
    
    // ساخت دایرکتوری‌ها
    await fs.mkdir(CONFIG.tempDir, { recursive: true });
    await fs.mkdir(CONFIG.outputDiagramsDir, { recursive: true });
    
    const texContent = this.buildStandaloneTeX(tikzCode);
    const texFile = path.join(CONFIG.tempDir, `${outputName}.tex`);
    const pdfFile = path.join(CONFIG.tempDir, `${outputName}.pdf`);
    
    try {
      // نوشتن فایل TeX
      await fs.writeFile(texFile, texContent, 'utf-8');
      
      // کامپایل با XeLaTeX
      console.log(`   🔄 کامپایل: ${outputName}...`);
      await execAsync(
        `cd "${CONFIG.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`,
        { timeout: 60000 }
      );
      
      // تبدیل PDF به SVG
      await execAsync(`pdf2svg "${pdfFile}" "${svgPath}"`);
      
      // بهینه‌سازی SVG
      let svgContent = await fs.readFile(svgPath, 'utf-8');
      svgContent = this.optimizeSVG(svgContent, outputName);
      await fs.writeFile(svgPath, svgContent, 'utf-8');
      
      console.log(`   ✅ تولید شد: ${outputName}`);
      this.processedCount++;
      this.cache.set(hash, svgPath);
      
      return svgPath;
      
    } catch (error) {
      console.error(`   ❌ خطا در ${outputName}:`, error.message);
      this.failedCount++;
      
      // ذخیره لاگ خطا
      const logFile = path.join(CONFIG.tempDir, `${outputName}.log`);
      try {
        const logContent = await fs.readFile(logFile, 'utf-8');
        const errorLines = logContent.split('\n').filter(l => l.includes('!') || l.includes('Error'));
        console.error(`   📋 جزئیات:`, errorLines.slice(0, 5).join('\n'));
      } catch {}
      
      return null;
    }
  }

  /**
   * بهینه‌سازی و افزودن کلاس به SVG
   */
  optimizeSVG(svgContent, name) {
    return svgContent
      // حذف کامنت‌ها
      .replace(/<!--[\s\S]*?-->/g, '')
      // اضافه کردن کلاس و شناسه
      .replace(
        '<svg',
        `<svg class="tikz-diagram" id="diagram-${name}" role="img" aria-label="نمودار ${name}"`
      )
      // اضافه کردن استایل dark mode
      .replace(
        '</svg>',
        `<style>
          @media (prefers-color-scheme: dark) {
            .tikz-diagram text { fill: #e2e8f0; }
            .tikz-diagram path[stroke="#000"], 
            .tikz-diagram line[stroke="#000"] { stroke: #e2e8f0; }
          }
        </style></svg>`
      );
  }
}

// ═══════════════════════════════════════════════════════════════
// کلاس پردازشگر اصلی
// ═══════════════════════════════════════════════════════════════

class LaTeXToMarkdownProcessor {
  constructor() {
    this.tikzProcessor = new TikZProcessor();
    this.diagramCounter = 0;
  }

  /**
   * استخراج همه بلوک‌های TikZ
   */
  extractTikZBlocks(content) {
    const blocks = [];
    
    for (const pattern of CONFIG.tikzPatterns) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      
      while ((match = regex.exec(content)) !== null) {
        blocks.push({
          full: match[0],
          code: match[0],
          index: match.index,
          type: this.detectTikZType(match[0])
        });
      }
    }
    
    // مرتب‌سازی بر اساس موقعیت (از آخر به اول برای جایگزینی امن)
    return blocks.sort((a, b) => b.index - a.index);
  }

  /**
   * تشخیص نوع نمودار TikZ
   */
  detectTikZType(code) {
    if (code.includes('\\begin{forest}')) return 'tree';
    if (code.includes('\\begin{ganttchart}')) return 'gantt';
    if (code.includes('axis') || code.includes('\\addplot')) return 'chart';
    if (code.includes('mindmap')) return 'mindmap';
    if (code.includes('flowchart') || code.includes('->')) return 'flowchart';
    return 'diagram';
  }

  /**
   * پردازش فایل LaTeX
   */
  async processFile(inputPath, outputDir, options = {}) {
    const { bookSlug, chapterNumber, lang = 'fa' } = options;
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📄 پردازش: ${inputPath}`);
    console.log(`${'═'.repeat(60)}`);
    
    let content = await fs.readFile(inputPath, 'utf-8');
    
    // ۱. استخراج و پردازش TikZ
    console.log('\n📊 مرحله ۱: پردازش نمودارها...');
    content = await this.processTikZBlocks(content, bookSlug);
    
    // ۲. پیش‌پردازش برای Pandoc
    console.log('\n🔧 مرحله ۲: پیش‌پردازش...');
    content = this.preProcessForPandoc(content);
    
    // ۳. ذخیره فایل موقت و اجرای Pandoc
    console.log('\n📝 مرحله ۳: تبدیل با Pandoc...');
    const tempTexFile = path.join(CONFIG.tempDir, 'processed.tex');
    await fs.writeFile(tempTexFile, content, 'utf-8');
    
    const tempMdFile = path.join(CONFIG.tempDir, 'output.md');
    await execAsync(
      `pandoc "${tempTexFile}" -o "${tempMdFile}" --wrap=none --columns=1000`
    );
    
    let markdown = await fs.readFile(tempMdFile, 'utf-8');
    
    // ۴. پس‌پردازش Markdown
    console.log('\n✨ مرحله ۴: پس‌پردازش...');
    markdown = this.postProcessMarkdown(markdown, { lang });
    
    // ۵. اضافه کردن frontmatter
    markdown = this.addFrontmatter(markdown, inputPath, options);
    
    // ۶. ذخیره خروجی
    await fs.mkdir(outputDir, { recursive: true });
    const outputFileName = this.generateOutputFileName(inputPath, options);
    const outputPath = path.join(outputDir, outputFileName);
    await fs.writeFile(outputPath, markdown, 'utf-8');
    
    console.log(`\n✅ خروجی: ${outputPath}`);
    console.log(`   📊 نمودارها: ${this.tikzProcessor.processedCount} موفق، ${this.tikzProcessor.failedCount} ناموفق`);
    
    return outputPath;
  }

  /**
   * پردازش بلوک‌های TikZ
   */
  async processTikZBlocks(content, prefix = 'diagram') {
    const blocks = this.extractTikZBlocks(content);
    
    console.log(`   یافت شد: ${blocks.length} نمودار`);
    
    for (const block of blocks) {
      this.diagramCounter++;
      const diagramName = `${prefix}-${this.diagramCounter}-${block.type}`;
      
      const svgPath = await this.tikzProcessor.renderToSVG(block.code, diagramName);
      
      if (svgPath) {
        // جایگزینی با تگ تصویر
        const relativePath = `/diagrams/${path.basename(svgPath)}`;
        const replacement = `\n\n![${block.type}](${relativePath}){.tikz-diagram}\n\n`;
        content = content.replace(block.full, replacement);
      } else {
        // در صورت خطا، به صورت کامنت بگذار
        const replacement = `\n\n<!-- TIKZ_ERROR: نمودار ${diagramName} قابل رندر نبود -->\n\n`;
        content = content.replace(block.full, replacement);
      }
    }
    
    return content;
  }

  /**
   * پیش‌پردازش برای Pandoc
   */
  preProcessForPandoc(content) {
    return content
      // تبدیل کادرهای tcolorbox به blockquote
      .replace(/\\begin\{tcolorbox\}\[([^\]]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g, 
        (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`)
      
      // تبدیل itemize فارسی
      .replace(/\\begin\{itemize\}\[([^\]]*)\]/g, '\\begin{itemize}')
      
      // تبدیل enumerate فارسی
      .replace(/\\begin\{enumerate\}\[([^\]]*)\]/g, '\\begin{enumerate}')
      
      // حذف کامندهای نامربوط
      .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '')
      .replace(/\\setcounter\{[^}]*\}\{[^}]*\}/g, '')
      
      // تبدیل خط تزئینی
      .replace(/\\begin\{tikzpicture\}[\s\S]*?\\draw\[line width=2pt[^\]]*\][\s\S]*?\\end\{tikzpicture\}/g, 
        '\n\n---\n\n')
      
      // حذف خطوط خالی اضافی
      .replace(/\n{4,}/g, '\n\n\n');
  }

  /**
   * پس‌پردازش Markdown
   */
  postProcessMarkdown(markdown, options = {}) {
    const { lang = 'fa' } = options;
    
    let result = markdown
      // حذف کدهای TikZ باقی‌مانده (که Pandoc نفهمیده)
      .replace(/\[node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\[scale[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\\node[\s\S]*?;/g, '')
      .replace(/\\draw[\s\S]*?;/g, '')
      .replace(/\\begin\{scope\}[\s\S]*?\\end\{scope\}/g, '')
      .replace(/\([\w]+\)\s*\{[\s\S]*?\};/g, '')
      
      // اصلاح تصاویر
      .replace(/!\[(.*?)\]\((.+?)\)\{\.tikz-diagram\}/g, 
        '\n<figure class="tikz-figure">\n  <img src="$2" alt="$1" class="tikz-diagram" loading="lazy" />\n</figure>\n')
      
      // تبدیل blockquote های خاص به کلاس‌دار
      .replace(/> \*\*خلاصه فصل\*\*/g, '> {.summary}\n> **خلاصه فصل**')
      .replace(/> \*\*هشدار/g, '> {.warning}\n> **هشدار')
      .replace(/> \*\*نکته/g, '> {.note}\n> **نکته')
      
      // اصلاح لینک‌ها
      .replace(/\{#([\w-]+)\}/g, '')
      
      // پاکسازی فاصله‌های اضافی
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return result;
  }

  /**
   * تولید frontmatter
   */
  addFrontmatter(markdown, inputPath, options = {}) {
    const { bookSlug, chapterNumber, lang = 'fa', title } = options;
    
    // استخراج عنوان از محتوا
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const extractedTitle = titleMatch ? titleMatch[1] : path.basename(inputPath, '.tex');
    
    const frontmatter = `---
title: "${title || extractedTitle}"
description: "${title || extractedTitle}"
lang: ${lang}
${chapterNumber ? `chapterNumber: ${chapterNumber}` : ''}
${bookSlug ? `book: "${bookSlug}"` : ''}
---

`;
    
    return frontmatter + markdown;
  }

  /**
   * تولید نام فایل خروجی
   */
  generateOutputFileName(inputPath, options = {}) {
    const { chapterNumber } = options;
    const baseName = path.basename(inputPath, '.tex');
    
    if (chapterNumber) {
      return `ch${String(chapterNumber).padStart(2, '0')}-${baseName}.md`;
    }
    
    return `${baseName}.md`;
  }
}

// ═══════════════════════════════════════════════════════════════
// پردازش کتاب کامل
// ═══════════════════════════════════════════════════════════════

async function processBook(bookDir, outputDir, options = {}) {
  const { lang = 'fa', slug } = options;
  const processor = new LaTeXToMarkdownProcessor();
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📚 پردازش کتاب: ${bookDir}`);
  console.log(`${'═'.repeat(60)}`);
  
  // یافتن فایل‌های فصل
  const chapterFiles = await globby([
    path.join(bookDir, 'chapter*.tex'),
    path.join(bookDir, 'ch*.tex'),
    path.join(bookDir, 'فصل*.tex'),
  ]);
  
  // مرتب‌سازی فصل‌ها
  chapterFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });
  
  console.log(`   یافت شد: ${chapterFiles.length} فصل`);
  
  // پردازش هر فصل
  for (let i = 0; i < chapterFiles.length; i++) {
    const chapterFile = chapterFiles[i];
    await processor.processFile(chapterFile, outputDir, {
      bookSlug: slug,
      chapterNumber: i + 1,
      lang,
    });
  }
  
  // ایجاد index.md
  const indexContent = `---
title: "${slug}"
description: ""
lang: ${lang}
---

# فهرست فصول

${chapterFiles.map((f, i) => `${i + 1}. [فصل ${i + 1}](./ch${String(i + 1).padStart(2, '0')}-${path.basename(f, '.tex')})`).join('\n')}
`;
  
  await fs.writeFile(path.join(outputDir, 'index.md'), indexContent);
  
  console.log(`\n✅ پردازش کتاب کامل شد!`);
}

// ═══════════════════════════════════════════════════════════════
// اجرای اسکریپت
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
استفاده:
  
  پردازش یک فایل:
    node scripts/process-book.mjs <input.tex> [output-dir]
  
  پردازش کتاب کامل:
    node scripts/process-book.mjs <book-directory> --book --slug=my-book --lang=fa
  
مثال:
    node scripts/process-book.mjs content-source/books/transition-guide/ \\
      --book --slug=transition-guide --lang=fa
`);
  process.exit(1);
}

const inputPath = args[0];
const isBook = args.includes('--book');
const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'fa';
const slug = args.find(a => a.startsWith('--slug='))?.split('=')[1] || path.basename(inputPath);

(async () => {
  try {
    if (isBook) {
      const outputDir = `src/content/books/${lang}/${slug}`;
      await processBook(inputPath, outputDir, { lang, slug });
    } else {
      const processor = new LaTeXToMarkdownProcessor();
      const outputDir = args[1] || `src/content/articles/${lang}`;
      await processor.processFile(inputPath, outputDir, { lang });
    }
  } catch (error) {
    console.error('❌ خطا:', error);
    process.exit(1);
  }
})();

export { LaTeXToMarkdownProcessor, TikZProcessor, processBook };
```

### ۳. کامپوننت Astro برای نمودارها

**فایل `src/components/TikzDiagram.astro`:**

```astro
---
interface Props {
  src: string;
  alt?: string;
  caption?: string;
  class?: string;
}

const { src, alt = 'نمودار', caption, class: className = '' } = Astro.props;
---

<figure class={`tikz-figure ${className}`}>
  <img 
    src={src} 
    alt={alt}
    class="tikz-diagram"
    loading="lazy"
    decoding="async"
  />
  {caption && <figcaption>{caption}</figcaption>}
</figure>

<style>
  .tikz-figure {
    margin: 2rem auto;
    text-align: center;
  }
  
  .tikz-diagram {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
  }
   
  figcaption {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  /* Dark mode */
  :global(.dark) .tikz-diagram {
    filter: invert(0.9) hue-rotate(180deg);
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
  }
  
  :global(.dark) figcaption {
    color: #9ca3af;
  }
</style>
```

---

### ۴. کامپوننت Mermaid

**فایل `src/components/MermaidDiagram.astro`:**

```astro
---
interface Props {
  chart: string;
  caption?: string;
  theme?: 'default' | 'dark' | 'forest' | 'neutral';
}

const { chart, caption, theme = 'neutral' } = Astro.props;
const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
---

<figure class="mermaid-figure">
  <div class="mermaid-wrapper">
    <pre id={id} class="mermaid" data-theme={theme}>
      {chart}
    </pre>
  </div>
  {caption && <figcaption>{caption}</figcaption>}
</figure>

<style>
  .mermaid-figure {
    margin: 2rem auto;
    text-align: center;
    direction: ltr;
  }
  
  .mermaid-wrapper {
    overflow-x: auto;
    padding: 1rem;
    background: #fafafa;
    border-radius: 8px;
  }
  
  :global(.dark) .mermaid-wrapper {
    background: #1e293b;
  }
  
  .mermaid {
    display: flex;
    justify-content: center;
  }
  
  figcaption {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
    direction: rtl;
  }
</style>
```

---

### ۵. Layout به‌روزشده برای مقالات

**فایل `src/layouts/ArticleLayout.astro`:**

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
  pubDate?: Date;
  updatedDate?: Date;
  heroImage?: string;
  lang?: 'fa' | 'en';
  tags?: string[];
  chapterNumber?: number;
  book?: string;
}

const { 
  title, 
  description, 
  pubDate, 
  updatedDate, 
  heroImage,
  lang = 'fa',
  tags = [],
  chapterNumber,
  book
} = Astro.props;

const isRTL = lang === 'fa';
---

<!DOCTYPE html>
<html lang={lang} dir={isRTL ? 'rtl' : 'ltr'}>
<head>
  <BaseHead title={title} description={description} image={heroImage} />
  
  <!-- KaTeX برای فرمول‌های ریاضی -->
  <link 
    rel="stylesheet" 
    href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
    crossorigin="anonymous"
  />
  
  <!-- فونت فارسی -->
  <link 
    href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" 
    rel="stylesheet" 
  />
  
  <style is:global>
    /* ═══════════════════════════════════════════════════════════ */
    /* استایل‌های پایه RTL                                         */
    /* ═══════════════════════════════════════════════════════════ */
    
    :root {
      --font-persian: 'Vazirmatn', system-ui, sans-serif;
      --font-english: 'Inter', system-ui, sans-serif;
      
      /* رنگ‌های مطابق با تم شما */
      --color-primary: #1a73e8;
      --color-primary-light: #e8f4f8;
      --color-success: #34a853;
      --color-success-light: #e8f8ed;
      --color-warning: #fbbc04;
      --color-danger: #ea4335;
      --color-danger-light: #fcedec;
      --color-purple: #8e44ad;
      --color-purple-light: #f5eef8;
    }
    
    body {
      font-family: var(--font-persian);
    }
    
    [dir="rtl"] {
      text-align: right;
    }
    
    [dir="ltr"] {
      text-align: left;
      font-family: var(--font-english);
    }
    
    /* ═══════════════════════════════════════════════════════════ */
    /* نمودارها و تصاویر (همیشه LTR)                               */
    /* ═══════════════════════════════════════════════════════════ */
    
    .tikz-figure,
    .mermaid-figure,
    .chart-container {
      direction: ltr !important;
      text-align: center !important;
      margin: 2rem auto;
      max-width: 100%;
      overflow-x: auto;
    }
    
    .tikz-figure figcaption,
    .mermaid-figure figcaption {
      direction: rtl;
      text-align: center;
    }
    
    .tikz-diagram {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    /* ═══════════════════════════════════════════════════════════ */
    /* جداول                                                       */
    /* ═══════════════════════════════════════════════════════════ */
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 0.95rem;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
    }
    
    [dir="rtl"] th,
    [dir="rtl"] td {
      text-align: right;
    }
    
    th {
      background: #f8fafc;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: #fafafa;
    }
    
    /* Dark mode tables */
    .dark th {
      background: #1e293b;
    }
    
    .dark td {
      border-color: #334155;
    }
    
    .dark tr:nth-child(even) {
      background: #1e293b;
    }
    
    /* ═══════════════════════════════════════════════════════════ */
    /* کادرهای ویژه (Callouts)                                     */
    /* ═══════════════════════════════════════════════════════════ */
    
    blockquote {
      border-right: 4px solid var(--color-primary);
      border-left: none;
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
      background: var(--color-primary-light);
      border-radius: 0 8px 8px 0;
    }
    
    [dir="ltr"] blockquote {
      border-left: 4px solid var(--color-primary);
      border-right: none;
      border-radius: 8px 0 0 8px;
    }
    
    blockquote.summary {
      border-color: var(--color-primary);
      background: var(--color-primary-light);
    }
    
    blockquote.warning {
      border-color: var(--color-danger);
      background: var(--color-danger-light);
    }
    
    blockquote.note {
      border-color: var(--color-success);
      background: var(--color-success-light);
    }
    
    blockquote.strategy {
      border-color: var(--color-purple);
      background: var(--color-purple-light);
    }
    
    /* ═══════════════════════════════════════════════════════════ */
    /* کد                                                          */
    /* ═══════════════════════════════════════════════════════════ */
    
    pre, code {
      direction: ltr !important;
      text-align: left !important;
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
    }
    
    pre {
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    
    :not(pre) > code {
      background: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
    }
    
    .dark :not(pre) > code {
      background: #334155;
    }
    
    /* ═══════════════════════════════════════════════════════════ */
    /* فرمول‌های ریاضی                                              */
    /* ═══════════════════════════════════════════════════════════ */
    
    .katex-display {
      direction: ltr !important;
      overflow-x: auto;
      padding: 1rem 0;
    }
    
    /* ═══════════════════════════════════════════════════════════ */
    /* لیست‌ها                                                      */
    /* ═══════════════════════════════════════════════════════════ */
    
    [dir="rtl"] ul,
    [dir="rtl"] ol {
      padding-right: 1.5rem;
      padding-left: 0;
    }
    
    [dir="rtl"] li::marker {
      unicode-bidi: isolate;
    }
  </style>
</head>

<body class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen">
  <Header lang={lang} />
  
  <main class="max-w-4xl mx-auto px-4 py-8">
    <article class="article-content">
      <!-- هدر مقاله -->
      <header class="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
        {book && chapterNumber && (
          <div class="text-sm text-slate-500 dark:text-slate-400 mb-2">
            <a href={`/books/${lang}/${book}`} class="hover:text-primary">
              {book}
            </a>
            <span class="mx-2">›</span>
            <span>فصل {chapterNumber}</span>
          </div>
        )}
        
        <h1 class="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        
        {description && (
          <p class="text-lg text-slate-600 dark:text-slate-300 mb-4">
            {description}
          </p>
        )}
        
        <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          {pubDate && (
            <time datetime={pubDate.toISOString()}>
              📅 {pubDate.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
            </time>
          )}
          
          {updatedDate && (
            <span>
              🔄 به‌روزرسانی: {updatedDate.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
            </span>
          )}
        </div>
        
        {tags && tags.length > 0 && (
          <div class="flex flex-wrap gap-2 mt-4">
            {tags.map(tag => (
              <a 
                href={`/${lang === 'fa' ? '' : 'en/'}tags/${tag}`}
                class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-primary hover:text-white transition-colors"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </header>
      
      <!-- محتوای اصلی -->
      <div class="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                  prose-p:leading-relaxed prose-p:mb-4
                  prose-li:my-1
                  prose-img:rounded-lg prose-img:shadow-md">
        <slot />
      </div>
    </article>
  </main>
  
  <Footer lang={lang} />
  
  <!-- Mermaid.js -->
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    
    const isDark = document.documentElement.classList.contains('dark') ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    mermaid.initialize({
      startOnLoad: true,
      theme: isDark ? 'dark' : 'neutral',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      fontFamily: 'Vazirmatn, sans-serif',
      securityLevel: 'loose'
    });
    
    // Re-render اگر تم عوض شد
    document.addEventListener('theme-changed', () => {
      location.reload();
    });
  </script>
  
  <!-- KaTeX auto-render -->
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      if (typeof renderMathInElement !== 'undefined') {
        renderMathInElement(document.body, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false
        });
      }
    });
  </script>
</body>
</html>
```

---

### ۶. به‌روزرسانی `package.json`

```json
{
  "name": "your-site",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "npm run process:all && astro build",
    "preview": "astro preview",
    
    "process:all": "npm run process:books && npm run process:articles",
    "process:books": "node scripts/process-all-books.mjs",
    "process:articles": "node scripts/process-all-articles.mjs",
    
    "process:book": "node scripts/process-book.mjs",
    "process:file": "node scripts/process-book.mjs",
    
    "clean:diagrams": "rm -rf public/diagrams/*",
    "clean:generated": "rm -rf src/content/**/generated-*"
  },
  "dependencies": {
    "astro": "^4.0.0",
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/mdx": "^2.0.0"
  },
  "devDependencies": {
    "globby": "^14.0.0",
    "gray-matter": "^4.0.3",
    "tailwindcss": "^4.0.0"
  }
}
```

---

### ۷. اسکریپت پردازش همه کتاب‌ها

**فایل `scripts/process-all-books.mjs`:**

```javascript
#!/usr/bin/env node
/**
 * پردازش همه کتاب‌های موجود در content-source
 */

import { globby } from 'globby';
import path from 'path';
import { processBook } from './process-book.mjs';

async function processAllBooks() {
  console.log('📚 شروع پردازش همه کتاب‌ها...\n');
  
  // یافتن همه دایرکتوری‌های کتاب
  const bookDirs = await globby('content-source/books/*', { 
    onlyDirectories: true 
  });
  
  console.log(`یافت شد: ${bookDirs.length} کتاب\n`);
  
  for (const bookDir of bookDirs) {
    const slug = path.basename(bookDir);
    
    // تشخیص زبان از نام یا محتوا
    const lang = bookDir.includes('/en/') ? 'en' : 'fa';
    
    const outputDir = `src/content/books/${lang}/${slug}`;
    
    try {
      await processBook(bookDir, outputDir, { lang, slug });
    } catch (error) {
      console.error(`❌ خطا در پردازش ${slug}:`, error.message);
    }
  }
  
  console.log('\n✅ پردازش همه کتاب‌ها کامل شد!');
}

processAllBooks().catch(console.error);
```

---

## 🚀 راهنمای استفاده

### گام ۱: نصب پیش‌نیازها

```bash
#نصب وابستگی‌های سیستم

#macOS
brew install texlive-full pdf2svg

#Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  texlive-full \
  texlive-xetex \
  texlive-lang-arabic \
  pdf2svg \
  fonts-vazirmatn

#نصب وابستگی‌های Node
npm install
```

### گام ۲: ساختار فایل‌های LaTeX

```
content-source/
└── books/
    └── transition-guide/           # کتاب راهنمای گذار
        ├── main.tex                # فایل اصلی (اختیاری)
        ├── chapter1.tex            # فصل ۱
        ├── chapter2.tex            # فصل ۲
        ├── ...
        └── images/                 # تصاویر اصلی
```

### گام ۳: پردازش محتوا

```bash
# پردازش یک کتاب
npm run process:book content-source/books/transition-guide/ \
  --book --slug=transition-guide --lang=fa

# پردازش یک فایل تکی
npm run process:file content-source/articles/my-article.tex \
  src/content/articles/fa/

# پردازش همه محتوا
npm run process:all

# Build نهایی
npm run build
```

### گام ۴: بررسی خروجی

```bash
#اجرای محلی
npm run dev

#باز کردن در مرورگر
open http://localhost:4321/books/fa/transition-guide/
```

---

## 🔧 عیب‌یابی مشکلات رایج

### مشکل ۱: فونت فارسی نمایش داده نمی‌شود

```bash
# بررسی نصب فونت
fc-list | grep -i vazir

# نصب فونت
# macOS
brew tap homebrew/cask-fonts
brew install font-vazirmatn

# Ubuntu
sudo apt-get install fonts-vazirmatn
```

### مشکل ۲: خطای XeLaTeX

```bash
# بررسی نصب
which xelatex

# نصب کامل TeXLive
# macOS
brew install --cask mactex-no-gui

# Ubuntu
sudo apt-get install texlive-full
```

### مشکل ۳: کتابخانه TikZ موجود نیست

در فایل `scripts/process-book.mjs`، بخش `buildStandaloneTeX` را ویرایش کنید:

```javascript
buildStandaloneTeX(tikzCode, options = {}) {
  return `
\\documentclass[tikz,border=15pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{
  shapes.geometric,
  arrows.meta,
  positioning,
  calc,
  backgrounds,
  fit,
  decorations.pathreplacing,
  shadows,
  trees,
  mindmap,          % اضافه کنید
  calendar,         % اضافه کنید
  matrix            % اضافه کنید
}
% ... بقیه کد
`;
}
```

---

## 📊 خلاصه راه‌حل

```
┌─────────────────────────────────────────────────────────────────┐
│                    خلاصه راه‌حل                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ مشکل شناسایی شد:                                             │
│     Pandoc کدهای TikZ را نمی‌فهمد و خراب می‌کند                   │
│                                                                   │
│  ✅ راه‌حل:                                                       │
│     Pre-processor که TikZ را قبل از Pandoc به SVG تبدیل کند     │
│                                                                   │
│  ✅ فایل‌های کلیدی:                                               │
│     1. scripts/process-book.mjs      → پردازشگر اصلی            │
│     2. scripts/color-definitions.tex → رنگ‌های سفارشی           │
│     3. src/layouts/ArticleLayout.astro → Layout با RTL          │
│                                                                   │
│  ✅ دستور اجرا:                                                   │
│     npm run process:all && npm run build                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```



# سایر
