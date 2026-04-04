# Technical Documentation

## Architecture Overview

- **Astro static site** with content collections for articles, books, statements, wiki, multimedia
- **Category taxonomy**: defined in `src/data/categories.ts`, used via `interface` field in content
- **Tagging system**: tags supported in schema, not fully surfaced in UI
- **Multimedia system**: video/audio/podcast, player components, responsive, bilingual
- **Telegram feed**: Cloudflare Worker, homepage integration, caching, environment variables
- **Analytics**: visit stats and ratings tracked in `src/data/stats.json` and `src/data/ratings.json`
- **PDF viewer**: in-page, tab interface for books

## Content Pipeline & Schema

- **Schema**: Defined in `src/content.config.ts`. Extends the basic Astro `zod` schema with:
  - **Visual Controls**: `imageDisplay`, `cardImage` for granular layout control.
  - **Multimedia**: Specific fields for `duration`, `platform` (YouTube/Self-hosted), and `mediaUrl`.
  - **Governance**: `draft`, `hidden`, and `aiRole` (to track AI assistance levels).
  - **Extended PDF/Slides**: `pdfUrl`, `showPdfViewer`, `hasSlide`, `slideArray`.

- **Books**: Now structured as **folders** per book. 
  - `src/content/books/{fa|en}/{book-slug}/index.mdx` is the entry point.
  - Chapters are separate `.mdx` files in the same folder.
  - `bookSlug` field links chapters to summaries.

- **Scripts/Pipeline**:
  - `process-content.mjs`: Core pipeline for converting LaTeX, DOCX, and HTML to MDX.
  - Mermaid Processor: Automated Farsi support and interactive controls (Zoom/Pan).
  - Archiving: Automatic movement of processed source files to `content-source/Archive/YYYYMMDD`.

## Deployment & Environment

- **Cloudflare Pages**: auto-deploys on push to main
- **Telegram Worker**: deploy via Wrangler, set secrets and environment variables
- **Local development**: `npm run dev`, `.env` for local variables

## Accessibility, Performance, Privacy

- ARIA labels, keyboard navigation, alt text, semantic HTML
- Lazy loading, caching, responsive images, CDN for media
- No cookies/tracking by default, privacy mode for embeds

## Lessons Learned

- Tagging system needs UI integration
- Interface/category scripts ensure taxonomy consistency
- Analytics/rating APIs recommended for automation
- Telegram integration requires careful environment setup

## References

- `src/content.config.ts` — content schema
- `src/data/categories.ts` — taxonomy
- `src/components/` — UI components
- `src/pages/` — route pages
- `workers/` — Telegram Worker
- `public/images/categories/` — SVG icons

---

For further development, see the "Idea to implement.." file for prompts, requests, and future plans.
