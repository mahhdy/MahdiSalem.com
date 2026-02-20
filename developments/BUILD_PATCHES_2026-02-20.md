# MDX Build & Content Pipeline Patches

**Date:** February 20, 2026
**Status:** ✅ Fully Resolved & Build Passing

## 🛡️ Critical Fixes (The "Patches")

The following technical barriers were resolved to ensure zero-error builds and high-quality content rendering.

### 1. MDX Strictness & Special Characters

- **The Issue:** MDX interprets `<` and `{` as JSX starts. Lone braces or backslashes (like `\u` or `\x` in LaTeX math) were crashing the Vite/Astro build with "Could not parse expression" or "Expecting Unicode escape sequence".
- **The Patch:**
  - Implemented an automated **HTML Entity Converter** in `process-content.mjs`.
  - Curly braces in text are now safely converted to `&#123;` and `&#125;`.
  - Potentially dangerous backslashes (like `\ux`) are escaped to `&#92;ux`.
  - Fenced code blocks and valid HTML tags are protected during this escaping process.

### 2. Pandoc to MDX Cleanup

- **The Issue:** Pandoc conversion from LaTeX often left behind technical attributes like `{#id .class}` or `{reference-type="ref"}`. MDX tried to parse these as JavaScript objects and failed.
- **The Patch:** Added robust regex filters to the post-processing pipeline to strip all "Pandoc Attributes".
- **Container Support:** Improved support for Pandoc containers (`:::`) by allowing 3 or more colons, ensuring they correctly transform into `<div>` tags with proper closing tags.

### 3. Mermaid Farsi Syntax Errors

- **The Issue:** Previous "auto-quoting" logic was too broad. It was quoting arrows (e.g., `-->` became `"-->"`), which broke the Mermaid syntax.
- **The Patch:** Refined the `MermaidProcessor` regex to target **only** text inside node definitions (like `[]`, `()`, `{}`, `(( ))`) while leaving directional arrows and keywords intact.

### 4. Content Scanning & Categorization

- **Archive Isolation:** Fixed the pipeline to **ignore the `Archive` folder**. Previously, it was re-scanning archived versions, leading to duplicate content and ID conflicts.
- **Book vs Article Logic:** Resolved a bug where book files occasionally defaulted to the articles directory. The scanner now strictly identifies books based on folder structure or explicit `--book` flags.

---

## 📈 Progress Update

### ✅ Completed (Feb 20)

- **Interactive Mermaid:** Zoom, Pan, Reset, Full-Screen, and Auto-Collapse are fully integrated and theme-aware.
- **Robust Archiving:** Verified date-based archiving with conflict resolution (`file_TIMESTAMP.ext`).
- **LaTeX-to-MDX Pipeline:** "Shadow Political Court for Iran" (complex LaTeX) now renders perfectly in MDX.
- **Build Stabilization:** The site successfully builds (`npm run build`) without any acorn/parsing errors.

### 🔄 In Progress

- **TikZ Rendering:** Standalone LaTeX TikZ diagrams are currently being mapped to placeholders when XeLaTeX is unavailable on the build runner.

---

## 🛠️ Updated File manifest

- `scripts/process-content.mjs`: Core logic for escaping, attribute stripping, and archive isolation.
- `src/plugins/remark-mermaid.mjs`: Logic for injecting interactive UI into diagrams.
- `src/pages/books/[...slug].astro`: Refactored routing to handle clean slugs without extensions.
- `src/content.config.ts`: Verified schema compatibility for new fields.
