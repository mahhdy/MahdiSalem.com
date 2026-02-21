// fix-mermaid-quotes.mjs
// Usage: node fix-mermaid-quotes.mjs ./src/content [--dry-run] [--verbose]

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');
const DIAGNOSTIC = process.argv.includes('--diagnose');
const targetDir = process.argv[2];

if (!targetDir) {
  console.error(`
Usage: node fix-mermaid-quotes.mjs <directory> [options]

Options:
  --dry-run    Show changes without writing files
  --verbose    Show detailed diff for each fix
  --diagnose   Show hex dump of problematic areas (no fixes applied)
`);
  process.exit(1);
}

// ============================================
// Diagnostic: show what's ACTUALLY in the file
// ============================================

function diagnoseProblems(mermaidCode, filePath) {
  const lines = mermaidCode.split('\n');
  const problems = [];

  lines.forEach((line, lineNum) => {
    // Check for consecutive quotes
    const quoteMatches = [...line.matchAll(/"{2,}/g)];
    quoteMatches.forEach((m) => {
      const start = Math.max(0, m.index - 15);
      const end = Math.min(line.length, m.index + m[0].length + 15);
      const context = line.slice(start, end);

      // Show hex of the problematic area
      const hexArea = line.slice(Math.max(0, m.index - 5), m.index + m[0].length + 5);
      const hex = [...hexArea].map(c =>
        c.charCodeAt(0) > 127
          ? `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
          : c === '"' ? '❝"❞' : c
      ).join(' ');

      problems.push({
        line: lineNum + 1,
        col: m.index,
        type: `${m[0].length}× consecutive quotes`,
        context: `...${context}...`,
        hex,
      });
    });

    // Check for arrow-quote patterns
    const arrowQuote = [...line.matchAll(/(-->|==>|---|-\.->?)\s*"{1,}\s*[A-Za-z]/g)];
    arrowQuote.forEach((m) => {
      const context = line.slice(Math.max(0, m.index - 5), m.index + m[0].length + 10);
      problems.push({
        line: lineNum + 1,
        col: m.index,
        type: 'stray quote after arrow',
        context: `...${context}...`,
        hex: [...m[0]].map(c => c === '"' ? '❝"❞' : c).join(''),
      });
    });

    // Check for invisible Unicode characters near arrows/brackets
    const invisibles = [...line.matchAll(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g)];
    invisibles.forEach((m) => {
      const charName = {
        '\u200B': 'ZERO-WIDTH-SPACE',
        '\u200C': 'ZWNJ',
        '\u200D': 'ZWJ',
        '\u200E': 'LTR-MARK',
        '\u200F': 'RTL-MARK',
        '\u202A': 'LTR-EMBED',
        '\u202B': 'RTL-EMBED',
        '\u202C': 'POP-DIR',
        '\uFEFF': 'BOM',
      }[m[0]] || `U+${m[0].charCodeAt(0).toString(16)}`;

      problems.push({
        line: lineNum + 1,
        col: m.index,
        type: `invisible char: ${charName}`,
        context: line.slice(Math.max(0, m.index - 10), m.index + 10),
      });
    });
  });

  return problems;
}

// ============================================
// The actual fixer — CORRECT ORDER
// ============================================

function fixMermaidQuotes(mermaidCode) {
  let fixed = mermaidCode;
  const fixes = [];

  // ─────────────────────────────────────────
  // PHASE 1: Remove invisible Unicode chars
  //          that break pattern matching
  // ─────────────────────────────────────────
  fixed = fixed.replace(
    /[\u200B-\u200F\u202A-\u202E\uFEFF]/g,
    (match) => {
      fixes.push({
        type: 'invisible-unicode',
        before: `U+${match.charCodeAt(0).toString(16).toUpperCase()}`,
        after: '(removed)',
      });
      return '';
    }
  );

  // ─────────────────────────────────────────
  // PHASE 2: Normalize ALL double/triple quotes
  //          to single quotes FIRST
  //          "" → "    """ → "
  // ─────────────────────────────────────────
  fixed = fixed.replace(/"{2,}/g, (match) => {
    fixes.push({
      type: 'multi-quote',
      before: match,
      after: '"',
      context: 'normalized consecutive quotes',
    });
    return '"';
  });

  // ─────────────────────────────────────────
  // PHASE 3: NOW fix stray quotes after arrows
  //          -->"B[  →  --> B[
  //          ==>"X(  →  ==> X(
  //
  //          After Phase 2, all "" are now "
  //          so this WILL match
  // ─────────────────────────────────────────
  fixed = fixed.replace(
    /(-->|==>|---|-\.->?|~~>)\s*"\s*([A-Za-z0-9_]+)\s*([\[\(\{])/g,
    (match, arrow, nodeId, bracket) => {
      fixes.push({
        type: 'stray-quote-after-arrow',
        before: match,
        after: `${arrow} ${nodeId}${bracket}`,
      });
      return `${arrow} ${nodeId}${bracket}`;
    }
  );

  // ─────────────────────────────────────────
  // PHASE 4: Fix stray quotes before arrows
  //          "]-->  (quote stuck to bracket+arrow)
  //          "] -->  is fine, skip
  // ─────────────────────────────────────────
  fixed = fixed.replace(
    /([$$\)\}])\s*"\s*(-->|==>|---|-\.->?|~~>)/g,
    (match, bracket, arrow) => {
      fixes.push({
        type: 'stray-quote-before-arrow',
        before: match,
        after: `${bracket} ${arrow}`,
      });
      return `${bracket} ${arrow}`;
    }
  );

  // ─────────────────────────────────────────
  // PHASE 5: Fix edge label quotes
  //          -->|""label""|  →  -->|"label"|
  //          (already normalized by Phase 2,
  //           but check for "|" → |"|)
  // ─────────────────────────────────────────
  // Already handled by Phase 2

  return { fixed, fixes };
}

// ============================================
// Extract mermaid blocks from MDX
// ============================================

function processMdxContent(content, filePath) {
  let totalFixes = 0;
  const allFixes = [];

  const processed = content.replace(
    /(```mermaid[^\n]*\n)([\s\S]*?)(```)/g,
    (fullMatch, opener, mermaidCode, closer) => {

      // Run diagnostic if requested
      if (DIAGNOSTIC) {
        const problems = diagnoseProblems(mermaidCode, filePath);
        if (problems.length > 0) {
          problems.forEach((p) => {
            allFixes.push({
              type: `[DIAG] ${p.type}`,
              before: p.context,
              after: p.hex || '',
            });
          });
          totalFixes += problems.length;
        }
        return fullMatch; // Don't modify in diagnostic mode
      }

      const { fixed, fixes } = fixMermaidQuotes(mermaidCode);

      if (fixes.length > 0) {
        totalFixes += fixes.length;
        allFixes.push(...fixes);
        return `${opener}${fixed}${closer}`;
      }
      return fullMatch;
    }
  );

  return { processed, totalFixes, allFixes };
}

// ============================================
// Verification: check fix results
// ============================================

function verifyFix(content) {
  const issues = [];

  content.replace(
    /(```mermaid[^\n]*\n)([\s\S]*?)(```)/g,
    (fullMatch, opener, mermaidCode) => {
      const lines = mermaidCode.split('\n');
      lines.forEach((line, i) => {
        // Still has double quotes?
        if (/"{2,}/.test(line)) {
          issues.push(`  Line ${i + 1}: still has "": ${line.trim()}`);
        }
        // Still has arrow-quote?
        if (/(-->|==>)\s*"[A-Za-z]/.test(line)) {
          issues.push(`  Line ${i + 1}: still has arrow-quote: ${line.trim()}`);
        }
      });
      return fullMatch;
    }
  );

  return issues;
}

// ============================================
// Recursively find MDX files
// ============================================

async function findMdxFiles(dir) {
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

// ============================================
// Main
// ============================================

async function main() {
  const mode = DIAGNOSTIC ? '🔬 DIAGNOSTIC' : DRY_RUN ? '🏜️  DRY RUN' : '✏️  LIVE';

  console.log(`
╔══════════════════════════════════════════╗
║    Mermaid Quote Fixer v2.0              ║
╠══════════════════════════════════════════╣
║  📁 Path: ${targetDir.padEnd(30)}║
║  🔧 Mode: ${mode.padEnd(30)}║
╚══════════════════════════════════════════╝
`);

  const files = await findMdxFiles(targetDir);
  console.log(`  Found ${files.length} .mdx/.md files\n`);

  let totalFilesFixed = 0;
  let totalFixesApplied = 0;
  const typeCounts = {};
  const fileResults = [];

  for (const filePath of files) {
    const content = await readFile(filePath, 'utf-8');
    if (!content.includes('```mermaid')) continue;

    const { processed, totalFixes, allFixes } = processMdxContent(content, filePath);

    if (totalFixes > 0) {
      totalFilesFixed++;
      totalFixesApplied += totalFixes;

      const relativePath = filePath.replace(targetDir, '.');
      fileResults.push({ file: relativePath, fixes: totalFixes, details: allFixes });

      console.log(`  ✅ ${relativePath} — ${totalFixes} fix(es)`);

          if (VERBOSE) {
        allFixes.forEach((fix) => {
          console.log(`     ${fix.type}`);
          console.log(`       ❌ ${JSON.stringify(fix.before)}`);
          console.log(`       ✅ ${JSON.stringify(fix.after)}`);
          if (fix.context) console.log(`       📍 ${fix.context}`);
        });
        console.log('');
      }

      // Count fix types
      allFixes.forEach((f) => {
        typeCounts[f.type] = (typeCounts[f.type] || 0) + 1;
      });

      // Write file (unless dry-run or diagnostic)
      if (!DRY_RUN && !DIAGNOSTIC) {
        await writeFile(filePath, processed, 'utf-8');

        // Verify the fix worked
        const verifiedContent = await readFile(filePath, 'utf-8');
        const remainingIssues = verifyFix(verifiedContent);
        if (remainingIssues.length > 0) {
          console.log(`     ⚠️  Remaining issues in ${relativePath}:`);
          remainingIssues.forEach((issue) => console.log(`       ${issue}`));
        }
      }
    }
  }

  // ============================================
  // Summary
  // ============================================
  console.log(`
${'═'.repeat(55)}
📊 Summary
${'═'.repeat(55)}
   Files scanned:    ${files.length}
   Files with fixes: ${totalFilesFixed}
   Total fixes:      ${totalFixesApplied}
`);

  if (totalFixesApplied > 0) {
    console.log('   Fix breakdown:');
    Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const bar = '█'.repeat(Math.min(count, 40));
        console.log(`     ${String(count).padStart(4)}× ${type}  ${bar}`);
      });
  }

  if (DRY_RUN && totalFixesApplied > 0) {
    console.log(`
   ⚠️  This was a DRY RUN — no files were modified.
   Run without --dry-run to apply fixes:
     node fix-mermaid-quotes.mjs ${targetDir}
`);
  }

  if (DIAGNOSTIC) {
    console.log(`
   🔬 DIAGNOSTIC mode — no files were modified.
   Review the output above to understand what's in your files.
   Then run in fix mode:
     node fix-mermaid-quotes.mjs ${targetDir} --dry-run --verbose
`);
  }

  if (!DRY_RUN && !DIAGNOSTIC && totalFixesApplied > 0) {
    console.log(`
   ✅ All fixes applied successfully.
`);
  }

  console.log('');
}

main().catch(console.error);