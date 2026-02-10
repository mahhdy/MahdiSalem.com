# MahdiSalem.com

Personal website for **Mehdi Salem** (مهدی سالم) - independent researcher in analytical philosophy and ethics, political writer focused on Iran's transition to democracy.

📖 **[Configuration Guide](./CONFIGURATION.md)** - راهنمای پیکربندی ویژگی‌های جدید / Step-by-step setup guide for new features

## Tech Stack

- **Framework**: [Astro](https://astro.build) (Static Site Generation)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with full RTL support
- **Content**: Markdown/MDX via Astro Content Collections
- **Comments**: [Giscus](https://giscus.app) (GitHub Discussions-based)
- **Newsletter**: [Buttondown](https://buttondown.email)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com)
- **i18n**: Persian (fa, RTL, default) + English (en, LTR)

## Features

### Core Features

- **Bilingual Support** - Full Persian (RTL) and English (LTR) with automatic direction switching
- **Online Book Reader** - Chapter navigation, sidebar TOC, in-page TOC, and reading progress tracking
- **Blog System** - Category filtering, tag support, and search functionality
- **Wiki** - Collaborative knowledge base with controlled edits via GitHub Issues
- **Statements/Press Releases** - Dedicated section for official statements
- **Dark/Light Theme** - User-toggleable theme with system preference detection
- **Newsletter Integration** - Buttondown email newsletter signup
- **Comments System** - Giscus-powered comments on articles (GitHub Discussions-based)
- **RSS Feeds** - Separate feeds per language
- **SEO Optimized** - Open Graph, Twitter Cards, sitemap, structured URLs
- **Privacy-Friendly** - No cookies, no tracking by default
- **Ko-fi Integration** - Donation support

### Advanced Analytics Dashboard

- **Squarified TreeMap Visualization** - Advanced 2D layout algorithm for optimal space utilization
- **Interactive Tabs** - Switch between tag-based and category-based visualizations
- **Smart Tooltips** - Hover over blocks to see top 3 most popular content items
- **Visit Statistics** - Real-time tracking and display of content popularity
- **Internationalized** - Full support for Persian/English with locale-specific number formatting

### Content Rating System

- **Star Ratings** - 5-star rating display on all articles and books
- **Interactive Voting** - Click-to-rate functionality with visual feedback
- **Vote Tracking** - Display of total votes and average ratings
- **Duplicate Prevention** - LocalStorage-based prevention of multiple ratings
- **Integrated Display** - Seamless integration in content layouts

### Enhanced Content Discovery

- **Real-time Search** - Instant search across titles and descriptions
- **Multi-Criteria Sorting** - Sort by newest, oldest, most popular, or top-rated
- **Category Filtering** - Filter content by categories (works with search and sort)
- **Rating Badges** - Visual rating indicators on content cards
- **Visit Count Display** - Show popularity metrics on all content
- **Responsive Design** - Mobile-optimized search and filter controls

## Project Structure

```
src/
├── components/       # Reusable Astro components
├── content/          # Markdown content (articles, books, statements, wiki)
│   ├── articles/
│   │   ├── fa/       # Persian articles
│   │   └── en/       # English articles
│   ├── books/
│   │   ├── fa/       # Persian books & chapters
│   │   └── en/       # English books & chapters
│   ├── statements/
│   │   ├── fa/
│   │   └── en/
│   └── wiki/
│       ├── fa/
│       └── en/
├── i18n/             # Translation files (fa.json, en.json)
├── data/             # Static data (stats.json for visits, ratings.json for content ratings)
├── layouts/          # Page layouts (Base, Article, Book)
├── pages/            # Route pages
│   ├── en/           # English pages (prefixed)
│   └── ...           # Persian pages (default, no prefix)
└── styles/           # Global CSS with Tailwind
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Content

### Articles

Create a new `.md` file in `src/content/articles/fa/` or `src/content/articles/en/`:

```markdown
---
title: "Article Title"
description: "Short description"
lang: fa
publishDate: 2025-03-01
categories:
  - Category Name
tags:
  - tag1
  - tag2
---

Article content here...
```

### Books

Books are organized in subdirectories. This allows managing chapters as separate files within a book's folder.

1. Create a folder in `src/content/books/fa/` or `en/` named after your book slug (e.g., `my-book`).
2. Create an `index.md` (or `.mdx`) inside that folder for the book overview.
3. Create chapters as separate files (e.g., `ch01-intro.md`, `ch02-laws.md`) inside the same folder.
4. The system automatically associates chapters based on their folder location.
5. Use `chapterNumber: N` in the chapter frontmatter to control the sort order.

**Note:** Only the `index.md` files appear in the main book lists (the home page and `/books` index). Chapters are visible inside the book reader.

### Pushing Content

To update the live website:

1. **Commit your changes**: `git add .` then `git commit -m "Add new article/book: [Title]"`
2. **Push to GitHub**: `git push origin main`
3. **Automatic Deployment**: Cloudflare Pages will automatically detect the push, build the site, and deploy it.
4. **Verification**: Check the [Cloudflare Pages Dashboard](https://dash.cloudflare.com) or wait for the build to complete (usually 1-2 minutes).
Create a new `.md` file in `src/content/statements/fa/` or `src/content/statements/en/`:

```markdown
---
title: "Statement Title"
description: "Short description"
lang: fa
publishDate: 2025-03-01
type: statement # options: statement, press, position
---

Statement content here...
```

### Wiki Pages

Create `.md` files in `src/content/wiki/fa/` or `src/content/wiki/en/` with `section` and `order` frontmatter.

### Drafts and Feedback

Content marked with `draft: true` in the frontmatter is displayed alongside published content in the main lists (Articles, Books, etc.), allowing readers to view, rate, and provide feedback on work-in-progress content.

```markdown
---
...
draft: true
---
```

**Note:** Draft content is included in:

- Main content lists (articles, books)
- Search and filtering
- Rating system
- Analytics dashboard

Draft content is excluded from:

- RSS feeds
- Homepage "Latest" sections (in some cases)

A dedicated **Drafts** page (`/drafts` or `/en/drafts`) is available to view only draft content across all content types.

## Converting from LaTeX

```bash
# Convert LaTeX to Markdown
pandoc input.tex -o output.md --wrap=none

# For books with chapters
pandoc book.tex -o book.md --wrap=none --toc
```

## Data Configuration

### Analytics and Ratings

The website uses two JSON files in `src/data/` to track content metrics:

#### `stats.json` - Visit Statistics

```json
{
  "visits": {
    "articles/fa/article-slug": 1250,
    "books/en/book-slug": 840
  }
}
```

**Update Method:**

- Manually update visit counts from your analytics provider (e.g., Cloudflare Analytics, Google Analytics)
- Or implement a server-side API to track visits dynamically

#### `ratings.json` - Content Ratings

```json
{
  "articles/fa/article-slug": {
    "average": 4.5,
    "count": 120
  },
  "books/fa/book-slug": {
    "average": 4.8,
    "count": 85
  }
}
```

**Current Implementation:**

- Client-side rating submission uses `localStorage` to prevent duplicate votes
- Ratings are simulated/not persisted to the server
- You can manually update `ratings.json` to display custom ratings

**To Enable Real Rating Storage:**

1. Create a backend API endpoint (e.g., Cloudflare Workers, Netlify Functions)
2. Modify `src/components/Rating.astro` to POST ratings to your API
3. Update `ratings.json` periodically from your database
4. Consider implementing authentication to prevent abuse

## Configuration Checklist

Before deploying, update these placeholders:

- [ ] `astro.config.mjs` - Set your actual domain in `site`
- [ ] `src/components/Giscus.astro` - Set GitHub repo details
- [ ] `src/components/Newsletter.astro` - Set Buttondown username
- [ ] `src/pages/contact.astro` - Set Formspree form ID
- [ ] GitHub Issue templates - Set your GitHub username
- [ ] Social media links in contact pages
- [ ] `src/data/stats.json` - Add your actual visit statistics
- [ ] `src/data/ratings.json` - Add initial ratings or leave empty
- [ ] **(Optional)** Implement backend API for real-time ratings storage

## License

Content is copyright Mehdi Salem. Code is MIT licensed.
