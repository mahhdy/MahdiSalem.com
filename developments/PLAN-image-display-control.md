# Implementation Plan: Cover Image Display Control

## Overview
Add frontmatter fields `imageDisplay` and `cardImage` to control how cover images appear across the site.

## Fields
- `imageDisplay`: `'full' | 'side' | 'thumbnail' | 'hidden'` (default: `'full'`, multimedia default: `'side'`)
  - `full` — current behavior, full-width banner image
  - `side` — small image floated beside the title/header
  - `thumbnail` — very small image (icon-sized) next to title
  - `hidden` — image exists in frontmatter but not rendered on the page
- `cardImage`: `'show' | 'hidden'` (default: `'show'`)
  - Controls whether cover image appears in card/list views

## Files to Modify

### 1. Schema — `src/content.config.ts`
- [x] Add `imageDisplay` enum to books, articles, statements, multimedia schemas
- [x] Add `cardImage` enum to books, articles, statements, multimedia schemas
- [x] Multimedia defaults `imageDisplay` to `'side'`

### 2. Admin Editor — `admin/client/src/pages/ContentEditor.tsx`
- [x] Add `imageDisplay` as select field in `getFieldsForCollection()` for all collections with coverImage
- [x] Add `cardImage` as select field
- [x] Add inline cover image preview when coverImage path is set

### 3. Article Detail — `src/layouts/ArticleLayout.astro`
- [x] Accept `imageDisplay` prop
- [x] Render 4 modes: full (existing), side, thumbnail, hidden

### 4. Book Detail — `src/pages/books/[...slug].astro`
- [x] Read `imageDisplay` from entry.data
- [x] Render 4 modes

### 5. Multimedia Detail — multimedia page(s)
- [x] Default to `side` display for video content
- [x] Respect `imageDisplay` override

### 6. Articles List — `src/pages/articles/index.astro`
- [x] Read `cardImage` from frontmatter
- [x] Conditionally render image only when `cardImage !== 'hidden'`

### 7. Books List — `src/pages/books/index.astro`
- [x] Read `cardImage` from frontmatter
- [x] Conditionally render image only when `cardImage !== 'hidden'`

### 8. Commit + README
- [x] Git commit
- [x] Update README with new frontmatter fields documentation

## Status: COMPLETE
