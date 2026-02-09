# MahdiSalem.com

Personal website for **Mehdi Salem** (مهدی سالم) - independent researcher in analytical philosophy and ethics, political writer focused on Iran's transition to democracy.

## Tech Stack

- **Framework**: [Astro](https://astro.build) (Static Site Generation)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) with full RTL support
- **Content**: Markdown/MDX via Astro Content Collections
- **Comments**: [Giscus](https://giscus.app) (GitHub Discussions-based)
- **Newsletter**: [Buttondown](https://buttondown.email)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com)
- **i18n**: Persian (fa, RTL, default) + English (en, LTR)

## Features

- Bilingual (Persian RTL / English LTR) with automatic direction switching
- Online book reader with chapter navigation, sidebar TOC, and reading progress
- Blog with category filtering and tag support
- Wiki with controlled collaboration via GitHub Issues
- Statements/press releases section
- Dark/light theme toggle
- Newsletter signup (Buttondown)
- Giscus comments on articles
- RSS feeds (per language)
- SEO optimized (Open Graph, Twitter Cards, sitemap, structured URLs)
- Privacy-friendly (no cookies, no tracking by default)
- Ko-fi donation integration

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

1. Create a book overview in `src/content/books/fa/my-book.md`
2. Create chapters as `src/content/books/fa/ch01-name.md` with `bookSlug: "fa/my-book"` in frontmatter

### Wiki Pages

Create `.md` files in `src/content/wiki/fa/` or `src/content/wiki/en/` with `section` and `order` frontmatter.

## Converting from LaTeX

```bash
# Convert LaTeX to Markdown
pandoc input.tex -o output.md --wrap=none

# For books with chapters
pandoc book.tex -o book.md --wrap=none --toc
```

## Deployment (Cloudflare Pages)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `18` |

## Configuration Checklist

Before deploying, update these placeholders:

- [ ] `astro.config.mjs` - Set your actual domain in `site`
- [ ] `src/components/Giscus.astro` - Set GitHub repo details
- [ ] `src/components/Newsletter.astro` - Set Buttondown username
- [ ] `src/pages/contact.astro` - Set Formspree form ID
- [ ] GitHub Issue templates - Set your GitHub username
- [ ] Social media links in contact pages

## License

Content is copyright Mehdi Salem. Code is MIT licensed.
