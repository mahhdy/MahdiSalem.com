import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, ".tmp", "mermaid");
const SELFTEST_FILE = path.join(OUT_DIR, "selftest.json");
const CHECK_SCRIPT = path.join(ROOT, "scripts", "mermaid", "check.mjs");

const diagrams = [
  {
    id: "selftest-valid-flowchart-br",
    file: "SELFTEST",
    index: 1,
    startLine: 1,
    endLine: 3,
    hash: "selftest001",
    diagramType: "flowchart",
    expectedOk: true,
    code: `flowchart TB
    A["خط اول<br/>خط دوم"] --> B["OK"]`
  },
  {
    id: "selftest-valid-pie",
    file: "SELFTEST",
    index: 2,
    startLine: 1,
    endLine: 7,
    hash: "selftest002",
    diagramType: "pie",
    expectedOk: true,
    code: `pie
    title اولویتبندی ارزشها
    "آزادی فردی" : 35
    "نظم و سنت" : 20
    "برابری اقتصادی" : 30`
  },
  {
    id: "selftest-valid-xychart-beta",
    file: "SELFTEST",
    index: 3,
    startLine: 1,
    endLine: 6,
    hash: "selftest003",
    diagramType: "xychart",
    expectedOk: true,
    code: `xychart-beta
    title "Income trend"
    x-axis [1, 2, 3, 4]
    y-axis "Y" 0 --> 10
    line [1, 3, 5, 8]`
  },
  {
    id: "selftest-invalid-flowchart",
    file: "SELFTEST",
    index: 4,
    startLine: 1,
    endLine: 2,
    hash: "selftest004",
    diagramType: "flowchart",
    expectedOk: false,
    code: `flowchart TB
    A -->`
  }
];

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(SELFTEST_FILE, JSON.stringify(diagrams, null, 2), "utf8");

  const result = spawnSync(process.execPath, [
    CHECK_SCRIPT,
    `--input=${SELFTEST_FILE}`,
    `--report-json=${path.join(OUT_DIR, "selftest-report.json")}`,
    `--report-md=${path.join(OUT_DIR, "selftest-report.md")}`,
    "--expect"
  ], {
    cwd: ROOT,
    stdio: "inherit",
    shell: false
  });

  process.exit(result.status ?? 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
