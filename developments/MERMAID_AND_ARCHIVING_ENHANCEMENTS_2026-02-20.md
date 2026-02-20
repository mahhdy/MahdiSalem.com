# Mermaid Diagrams and Content Archiving Refinements

**Date:** February 20, 2026

## 🎯 Aimed Improvements

1. **Perfect Rendering**: Ensure Farsi text in Mermaid diagrams renders without syntax errors.
2. **User Control**: Provide "smart" interaction tools (Zoom, Pan, Reset, FullScreen) instead of static images.
3. **Smart Sizing**: Implement auto-collapse for large diagrams to avoid layout disruption.
4. **Robust Extraction**: Fix issues where Mermaid diagrams inside HTML tags were not being processed correctly.
5. **Safe Archiving**: Automate the archiving of source files into date-based folders with duplicate protection.

---

## 🔄 "What Was" vs "What It Is Now"

### 1. Mermaid Rendering & Farsi Support

- **WAS**: Farsi text often caused Mermaid syntax errors unless manually quoted. Diagrams were static and hard to read if too large.
- **IS NOW**: A dedicated `MermaidProcessor` automatically detects and quotes Farsi text. All diagrams feature a "Smart Resizer" toolbar with Zoom Slider, Pan Tool, and Reset capabilities.

### 2. Layout & Interactivity

- **WAS**: Large diagrams forced massive vertical scrolling. Code was mixed into `BaseLayout.astro`.
- **IS NOW**: Logic moved to a modular `src/scripts/mermaid-interact.ts`. Diagrams taller than 500px auto-collapse with a fade effect. Users can toggle "Pan Mode" to drag large diagrams or use a Zoom Slider for precision.

### 3. Content Extraction (HTML-Mermaid Mix)

- **WAS**: Mermaid blocks inside `<div>` or `<pre>` tags in HTML source files were often ignored or caused MDX parsing errors.
- **IS NOW**: Enhanced regex in `process-content.mjs` cleanly extracts Mermaid code from any HTML wrapper, ensuring it's treated as a first-class diagram.

### 4. Archiving Logic

- **WAS**: Processing script left source files in the `content-source` folder or had basic archiving that could overwrite files with same names.
- **IS NOW**: All processed files are moved to `content-source/Archive/YYYYMMDD/`. If a filename collision occurs, a unique timestamp is appended (e.g., `file_1771612832244.pdf`), ensuring zero data loss.

---

## 🛠 File Changes Summary

- `scripts/process-content.mjs`: Improved extraction regex and finalized archiving logic.
- `src/plugins/remark-mermaid.mjs`: Updated to inject advanced toolbar and metadata.
- `src/scripts/mermaid-interact.ts`: **New** dedicated script for all diagram interactions.
- `src/layouts/BaseLayout.astro`: Cleaned up manual scripts to use the new modular import.
- `src/styles/global.css`: Added styles for Zoom Slider, Pan Tool active states, and collapsed fades.
