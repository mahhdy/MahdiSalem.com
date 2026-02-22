# Development Progress Tracker

This document consolidates earlier tracking files to provide a single overview of project milestones, ideas, and fixes.

---

## 🚀 Admin Panel Milestones (from ADMIN_MILESTONES.md)

**Phase:** 1 — Foundation ✅
**Branch:** `feature/admin-panel`

### ✅ Completed

1. **Foundation & Project Scaffold**: Hono server (:3334), Vite + React 19 SPA (:3333), Dark glassmorphism design. All APIs verified.
2. **Content CRUD**: Editor with Monaco, Image picker linked to Media Manager.
3. **Taxonomy Management**: Category CRUD, Tag rename/merge across frontmatter.
4. **i18n & Schema**: Atomic i18n key management, Schema Inspector.
5. **Media & Pipeline**: File upload, Script runner with high-frequency polling.
6. **Additional Features**: AI Tagging interface (Preview/Approve/Apply), MDX/Git Cheatsheet added, nested deep route fix for content browser.

---

## 💡 Ideas and Implementation Plans (from Idea to implement.md)

### ✅ Recently Completed

- **Category View Improvements**: Query-based filtering (`?interface=<slug>`), Tooltips, Item Previews.
- **Show-Header Frontmatter**: Support for `show-header: false` to hide redundant h1 headings.
- **Mermaid & Archiving (Feb 20, 2026)**: Smart sizing (zoom, pan, auto-collapse), Farsi text support, and automated date-based archiving with duplicate protection.
- **Build Stability & MDX Patches (Feb 20, 2026)**: Fixed MDX parsing crashes by implementing robust character escaping (`{`, `}`, `\`) and stripping Pandoc-specific attributes from converted content.

### ✅ Phase 2 — Site Enhancements (Feb 22, 2026)

**Branch:** `feature/site-enhancements-phase2`

#### Batch 1 — Quick Wins
- **Footer 2-column on mobile**: Changed `grid-cols-1` → `grid-cols-2`, brand spans full width, links in two side-by-side columns. Also added Statements, Social, Tags, Search links.
- **PDF Desktop — IDM bypass**: Added "Open in Browser" button that fetches PDF as a Blob URL, bypassing download-manager interception. Falls back to `#toolbar=1&view=FitH` hash.
- **PDF Mobile — Native experience**: On screens ≤768px the iframe is hidden; a clean card is shown with "Open PDF" (→ native app) and "Download" buttons.

#### Batch 2 — `hidden` Frontmatter
- Added `hidden: boolean (default: false)` and `showInContents: boolean (default: true)` to **all five** collection schemas in `src/content.config.ts`.
- Also added `sourceType`, `book`, `authorTitle`, `email`, `website`, `location`, `date` as optional passthrough fields so existing content files don't cause schema errors.
- Created `scripts/patch-hidden-frontmatter.mjs` — run with `--apply` to add missing fields to all content files, skipping the Archive folder.
- Patched **24 content files** automatically.

#### Batch 3 — New Pages & Telegram Toggle

- **`src/config/site.ts`**: Central site config. Controls `telegramView` (`'full'` | `'compact'`), `telegramHomeLimit`, and per-platform social handles.
- **`/social` page** (`src/pages/social/index.astro`): Social media hub with platform tabs (Telegram live, X/Instagram/Facebook/LinkedIn as stubs). Only tabs with a configured handle are shown.
- **`TelegramFeedCompact` component**: 2-column card grid variant for the homepage. Links to `/social` and the Telegram channel. Activated by `siteConfig.telegramView = 'compact'`.
- **Homepage updated**: Imports both feed variants; renders the one specified in `siteConfig`.
- **`/contents` page updated**: Added two tabs — "By Category" (existing view) and "By Tag" (tag cloud with counts linking to `/tags/[tag]`). Also now filters out `hidden` content.
- **i18n updated**: Added `nav.social`, `social.*`, `hidden.*`, `contents.tab_categories`, `contents.tab_tags`, `contents.no_tags` keys to both `fa.json` and `en.json`.

### 🔄 Planned / In Progress (Phase 3)

- **Admin pages**: SocialMediaManager, HiddenContentManager, AllContentsManager, SiteConfigManager (Config/Setup page), FrontmatterManager.
- **Bulk frontmatter editing**: Multi-select in ContentBrowser + batch field-change dialog.
- **New subject types**: multimedia and social media as filterable types in search and content browser.

### 🔮 Future Plans

- Content pipeline improvements (LaTeX/Markdown conversion). [Mostly Done]
- Tagging system UI integration. [Done]
- Analytics/rating API automation.
- Multimedia enhancements (playlists, transcript search, subtitles, waveform).
- Telegram feed (comment/reaction counts, embedded media, scheduled updates).
- Accessibility and Performance optimizations.
- Privacy compliance.

---

## 🛠️ Category View Fix Log (from CATEGORY_VIEW_FIX.md)

**Problem:** Category view was showing empty because the `interface` field wasn't defined in Astro's schema, even though it was in the markdown files.

**Solution:**

1. Added `interface: z.string().optional()` to all collection schemas in `src/content.config.ts`.
2. Modified `CategoryTabView.astro` to prioritize `item.data.interface` for matching with fallback to legacy `categories`.
3. Ran scripts to add and fix interface categories in all 33 files.

**Results:** Content is now properly categorized natively in Astro across Articles, Statements, and Books collections.
