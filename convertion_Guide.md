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