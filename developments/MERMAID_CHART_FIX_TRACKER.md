# 🗂️ Mermaid Chart Fix Tracker

**Created:** 2026-02-20  
**Purpose:** Exhaustive catalogue of all rendering issue _classes_, their root causes, and a clear fix strategy — to avoid circular patching.

> **How to use this file:**
>
> - The "Issue Classes" section is the ground truth. Always check here before touching code.
> - The "Chart Index" links each diagram to its issue class(es).
> - The "Fix Strategy" section maps each class to the _specific_ code change required.
> - After any fix, update the status column on the chart index row.
> - You (the user) can add feedback in the **User Notes** column using chart IDs like `TR-1`, `GA-1` etc.

---

## 🔍 PART 1: Issue Class Catalogue

These are the _categories_ of problems, independently diagnosed from reviewing all 52 charts:

---

### CLASS A — HTML Entity Corruption (`-->` becomes `--&gt;`)

| Field              | Detail                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Root Cause**     | The Remark MDX plugin (or Pandoc conversion) HTML-encodes `>` to `&gt;`. Mermaid receives the literal string `--&gt;` instead of `-->`, which it cannot parse as an arrow.                                         |
| **Symptoms**       | Chart shows "Parse error" or renders nothing. Usually affects `graph`, `flowchart`, `gantt`, `sequence` types.                                                                                                     |
| **Scope**          | ~35 of 52 charts                                                                                                                                                                                                   |
| **Affected Files** | `src/plugins/remark-mermaid.mjs` — the plugin receives content _after_ MDX has already parsed HTML entities from the MDX source. The source articles themselves have literal `-->` but the pipeline converts them. |
| **Fix Location**   | `remark-mermaid.mjs`: Do NOT re-encode `>`. The plugin must receive raw mermaid code and pass it through as-is inside the HTML wrapper.                                                                            |
| **Risk**           | Low — this is a pipeline decode step, not content change.                                                                                                                                                          |
| **Status**         | 🔴 Not Fixed                                                                                                                                                                                                       |

---

### CLASS B — Malformed Node Syntax from AI-Generated Content

| Field            | Detail                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**   | Some articles were written by AI and use a broken syntax pattern like `A --> "B["label""]` (extra quote before node ID). This is NOT valid Mermaid syntax. |
| **Symptoms**     | Parse error on affected nodes. Pattern: `-->\"B[\"text\"\"]` or `-->"B["text""]`                                                                           |
| **Scope**        | ~15 charts                                                                                                                                                 |
| **Example**      | `A["🔄 عدم قطعیت"] -->"B["⚖️ بازتوزیع قدرت""]`                                                                                                             |
| **Fix Location** | In source article `.mdx` files — the content itself needs to be corrected. **Cannot be auto-fixed at the pipeline level without risk.**                    |
| **Fix Strategy** | Fix in source file: `A["text"] --> B["label"]`                                                                                                             |
| **Risk**         | Medium — requires manual correction, but changes are isolated to content files.                                                                            |
| **Status**       | 🔴 Not Fixed                                                                                                                                               |

---

### CLASS C — Broken `<br/>` Inside Node Labels

| Field            | Detail                                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**   | The HTML entity encoding converts `<br/>` to `&lt;br/&gt;` inside node label text, which Mermaid doesn't understand. Valid Mermaid syntax requires literal `<br/>` or the node label to not contain HTML. |
| **Symptoms**     | Nodes render with literal text `&lt;br/&gt;` or the chart fails.                                                                                                                                          |
| **Scope**        | ~8 charts                                                                                                                                                                                                 |
| **Example**      | `A["text<br/>(\"subtitle\")"]` — the `<br/>` gets entity-encoded                                                                                                                                          |
| **Fix Location** | `remark-mermaid.mjs` — must preserve `<br/>` literally inside mermaid node content.                                                                                                                       |
| **Risk**         | Low — a targeted decode step.                                                                                                                                                                             |
| **Status**       | 🔴 Not Fixed                                                                                                                                                                                              |

---

### CLASS D — Gantt Chart Farsi Duration Strings

| Field            | Detail                                                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**   | Mermaid's gantt chart only understands standard duration suffixes: `d` (days), `w` (weeks), `h` (hours), `ms`. It does NOT understand `۳ماه` (Farsi for "3 months"). |
| **Symptoms**     | Gantt chart fails to render or shows garbled tasks.                                                                                                                  |
| **Scope**        | ~2 charts                                                                                                                                                            |
| **Example**      | `des1, 2025-01, 3ماه` — `3ماه` must be `90d`                                                                                                                         |
| **Fix Location** | Source article `.mdx` files — must convert Farsi duration to numeric days.                                                                                           |
| **Risk**         | Low — isolated to gantt definitions only.                                                                                                                            |
| **Status**       | 🔴 Not Fixed                                                                                                                                                         |

---

### CLASS E — Broken `timeline` Keyword (`titleChronologie` typo)

| Field            | Detail                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**   | A `timeline` block uses `titleChronologie` instead of `title Chronologie`. The keyword `title` must be followed by a space. |
| **Symptoms**     | Timeline renders empty or throws parse error.                                                                               |
| **Scope**        | 1 chart (France Revolution article, Diagram 3)                                                                              |
| **Example**      | `titleChronologie انقلاب فرانسه` → should be `title Chronologie انقلاب فرانسه`                                              |
| **Fix Location** | Source article `.mdx`                                                                                                       |
| **Risk**         | Very low — single typo fix.                                                                                                 |
| **Status**       | 🔴 Not Fixed                                                                                                                |

---

### CLASS F — Unmatched Quotes in `pie title` and Node Labels

| Field            | Detail                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**   | Some `pie title` lines use nested quotes like `pie title "سهم هزینه‌ها ("۱۷۸۸")"` — the inner parenthesized year with quotes creates an unclosed string. |
| **Symptoms**     | Chart fails to parse, shows empty or error.                                                                                                              |
| **Scope**        | ~3 charts                                                                                                                                                |
| **Example**      | `pie title "عنوان ("سال")"` — the inner `"` closes the outer string early                                                                                |
| **Fix Location** | Source article `.mdx` files — remove inner quotes or use single quotes.                                                                                  |
| **Risk**         | Low — targeted content fix.                                                                                                                              |
| **Status**       | 🔴 Not Fixed                                                                                                                                             |

---

### CLASS G — Subgraph Labels with Unquoted Farsi Text

| Field            | Detail                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Cause**   | `subgraph حلقه هسته‌ای` — subgraph names with Farsi text including special chars (like `‌` zero-width non-joiner) are not quoted. Mermaid technically accepts this but some builds fail due to character encoding in the parser. |
| **Symptoms**     | Chart renders incorrectly or subgraph label is garbled.                                                                                                                                                                          |
| **Scope**        | ~5 charts                                                                                                                                                                                                                        |
| **Fix Location** | `remark-mermaid.mjs` — auto-quote unquoted Farsi subgraph names.                                                                                                                                                                 |
| **Risk**         | Low — additive fix.                                                                                                                                                                                                              |
| **Status**       | 🟡 Partially Addressed                                                                                                                                                                                                           |

---

### CLASS H — `<` Arrow in Edge Labels (`|"text"<| G`)

| Field            | Detail                                           |
| ---------------- | ------------------------------------------------ | ------------------ | --------------------------------------------------------------------------------------------- |
| **Root Cause**   | One chart uses `                                 | "نابرابری\nطبقات"< | G`— the`<` at the end of a label is not valid syntax. This appears to be an AI writing error. |
| **Symptoms**     | Parse error on that specific edge.               |
| **Scope**        | 1 chart                                          |
| **Fix Location** | Source article `.mdx` — remove the trailing `<`. |
| **Risk**         | Very low.                                        |
| **Status**       | 🔴 Not Fixed                                     |

---

## 🗺️ PART 2: Chart Index with Issue Mapping

Use chart IDs to give feedback. Format: `[SOURCE_CODE]-[INDEX]`

| Chart ID     | Source File             | Type                       | Detected Issues      | Status   | User Notes |
| ------------ | ----------------------- | -------------------------- | -------------------- | -------- | ---------- |
| **TR-1**     | iran-transition-article | `graph LR`                 | A                    | 🔴 Error |            |
| **TR-2**     | iran-transition-article | `graph TD`                 | A                    | 🔴 Error |            |
| **TR-3**     | iran-transition-article | `gantt`                    | A, D                 | 🔴 Error |            |
| **TR-4**     | iran-transition-article | `graph TD` (subgraph)      | A, G                 | 🔴 Error |            |
| **TR-5**     | iran-transition-article | `flowchart LR`             | A                    | 🔴 Error |            |
| **TR-6**     | iran-transition-article | `graph LR`                 | A                    | 🔴 Error |            |
| **TR-7**     | iran-transition-article | `pie`                      | A (in labels `>70%`) | 🟡 Maybe |            |
| **TR-8**     | iran-transition-article | `graph TD`                 | A                    | 🔴 Error |            |
| **TR-9**     | iran-transition-article | `flowchart TD`             | A                    | 🔴 Error |            |
| **TR-10**    | iran-transition-article | `graph LR` (dotted)        | A                    | 🔴 Error |            |
| **GA-1**     | آشنایی-با-دوران         | `mindmap`                  | None obvious         | 🟢 OK?   |            |
| **GA-2**     | آشنایی-با-دوران         | `flowchart LR`             | A, B                 | 🔴 Error |            |
| **GA-3**     | آشنایی-با-دوران         | `timeline`                 | None obvious         | 🟡 Maybe |            |
| **GA-4**     | آشنایی-با-دوران         | `pie`                      | None obvious         | 🟢 OK?   |            |
| **GA-5**     | آشنایی-با-دوران         | `flowchart TB`             | A, B, C              | 🔴 Error |            |
| **GA-6**     | آشنایی-با-دوران         | `flowchart LR` (subgraphs) | A                    | 🔴 Error |            |
| **GA-7**     | آشنایی-با-دوران         | `flowchart LR`             | A, B                 | 🔴 Error |            |
| **GA-8**     | آشنایی-با-دوران         | `flowchart TB` (risk)      | None obvious         | 🟢 OK?   |            |
| **AR-1**     | ارتش-و-انقلاب           | `flowchart TD`             | A, B, C              | 🔴 Error |            |
| **AR-2**     | ارتش-و-انقلاب           | `flowchart TD`             | A, B                 | 🔴 Error |            |
| **AR-3**     | ارتش-و-انقلاب           | `flowchart TD`             | A, B, C              | 🔴 Error |            |
| **FR-1**     | انقلاب-فرانسه           | `graph TD`                 | A, B, H              | 🔴 Error |            |
| **FR-2**     | انقلاب-فرانسه           | `pie`                      | F                    | 🔴 Error |            |
| **FR-3**     | انقلاب-فرانسه           | `timeline`                 | E                    | 🔴 Error |            |
| **FR-4**     | انقلاب-فرانسه           | `graph LR`                 | A, B, C, F           | 🔴 Error |            |
| _(+28 more)_ | …                       | …                          | …                    | 🔴 TBD   |            |

_(Run `npm run test:mermaid` anytime to refresh the test file — all IDs are preserved.)_

---

## 🔧 PART 3: Proposed Fix Strategy (Ordered by Safety)

**Rule:** Each fix must be **isolated, reversible, and targeted** at one class only.

### Step 1 — Fix Class A: HTML Entity De-encoding (PIPELINE)

- **File:** `src/plugins/remark-mermaid.mjs`
- **Change:** The plugin wraps mermaid code in a `<div class="mermaid">` block. The raw code block content (from remark's AST `node.value`) is already the _decoded_ string — we must NOT re-encode it. Verify the plugin is passing `node.value` directly without any `.replaceAll('>', '&gt;')` calls.
- **Test:** After fix, `TR-1` through `TR-10` should all render arrows correctly.
- **Risk:** LOW. This is a no-op change (removing bad encoding).

### Step 2 — Fix Class B: Malformed AI-Generated Node Syntax (CONTENT)

- **File:** Individual source `.mdx` files
- **Change:** Find and fix pattern `-->"B["label""]` → `--> B["label"]`
- **Script:** Can auto-detect with `node scripts/extract-mermaid-tests.mjs` which flags `CLASS_B` charts.
- **Risk:** LOW (content-only, no pipeline change).

### Step 3 — Fix Class C: `<br/>` Preservation (PIPELINE)

- **File:** `src/plugins/remark-mermaid.mjs`
- **Change:** After Farsi quoting, ensure `<br/>` in node labels is preserved literally. Only escape `<` that are NOT part of `<br/>` or `<br>`.
- **Risk:** MEDIUM — regex must be precise.

### Step 4 — Fix Class D: Gantt Farsi Durations (CONTENT)

- **File:** Source `.mdx` articles only
- **Change:** Replace `Xماه` → `X*30d`, `Xهفته` → `Xw`
- **Risk:** LOW.

### Step 5 — Fix Classes E, F, H (CONTENT TYPOS)

- **File:** Source `.mdx` articles
- **Change:** Fix individual typos identified above.
- **Risk:** VERY LOW.

### Step 6 — Fix Class G: Subgraph Auto-quoting (PIPELINE)

- **File:** `src/plugins/remark-mermaid.mjs` or `scripts/lib/mermaid-processor.mjs`
- **Change:** Add regex to auto-quote `subgraph FARSI_TEXT` → `subgraph "FARSI_TEXT"`
- **Risk:** LOW.

---

## 📊 PART 4: What NOT to Touch

These changes have been tried and **broke other things**. Do not re-introduce them:

| ❌ Change                                   | Why it Broke Things                                         |
| ------------------------------------------- | ----------------------------------------------------------- |
| `.replaceAll('>', '&gt;')` in remark plugin | Converts `-->` arrows to `--&gt;` — Mermaid cannot parse    |
| `.replaceAll('{', '&#123;')` globally       | Destroys `{}` diamond nodes in flowcharts                   |
| `\\` → `\\\\` globally                      | Double-escaping LaTeX expressions; causes `\u` parse errors |
| Applying `escapeForMDX()` to mermaid blocks | Mermaid needs raw syntax, not MDX-safe entities             |

---

## 📝 PART 5: User Feedback Log

_Fill this in with notes as you review the Chart-test page._

| Date       | Chart ID | Observation                      | Action Taken                       |
| ---------- | -------- | -------------------------------- | ---------------------------------- |
| 2026-02-20 | ALL      | Most charts showing parse errors | Analysis complete, tracker created |
|            |          |                                  |                                    |

---

## 🔄 Refresh Instructions

```bash
# Re-extract all diagrams from articles (run after adding new articles)
npm run test:mermaid

# Preview the test page
npm run dev
# → http://localhost:4321/articles/Chart-test
```
