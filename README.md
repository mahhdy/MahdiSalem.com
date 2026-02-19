# MahdiSalem.com

Personal website for **Mehdi Salem** (مهدی سالم) — philosophy, ethics, politics, and democracy.

## Quick Start & Usage

### 1. Install & Setup

```bash
git clone https://github.com/mahhdy/MahdiSalem.com.git
cd MahdiSalem.com
npm install
npm run dev # Start local server
```

### 2. Update or Deploy (New Machine)

```bash
# Update dependencies
npm install
# Build for production
npm run build
# Preview
npm run preview
# Push changes
git add .
git commit -m "Update content"
git push origin main
# Cloudflare Pages auto-deploys
```

### 3. Add Content

- **Articles**: `src/content/articles/fa/` or `en/` — add `.md` files with frontmatter (title, description, lang, publishDate, categories, tags, interface, draft, show-header)
- **Books**: `src/content/books/fa/` or `en/` — folder per book, `index.md` for overview, chapters as `.md` files, `pdfUrl` for PDF, `showPdfViewer: true` for viewer, `show-header: false` (default) to hide redundant H1
- **Statements**: `src/content/statements/fa/` or `en/` — add `.md` files
- **Wiki**: `src/content/wiki/fa/` or `en/` — add `.md` files with section/order
- **Multimedia**: `src/content/multimedia/fa/` or `en/` — add `.md` files (type: video/audio/podcast, mediaUrl, thumbnailUrl, duration, platform, podcastName, episodeNumber, seasonNumber)

**Note on `show-header`**: By default, article and book content templates hide the first H1 heading to avoid redundancy (since the layout already shows the title). Set `show-header: true` in frontmatter if you want to display it.

### 4. Categorization & Tagging

- **Interface**: Use the `interface` field for taxonomy (see `src/data/categories.ts`)
- **Categories**: Assign one or more categories (bilingual, hierarchical)
- **Tags**: Add relevant tags for search/discovery

### 5. Analytics & Ratings

- **Visit Statistics**: Update `src/data/stats.json` manually or via API (see below)
- **Ratings**: Update `src/data/ratings.json` (client-side, or implement backend API for real ratings)

### 6. Telegram Feed Integration

1. Get Telegram Bot Token from [@BotFather](https://t.me/BotFather)
2. Deploy Cloudflare Worker (see `workers/README.md`)
3. Set environment variables:
   - `PUBLIC_TELEGRAM_WORKER_URL`
   - `PUBLIC_TELEGRAM_CHANNEL`

### 7. LaTeX Conversion

```bash
pandoc input.tex -o output.md --wrap=none
# For books with chapters
pandoc book.tex -o book.md --wrap=none --toc
```

## Features & Architecture

- **Bilingual (FA/EN)**, RTL/LTR, mobile-first, dark/light theme
- **Category Taxonomy**: 25+ categories, SVG icons, parent-child, interface field
  - **Category Cards**: Clickable with hover tooltips, show top 5 items per category
  - **Query Filtering**: URL-based filtering via `?interface=<slug>` across all list pages
  - **Filter Reset**: "Show All" button removes active filters
- **Tagging System**: Tag support for all content
- **Multimedia**: Video, audio, podcast, player components
- **Telegram Feed**: Cloudflare Worker, homepage integration
- **Analytics Dashboard**: Visit stats, rating system, TreeMap visualization
- **Wiki & Statements**: Collaborative editing, GitHub Issues
- **PDF Viewer**: In-page PDF, tab interface for books
- **SEO & Privacy**: Open Graph, Twitter Cards, no cookies by default
- **Content Controls**:
  - `show-header: false` (default) hides redundant first H1 in articles/books
  - `draft: true` marks content as unpublished

## Known Issues & Lessons Learned

- **Tagging system**: Not fully implemented; tags are supported in schema but not all UI views. Use interface/category for main grouping.
- **Interface field**: All content should use the `interface` field for taxonomy. Scripts available: `node scripts/add-interface-categories.mjs` and `node scripts/fix-interface-categories.mjs`.
- **Category/Tag/Interface**: See `src/data/categories.ts` for taxonomy. Use scripts to update content.
- **Analytics**: Visit stats and ratings are manual unless API is implemented. See `src/data/stats.json` and `src/data/ratings.json`.
- **Telegram Feed**: Requires Cloudflare Worker and environment setup. See `workers/README.md`.
- **Accessibility**: All players/components have ARIA labels and keyboard support.
- **Performance**: Lazy loading, caching, responsive images, CDN recommended for media.
- **Privacy**: No cookies/tracking by default. External embeds (YouTube/Vimeo) use privacy mode.

## Project Structure

See folder tree in repo. Key files:

- `src/content.config.ts` — content schema
- `src/data/categories.ts` — taxonomy
- `src/components/` — UI components
- `src/pages/` — route pages
- `workers/` — Telegram Worker
- `public/images/categories/` — SVG icons

How to Run
bash

# Start both servers in parallel

npm run admin:dev

# Or start individually

npm run admin:server    # → localhost:3334
npm run admin:client    # → localhost:3333
Open <http://localhost:3333> in your browser.

## Contributing

Open issues or pull requests for suggestions, bug reports, or feature requests. See `CONTRIBUTING.md` for guidelines.

## License

Content © Mehdi Salem. Code MIT licensed.
