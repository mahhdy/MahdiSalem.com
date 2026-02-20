/**
 * extract-mermaid-tests.mjs
 *
 * Extracts all Mermaid diagrams from all articles (fa + en)
 * and compiles them into a single Chart-test.mdx test file.
 * Each chart gets a stable ID (e.g. TR-1, GA-2) for feedback tracking.
 *
 * Also auto-detects known issues (Class A–H) from the tracker.
 *
 * Usage: node scripts/extract-mermaid-tests.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ARTICLE_DIRS = [
    path.join(ROOT, 'src/content/articles/fa'),
    path.join(ROOT, 'src/content/articles/en'),
];

const OUTPUT_FILE = path.join(ROOT, 'src/content/articles/fa/Chart-test.mdx');

/**
 * Map filenames to short 2-letter IDs for chart tracking.
 * Order is important — first match wins.
 */
const FILE_ID_MAP = [
    ['iran-transition-article', 'TR'],
    ['آشنایی-با-دوران', 'GA'],
    ['ارتش-و-انقلاب', 'AR'],
    ['انقلاب-شناسی-تحلیل-جامع-انقلاب-فرانسه', 'FR'],
    ['انقلاب-شناسی-تحلیلی', 'RU'],
    ['انواع-سطوح', 'PC'],
    ['مروری-بر-شیوه', 'RG'],
    ['مقایسه', 'CM'],
    ['democracy-and-ethics', 'DE'],
];

function getFileId(fileName) {
    for (const [pattern, id] of FILE_ID_MAP) {
        if (fileName.includes(pattern)) return id;
    }
    // Fallback: use first 2 uppercase letters of filename
    const cleaned = fileName.replace(/[^a-zA-Z\u0600-\u06FF]/g, '');
    return cleaned.slice(0, 2).toUpperCase() || 'XX';
}

/**
 * Auto-detect issue classes from raw mermaid code.
 * Returns array of class IDs like ['A', 'B', 'C']
 */
function detectIssues(code) {
    const issues = [];

    // CLASS A: HTML entities in arrows
    if (/--&gt;|&gt;|&lt;/.test(code)) issues.push('A');

    // CLASS B: Malformed AI node syntax: -->"B["  or -->"C[
    if (/-->"[A-Z]\d?\["/.test(code) || /--\u003e"[A-Z]/.test(code)) issues.push('B');
    // Also detect if the escaped arrow is followed by a quote-node pattern
    if (/--\\u003e"/.test(code)) issues.push('B');

    // CLASS C: <br/> in node labels (which may get entity-encoded)
    if (/<br\s*\/?>/.test(code) && /\[".+<br/.test(code)) issues.push('C');

    // CLASS D: Farsi duration in gantt (e.g. 3ماه, 6ماه)
    if (/\d+ماه|\d+هفته/.test(code) && /gantt/.test(code)) issues.push('D');

    // CLASS E: titleChronologie typo
    if (/titleChronologie/.test(code)) issues.push('E');

    // CLASS F: Unmatched quotes in pie title
    if (/pie title ".*\(".*"\)"/.test(code)) issues.push('F');

    // CLASS G: Unquoted Farsi subgraph labels
    if (/subgraph [^"\n]+[\u0600-\u06FF]/.test(code)) issues.push('G');

    // CLASS H: Trailing < in edge labels
    if (/\|"[^"]+"\u003c\||\|"[^"]+"<\|/.test(code)) issues.push('H');

    return issues;
}

async function getAllFiles(dir) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries
            .filter(e => e.isFile() && (e.name.endsWith('.mdx') || e.name.endsWith('.md')))
            .map(e => path.join(dir, e.name));
    } catch {
        return [];
    }
}

async function extractMermaidBlocks(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const blocks = [];
    const mermaidRegex = /```mermaid([^\n]*)\n([\s\S]*?)```/g;
    let match;
    while ((match = mermaidRegex.exec(content)) !== null) {
        const meta = match[1].trim();
        const code = match[2].trim();
        if (code) blocks.push({ meta, code });
    }
    return blocks;
}

async function main() {
    console.log('🔍 Scanning articles for Mermaid diagrams...\n');

    const allBlocks = [];

    for (const dir of ARTICLE_DIRS) {
        const files = await getAllFiles(dir);
        for (const filePath of files) {
            const fileName = path.basename(filePath);
            if (fileName === 'Chart-test.mdx') continue;

            const blocks = await extractMermaidBlocks(filePath);
            if (blocks.length > 0) {
                const fileId = getFileId(fileName);
                console.log(`  📄 [${fileId}] ${fileName}: ${blocks.length} diagram(s)`);
                allBlocks.push({
                    source: fileName,
                    dir: path.basename(path.dirname(filePath)),
                    fileId,
                    blocks,
                });
            }
        }
    }

    if (allBlocks.length === 0) {
        console.log('⚠️  No Mermaid diagrams found.');
        return;
    }

    const totalDiagrams = allBlocks.reduce((sum, item) => sum + item.blocks.length, 0);
    console.log(`\n✅ Found ${totalDiagrams} diagram(s) across ${allBlocks.length} file(s)\n`);

    // Build the MDX content
    const sections = [];
    const issueReport = [];

    for (const item of allBlocks) {
        sections.push(`\n## 📄 Source: \`${item.dir}/${item.source}\`\n`);

        for (let i = 0; i < item.blocks.length; i++) {
            const { meta, code } = item.blocks[i];
            const diagramNum = i + 1;
            const chartId = `${item.fileId}-${diagramNum}`;

            // Detect chart type
            const firstLine = code.split('\n')[0].trim();
            const chartType = firstLine.split(/\s+/)[0] || 'unknown';

            // Auto-detect issues
            const issues = detectIssues(code);
            const issueTag = issues.length > 0
                ? `⚠️ Issues: ${issues.map(c => `CLASS ${c}`).join(', ')}`
                : '✅ No issues detected';

            if (issues.length > 0) {
                issueReport.push({ chartId, chartType, issues });
                console.log(`  ⚠️  ${chartId}: ${issues.map(c => `CLASS_${c}`).join(', ')}`);
            }

            sections.push(`### 🆔 \`${chartId}\` — ${chartType}`);
            sections.push('');
            sections.push(`> ${issueTag}`);
            sections.push('');
            sections.push('**Raw Source:**');
            sections.push('```text');
            sections.push(code);
            sections.push('```');
            sections.push('');
            sections.push('**Rendered:**');
            sections.push('');
            sections.push(`\`\`\`mermaid ${meta}`);
            sections.push(code);
            sections.push('```');
            sections.push('');
            sections.push('---');
            sections.push('');
        }
    }

    const now = new Date().toISOString().split('T')[0];

    // Issue summary table
    const issueSummaryLines = [
        '',
        '## ⚠️ Auto-Detected Issues',
        '',
        '| Chart ID | Type | Issues |',
        '|----------|------|--------|',
    ];
    for (const { chartId, chartType, issues } of issueReport) {
        issueSummaryLines.push(`| \`${chartId}\` | ${chartType} | ${issues.map(c => `CLASS ${c}`).join(', ')} |`);
    }
    issueSummaryLines.push('');
    issueSummaryLines.push('> See `developments/MERMAID_CHART_FIX_TRACKER.md` for what each class means.');
    issueSummaryLines.push('');

    const mdxContent = `---
title: "Mermaid Chart Test Baseline"
description: "Auto-extracted Mermaid diagrams from all articles. Use this file to validate chart rendering before deploying changes."
lang: fa
publishDate: ${now}
draft: true
tags: ["test", "mermaid", "baseline"]
---

# 🧪 Mermaid Chart Test Baseline

> **Auto-generated on ${now}**
> Each diagram has a stable **Chart ID** (e.g. \`TR-1\`) you can reference in feedback.
> Re-run \`npm run test:mermaid\` to refresh this file after adding new articles.

---

**Statistics:**
- Total diagrams: **${totalDiagrams}**
- Source files: **${allBlocks.length}**
- Issues detected: **${issueReport.length}**
- Generated: \`${now}\`

---
${issueSummaryLines.join('\n')}
---

${sections.join('\n')}
`;

    await fs.writeFile(OUTPUT_FILE, mdxContent, 'utf-8');
    console.log(`\n📦 Output: src/content/articles/fa/Chart-test.mdx`);
    console.log(`   → ${totalDiagrams} diagrams, ${issueReport.length} with detected issues`);
    console.log(`   → http://localhost:4321/articles/Chart-test`);
}

main().catch(console.error);
