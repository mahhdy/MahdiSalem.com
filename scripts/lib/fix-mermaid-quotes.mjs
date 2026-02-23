// scripts/lib/fix-mermaid-quotes.mjs
// Master Mermaid Fixer - Standardizes source files by applying all issue class fixes.
// Usage: node scripts/lib/fix-mermaid-quotes.mjs ./src/content [--dry-run] [--verbose]

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const targetDir = process.argv[2];

if (!targetDir) {
  console.error(`Usage: node fix-mermaid-quotes.mjs <directory> [options]`);
  process.exit(1);
}

function toEnglishDigits(str) {
  return str.replace(/[۰-۹]/g, (d) => String(d.codePointAt(0) - '۰'.codePointAt(0)));
}

// CLASS B: Repair malformed AI-generated node syntax: -->"B["label""]  ->  --> B["label"]
function fixMalformedNodeSyntax(code) {
  // Pattern 1: arrow + quote + NodeId + ["label""]
  code = code.replace(/(-->|-\.->|===>?|~~~)\s*"([A-Za-z][A-Za-z0-9]*)\["([^"]+)""\]/g,
    (_, arrow, nodeId, label) => `${arrow} ${nodeId}["${label}"]`
  );
  // Pattern 2: -->"B[" -> --> B["
  code = code.replace(/(-->|===>?)\s*"([A-Za-z]\d*)\["/g,
    (_, arrow, nodeId) => `${arrow} ${nodeId}["`
  );
  // Pattern 3: Clean up remaining double-closing quotes: ""] -> "]
  code = code.replace(/""\]/g, '"]');
  // Pattern 4: Stuck quotes: -->"B[ -> --> B[
  code = code.replace(/(-->|==>|---|-\.->?|~~>)\s*"([A-Za-z0-9_]+)\s*([\[\(\{])/g,
    (_, arrow, nodeId, bracket) => `${arrow} ${nodeId}${bracket}`
  );
  // Pattern 5: label with trailing quote before nodeId or bracket: |"label"|"D -> |"label"| D
  code = code.replace(/(\|"[^"]+"\|)"\s*([A-Za-z0-9_]|\{)/g, '$1 $2');
  // Pattern 6: arrow with leading quote before label: -->"|"label"| -> --> |"label"|
  code = code.replace(/(-->|==>|---)\s*"(\|[^|]+\|)/g, '$1 $2');
  return code;
}

// CLASS D: Convert Farsi duration strings to Mermaid-compatible day counts.
function fixFarsiDurations(text) {
  return text.replace(/([۰-۹0-9]+)\s*(ماه|هفته|روز|سال)/g, (match, num, unit) => {
    const n = parseInt(toEnglishDigits(num), 10);
    if (unit === 'سال') return n * 365 + 'd';
    if (unit === 'ماه') return n * 30 + 'd';
    if (unit === 'هفته') return n * 7 + 'd';
    if (unit === 'روز') return n + 'd';
    return match;
  });
}

// CLASS E: Fix 'titleChronologie' typo in timeline blocks.
function fixTimelineTypo(code) {
  return code.replace(/titleChronologie\s/g, 'title Chronologie ');
}

// CLASS F: Fix nested/unmatched quotes in pie title.
function fixPieTitleQuotes(code) {
  return code.replace(/^(pie\s+title\s+)"(.+?)\("(.+?)"\)"?\s*$/gm, (match, prefix, main, sub) =>
    `${prefix}"${main} - ${sub}"`
  );
}

// CLASS G: Auto-quote unquoted Farsi subgraph labels.
function fixSubgraphLabels(code) {
  return code.replace(/^(\s*subgraph\s+)([^"\n]+[\u0600-\u06FF][^"\n]*)$/gm, (match, prefix, label) => {
    const trimmed = label.trim();
    if (trimmed.charAt(0) === '"') return match;
    return `${prefix}"${trimmed}"`;
  });
}

// CLASS H: Remove trailing '<' from edge labels |"text"<| -> |"text"|
function fixEdgeLabelTrailingChar(code) {
  return code.replace(/\|(".*?)"<\|/g, '|$1"|');
}

// Auto-quote Farsi in flowchart/graph node labels if they are missing quotes.
function autoQuoteFarsiNodes(code) {
  const lines = code.split('\n');
  const result = lines.map((line) => {
    // ID[text] or ID["text"]
    line = line.replace(/([A-Za-z]\d*)(\[)([^\]"]+)(])/g, (m, id, open, text, close) => {
      const t = text.trim();
      if (!t || t.charAt(0) === '"') return m;
      if (/[\u0600-\u06FF]/.test(t)) return `${id}${open}"${t}"${close}`;
      return m;
    });
    // ID(text) or ID("text")
    line = line.replace(/([A-Za-z]\d*)(\()([^)"]+)(\))/g, (m, id, open, text, close) => {
      const t = text.trim();
      if (!t || t.charAt(0) === '"') return m;
      if (/[\u0600-\u06FF]/.test(t)) return `${id}${open}"${t}"${close}`;
      return m;
    });
    return line;
  });
  code = result.join('\n');
  // Edge labels |text|
  code = code.replace(/\|([^|"]+)\|/g, (m, text) => {
    const t = text.trim();
    if (!t || t.charAt(0) === '"' || !/[\u0600-\u06FF]/.test(t)) return m;
    return `|"${t}"|`;
  });
  return code;
}

// Fix gantt axes and standard date formats
function fixGanttAxes(code) {
  code = code.replace(/^(\s*axisFormat\s+)ماه\s*$/gm, '$1%Y-%m');
  // Add day to dates missing it: 2025-01 -> 2025-01-01 (Mermaid strictness)
  code = code.replace(/\b(\d{4}-\d{2})(?!-\d{2})\b/g, '$1-01');
  // Convert Farsi digits to English for Mermaid parser
  code = code.replace(/[۰-۹]/g, (d) => toEnglishDigits(d));
  return code;
}

function detectDiagramType(code) {
  const firstLine = code.trim().split('\n').find(l => l.trim()) || '';
  const fl = firstLine.trim().toLowerCase();
  if (fl.startsWith('gantt')) return 'gantt';
  if (fl.startsWith('flowchart')) return 'flowchart';
  if (fl.startsWith('graph')) return 'graph';
  if (fl.startsWith('sequence')) return 'sequence';
  if (fl.startsWith('pie')) return 'pie';
  if (fl.startsWith('timeline')) return 'timeline';
  if (fl.startsWith('mindmap')) return 'mindmap';
  return 'other';
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function processMdxContent(content) {
  let totalFixes = 0;
  const processed = content.replace(
    /(```mermaid[^\n]*\n)([\s\S]*?)(```)/g,
    (fullMatch, opener, mermaidCode, closer) => {
      const originalCode = mermaidCode;
      let code = mermaidCode;

      // Decode HTML entities (CLASS A)
      code = decodeHtmlEntities(code);

      // Clean invisible chars (except ZWNJ which is meaningful in labels)
      // Keep \u200C (ZWNJ) but remove others like \u200B (Zero width space)
      code = code.replace(/[\u200B\u200D-\u200F\u202A-\u202E\uFEFF]/g, '');

      const diagramType = detectDiagramType(code);

      // Apply Class Fixers
      code = fixMalformedNodeSyntax(code);   // CLASS B
      code = fixEdgeLabelTrailingChar(code);  // CLASS H
      code = fixSubgraphLabels(code);         // CLASS G

      if (diagramType === 'gantt') {
        code = fixGanttAxes(code);
        code = fixFarsiDurations(code);       // CLASS D
      }
      if (diagramType === 'timeline') {
        code = fixTimelineTypo(code);          // CLASS E
      }
      if (diagramType === 'pie') {
        code = fixPieTitleQuotes(code);        // CLASS F
      }

      // Auto-quote (not for gantt/timeline)
      if (diagramType !== 'gantt' && diagramType !== 'timeline') {
        code = autoQuoteFarsiNodes(code);
      }

      // Final cleanup of redundant spaces at line ends
      code = code.split('\n').map(l => l.trimEnd()).join('\n');

      if (code.trim() !== originalCode.trim()) {
        totalFixes++;
        return `${opener}${code}${closer}`;
      }
      return fullMatch;
    }
  );

  return { processed, totalFixes };
}

async function findFiles(dir) {
  const files = [];
  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await walk(fullPath);
      } else if (entry.isFile() && ['.mdx', '.md'].includes(extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }
  await walk(dir);
  return files;
}

async function main() {
  console.log(`🚀 Starting Mermaid Master Fixer on ${targetDir}...`);
  const files = await findFiles(targetDir);
  let filesChanged = 0;
  let totalFixes = 0;

  for (const file of files) {
    try {
      const content = await readFile(file, 'utf-8');
      if (!content.includes('```mermaid')) continue;

      const { processed, totalFixes: count } = processMdxContent(content);

      if (count > 0) {
        filesChanged++;
        totalFixes += count;
        if (!DRY_RUN) {
          await writeFile(file, processed, 'utf-8');
          console.log(`✅ Fixed ${count} charts in: ${file}`);
        } else {
          console.log(`🔍 [DRY RUN] Would fix ${count} charts in: ${file}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
    }
  }

  console.log(`\n✨ Finished processing.
   Files Checked: ${files.length}
   Files Changed: ${filesChanged}
   Total Charts Fixed: ${totalFixes}
  `);

  if (DRY_RUN) console.log('⚠️  This was a DRY RUN. No files were actually modified.');
}

main().catch(console.error);