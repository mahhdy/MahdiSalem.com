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
      setMainFont: /\\setmainfont(?:$$([^$$]*)\])?\{([^}]+)\}/g,
      setFont: /\\set(\w+)font(?:$$([^$$]*)\])?\{([^}]+)\}/g,
      newFontFamily: /\\newfontfamily\\(\w+)(?:$$([^$$]*)\])?\{([^}]+)\}/g,
      tikzLibrary: /\\usetikzlibrary\{([^}]+)\}/g,
      pgfplotsLibrary: /\\usepgfplotslibrary\{([^}]+)\}/g,
      tikzStyle: /\\tikzstyle\{(\w+)\}\s*=\s*$$([^$$]+)\]/g,
      tikzSet: /\\tikzset\{([^}]+)\}/g,
      usePackage: /\\usepackage(?:$$([^$$]*)\])?\{([^}]+)\}/g,
      newCommand: /\\newcommand\{\\(\w+)\}(?:$$(\d+)$$)?\{([^}]+)\}/g,
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
      } catch { }
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
    } catch { }
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

  /**
   * ✅ نسخه اصلاح‌شده parseColor
   */
  parseColor(model, spec) {
    const modelLower = model.toLowerCase();
    const values = spec.split(',').map(v => parseFloat(v.trim()));

    // RGB با حروف بزرگ = مقادیر 0-255
    if (model === 'RGB') {
      const r = this.clampRGB(values[0]);
      const g = this.clampRGB(values[1]);
      const b = this.clampRGB(values[2]);
      return {
        type: 'rgb',
        r, g, b,
        css: `rgb(${r}, ${g}, ${b})`
      };
    }

    // rgb با حروف کوچک = مقادیر 0-1
    if (modelLower === 'rgb') {
      // بررسی اینکه مقادیر واقعاً بین 0-1 هستند
      const isNormalized = values.every(v => v >= 0 && v <= 1);

      let r, g, b;
      if (isNormalized) {
        // مقادیر 0-1، تبدیل به 0-255
        r = this.clampRGB(Math.round(values[0] * 255));
        g = this.clampRGB(Math.round(values[1] * 255));
        b = this.clampRGB(Math.round(values[2] * 255));
      } else {
        // مقادیر از قبل 0-255 هستند (اشتباه تعریف شده در LaTeX)
        r = this.clampRGB(Math.round(values[0]));
        g = this.clampRGB(Math.round(values[1]));
        b = this.clampRGB(Math.round(values[2]));
      }

      return {
        type: 'rgb',
        r, g, b,
        css: `rgb(${r}, ${g}, ${b})`
      };
    }

    // HTML/hex
    if (modelLower === 'html' || modelLower === 'hex') {
      const hex = spec.replace('#', '').toUpperCase();
      // تبدیل hex به RGB برای استفاده در LaTeX
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return {
        type: 'hex',
        r, g, b,
        hex: hex,
        css: `#${hex}`
      };
    }

    // gray
    if (modelLower === 'gray') {
      const gray = this.clampRGB(Math.round(values[0] * 255));
      return {
        type: 'rgb',
        r: gray, g: gray, b: gray,
        css: `rgb(${gray}, ${gray}, ${gray})`
      };
    }

    // named colors
    return { type: 'named', name: spec, css: spec };
  }

  /**
   * محدود کردن مقدار به 0-255
   */
  clampRGB(value) {
    if (isNaN(value)) return 0;
    return Math.min(255, Math.max(0, Math.round(value)));
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
        bleurepublique: { type: 'rgb', r: 0, g: 85, b: 164, css: 'rgb(0, 85, 164)' },
        rougerevolution: { type: 'rgb', r: 190, g: 30, b: 45, css: 'rgb(190, 30, 45)' },
        orroyal: { type: 'rgb', r: 218, g: 165, b: 32, css: 'rgb(218, 165, 32)' },
        vertnapoleon: { type: 'rgb', r: 0, g: 102, b: 51, css: 'rgb(0, 102, 51)' },
        violetempire: { type: 'rgb', r: 102, g: 51, b: 153, css: 'rgb(102, 51, 153)' },
        gris: { type: 'rgb', r: 128, g: 128, b: 128, css: 'rgb(128, 128, 128)' },
        grisclair: { type: 'rgb', r: 220, g: 220, b: 220, css: 'rgb(220, 220, 220)' },
        grislight: { type: 'rgb', r: 245, g: 245, b: 245, css: 'rgb(245, 245, 245)' },
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