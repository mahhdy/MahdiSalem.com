#!/usr/bin/env node
/**
 * convert-html-to-mdx.mjs — v3.0 FINAL
 *
 * Standalone HTML → MDX converter for Astro sites
 * Integrates with existing MermaidProcessor pipeline
 *
 * Usage:
 *   node convert-html-to-mdx.mjs input.html [-o output.mdx]
 *   node convert-html-to-mdx.mjs --batch ./html-dir/ [-o ./mdx-dir/]
 *   node convert-html-to-mdx.mjs input.html --fm custom-frontmatter.yaml
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { dirname, basename, resolve, join, extname } from 'path';

// Try to import MermaidProcessor if available
let MermaidProcessor;
try {
  const mod = await import('./lib/mermaid-processor.mjs');
  MermaidProcessor = mod.MermaidProcessor;
} catch {
  // Standalone mode — use built-in fixes
  MermaidProcessor = null;
}

// ═══════════════════════════════════════════════
// ENTITY MAP — Comprehensive
// ═══════════════════════════════════════════════

const ENTITIES = {
  '&hellip;': '…', '&mdash;': '—', '&ndash;': '–', '&laquo;': '«', '&raquo;': '»',
  '&bull;': '•', '&middot;': '·', '&ldquo;': '\u201C', '&rdquo;': '\u201D',
  '&lsquo;': '\u2018', '&rsquo;': '\u2019',
  '&nbsp;': '\u00A0', '&zwnj;': '\u200C', '&zwj;': '\u200D',
  '&thinsp;': '\u2009', '&ensp;': '\u2002', '&emsp;': '\u2003',
  '&rarr;': '→', '&larr;': '←', '&darr;': '↓', '&uarr;': '↑', '&harr;': '↔',
  '&eacute;': 'é', '&Eacute;': 'É', '&egrave;': 'è', '&Egrave;': 'È',
  '&ecirc;': 'ê', '&Ecirc;': 'Ê', '&euml;': 'ë',
  '&aacute;': 'á', '&agrave;': 'à', '&acirc;': 'â', '&auml;': 'ä', '&Auml;': 'Ä',
  '&ouml;': 'ö', '&Ouml;': 'Ö', '&uuml;': 'ü', '&Uuml;': 'Ü',
  '&icirc;': 'î', '&ccedil;': 'ç', '&scaron;': 'š', '&szlig;': 'ß',
  '&oslash;': 'ø', '&Oslash;': 'Ø', '&aring;': 'å', '&Aring;': 'Å',
  '&aelig;': 'æ', '&AElig;': 'Æ', '&ntilde;': 'ñ',
  '&times;': '×', '&divide;': '÷', '&copy;': '©', '&reg;': '®',
  '&trade;': '™', '&deg;': '°', '&para;': '¶', '&sect;': '§',
  '&amp;': '&',
};

function decode(text) {
  let r = text;
  for (const [e, c] of Object.entries(ENTITIES)) {
    if (e === '&amp;') continue;
    r = r.replaceAll(e, c);
  }
  r = r.replace(/&#(\d+);/g, (_, c) => {
    try { return String.fromCodePoint(+c); } catch { return `&#${c};`; }
  });
  r = r.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
    try { return String.fromCodePoint(parseInt(h, 16)); } catch { return `&#x${h};`; }
  });
  r = r.replace(/&amp;(?!#?\w+;)/g, '&');
  return r;
}

// ═══════════════════════════════════════════════
// MERMAID FIXES (built-in, in case MermaidProcessor unavailable)
// ═══════════════════════════════════════════════

function fixMermaid(code) {
  const type = detectType(code);

  // Strip :::className
  if (type === 'mindmap') {
    code = code.replace(/:::[\w-]+/g, '');
    code = code.replace(/^(\s{2,}\S.*?)\s+=\s+(.*)$/gm, '\$1 as \$2');
    code = code.replace(/^(\s{2,}.*),\s+(\d{4})\s*$/gm, '\$1 \$2');
  }

  // \n → <br/> in flowchart nodes
  if (type === 'flowchart' || type === 'graph') {
    code = code.replace(/$$"([^"]*?)"$$/g, m => m.replace(/\\n/g, '<br/>'));
    code = code.replace(/$$([^$$"]*?\\n[^\]]*?)\]/g, m => m.replace(/\\n/g, '<br/>'));
  }

  return code;
}

function detectType(code) {
  const c = code.trim().replace(/^%%\{[\s\S]*?\}%%\s*/m, '');
  const fl = (c.split('\n').find(l => l.trim()) || '').trim().toLowerCase();
  if (fl.startsWith('mindmap')) return 'mindmap';
  if (fl.startsWith('flowchart')) return 'flowchart';
  if (fl.startsWith('graph')) return 'graph';
  if (fl.startsWith('timeline')) return 'timeline';
  if (fl.startsWith('quadrantchart')) return 'quadrantChart';
  if (fl.startsWith('gantt')) return 'gantt';
  if (fl.startsWith('pie')) return 'pie';
  return 'other';
}

// ═══════════════════════════════════════════════
// CONVERSION PIPELINE
// ═══════════════════════════════════════════════
// UPDATE the main pipeline in convertHTML() function
// Add the missing steps in the correct order:

function convertHTML(html, opts = {}) {
  let c = html;

  // 1. Extract body
  const bm = c.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bm) c = bm[1];

  // 2. Extract frontmatter
  const fm = opts.frontmatter || extractFM(c, opts.filename);

  // 3. Strip boilerplate
  c = c.replace(/<header\s+class="page-header">[\s\S]*?<\/header>/gi, '');
  c = c.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  c = c.replace(/<style[\s\S]*?<\/style>/gi, '');
  c = c.replace(/<script[\s\S]*?<\/script>/gi, '');
  c = c.replace(/<main[^>]*>/gi, '');
  c = c.replace(/<\/main>/gi, '');

  // 4. Strip ALL comments
  c = c.replace(/<!--[\s\S]*?-->/g, '');
  c = stripCSSComments(c);                   // ← NEW

  // 5. Convert Mermaid (BEFORE entity decode)
  c = convertMermaidBlocks(c);

  // 6. Collapse split tags                   // ← NEW
  c = collapseSplitTags(c);

  // 7. Convert headings
  c = convertHeadings(c);

  // 8. Fix self-closing tags
  c = c.replace(/<br\s*>/gi, '<br/>');
  c = c.replace(/<br\s+\/>/gi, '<br/>');
  c = c.replace(/<hr\s*>/gi, '<hr/>');
  c = c.replace(/<hr\s+\/>/gi, '<hr/>');
  c = c.replace(/<img\s+([^>]*?)(?<!\/)>/gi, '<img \$1 />');

  // 9. Remove empty wrappers                 // ← NEW
  c = removeEmptyWrappers(c);

  // 10. Map CSS classes to site equivalents   // ← NEW
  c = mapCSSClasses(c);

  // 11. Convert standalone formatting         // ← NEW
  c = convertInlineFormatting(c);

  // 12. Decode entities (selective)
  c = decodeSelective(c);

  // 13. Clean whitespace
  c = c.replace(/\n{4,}/g, '\n\n\n');
  c = c.split('\n').map(l => l.trimEnd()).join('\n');
  c = c.trim() + '\n';

  // 14. Assemble with frontmatter
  const fmStr = typeof fm === 'string' ? fm : buildFullFrontmatter(fm);
  return fmStr + '\n\n' + c;
}

function extractFM(html, filename = '') {
  const fm = {
    title: '', description: '', lang: 'fa', dir: 'rtl',
    publishDate: new Date().toISOString().split('T')[0],
    author: '', categories: [], tags: [], draft: true,
  };
  const hm = html.match(/<header\s+class="page-header">([\s\S]*?)<\/header>/i);
  if (hm) {
    const h = hm[1];
    const h1 = h.match(/<h1>([\s\S]*?)<\/h1>/i);
    if (h1) fm.title = decode(h1[1].replace(/<[^>]*>/g, '').trim());
    const sub = h.match(/class="subtitle"[^>]*>([\s\S]*?)<\/div>/i);
    if (sub) fm.description = decode(sub[1].replace(/<[^>]*>/g, '').trim());
    const auth = h.match(/<strong>(.*?)<\/strong>/i);
    if (auth) fm.author = decode(auth[1].trim());
  }
  if (!fm.title && filename) {
    fm.title = basename(filename, extname(filename)).replace(/[-_]/g, ' ');
  }
  return fm;
}

function buildFM(fm) {
  const l = ['---'];
  l.push(`title: "${fm.title}"`);
  if (fm.description) l.push(`description: "${fm.description}"`);
  l.push(`lang: ${fm.lang}`);
  if (fm.dir) l.push(`dir: ${fm.dir}`);
  l.push(`publishDate: "${fm.publishDate}"`);
  if (fm.author) l.push(`author: ${fm.author}`);
  if (fm.categories?.length) {
    l.push('categories:');
    fm.categories.forEach(c => l.push(`  - ${c}`));
  }
  if (fm.tags?.length) {
    l.push('tags:');
    fm.tags.forEach(t => l.push(`  - ${t}`));
  }
  l.push(`draft: ${fm.draft ?? true}`);
  l.push('---');
  return l.join('\n');
}

function convertMermaidBlocks(html) {
  // Full wrapper pattern
  let r = html.replace(
    /<div\s+class="diagram-wrapper">\s*(?:<(?:div|p)\s+class="diagram-title"[^>]*>([\s\S]*?)<\/(?:div|p)>\s*)?<pre\s+class="mermaid">([\s\S]*?)<\/pre>\s*(?:<(?:div|p|figcaption)\s+class="diagram-caption"[^>]*>([\s\S]*?)<\/(?:div|p|figcaption)>\s*)?<\/div>/gi,
    (_, t, m, cap) => mermaidFence(t, m, cap)
  );
  // Bare pre.mermaid
  r = r.replace(
    /<pre\s+class="mermaid">([\s\S]*?)<\/pre>/gi,
    (_, m) => mermaidFence(null, m, null)
  );
  return r;
}

function mermaidFence(rawTitle, rawCode, rawCaption) {
  let code = decode(rawCode.trim());
  code = fixMermaid(code);
  code = code.split('\n').map(l => l.trimEnd()).join('\n').trim();

  const parts = [];
  if (rawTitle) {
    const t = decode(rawTitle.replace(/<[^>]*>/g, '').trim());
    parts.push(`\n**${t}**\n`);
  }
  parts.push('```mermaid');
  parts.push(code);
  parts.push('```');
  if (rawCaption) {
    const c = decode(rawCaption.replace(/<[^>]*>/g, '').trim());
    parts.push(`\n*${c}*`);
  }
  return '\n' + parts.join('\n') + '\n';
}

function convertHeadings(html) {
  let r = html;
  r = r.replace(
    /<h2\s+class="section-title">\s*<span\s+class="num">(.*?)<\/span>\s*([\s\S]*?)\s*<\/h2>/gi,
    (_, n, t) => `\n## ${decode(n)}. ${decode(t.replace(/<[^>]*>/g, '').trim())}\n`
  );
  r = r.replace(
    /<h3\s+(?:id="([^"]*)")?\s*>([\s\S]*?)<\/h3>/gi,
    (_, id, t) => {
      const clean = decode(t.replace(/<[^>]*>/g, '').trim());
      return id ? `\n### ${clean} {#${id}}\n` : `\n### ${clean}\n`;
    }
  );
  return r;
}

function decodeSelective(content) {
  let inM = false;
  return content.split('\n').map(l => {
    if (l.trim() === '```mermaid') { inM = true; return l; }
    if (inM && l.trim() === '```') { inM = false; return l; }
    if (inM) return l;
    return decode(l);
  }).join('\n');
}

// ═══════════════════════════════════════════════
// POST-PROCESS: Run MermaidProcessor if available
// ═══════════════════════════════════════════════

async function postProcess(content) {
  if (!MermaidProcessor) return content;

  const proc = new MermaidProcessor({
    decodeHTMLEntities: true,
    stripClassAnnotations: true,
    fixNewlines: true,
  });

  return proc.process(content);
}

// ═══════════════════════════════════════════════
// VALIDATE
// ═══════════════════════════════════════════════

function validate(content) {
  const w = [];
  let inM = false;
  content.split('\n').forEach((l, i) => {
    const n = i + 1;
    if (l.trim() === '```mermaid') inM = true;
    if (inM && l.trim() === '```' && !l.includes('mermaid')) inM = false;
    if (!inM && /&[a-zA-Z]+;/.test(l)) {
      const found = l.match(/&[a-zA-Z]+;/g)?.filter(
        e => !['&amp;', '&lt;', '&gt;', '&quot;'].includes(e)
      );
      if (found?.length) w.push(`L${n}: Undecoded: ${found.join(', ')}`);
    }
    if (inM && /:::\w/.test(l)) w.push(`L${n}: :::className in mermaid`);
    if (/<!--/.test(l) && !inM) w.push(`L${n}: HTML comment remaining`);
  });
  return w;
}

// ═══════════════════════════════════════════════
// BATCH MODE
// ═══════════════════════════════════════════════

function findHTML(dir) {
  const res = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) res.push(...findHTML(p));
    else if (/\.html?$/i.test(e.name)) res.push(p);
  }
  return res;
}

async function batch(inDir, outDir) {
  const files = findHTML(inDir);
  console.log(`\n📂 Found ${files.length} HTML files\n`);
  for (const f of files) {
    const html = readFileSync(f, 'utf-8');
    let mdx = convertHTML(html, { filename: f });
    mdx = await postProcess(mdx);
    const out = join(outDir, f.replace(inDir, '').replace(/\.html?$/i, '.mdx'));
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, mdx, 'utf-8');
    const w = validate(mdx);
    console.log(`  ${w.length ? '⚠️' : '✅'} ${basename(f)} → ${basename(out)} (${w.length} warnings)`);
  }
}

// ═══════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help')) {
  console.log(`
  HTML → MDX Converter for Astro (v3.0)

  Usage:
    node convert-html-to-mdx.mjs <input.html> [-o output.mdx]
    node convert-html-to-mdx.mjs --batch <html-dir/> [-o <mdx-dir/>]

  Options:
    -o            Output file or directory
    --batch       Process all HTML files recursively
    --fm <file>   Custom YAML frontmatter file
    --silent      Suppress output
  `);
  process.exit(0);
}

if (args.includes('--batch')) {
  const i = args.indexOf('--batch');
  const inDir = args[i + 1] || '.';
  const oi = args.indexOf('-o');
  const outDir = oi !== -1 ? args[oi + 1] : './converted-mdx';
  await batch(inDir, outDir);
} else {
  const input = args[0];
  const oi = args.indexOf('-o');
  const output = oi !== -1 ? args[oi + 1] : input.replace(/\.html?$/i, '.mdx');
  const fi = args.indexOf('--fm');
  const fmOverride = fi !== -1
    ? '---\n' + readFileSync(args[fi + 1], 'utf-8').trim() + '\n---'
    : undefined;

  console.log(`📂 Input:  ${input}`);
  console.log(`📂 Output: ${output}\n`);

  const html = readFileSync(input, 'utf-8');
  let mdx = convertHTML(html, { filename: input, frontmatter: fmOverride });
  mdx = await postProcess(mdx);

  mkdirSync(dirname(resolve(output)), { recursive: true });
  writeFileSync(output, mdx, 'utf-8');

  const w = validate(mdx);
  console.log(`\n💾 Saved: ${output}`);
  console.log(`📊 ${(mdx.length / 1024).toFixed(1)} KB | ${mdx.split('\n').length} lines | ${w.length} warnings`);
  if (w.length) w.forEach(x => console.log(`  ⚠️ ${x}`));
}
// ═══════════════════════════════════════════════
// PATCH: 6 Missing Items
// Add these functions to convert-html-to-mdx.mjs
// ═══════════════════════════════════════════════

// ── Missing 1: Strip CSS comments in inline styles ──
function stripCSSComments(html) {
  // Remove /* ... */ inside style="..." attributes
  return html.replace(
    /style="([^"]*)"/gi,
    (match, styleContent) => {
      const cleaned = styleContent.replace(/\/\*[\s\S]*?\*\//g, '');
      return `style="${cleaned}"`;
    }
  );
}

// ── Missing 2: Collapse split/broken tags ──
function collapseSplitTags(html) {
  // Tags broken across lines:
  // <div
  //   class="card"
  //   style="color:red">
  // → <div class="card" style="color:red">
  return html.replace(
    /<(\w+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))?)*)\s*>/g,
    (match) => {
      // Collapse internal newlines to spaces
      return match.replace(/\s*\n\s*/g, ' ');
    }
  );
}

// ── Missing 3: Remove empty wrapper divs ──
function removeEmptyWrappers(html) {
  // <div>\n  <div class="real">content</div>\n</div>
  // → <div class="real">content</div>

  // Remove divs with no class/id that only wrap a single child
  let result = html;

  // Iterative: keep removing until stable
  let prev;
  do {
    prev = result;
    // Empty div with only whitespace
    result = result.replace(
      /<div>\s*<\/div>/gi,
      ''
    );
    // Div with no attributes wrapping exactly one block child
    result = result.replace(
      /<div>\s*(<(?:div|section|table|article|nav|details)\s[\s\S]*?<\/(?:div|section|table|article|nav|details)>)\s*<\/div>/gi,
      '\$1'
    );
  } while (result !== prev);

  return result;
}

// ── Missing 4: Map CSS classes to site equivalents ──
function mapCSSClasses(html) {
  let r = html;

  // Card accent classes → site classes
  // Check your global.css to confirm these mappings!
  const classMap = {
    'card accent-right': 'card right',
    'card accent-primary': 'card primary',
    'card accent-green': 'card accent',
    'card accent-gold': 'card gold',
  };

  for (const [from, to] of Object.entries(classMap)) {
    r = r.replaceAll(`class="${from}"`, `class="${to}"`);
  }

  // Wave cards → card with border style preserved
  r = r.replace(
    /<div\s+class="wave-card"([^>]*)>/gi,
    '<div class="card"\$1>'
  );

  // wave-num spans → badge or remove
  r = r.replace(
    /<div\s+class="wave-num"[^>]*>(.*?)<\/div>/gi,
    '' // Remove — the heading already has the number
  );

  return r;
}

// ── Missing 5: Convert standalone <strong>/<em> ──
// CONSERVATIVE approach: only convert when on their own line
// (not inside table cells, divs, cards)
function convertInlineFormatting(html) {
  let r = html;
  const lines = r.split('\n');
  let inHTMLBlock = 0;

  const converted = lines.map(line => {
    // Track HTML block depth
    const opens = (line.match(/<(div|table|td|th|tr|blockquote|details|nav|section)\b/gi) || []).length;
    const closes = (line.match(/<\/(div|table|td|th|tr|blockquote|details|nav|section)>/gi) || []).length;
    inHTMLBlock += opens - closes;

    // Only convert on pure text lines (not inside HTML blocks)
    if (inHTMLBlock <= 0) {
      // Standalone <p><strong>text</strong></p> patterns
      line = line.replace(
        /^(\s*)<p><strong>(.*?)<\/strong><\/p>\s*$/,
        '\$1**\$2**'
      );
      // Standalone <p><em>text</em></p>
      line = line.replace(
        /^(\s*)<p><em>(.*?)<\/em><\/p>\s*$/,
        '\$1*\$2*'
      );
    }

    if (inHTMLBlock < 0) inHTMLBlock = 0;
    return line;
  });

  return converted.join('\n');
}

// ── Missing 6: Full frontmatter with all fields from plan ──
function buildFullFrontmatter(fm) {
  const lines = ['---'];

  lines.push(`title: "${fm.title || 'Untitled'}"`);
  if (fm.description) lines.push(`description: "${fm.description}"`);
  lines.push(`lang: ${fm.lang || 'fa'}`);
  if (fm.dir) lines.push(`dir: ${fm.dir}`);
  lines.push(`publishDate: "${fm.publishDate || new Date().toISOString().split('T')[0]}"`);
  if (fm.author) lines.push(`author: ${fm.author}`);
  if (fm.interface) lines.push(`interface: ${fm.interface}`);

  if (fm.categories?.length) {
    lines.push('categories:');
    fm.categories.forEach(c => lines.push(`  - ${c}`));
  }
  if (fm.tags?.length) {
    lines.push('tags:');
    fm.tags.forEach(t => lines.push(`  - ${t}`));
  }

  // Optional fields from plan
  if (fm.coverImage) lines.push(`coverImage: ${fm.coverImage}`);
  if (fm.imageDisplay) lines.push(`imageDisplay: ${fm.imageDisplay}`);
  if (fm.cardImage) lines.push(`cardImage: ${fm.cardImage}`);
  if (fm.pdfUrl) lines.push(`pdfUrl: ${fm.pdfUrl}`);
  if (fm.showPdfViewer !== undefined) lines.push(`showPdfViewer: ${fm.showPdfViewer}`);
  lines.push(`draft: ${fm.draft ?? true}`);
  if (fm.showInContents !== undefined) lines.push(`showInContents: ${fm.showInContents}`);

  lines.push('---');
  return lines.join('\n');
}