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

- Content files: Markdown/MDX, frontmatter includes title, description, lang, publishDate, categories, tags, interface, draft
- Books: folder per book, `index.md` for overview, chapters as `.md` files, `pdfUrl` for PDF, `showPdfViewer: true` for viewer
- Scripts/Pipeline:
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
