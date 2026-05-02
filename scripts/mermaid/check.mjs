import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = process.cwd();

function slash(filePath) {
  return filePath.split(path.sep).join("/");
}

function getArg(name, fallback = null) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  if (!found) return fallback;
  return found.slice(prefix.length);
}

function hasArg(name) {
  return process.argv.includes(name);
}

const INPUT_FILE = path.resolve(ROOT, getArg("--input", ".tmp/mermaid/diagrams.json"));
const REPORT_JSON = path.resolve(ROOT, getArg("--report-json", ".tmp/mermaid/report.json"));
const REPORT_MD = path.resolve(ROOT, getArg("--report-md", ".tmp/mermaid/report.md"));
const EXPECT_MODE = hasArg("--expect");

function getMermaidConfig() {
  return {
    startOnLoad: false,
    securityLevel: "loose",
    theme: "default",
    fontFamily: "Vazirmatn, Vazir, Tahoma, sans-serif",
    flowchart: {
      htmlLabels: true,
      useMaxWidth: true
    },
    sequence: {
      useMaxWidth: true
    },
    gantt: {
      useMaxWidth: true
    }
  };
}

function mdFence(code, lang = "") {
  const value = String(code || "");
  const fence = value.includes("````") ? "`````" : "````";
  return `${fence}${lang}\n${value}\n${fence}`;
}

function makeMarkdownReport(results) {
  const failed = results.filter((item) => !item.ok);
  const passed = results.length - failed.length;

  const byType = results.reduce((acc, item) => {
    const type = item.diagramType || "unknown";
    acc[type] = acc[type] || { total: 0, failed: 0 };
    acc[type].total += 1;
    if (!item.ok) acc[type].failed += 1;
    return acc;
  }, {});

  const lines = [];

  lines.push("# Mermaid Render Report");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total: ${results.length}`);
  lines.push(`- Passed: ${passed}`);
  lines.push(`- Failed: ${failed.length}`);
  lines.push("");

  lines.push("## By Type");
  lines.push("");
  lines.push("| Type | Total | Failed |");
  lines.push("|---|---:|---:|");
  for (const [type, stat] of Object.entries(byType).sort()) {
    lines.push(`| ${type} | ${stat.total} | ${stat.failed} |`);
  }
  lines.push("");

  if (failed.length === 0) {
    lines.push("## Failed Diagrams");
    lines.push("");
    lines.push("No failed Mermaid diagrams.");
    lines.push("");
    return lines.join("\n");
  }

  lines.push("## Failed Diagrams");
  lines.push("");

  for (const item of failed) {
    lines.push(`### ${item.file}:${item.startLine}`);
    lines.push("");
    lines.push(`- ID: \`${item.id}\``);
    lines.push(`- Type: \`${item.diagramType || "unknown"}\``);
    lines.push(`- Hash: \`${item.hash || ""}\``);
    lines.push("");
    lines.push("Error:");
    lines.push("");
    lines.push(mdFence(item.error || "Unknown error", "txt"));
    lines.push("");
    lines.push("Code:");
    lines.push("");
    lines.push(mdFence(item.code || "", "mermaid"));
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const inputRaw = await fs.readFile(INPUT_FILE, "utf8");
  const diagrams = JSON.parse(inputRaw);

  const mermaidPath = path.join(ROOT, "node_modules", "mermaid", "dist", "mermaid.min.js");

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  page.on("pageerror", (error) => {
    console.error("Browser page error:", error);
  });

  await page.setContent(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
</head>
<body>
  <div id="root"></div>
</body>
</html>`);

  await page.addScriptTag({
    path: mermaidPath
  });

  await page.evaluate((config) => {
    window.mermaid.initialize(config);
  }, getMermaidConfig());

  const results = [];

  for (const diagram of diagrams) {
    const result = {
      ...diagram,
      ok: false,
      error: null,
      svgLength: 0
    };

    try {
      const rendered = await page.evaluate(async ({ id, code }) => {
        const safeId = `m_${String(id).replace(/[^a-zA-Z0-9_]/g, "_")}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

        try {
          // parse is useful, but render is the real source of truth.
          if (window.mermaid.parse) {
            await window.mermaid.parse(code);
          }

          const output = await window.mermaid.render(safeId, code);

          if (!output || !output.svg) {
            throw new Error("Mermaid returned empty SVG.");
          }

          const svg = String(output.svg);

          if (svg.includes("aria-roledescription=\"error\"")) {
            throw new Error("Mermaid rendered an error SVG.");
          }

          if (svg.includes("Syntax error in text")) {
            throw new Error("Mermaid rendered syntax error SVG.");
          }

          return {
            ok: true,
            svgLength: svg.length,
            error: null
          };
        } catch (error) {
          return {
            ok: false,
            svgLength: 0,
            error: String(error?.message || error)
          };
        }
      }, {
        id: diagram.id,
        code: diagram.code
      });

      result.ok = rendered.ok;
      result.error = rendered.error;
      result.svgLength = rendered.svgLength || 0;
    } catch (error) {
      result.ok = false;
      result.error = String(error?.message || error);
    }

    results.push(result);

    const icon = result.ok ? "✅" : "❌";
    console.log(`${icon} ${diagram.file}:${diagram.startLine} [${diagram.diagramType}] ${diagram.hash}`);

    if (!result.ok) {
      console.log(`   ${result.error}`);
    }
  }

  await browser.close();

  await fs.mkdir(path.dirname(REPORT_JSON), { recursive: true });
  await fs.writeFile(REPORT_JSON, JSON.stringify(results, null, 2), "utf8");
  await fs.writeFile(REPORT_MD, makeMarkdownReport(results), "utf8");

  const failed = results.filter((item) => !item.ok);
  const passed = results.length - failed.length;

  console.log("");
  console.log(`Checked ${results.length} Mermaid diagrams.`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`JSON report: ${slash(path.relative(ROOT, REPORT_JSON))}`);
  console.log(`Markdown report: ${slash(path.relative(ROOT, REPORT_MD))}`);

  if (EXPECT_MODE) {
    const expectationMismatches = results.filter((item) => {
      if (typeof item.expectedOk !== "boolean") return false;
      return item.ok !== item.expectedOk;
    });

    if (expectationMismatches.length > 0) {
      console.log("");
      console.log(`Expectation mismatches: ${expectationMismatches.length}`);
      for (const item of expectationMismatches) {
        console.log(`❌ ${item.id}: expectedOk=${item.expectedOk}, actual=${item.ok}`);
      }
      process.exit(1);
    }

    console.log("");
    console.log("Self-test expectations matched.");
    process.exit(0);
  }

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
