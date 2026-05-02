import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const CONTENT_ROOT = path.join(ROOT, "src", "content");
const OUT_DIR = path.join(ROOT, ".tmp", "mermaid");
const OUT_FILE = path.join(OUT_DIR, "diagrams.json");

const ALLOWED_EXTENSIONS = new Set([".md", ".mdx"]);

function slash(filePath) {
  return filePath.split(path.sep).join("/");
}

function hashCode(value) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function getLineNumber(text, index) {
  return text.slice(0, index).split(/\r\n|\r|\n/).length;
}

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const results = [];

  if (!(await pathExists(dir))) {
    return results;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === ".astro" ||
        entry.name === ".tmp"
      ) {
        continue;
      }

      results.push(...await walk(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();

    if (ALLOWED_EXTENSIONS.has(ext)) {
      results.push(fullPath);
    }
  }

  return results;
}

function stripDirectivesAndComments(code) {
  return String(code)
    .replace(/^\s*%%\{[\s\S]*?\}%%\s*/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("%%"))
    .join("\n")
    .trim();
}

function detectDiagramType(code) {
  const cleaned = stripDirectivesAndComments(code);
  const firstLine = cleaned.split(/\r?\n/)[0]?.trim() || "";

  if (/^(flowchart|graph)\b/.test(firstLine)) return "flowchart";
  if (/^sequenceDiagram\b/.test(firstLine)) return "sequence";
  if (/^classDiagram\b/.test(firstLine)) return "class";
  if (/^stateDiagram(?:-v2)?\b/.test(firstLine)) return "state";
  if (/^erDiagram\b/.test(firstLine)) return "er";
  if (/^gantt\b/.test(firstLine)) return "gantt";
  if (/^journey\b/.test(firstLine)) return "journey";
  if (/^gitGraph\b/.test(firstLine)) return "gitgraph";
  if (/^pie\b/.test(firstLine)) return "pie";
  if (/^mindmap\b/.test(firstLine)) return "mindmap";
  if (/^timeline\b/.test(firstLine)) return "timeline";
  if (/^quadrantChart\b/.test(firstLine)) return "quadrant";
  if (/^requirementDiagram\b/.test(firstLine)) return "requirement";
  if (/^sankey-beta\b/.test(firstLine)) return "sankey";
  if (/^(xychart-beta|xychart)\b/.test(firstLine)) return "xychart";
  if (/^(block-beta|block)\b/.test(firstLine)) return "block";
  if (/^(architecture-beta|architecture)\b/.test(firstLine)) return "architecture";
  if (/^packet-beta\b/.test(firstLine)) return "packet";
  if (/^kanban\b/.test(firstLine)) return "kanban";

  return "unknown";
}

function extractMermaidBlocks(text, file) {
  const diagrams = [];

  // Supports fenced blocks with ```mermaid or ~~~mermaid.
  // Keeps extraction conservative and does not rewrite content.
  const fenceRegex = /(^|\r?\n)(`{3,}|~{3,})[ \t]*mermaid[^\r\n]*\r?\n([\s\S]*?)\r?\n\2[ \t]*(?=\r?\n|$)/g;

  let match;
  let index = 0;

  while ((match = fenceRegex.exec(text))) {
    index += 1;

    const matchStart = match.index + (match[1] ? match[1].length : 0);
    const matchEnd = fenceRegex.lastIndex;
    const code = String(match[3] || "").replace(/\r\n?/g, "\n").trimEnd();

    diagrams.push({
      id: `${file.replace(/[\\/.\s:()]+/g, "-")}-${String(index).padStart(3, "0")}`,
      file,
      index,
      startLine: getLineNumber(text, matchStart),
      endLine: getLineNumber(text, matchEnd),
      hash: hashCode(code),
      diagramType: detectDiagramType(code),
      code
    });
  }

  return diagrams;
}

async function main() {
  const files = await walk(CONTENT_ROOT);
  const diagrams = [];

  for (const absFile of files) {
    const relFile = slash(path.relative(ROOT, absFile));
    const text = await fs.readFile(absFile, "utf8");
    diagrams.push(...extractMermaidBlocks(text, relFile));
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(diagrams, null, 2), "utf8");

  const byType = diagrams.reduce((acc, item) => {
    acc[item.diagramType] = (acc[item.diagramType] || 0) + 1;
    return acc;
  }, {});

  console.log(`Extracted ${diagrams.length} Mermaid diagrams.`);
  console.log(`Saved to ${slash(path.relative(ROOT, OUT_FILE))}`);
  console.log("By type:");
  for (const [type, count] of Object.entries(byType).sort()) {
    console.log(`  ${type}: ${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
