

# پرامپت + فایل‌های کتابخانه

## 📋 پرامپت برای AntiGravity

```
# یکپارچه‌سازی Content Pipeline با وب‌سایت Astro

## خلاصه نیاز
یک Content Pipeline برای تبدیل LaTeX/PDF به Markdown با پشتیبانی از:
- رندر TikZ به SVG (قبل از Pandoc)
- استخراج خودکار رنگ/فونت از preamble
- استخراج محتوا از PDF
- تگ‌گذاری با AI
- Watch Mode برای پردازش خودکار

## ساختار جدید
```
project/
├── content-source/           # [جدید] منابع اصلی
│   ├── books/
│   └── articles/
├── scripts/                  # [جدید] Pipeline
│   ├── process-content.mjs
│   ├── watch-content.mjs
│   ├── color-definitions.tex
│   └── lib/
│       ├── preamble-parser.mjs
│       ├── style-generator.mjs
│       ├── smart-renderer.mjs
│       ├── pdf-extractor.mjs
│       └── ai-tagger.mjs
├── public/diagrams/          # [جدید] SVG ها
├── src/styles/book-themes/   # [جدید] CSS هر کتاب
└── .content-cache/           # [جدید] کش
```

## وظایف
1. پوشه‌های جدید را بساز
2. فایل‌های زیر را در مسیرهای مشخص‌شده قرار بده
3. package.json و .gitignore را به‌روز کن
4. وابستگی‌ها را نصب کن

کدهای کامل در ادامه آمده است.
```

---

## 📄 فایل ۱: `scripts/lib/preamble-parser.mjs`

```javascript
/**
 * تحلیلگر هوشمند Preamble
 */

import fs from 'fs/promises';
import path from 'path';

export class PreambleParser {
  constructor() {
    this.patterns = {
      defineColor: /\\definecolor\{(\w+)\}\{(\w+)\}\{([^}]+)\}/g,
      colorlet: /\\colorlet\{(\w+)\}\{([^}]+)\}/g,
      setMainFont: /\\setmainfont(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      setFont: /\\set(\w+)font(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      newFontFamily: /\\newfontfamily\\(\w+)(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      tikzLibrary: /\\usetikzlibrary\{([^}]+)\}/g,
      pgfplotsLibrary: /\\usepgfplotslibrary\{([^}]+)\}/g,
      tikzStyle: /\\tikzstyle\{(\w+)\}\s*=\s*\[([^\]]+)\]/g,
      tikzSet: /\\tikzset\{([^}]+)\}/g,
      usePackage: /\\usepackage(?:\[([^\]]*)\])?\{([^}]+)\}/g,
      newCommand: /\\newcommand\{\\(\w+)\}(?:\[(\d+)\])?\{([^}]+)\}/g,
      input: /\\input\{([^}]+)\}/g,
      include: /\\include\{([^}]+)\}/g,
    };
  }

  async analyzeProject(projectDir) {
    console.log(`\n🔍 تحلیل پروژه: ${projectDir}`);
    
    const config = {
      projectDir,
      colors: {},
      fonts: { main: null, sans: null, mono: null, custom: {} },
      tikz: { libraries: new Set(), styles: {}, pgfplotsLibraries: new Set() },
      packages: [],
      customCommands: {},
      dependencies: []
    };

    const mainFile = await this.findMainFile(projectDir);
    if (!mainFile) {
      console.log(`   ⚠️ فایل اصلی یافت نشد، استفاده از تنظیمات پیش‌فرض`);
      return this.getDefaultConfig();
    }

    console.log(`   📄 فایل اصلی: ${mainFile}`);
    await this.parseFileRecursive(mainFile, config, new Set());

    config.tikz.libraries = Array.from(config.tikz.libraries);
    config.tikz.pgfplotsLibraries = Array.from(config.tikz.pgfplotsLibraries);

    console.log(`   🎨 رنگ‌ها: ${Object.keys(config.colors).length}`);
    console.log(`   📊 کتابخانه‌های TikZ: ${config.tikz.libraries.length}`);

    return config;
  }

  async findMainFile(projectDir) {
    const candidates = ['main.tex', 'book.tex', 'index.tex', 'document.tex'];
    for (const candidate of candidates) {
      try {
        const filePath = path.join(projectDir, candidate);
        await fs.access(filePath);
        return filePath;
      } catch {}
    }
    
    const texFiles = await this.findTexFiles(projectDir);
    for (const file of texFiles) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes('\\documentclass')) return file;
    }
    return null;
  }

  async findTexFiles(dir) {
    const files = [];
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          files.push(...await this.findTexFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.tex')) {
          files.push(fullPath);
        }
      }
    } catch {}
    return files;
  }

  async parseFileRecursive(filePath, config, visited) {
    const absPath = path.resolve(filePath);
    if (visited.has(absPath)) return;
    visited.add(absPath);

    let content;
    try {
      content = await fs.readFile(filePath, 'utf-8');
    } catch { return; }

    const baseDir = path.dirname(filePath);
    this.extractColors(content, config);
    this.extractFonts(content, config);
    this.extractTikzConfig(content, config);

    const deps = this.extractDependencies(content, baseDir);
    for (const dep of deps) {
      await this.parseFileRecursive(dep, config, visited);
    }
  }

  extractColors(content, config) {
    let match;
    const defineColorRegex = new RegExp(this.patterns.defineColor.source, 'g');
    while ((match = defineColorRegex.exec(content)) !== null) {
      const [, name, model, spec] = match;
      config.colors[name] = this.parseColor(model, spec);
    }
    
    const colorletRegex = new RegExp(this.patterns.colorlet.source, 'g');
    while ((match = colorletRegex.exec(content)) !== null) {
      const [, name, baseColor] = match;
      config.colors[name] = { type: 'reference', base: baseColor };
    }
  }

  parseColor(model, spec) {
    switch (model.toLowerCase()) {
      case 'rgb':
        const rgbParts = spec.split(',').map(v => Math.round(parseFloat(v.trim()) * 255));
        return { type: 'rgb', r: rgbParts[0], g: rgbParts[1], b: rgbParts[2], css: `rgb(${rgbParts.join(', ')})` };
      case 'RGB':
        const RGBParts = spec.split(',').map(v => parseInt(v.trim()));
        return { type: 'rgb', r: RGBParts[0], g: RGBParts[1], b: RGBParts[2], css: `rgb(${RGBParts.join(', ')})` };
      case 'HTML': case 'hex':
        return { type: 'hex', css: `#${spec.replace('#', '')}` };
      default:
        return { type: 'named', name: spec, css: spec };
    }
  }

  extractFonts(content, config) {
    let match;
    const mainFontRegex = new RegExp(this.patterns.setMainFont.source, 'g');
    while ((match = mainFontRegex.exec(content)) !== null) {
      config.fonts.main = { name: match[2], options: {} };
    }
  }

  extractTikzConfig(content, config) {
    let match;
    const tikzLibRegex = new RegExp(this.patterns.tikzLibrary.source, 'g');
    while ((match = tikzLibRegex.exec(content)) !== null) {
      match[1].split(',').map(l => l.trim()).forEach(lib => config.tikz.libraries.add(lib));
    }
  }

  extractDependencies(content, baseDir) {
    const deps = [];
    const patterns = [this.patterns.input, this.patterns.include];
    for (const pattern of patterns) {
      let match;
      const regex = new RegExp(pattern.source, 'g');
      while ((match = regex.exec(content)) !== null) {
        let depPath = match[1];
        if (!depPath.endsWith('.tex')) depPath += '.tex';
        deps.push(path.resolve(baseDir, depPath));
      }
    }
    return deps;
  }

  getDefaultConfig() {
    return {
      colors: {
        bleurepublique: { r: 26, g: 115, b: 232, css: 'rgb(26, 115, 232)' },
        bleulight: { css: 'rgb(232, 244, 248)' },
        vertnapoleon: { css: 'rgb(52, 168, 83)' },
        vertlight: { css: 'rgb(232, 248, 237)' },
        violetempire: { css: 'rgb(142, 68, 173)' },
        rougerevolution: { css: 'rgb(234, 67, 53)' },
        rougelight: { css: 'rgb(252, 237, 236)' },
        orroyal: { css: 'rgb(251, 188, 4)' },
        orroyaldark: { css: 'rgb(230, 150, 0)' },
        gris: { css: 'rgb(95, 99, 104)' },
        grisclair: { css: 'rgb(218, 220, 224)' },
        grislight: { css: 'rgb(248, 249, 250)' },
      },
      fonts: { main: { name: 'Vazirmatn' }, sans: null, mono: null, custom: {} },
      tikz: {
        libraries: ['shapes.geometric', 'shapes.misc', 'arrows.meta', 'positioning', 'calc', 'backgrounds', 'fit', 'decorations.pathreplacing', 'shadows', 'trees'],
        styles: {},
        pgfplotsLibraries: []
      },
      packages: [],
      customCommands: {},
      dependencies: []
    };
  }
}

export default PreambleParser;
```

---

## 📄 فایل ۲: `scripts/lib/style-generator.mjs`

```javascript
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
```

---

## 📄 فایل ۳: `scripts/lib/smart-renderer.mjs`

```javascript
/**
 * رندرر TikZ به SVG
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
  }

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
    
    if (config.tikz?.libraries?.length > 0) {
      lines.push(`\\usetikzlibrary{${config.tikz.libraries.join(',')}}`);
    }
    
    const fontName = config.fonts?.main?.name || 'Vazirmatn';
    lines.push(`\\setmainfont{${fontName}}`);
    lines.push('');
    
    for (const [name, color] of Object.entries(config.colors || {})) {
      if (color.type === 'rgb' && color.r !== undefined) {
        lines.push(`\\definecolor{${name}}{RGB}{${color.r},${color.g},${color.b}}`);
      } else if (color.type === 'hex') {
        lines.push(`\\definecolor{${name}}{HTML}{${color.css.replace('#', '')}}`);
      }
    }
    
    lines.push('', '\\begin{document}', tikzCode, '\\end{document}');
    return lines.join('\n');
  }

  async render(tikzCode, config, options = {}) {
    const { name = 'diagram', forceRender = false } = options;
    
    const contentHash = crypto.createHash('md5')
      .update(tikzCode + JSON.stringify(config.colors || {}))
      .digest('hex').slice(0, 12);
    
    const outputName = `${name}-${contentHash}`;
    const svgPath = path.join(this.outputDir, `${outputName}.svg`);
    
    if (!forceRender) {
      try {
        await fs.access(svgPath);
        this.stats.cached++;
        console.log(`      ⚡ کش: ${outputName}`);
        return { success: true, path: svgPath, cached: true };
      } catch {}
    }
    
    await fs.mkdir(this.tempDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    
    const texContent = this.buildDynamicTemplate(tikzCode, config);
    const texFile = path.join(this.tempDir, `${outputName}.tex`);
    const pdfFile = path.join(this.tempDir, `${outputName}.pdf`);
    
    try {
      await fs.writeFile(texFile, texContent, 'utf-8');
      console.log(`      🔄 رندر: ${outputName}...`);
      
      const compileCmd = this.isWindows
        ? `cd /d "${this.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`
        : `cd "${this.tempDir}" && xelatex -interaction=nonstopmode -halt-on-error "${outputName}.tex"`;
      
      await execAsync(compileCmd, { timeout: 120000, shell: this.isWindows ? 'cmd.exe' : '/bin/sh' });
      await this.convertToSVG(pdfFile, svgPath);
      await this.optimizeSVG(svgPath, outputName);
      
      this.stats.rendered++;
      console.log(`      ✅ تولید: ${outputName}`);
      return { success: true, path: svgPath, cached: false };
      
    } catch (error) {
      this.stats.failed++;
      console.error(`      ❌ خطا: ${outputName} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async convertToSVG(pdfPath, svgPath) {
    if (this.isWindows) {
      await execAsync(`inkscape "${pdfPath}" --export-filename="${svgPath}" --export-type=svg`, { timeout: 60000 });
    } else {
      await execAsync(`pdf2svg "${pdfPath}" "${svgPath}"`);
    }
  }

  async optimizeSVG(svgPath, name) {
    let content = await fs.readFile(svgPath, 'utf-8');
    content = content
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace('<svg', `<svg class="tikz-diagram" id="${name}"`);
    await fs.writeFile(svgPath, content, 'utf-8');
  }

  getStats() { return { ...this.stats }; }
}

export default SmartRenderer;
```

---

## 📄 فایل ۴: `scripts/lib/pdf-extractor.mjs`

```javascript
/**
 * استخراج‌کننده محتوای PDF
 */

import fs from 'fs/promises';
import path from 'path';

export class PDFExtractor {
  constructor(options = {}) {
    this.imageOutputDir = options.imageOutputDir || 'public/images/extracted';
  }

  async extract(pdfPath, options = {}) {
    console.log(`   📄 استخراج PDF: ${path.basename(pdfPath)}`);
    
    const dataBuffer = await fs.readFile(pdfPath);
    
    let pdfParse;
    try {
      pdfParse = (await import('pdf-parse')).default;
    } catch {
      console.warn('   ⚠️ pdf-parse نصب نیست');
      return { metadata: {}, content: { text: '', structure: [] }, images: [], tables: [] };
    }
    
    const data = await pdfParse(dataBuffer);
    
    return {
      metadata: {
        title: data.info?.Title || null,
        author: data.info?.Author || null,
        pageCount: data.numpages
      },
      content: {
        text: data.text,
        structure: this.analyzeStructure(data.text)
      },
      images: [],
      tables: []
    };
  }

  analyzeStructure(text) {
    const structure = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      const heading = this.detectHeading(trimmed);
      if (heading) {
        structure.push({ type: 'heading', level: heading.level, text: heading.text });
      } else {
        structure.push({ type: 'paragraph', content: trimmed });
      }
    }
    
    return structure;
  }

  detectHeading(line) {
    const patterns = [
      { regex: /^فصل\s+[\u06F0-\u06F9۰-۹\d]+[:\s]+(.+)$/i, level: 1 },
      { regex: /^بخش\s+[\u06F0-\u06F9۰-۹\d]+[:\s]+(.+)$/i, level: 1 },
      { regex: /^Chapter\s+\d+[:\s]+(.+)$/i, level: 1 },
      { regex: /^\d+\.\s+(.+)$/, level: 2 },
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) return { level: pattern.level, text: match[1] || line };
    }
    return null;
  }

  async toMarkdown(pdfPath, options = {}) {
    const data = await this.extract(pdfPath, options);
    
    let markdown = '';
    if (data.metadata.title) markdown += `# ${data.metadata.title}\n\n`;
    
    for (const item of data.content.structure) {
      if (item.type === 'heading') {
        markdown += `${'#'.repeat(item.level + 1)} ${item.text}\n\n`;
      } else {
        markdown += `${item.content}\n\n`;
      }
    }
    
    return { markdown, metadata: data.metadata, images: data.images };
  }
}

export class WordExtractor {
  async extract(docxPath) {
    console.log(`   📝 استخراج Word: ${path.basename(docxPath)}`);
    
    let mammoth;
    try {
      mammoth = (await import('mammoth')).default;
    } catch {
      console.warn('   ⚠️ mammoth نصب نیست');
      return { markdown: '', html: '' };
    }
    
    const result = await mammoth.convertToHtml({ path: docxPath });
    const mdResult = await mammoth.extractRawText({ path: docxPath });
    
    return { html: result.value, markdown: mdResult.value };
  }
}

export class UniversalExtractor {
  constructor(options = {}) {
    this.pdfExtractor = new PDFExtractor(options);
    this.wordExtractor = new WordExtractor();
  }

  async extract(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') return this.pdfExtractor.toMarkdown(filePath, options);
    if (ext === '.docx' || ext === '.doc') return this.wordExtractor.extract(filePath);
    
    throw new Error(`فرمت پشتیبانی نمی‌شود: ${ext}`);
  }
}

export default PDFExtractor;
```

---

## 📄 فایل ۵: `scripts/lib/ai-tagger.mjs`

```javascript
/**
 * تگ‌گذاری با AI
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai',
  cacheDir: '.content-cache/ai',
  cacheEnabled: true
};

class AIProvider {
  constructor(providerName) {
    this.providerName = providerName;
    this.client = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    if (this.providerName === 'openai' && process.env.OPENAI_API_KEY) {
      const OpenAI = (await import('openai')).default;
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else if (this.providerName === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    
    this.initialized = true;
  }

  async complete(prompt, options = {}) {
    await this.initialize();
    if (!this.client) return null;
    
    try {
      if (this.providerName === 'openai') {
        const response = await this.client.chat.completions.create({
          model: options.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: options.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.3
        });
        return response.choices[0].message.content;
      } else if (this.providerName === 'anthropic') {
        const response = await this.client.messages.create({
          model: options.model || 'claude-sonnet-4-20250514',
          max_tokens: options.maxTokens || 2000,
          system: options.systemPrompt || 'You are a helpful assistant.',
          messages: [{ role: 'user', content: prompt }]
        });
        return response.content[0].text;
      }
    } catch (error) {
      console.error(`   ⚠️ خطای AI: ${error.message}`);
      return null;
    }
  }
}

export class AITagger {
  constructor(options = {}) {
    this.provider = new AIProvider(options.provider || CONFIG.provider);
    this.cacheEnabled = options.cacheEnabled ?? CONFIG.cacheEnabled;
    this.cacheDir = options.cacheDir || CONFIG.cacheDir;
    this.stats = { processed: 0, cached: 0, failed: 0 };
  }

  async analyze(content, options = {}) {
    const { title, forceRefresh = false, lang = 'fa' } = options;
    
    const cacheKey = this.getCacheKey(content, title);
    if (this.cacheEnabled && !forceRefresh) {
      const cached = await this.getFromCache(cacheKey);
      if (cached) { this.stats.cached++; return cached; }
    }
    
    console.log(`   🤖 تحلیل AI...`);
    
    try {
      const result = await this.performAnalysis(content, title, lang);
      if (this.cacheEnabled && result) await this.saveToCache(cacheKey, result);
      this.stats.processed++;
      return result;
    } catch (error) {
      this.stats.failed++;
      return this.getDefaultResult(title, lang);
    }
  }

  async performAnalysis(content, title, lang) {
    const prompt = this.buildPrompt(title, content.slice(0, 4000), lang);
    const response = await this.provider.complete(prompt, {
      systemPrompt: this.getSystemPrompt(lang),
      temperature: 0.3
    });
    
    if (!response) return this.getDefaultResult(title, lang);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return this.validateResult(JSON.parse(jsonMatch[0]), lang);
    } catch {}
    
    return this.getDefaultResult(title, lang);
  }

  getSystemPrompt(lang) {
    return lang === 'fa'
      ? 'تو یک سیستم تحلیل محتوای فارسی هستی. همیشه JSON معتبر برگردان.'
      : 'You are a content analysis system. Always return valid JSON.';
  }

  buildPrompt(title, content, lang) {
    if (lang === 'fa') {
      return `عنوان: ${title || 'بدون عنوان'}\n\nمتن:\n${content}\n\n---\n\nJSON با این ساختار برگردان:\n{"tags":["تگ۱","تگ۲"],"category":{"primary":"دسته","secondary":[]},"summary":"خلاصه","description":"توضیح","keywords":["کلید۱"],"readingTime":5,"difficulty":"متوسط"}`;
    }
    return `Title: ${title || 'Untitled'}\n\nContent:\n${content}\n\n---\n\nReturn JSON: {"tags":["tag1"],"category":{"primary":"cat","secondary":[]},"summary":"summary","description":"desc","keywords":["key"],"readingTime":5,"difficulty":"intermediate"}`;
  }

  validateResult(result, lang) {
    return {
      tags: Array.isArray(result.tags) ? result.tags.slice(0, 10) : [],
      category: result.category || { primary: lang === 'fa' ? 'متفرقه' : 'Misc', secondary: [] },
      summary: result.summary || '',
      description: result.description || '',
      keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 10) : [],
      readingTime: typeof result.readingTime === 'number' ? result.readingTime : 5,
      difficulty: result.difficulty || (lang === 'fa' ? 'متوسط' : 'intermediate'),
      _analyzed: new Date().toISOString()
    };
  }

  getDefaultResult(title, lang) {
    return {
      tags: [],
      category: { primary: lang === 'fa' ? 'متفرقه' : 'Misc', secondary: [] },
      summary: '',
      description: '',
      keywords: title ? title.split(/\s+/).slice(0, 5) : [],
      readingTime: 5,
      difficulty: lang === 'fa' ? 'متوسط' : 'intermediate',
      _analyzed: new Date().toISOString(),
      _fallback: true
    };
  }

  getCacheKey(content, title) {
    return crypto.createHash('md5').update(content.slice(0, 1000) + (title || '')).digest('hex');
  }

  async getFromCache(key) {
    try {
      const data = await fs.readFile(path.join(this.cacheDir, `${key}.json`), 'utf-8');
      return JSON.parse(data);
    } catch { return null; }
  }

  async saveToCache(key, data) {
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.writeFile(path.join(this.cacheDir, `${key}.json`), JSON.stringify(data, null, 2));
  }

  getStats() { return { ...this.stats }; }
}

export default AITagger;
```

---

## 📄 فایل ۶: `scripts/color-definitions.tex`

```latex
% رنگ‌های پیش‌فرض پروژه
\usepackage{xcolor}

\definecolor{bleurepublique}{RGB}{26, 115, 232}
\definecolor{bleulight}{RGB}{232, 244, 248}
\definecolor{vertnapoleon}{RGB}{52, 168, 83}
\definecolor{vertlight}{RGB}{232, 248, 237}
\definecolor{violetempire}{RGB}{142, 68, 173}
\definecolor{violetlight}{RGB}{245, 238, 248}
\definecolor{rougerevolution}{RGB}{234, 67, 53}
\definecolor{rougelight}{RGB}{252, 237, 236}
\definecolor{orroyal}{RGB}{251, 188, 4}
\definecolor{orroyaldark}{RGB}{230, 150, 0}
\definecolor{gris}{RGB}{95, 99, 104}
\definecolor{grisclair}{RGB}{218, 220, 224}
\definecolor{grislight}{RGB}{248, 249, 250}
\definecolor{scenario1}{RGB}{66, 133, 244}
\definecolor{scenario2}{RGB}{52, 168, 83}
\definecolor{scenario3}{RGB}{251, 188, 4}
\definecolor{scenario4}{RGB}{234, 67, 53}
```

---

## 📄 فایل ۷: `scripts/process-content.mjs`

```javascript
#!/usr/bin/env node
/**
 * سیستم جامع پردازش محتوا
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// تلاش برای import کتابخانه‌ها
let globby, matter;
try {
  globby = (await import('globby')).globby;
  matter = (await import('gray-matter')).default;
} catch {
  console.error('❌ لطفاً وابستگی‌ها را نصب کنید: npm install');
  process.exit(1);
}

import { PreambleParser } from './lib/preamble-parser.mjs';
import { StyleGenerator } from './lib/style-generator.mjs';
import { SmartRenderer } from './lib/smart-renderer.mjs';
import { PDFExtractor, UniversalExtractor } from './lib/pdf-extractor.mjs';
import { AITagger } from './lib/ai-tagger.mjs';

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
  
  supportedFormats: {
    latex: ['.tex'],
    markdown: ['.md', '.mdx'],
    pdf: ['.pdf'],
    word: ['.docx', '.doc']
  },
  
  ai: {
    enabled: process.env.AI_ENABLED !== 'false',
    provider: process.env.AI_PROVIDER || 'openai'
  }
};

// ═══════════════════════════════════════════════════════════════
// کلاس ContentPipeline
// ═══════════════════════════════════════════════════════════════

export class ContentPipeline {
  constructor(options = {}) {
    this.parser = new PreambleParser();
    this.styleGen = new StyleGenerator(CONFIG.stylesDir);
    this.renderer = new SmartRenderer({
      outputDir: CONFIG.diagramsDir,
      cacheDir: CONFIG.cacheDir
    });
    this.pdfExtractor = new PDFExtractor({ imageOutputDir: CONFIG.imagesDir });
    this.universalExtractor = new UniversalExtractor();
    
    this.aiEnabled = options.aiEnabled ?? CONFIG.ai.enabled;
    if (this.aiEnabled) {
      this.aiTagger = new AITagger({ provider: options.aiProvider || CONFIG.ai.provider });
    }
    
    this.configCache = new Map();
    this.stats = { latex: 0, markdown: 0, pdf: 0, word: 0, aiTagged: 0, errors: 0 };
  }

  async processFile(filePath, options = {}) {
    const ext = path.extname(filePath).toLowerCase();
    const { lang = this.detectLanguage(filePath) } = options;
    
    console.log(`\n📄 پردازش: ${path.basename(filePath)}`);
    
    try {
      let result;
      
      if (CONFIG.supportedFormats.latex.includes(ext)) {
        result = await this.processLaTeX(filePath, options);
        this.stats.latex++;
      } else if (CONFIG.supportedFormats.markdown.includes(ext)) {
        result = await this.processMarkdown(filePath, options);
        this.stats.markdown++;
      } else if (CONFIG.supportedFormats.pdf.includes(ext)) {
        result = await this.processPDF(filePath, options);
        this.stats.pdf++;
      } else if (CONFIG.supportedFormats.word.includes(ext)) {
        result = await this.processWord(filePath, options);
        this.stats.word++;
      } else {
        throw new Error(`فرمت پشتیبانی نمی‌شود: ${ext}`);
      }
      
      if (this.aiEnabled && result) {
        result = await this.enrichWithAI(result, lang);
        this.stats.aiTagged++;
      }
      
      return result;
      
    } catch (error) {
      this.stats.errors++;
      console.error(`   ❌ خطا: ${error.message}`);
      throw error;
    }
  }

  async processLaTeX(filePath, options = {}) {
    const { bookSlug, chapterNumber, config } = options;
    
    let content = await fs.readFile(filePath, 'utf-8');
    const finalConfig = config || await this.parser.getDefaultConfig();
    
    const prefix = bookSlug ? `${bookSlug}-ch${chapterNumber || 0}` : path.basename(filePath, '.tex');
    content = await this.processAllDiagrams(content, finalConfig, prefix);
    content = this.preProcessLaTeX(content);
    
    const markdown = await this.convertWithPandoc(content);
    const title = this.extractTitle(markdown) || path.basename(filePath, '.tex');
    
    return { type: 'latex', source: filePath, title, content: markdown, metadata: { bookSlug, chapterNumber } };
  }

  async processMarkdown(filePath, options = {}) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(content);
    const title = frontmatter.title || this.extractTitle(body) || path.basename(filePath, '.md');
    
    return { type: 'markdown', source: filePath, title, content: body, frontmatter, metadata: {} };
  }

  async processPDF(filePath, options = {}) {
    console.log(`   📄 استخراج از PDF...`);
    const extracted = await this.pdfExtractor.toMarkdown(filePath, options);
    const title = extracted.metadata?.title || path.basename(filePath, '.pdf');
    
    return { type: 'pdf', source: filePath, title, content: extracted.markdown, pdfMetadata: extracted.metadata, metadata: {} };
  }

  async processWord(filePath, options = {}) {
    console.log(`   📝 استخراج از Word...`);
    const extracted = await this.universalExtractor.extract(filePath);
    const title = this.extractTitle(extracted.markdown) || path.basename(filePath, '.docx');
    
    return { type: 'word', source: filePath, title, content: extracted.markdown, metadata: {} };
  }

  async enrichWithAI(result, lang = 'fa') {
    if (!this.aiTagger) return result;
    console.log(`   🤖 تحلیل AI...`);
    const aiResult = await this.aiTagger.analyze(result.content, { title: result.title, lang });
    return { ...result, ai: aiResult };
  }

  async processAllDiagrams(content, config, prefix) {
    const tikzRegex = /\\begin\{tikzpicture\}(\[[\s\S]*?\])?([\s\S]*?)\\end\{tikzpicture\}/g;
    const matches = [...content.matchAll(tikzRegex)];
    
    if (matches.length > 0) console.log(`   📊 نمودارها: ${matches.length}`);
    
    let counter = 0;
    for (const match of matches) {
      counter++;
      const tikzCode = match[0];
      const name = `${prefix}-${counter}`;
      
      const result = await this.renderer.render(tikzCode, config, { name });
      
      if (result.success) {
        const relativePath = `/diagrams/${path.basename(result.path)}`;
        content = content.replace(tikzCode, `\n\n![نمودار ${counter}](${relativePath}){.tikz-diagram}\n\n`);
      } else {
        content = content.replace(tikzCode, `\n\n<!-- DIAGRAM_ERROR: ${name} -->\n\n`);
      }
    }
    
    return content;
  }

  preProcessLaTeX(content) {
    return content
      .replace(/\\begin\{tcolorbox\}\[([^\]]*title=\{([^}]*)\}[^\]]*)\]([\s\S]*?)\\end\{tcolorbox\}/g,
        (_, opts, title, body) => `\n\n> **${title}**\n> ${body.trim().replace(/\n/g, '\n> ')}\n\n`)
      .replace(/\\renewcommand\{[^}]*\}\{[^}]*\}/g, '')
      .replace(/\\setcounter\{[^}]*\}\{[^}]*\}/g, '');
  }

  async convertWithPandoc(content) {
    const tempDir = path.join(CONFIG.cacheDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `input-${timestamp}.tex`);
    const outputFile = path.join(tempDir, `output-${timestamp}.md`);
    
    await fs.writeFile(inputFile, content, 'utf-8');
    await execAsync(`pandoc "${inputFile}" -o "${outputFile}" --wrap=none --columns=1000`, { timeout: 60000 });
    
    const result = await fs.readFile(outputFile, 'utf-8');
    
    await fs.unlink(inputFile).catch(() => {});
    await fs.unlink(outputFile).catch(() => {});
    
    return this.postProcessMarkdown(result);
  }

  postProcessMarkdown(markdown) {
    return markdown
      .replace(/\[node distance[\s\S]*?(?=\n\n|\n#|$)/g, '')
      .replace(/\\node[\s\S]*?;/g, '')
      .replace(/\\draw[\s\S]*?;/g, '')
      .replace(/\[.*?\]\s*\(.*?\)\s*\{[\s\S]*?\};?/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  extractTitle(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  detectLanguage(filePath) {
    return (filePath.includes('/en/') || filePath.includes('\\en\\')) ? 'en' : 'fa';
  }

  buildFrontmatter(result) {
    const fm = {
      title: result.title,
      description: result.ai?.description || result.ai?.summary?.slice(0, 160) || '',
      lang: result.metadata?.lang || 'fa',
      publishDate: new Date().toISOString().split('T')[0],
      sourceType: result.type
    };
    
    if (result.ai) {
      if (result.ai.tags?.length) fm.tags = result.ai.tags;
      if (result.ai.category?.primary) fm.category = result.ai.category.primary;
      if (result.ai.keywords?.length) fm.keywords = result.ai.keywords;
      if (result.ai.readingTime) fm.readingTime = result.ai.readingTime;
      if (result.ai.difficulty) fm.difficulty = result.ai.difficulty;
      if (result.ai.summary) fm.summary = result.ai.summary;
    }
    
    if (result.metadata?.bookSlug) fm.book = result.metadata.bookSlug;
    if (result.metadata?.chapterNumber) fm.chapterNumber = result.metadata.chapterNumber;
    
    return fm;
  }

  stringifyYaml(obj) {
    const lines = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        lines.push(`${key}:`);
        value.forEach(item => lines.push(`  - "${String(item).replace(/"/g, '\\"')}"`));
      } else if (typeof value === 'string') {
        lines.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
      } else {
        lines.push(`${key}: ${value}`);
      }
    }
    return lines.join('\n');
  }

  async saveResult(result, outputDir, customFileName = null) {
    await fs.mkdir(outputDir, { recursive: true });
    
    const frontmatter = this.buildFrontmatter(result);
    const finalContent = `---\n${this.stringifyYaml(frontmatter)}\n---\n\n${result.content}`;
    
    const baseName = customFileName || path.basename(result.source, path.extname(result.source));
    const outputPath = path.join(outputDir, `${baseName}.md`);
    
    await fs.writeFile(outputPath, finalContent, 'utf-8');
    console.log(`   💾 ذخیره: ${path.basename(outputPath)}`);
    
    return outputPath;
  }

  async findChapters(bookDir) {
    const patterns = [
      path.join(bookDir, 'chapters', '*.tex'),
      path.join(bookDir, 'ch*.tex'),
      path.join(bookDir, 'chapter*.tex'),
    ];
    
    let chapters = await globby(patterns);
    chapters = chapters.filter(f => {
      const name = path.basename(f).toLowerCase();
      return !['main.tex', 'book.tex', 'index.tex', 'preamble.tex'].includes(name);
    });
    
    chapters.sort((a, b) => {
      const numA = parseInt(path.basename(a).match(/\d+/)?.[0] || '0');
      const numB = parseInt(path.basename(b).match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
    
    return chapters;
  }

  async processBook(bookDir, options = {}) {
    const bookSlug = options.slug || path.basename(bookDir);
    const lang = options.lang || this.detectLanguage(bookDir) || 'fa';
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📚 کتاب: ${bookSlug}`);
    console.log(`${'═'.repeat(60)}`);
    
    let config;
    try {
      config = await this.parser.analyzeProject(bookDir);
      this.configCache.set(bookSlug, config);
      await this.styleGen.generateCSS(config, bookSlug);
    } catch {
      config = await this.parser.getDefaultConfig();
    }
    
    const chapters = await this.findChapters(bookDir);
    console.log(`   📑 فصل‌ها: ${chapters.length}`);
    
    const outputDir = path.join(CONFIG.outputDir, 'books', lang, bookSlug);
    await fs.mkdir(outputDir, { recursive: true });
    
    for (let i = 0; i < chapters.length; i++) {
      const chapterPath = chapters[i];
      const chapterNumber = i + 1;
      
      try {
        const result = await this.processFile(chapterPath, { bookSlug, chapterNumber, config, lang });
        
        if (result) {
          const baseName = path.basename(chapterPath, '.tex');
          const outputFileName = `ch${String(chapterNumber).padStart(2, '0')}-${baseName}`;
          await this.saveResult({ ...result, metadata: { ...result.metadata, bookSlug, chapterNumber, lang } }, outputDir, outputFileName);
        }
      } catch (error) {
        console.error(`   ❌ فصل ${chapterNumber}: ${error.message}`);
      }
    }
    
    await this.generateBookIndex(bookSlug, chapters, outputDir, lang);
    console.log(`   ✅ کتاب ${bookSlug} کامل شد!`);
  }

  async generateBookIndex(bookSlug, chapters, outputDir, lang) {
    const content = `---
title: "${bookSlug}"
description: "فهرست فصول"
lang: ${lang}
type: book-index
---

# فهرست فصول

${chapters.map((ch, i) => {
  const baseName = path.basename(ch, '.tex');
  const num = i + 1;
  return `${num}. [فصل ${num}](./ch${String(num).padStart(2, '0')}-${baseName})`;
}).join('\n')}
`;
    await fs.writeFile(path.join(outputDir, 'index.md'), content, 'utf-8');
  }

  async processAll(options = {}) {
    console.log('🚀 شروع پردازش همه محتوا...\n');
    
    // پردازش کتاب‌ها
    const bookDirs = await globby(`${CONFIG.sourceDir}/books/*`, { onlyDirectories: true });
    console.log(`📚 کتاب‌ها: ${bookDirs.length}`);
    
    for (const bookDir of bookDirs) {
      try {
        await this.processBook(bookDir, options);
      } catch (error) {
        console.error(`❌ خطا در ${path.basename(bookDir)}: ${error.message}`);
      }
    }
    
    // پردازش مقالات
    const articlePatterns = Object.values(CONFIG.supportedFormats).flat().map(ext => `${CONFIG.sourceDir}/articles/**/*${ext}`);
    const articleFiles = await globby(articlePatterns);
    console.log(`\n📄 مقالات: ${articleFiles.length}`);
    
    for (const file of articleFiles) {
      const lang = this.detectLanguage(file);
      const outputDir = path.join(CONFIG.outputDir, 'articles', lang);
      
      try {
        const result = await this.processFile(file, { lang });
        if (result) await this.saveResult({ ...result, metadata: { ...result.metadata, lang } }, outputDir);
      } catch (error) {
        console.error(`❌ خطا در ${path.basename(file)}: ${error.message}`);
      }
    }
    
    this.printFinalReport();
    return this.stats;
  }

  printFinalReport() {
    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 گزارش نهایی');
    console.log('═'.repeat(60));
    console.log(`   📄 LaTeX: ${this.stats.latex}`);
    console.log(`   📝 Markdown: ${this.stats.markdown}`);
    console.log(`   📑 PDF: ${this.stats.pdf}`);
    console.log(`   📃 Word: ${this.stats.word}`);
    console.log(`   🤖 AI: ${this.stats.aiTagged}`);
    console.log(`   ❌ خطا: ${this.stats.errors}`);
    console.log('═'.repeat(60) + '\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    aiEnabled: !args.includes('--no-ai'),
    aiProvider: args.find(a => a.startsWith('--ai-provider='))?.split('=')[1],
    lang: args.find(a => a.startsWith('--lang='))?.split('=')[1] || 'fa',
    slug: args.find(a => a.startsWith('--slug='))?.split('=')[1]
  };
  
  const pipeline = new ContentPipeline(options);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📘 Content Pipeline

دستورات:
  node scripts/process-content.mjs --all              پردازش همه
  node scripts/process-content.mjs --book <path>      پردازش کتاب
  node scripts/process-content.mjs --file <path>      پردازش فایل

گزینه‌ها:
  --no-ai              غیرفعال کردن AI
  --lang=fa|en         زبان
  --slug=name          نام کتاب
`);
    return;
  }
  
  if (args.includes('--all') || args.length === 0) {
    await pipeline.processAll(options);
  } else if (args.includes('--book')) {
    const bookDir = args[args.indexOf('--book') + 1];
    if (bookDir) await pipeline.processBook(bookDir, options);
  } else if (args.includes('--file')) {
    const filePath = args[args.indexOf('--file') + 1];
    const outputDir = args.find(a => a.startsWith('--output='))?.split('=')[1] || `src/content/articles/${options.lang}`;
    if (filePath) {
      const result = await pipeline.processFile(filePath, options);
      if (result) await pipeline.saveResult(result, outputDir);
    }
  } else if (args[0] && !args[0].startsWith('--')) {
    const result = await pipeline.processFile(args[0], options);
    const outputDir = args[1] || `src/content/articles/${options.lang}`;
    if (result) await pipeline.saveResult(result, outputDir);
  }
}

main().catch(error => {
  console.error('❌ خطا:', error);
  process.exit(1);
});

export { ContentPipeline };
```

---

## 📄 فایل ۸: `scripts/watch-content.mjs`

```javascript
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
```

---

## 📄 فایل ۹: به‌روزرسانی `package.json`

این بخش را به `package.json` موجود **اضافه** کنید:

```json
{
  "scripts": {
    "content:all": "node scripts/process-content.mjs --all",
    "content:book": "node scripts/process-content.mjs --book",
    "content:file": "node scripts/process-content.mjs --file",
    "content:watch": "node scripts/watch-content.mjs",
    "content:watch:no-ai": "node scripts/watch-content.mjs --no-ai",
    "dev:watch": "npm-run-all --parallel dev content:watch",
    "build": "npm run content:all && astro build"
  },
  "devDependencies": {
    "chokidar": "^3.6.0",
    "globby": "^14.0.0",
    "gray-matter": "^4.0.3",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "sharp": "^0.33.0",
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.10.0",
    "npm-run-all": "^4.1.5",
    "rimraf": "^5.0.5"
  }
}
```

---

## 📄 فایل ۱۰: `.env.example`

```env
# AI Settings
AI_ENABLED=true
AI_PROVIDER=openai

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxx

# Anthropic Claude (https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

---

## 📄 فایل ۱۱: به‌روزرسانی `.gitignore`

این خطوط را اضافه کنید:

```gitignore
# Content Pipeline Cache
.content-cache/

# Environment
.env
.env.local

# Generated (اختیاری - اگر می‌خواهید در git نباشند)
# public/diagrams/
# src/styles/book-themes/
```

---

## ✅ چک‌لیست نهایی برای Augment

```
☐ پوشه content-source/books/ ایجاد شد
☐ پوشه content-source/articles/ ایجاد شد  
☐ پوشه scripts/lib/ ایجاد شد
☐ پوشه public/diagrams/ ایجاد شد
☐ پوشه src/styles/book-themes/ ایجاد شد

☐ scripts/lib/preamble-parser.mjs ایجاد شد
☐ scripts/lib/style-generator.mjs ایجاد شد
☐ scripts/lib/smart-renderer.mjs ایجاد شد
☐ scripts/lib/pdf-extractor.mjs ایجاد شد
☐ scripts/lib/ai-tagger.mjs ایجاد شد
☐ scripts/process-content.mjs ایجاد شد
☐ scripts/watch-content.mjs ایجاد شد
☐ scripts/color-definitions.tex ایجاد شد

☐ package.json به‌روز شد (scripts + devDependencies)
☐ .env.example ایجاد شد
☐ .gitignore به‌روز شد

☐ npm install اجرا شد
☐ تست: npm run content:all
```

---

## 🚀 دستورات پس از یکپارچه‌سازی

```powershell
# نصب وابستگی‌ها
npm install

# تست پردازش همه محتوا
npm run content:all

# اجرای Watch + Astro همزمان
npm run dev:watch
```

---

