/**
 * Mermaid Audit Script
 * Scans all .mdx/.md files in published content folders (NOT Archive)
 * and extracts every ```mermaid block, then validates syntax heuristically.
 */
import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.resolve('src/content');
const SCAN_DIRS = ['articles', 'books', 'statements', 'multimedia', 'wiki'];

// Common issues we look for
const CHECKS = [
    {
        name: 'Leading whitespace before diagram type',
        test: (code) => /^\s+(mindmap|flowchart|graph|sequenceDiagram|gantt|pie|timeline|gitGraph|stateDiagram|classDiagram|erDiagram)/m.test(code) && /^```mermaid/m.test('```mermaid\n' + code),
        desc: 'Diagram type keyword has leading spaces (should start at column 0)',
    },
    {
        name: 'Smart/curly quotes',
        test: (code) => /[\u201C\u201D\u2018\u2019\u00AB\u00BB]/.test(code),
        desc: 'Contains smart quotes that Mermaid cannot parse',
    },
    {
        name: 'Unmatched parentheses in root(())',
        test: (code) => {
            const rootMatch = code.match(/root\(([^)]*)\)/);
            if (!rootMatch) return false;
            const inner = rootMatch[1];
            const opens = (inner.match(/\(/g) || []).length;
            const closes = (inner.match(/\)/g) || []).length;
            return opens !== closes;
        },
        desc: 'Root node has mismatched parentheses',
    },
    {
        name: 'subgraph in mindmap',
        test: (code) => /^\s*mindmap/m.test(code) && /subgraph/m.test(code),
        desc: 'Using "subgraph" inside a mindmap (not supported)',
    },
    {
        name: 'Empty diagram body',
        test: (code) => code.trim().split('\n').length <= 1,
        desc: 'Diagram has no content after the type declaration',
    },
    {
        name: 'Tab characters',
        test: (code) => /\t/.test(code),
        desc: 'Contains tab characters (use spaces for indentation)',
    },
    {
        name: 'Flowchart with Persian quotes issue',
        test: (code) => /^\s*(flowchart|graph)/m.test(code) && /\[\"[^\]]*[\u0600-\u06FF]/.test(code) && /[\u201C\u201D]/.test(code),
        desc: 'Flowchart with Persian text using smart quotes in labels',
    },
];

function walkDir(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkDir(full));
        } else if (/\.(md|mdx)$/.test(entry.name)) {
            results.push(full);
        }
    }
    return results;
}

function extractMermaidBlocks(content, filePath) {
    const blocks = [];
    const regex = /```mermaid\s*\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const code = match[1];
        const lineNum = content.substring(0, match.index).split('\n').length;
        blocks.push({ code, lineNum, filePath });
    }
    return blocks;
}

// --- Main ---
console.log('═══════════════════════════════════════════════════');
console.log('  MERMAID AUDIT — Published Content');
console.log('═══════════════════════════════════════════════════\n');

let totalFiles = 0;
let totalBlocks = 0;
let totalIssues = 0;
const issuesByFile = {};
const summary = { ok: 0, warn: 0 };

for (const folder of SCAN_DIRS) {
    const dir = path.join(CONTENT_DIR, folder);
    const files = walkDir(dir);

    for (const file of files) {
        // skip .bak files
        if (file.endsWith('.bak')) continue;

        const content = fs.readFileSync(file, 'utf-8');

        // Check if draft
        const draftMatch = content.match(/^draft:\s*(true|false)/m);
        const isDraft = draftMatch ? draftMatch[1] === 'true' : false;

        const blocks = extractMermaidBlocks(content, file);
        if (blocks.length === 0) continue;

        totalFiles++;
        totalBlocks += blocks.length;

        const rel = path.relative(CONTENT_DIR, file);

        for (const block of blocks) {
            const issues = [];
            for (const check of CHECKS) {
                if (check.test(block.code)) {
                    issues.push(check);
                }
            }

            if (issues.length > 0) {
                totalIssues += issues.length;
                summary.warn++;
                if (!issuesByFile[rel]) issuesByFile[rel] = [];
                issuesByFile[rel].push({
                    line: block.lineNum,
                    isDraft,
                    diagramType: block.code.trim().split('\n')[0].trim(),
                    issues: issues.map(i => i.name),
                });
            } else {
                summary.ok++;
            }
        }
    }
}

// Print report
console.log(`📊 Scanned: ${totalFiles} files with Mermaid blocks`);
console.log(`📊 Total Mermaid blocks: ${totalBlocks}`);
console.log(`✅ Blocks passing checks: ${summary.ok}`);
console.log(`⚠️  Blocks with issues: ${summary.warn}`);
console.log(`🐛 Total issues found: ${totalIssues}\n`);

if (Object.keys(issuesByFile).length === 0) {
    console.log('🎉 No issues detected in any published Mermaid blocks!\n');
} else {
    console.log('─── Issues by File ───────────────────────────────\n');
    for (const [file, blocks] of Object.entries(issuesByFile)) {
        const draftLabel = blocks[0].isDraft ? ' [DRAFT]' : ' [PUBLISHED]';
        console.log(`📄 ${file}${draftLabel}`);
        for (const b of blocks) {
            console.log(`   Line ${b.line} | ${b.diagramType}`);
            for (const issue of b.issues) {
                console.log(`      ⚠️  ${issue}`);
            }
        }
        console.log('');
    }
}

// Also check for first-line indentation specifically (the bug we just fixed)
console.log('─── Indentation Check (first line after ```mermaid) ──\n');
let indentIssues = 0;
for (const folder of SCAN_DIRS) {
    const dir = path.join(CONTENT_DIR, folder);
    const files = walkDir(dir);
    for (const file of files) {
        if (file.endsWith('.bak')) continue;
        const content = fs.readFileSync(file, 'utf-8');
        const regex = /```mermaid\s*\n(\s+)(mindmap|flowchart|graph|sequenceDiagram|gantt|pie|timeline|gitGraph|stateDiagram|classDiagram|erDiagram)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            const rel = path.relative(CONTENT_DIR, file);
            const spaces = match[1].length;
            console.log(`   ⚠️  ${rel}:${lineNum} — "${match[2]}" indented ${spaces} spaces (should be 0)`);
            indentIssues++;
        }
    }
}
if (indentIssues === 0) {
    console.log('   ✅ No first-line indentation issues found.\n');
} else {
    console.log(`\n   Found ${indentIssues} blocks with indentation issues.\n`);
}

console.log('═══════════════════════════════════════════════════');
console.log('  AUDIT COMPLETE');
console.log('═══════════════════════════════════════════════════');
