# Idea to Implement

## Recently Completed

### ✅ Category View Improvements (Feb 2026)

- **Category Cards**: Now fully clickable with hover descriptions and tooltip functionality
- **Query-Based Filtering**: Implemented `?interface=<slug>` URL filtering across all content list pages (articles, books, multimedia - both FA & EN)
- **Filter Reset**: Added "Show All" functionality via URL state management
- **Preview Tooltips**: Category descriptions shown on hover
- **Item Preview**: Top 5 items displayed on each category card with direct links

### ✅ Show-Header Frontmatter Support

- Added `show-header: false` as default option in content schema
- Allows hiding redundant first H1 headings in articles and books
- User can override with `show-header: true` when needed

## Planned / In Progress

### 🔄 AIO Contents Page (All-in-One Content View)

- Bilingual sitemap-style page showing all content organized by:
  - Interface (primary taxonomy)
  - Category (legacy support)
  - Tags (topical organization)
  - Subject (thematic grouping)
- Switchable grouping modes
- Colored SVG icons per content type (book/article/multimedia)
- Scrollable card previews (5-10 items per category)

### 🔄 Local Admin Panel (Feb 2026) — `feature/admin-panel` branch

A local-only web admin UI (`localhost:3333`) for managing site content without touching production.
Full proposal in the conversation artifact `admin_panel_proposal.md`.

**Architecture**: Hono server (port 3334) + Vite React SPA (port 3333). Reads/writes flat files directly.

**Modules planned:**

- **Dashboard** — health check: drafts, missing metadata, category coverage
- **Content Editor** — type-safe frontmatter forms for all 5 collections (books, articles, statements, multimedia, wiki)
- **Category Manager** — edit `categories.ts` via a visual tree (no TypeScript editing)
- **Tag Manager** — canonical tag list; rename/merge across all frontmatter
- **Schema Inspector** — surface field drift (`category`/`categories`/`subject`/`interface`) + bulk migration
- **i18n Manager** — parity table for `fa.json` ↔ `en.json` with inline edit
- **Script Runner** — trigger `process-content.mjs` from browser with live log stream
- **Media Manager** — browse/upload `public/` assets, copy paths to clipboard

Start with: `npm run admin:dev`

## Future Plans

- Content pipeline improvements (LaTeX/Markdown conversion, AI tagging)
- Tagging system UI integration
- Analytics/rating API automation
- Multimedia enhancements: playlists, transcript search, subtitles, waveform visualization
- Telegram feed: comment/reaction counts, embedded media, scheduled updates
- Accessibility: captions/subtitles, improved ARIA support
- Performance: further lazy loading, CDN optimization, responsive images
- Privacy: GDPR compliance, external embed opt-out

## Example Prompts

- "Add tagging UI to category view"
- "Implement backend API for real-time ratings"
- "Integrate Telegram comment counts"
- "Improve accessibility for multimedia players"
- "Optimize image delivery for mobile"

## Requests

- Feature suggestions, bug reports, and improvement ideas can be submitted via GitHub Issues or Pull Requests.

---
For technical details, see `technical.md`. For usage and setup, see `README.md`.
