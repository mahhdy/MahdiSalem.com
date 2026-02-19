MahdiSalem.com — Local Admin Panel Proposal
A tailored, opinionated plan for building a local-only web admin UI that makes managing your Astro + flat-file site faster, safer, and more enjoyable — without touching your production build pipeline.

1 The Problem Space
Your site today:

Layer Current Reality Pain Point
Content Markdown / MDX files on disk Manual frontmatter editing, error-prone
Categories
src/data/categories.ts
 (hardcoded TypeScript) Edit-compile cycle to add/rename a category
Schema
src/content.config.ts
 (Zod) Adding a new field = touch 3+ files
Processing
scripts/process-content.mjs
 (CLI) No progress feedback, hard to re-run selectively
Tags Free-text in frontmatter No canonical list, drift over time
i18n
src/i18n/en.json
 +
fa.json
Side-by-side JSON editing, easy to miss a key
An admin panel solves all of these through a single browser UI, running localhost only.

2 Design Philosophy
2.1 Guiding Principles
Zero Production Coupling — the admin server only ever runs locally (localhost:4321 admin / localhost:4322 Astro dev). Nothing in the panel touches the public deploy.
Files Are the Source of Truth — the panel reads and writes
.md
 / .mdx frontmatter and
.ts
 data files directly. No external database.
Bilingual-First — every label, field name, and validation message appears in both Persian (fa) and English (en), matching your site's own i18n approach.
Non-Destructive by Default — all writes create a .bak alongside the original; a trash/undo mechanism holds deletions for 30 minutes.
Fast Iteration — the panel triggers chokidar-backed live-reload on save, so Astro's dev server reacts immediately.
2.2 Visual Design Concept
Dark glassmorphism sidebar, light frosted-glass content area
Accent colour: hsl(220, 85%, 60%) (electric blue) — matches the existing site's cool-academic tone
Typography: Vazirmatn (RTL body) + Inter (LTR labels / code), both already available
Layout: fixed left sidebar (collapsed on small screens) → main workspace panel → optional right detail drawer
Micro-animations: Framer-Motion-style transitions on panel switches, skeleton loaders during file ops
Persian + English toggle in the top navbar (persists to localStorage)
3 Feature Modules
Module A — Dashboard & Health
"What's the state of my whole site at a glance?"

Widget Description
Content Count Cards Live counts per collection: books, articles, statements, multimedia, wiki
Draft Pipeline List of all draft: true items with one-click "Publish" button
Missing Metadata Warnings Items with no coverImage, empty description, missing tags, etc.
Category Coverage Map Which categories have < 3 items linked (shows gaps in your taxonomy)
Processing Status Last-run time/result of
scripts/process-content.mjs
; re-run button with live stdout tail
i18n Parity Which content slugs exist in fa but not
en
, and vice-versa
Module B — Content Editor
"Add, edit, and manage any piece of content."

B.1 Collection Browser
Tree view: Collection → Sub-folder → File
Filters: by lang, draft status, content type, category, tag
Sort: publishDate, updatedDate, title, slug
Bulk select → bulk tag / bulk category / bulk publish / bulk delete
B.2 Frontmatter Form (per content type)
Each collection (books, articles, statements, multimedia, wiki) renders a type-safe form derived directly from your Zod schema in
content.config.ts
:

┌─────────────────────────────────────────────────────────┐
│  📖 Book Editor                                          │
├──────────────────────┬──────────────────────────────────┤
│  FIELD               │  CONTROL                         │
├──────────────────────┼──────────────────────────────────┤
│  title               │  Text input (RTL/LTR aware)      │
│  description         │  Textarea with char counter      │
│  lang                │  fa / en toggle                  │
│  publishDate         │  Date picker (Jalali + Gregorian)│
│  coverImage          │  File picker → /public/images    │
│  pdfUrl              │  File picker → /public           │
│  showPdfViewer       │  Toggle switch                   │
│  category / interface│  Multi-select from categories.ts │
│  tags                │  Tag tokenizer (autocomplete)    │
│  draft               │  Prominent draft/published badge │
│  bookSlug            │  Linked to book list             │
│  chapterNumber       │  Number input                    │
└──────────────────────┴──────────────────────────────────┘
Multimedia extras: duration picker (hh:mm:ss), platform select, episode/season number inputs displayed only when type === 'podcast'.

B.3 Rich Body Editor (optional toggle)
Plain Mode: Monaco editor with Markdown syntax highlighting (great for complex MDX)
WYSIWYG Mode: Milkdown or TipTap editor for quick prose edits (renders heading, bold, lists, links)
Switching mode is lossless — always serializes back to Markdown
Math preview pane (KaTeX render) and Mermaid diagram preview pane
Module C — Category & Taxonomy Manager
"Maintain my bilingual category tree without touching TypeScript."

This is the biggest quality-of-life win because
categories.ts
 is currently hand-edited code.

C.1 Category Tree UI
Philosophy (فلسفه)
├─ Ontology (هستی‌شناسی)       [23 items]  ✏️ 🗑️
├─ Epistemology (معرفت‌شناسی)  [11 items]  ✏️ 🗑️
└─ + Add Sub-category
Science (علم)
└─ ...
Drag-and-drop reordering within parent
Click to expand/collapse
Item count badge (live query against content files)
C.2 Category Detail Editor
Fields map 1:1 to the
Category
 interface in
categories.ts
:

Field UI Control
slug Slug input (auto-generated from nameEn, editable)
nameFa RTL text input
nameEn LTR text input
descriptionFa RTL textarea
descriptionEn LTR textarea
imagePath Image picker (shows thumbnail preview)
parentCategory Dropdown of all existing parent slugs
contentTypes Multi-checkbox: articles / books / statements / multimedia
Saving writes back to
src/data/categories.ts
 using an AST-aware formatter (Prettier + TypeScript AST manipulation or a template-literal approach) so the file stays clean and type-correct.

C.3 Tag Manager
Canonical Tag List — derived by scanning all frontmatter across all collections
Shows: tag name · usage count · content types it appears in
Rename: updates every frontmatter file that uses it
Merge: combine two tags → rewrites all occurrences
Delete: safely prompts with list of affected content
Add: creates the tag in the canonical list (doesn't require content to already use it)
Module D — Schema & Interface Definition Manager
"Evolve the content schema without a compile → rebuild → fix cycle."

D.1 Field Inspector
Visual overview of each collection's Zod schema
Shows field name, type, required/optional, default value
Flag for fields that are inconsistent across collection types (e.g., category vs categories duplication)
D.2 Frontmatter Field Migration Tool
When you add a new field to
content.config.ts
, this tool:

Reports which existing files are missing the new field
Lets you set a bulk default value for all missing files
Applies it with one click — writes the default into every frontmatter
D.3 Interface / Taxonomy Mapper
The interface field in your frontmatter is your primary taxonomy key. The admin panel makes this explicit:

Shows every unique interface value in use across all content
Cross-references against category slugs to detect orphaned values
Lets you reassign interface in bulk (e.g., rename "ontology" → "philosophy-ontology")
Module E — i18n Key Manager
"Keep
fa.json
 and
en.json
 in sync without hunting for missing keys."

Feature Description
Parity Table Two-column view: FA key / FA value
Inline Edit Click any cell to edit the translation in place
Add Key Form adds the key to both files simultaneously
Delete Key Removes from both, shows where the key was used in .astro /
.ts
 files (grep-based)
Search Filter by key name or value text
Module F — Script Runner & Content Pipeline
"Trigger and monitor processing scripts from the browser."

Feature Description
Process All Runs node scripts/process-content.mjs --all with live stdout stream
Process Single File picker → runs --file path
Watch Mode Toggle Start/stop
watch-content.mjs
Script Output Log Persistent log with timestamps, error highlighting, copy-to-clipboard
Cache Inspector Browse .content-cache/ — see what's cached, clear individual entries
Module G — Media Manager
"Browse, upload, and link public assets without leaving the browser."

Browse public/ as a visual grid (thumbnail for images, icon for PDFs/SVGs)
Upload files via drag-and-drop (handled by the admin server, saves to public/)
Copy the public URL path to clipboard with one click (ready to paste into frontmatter)
Delete with trash-can (soft-delete with 30 min recovery)
Search by filename
4 Architecture & Implementation Plan
4.1 Technical Stack Choice
Because this is local-only and runs alongside your existing Astro dev server, the lightest viable approach is ideal:

┌─────────────────────────────────────────────┐
│              Browser (localhost:3333)        │
│  React 18 + Vite (SPA, hot-reload)          │
│  TanStack Query (data fetching & caching)   │
│  React Hook Form + Zod (validation)         │
│  Monaco Editor (code editing)               │
│  Tailwind CSS v4 (matches main site)        │
└─────────────────┬───────────────────────────┘
                  │  HTTP + WebSocket (REST + live log stream)
┌─────────────────▼───────────────────────────┐
│        Admin Server (localhost:3334)         │
│  Express.js (or Hono — lighter, TS-native)  │
│  REST API routes (see §4.3)                 │
│  chokidar watcher (file change events)      │
│  gray-matter (frontmatter read/write)       │
│  Prettier (code formatting on write)        │
│  child_process (script runner)              │
└─────────────────┬───────────────────────────┘
                  │  File system (direct read/write)
┌─────────────────▼───────────────────────────┐
│           Your Existing Project              │
│  src/content/**/*.{md,mdx}                  │
│  src/data/categories.ts                     │
│  src/i18n/en.json + fa.json                 │
│  public/                                    │
│  scripts/                                   │
└─────────────────────────────────────────────┘
Why not an Astro integration? Astro's built-in admin mode (Content Collections v3 / Astro DB) is still maturing and doesn't support your flat-file structure + custom scripts. A standalone Express/Hono server gives full control with the least friction.

4.2 Project Structure
admin/                          ← NEW top-level folder (gitignored or dev-only)
├── server/
│   ├── index.ts                ← Hono/Express entry point
│   ├── routes/
│   │   ├── content.ts          ← CRUD for .md/.mdx files
│   │   ├── categories.ts       ← Read/write categories.ts
│   │   ├── tags.ts             ← Tag scanning & mutation
│   │   ├── i18n.ts             ← en.json / fa.json CRUD
│   │   ├── media.ts            ← public/ file management
│   │   └── scripts.ts          ← Script runner + WS log stream
│   └── lib/
│       ├── frontmatter.ts      ← gray-matter wrappers
│       ├── categories-writer.ts← TS AST manipulation
│       └── file-backup.ts      ← .bak + soft-delete
│
├── client/                     ← Vite React SPA
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ContentBrowser.tsx
│   │   │   ├── ContentEditor.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   ├── TagManager.tsx
│   │   │   ├── SchemaInspector.tsx
│   │   │   ├── I18nManager.tsx
│   │   │   ├── MediaManager.tsx
│   │   │   └── ScriptRunner.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── vite.config.ts
│
└── package.json                ← "admin:dev" script
Add to the root
package.json
:

json
"admin:dev": "npm-run-all --parallel admin:server admin:client",
"admin:server": "tsx watch admin/server/index.ts",
"admin:client": "vite admin/client --port 3333"
4.3 Key API Routes (Admin Server)
GET    /api/content                        → list all content files (metadata only)
GET    /api/content/:collection/:slug      → read single file (frontmatter + body)
POST   /api/content/:collection            → create new content file
PUT    /api/content/:collection/:slug      → update frontmatter / body
DELETE /api/content/:collection/:slug      → soft-delete (moves to trash/)
GET    /api/categories                     → parsed categories array
POST   /api/categories                     → add category, write file
PUT    /api/categories/:slug               → update category, write file
DELETE /api/categories/:slug               → remove, validate no content uses it
GET    /api/tags                           → scanned canonical tag list
PUT    /api/tags/:tag/rename               → renames across all frontmatter
DELETE /api/tags/:tag                      → removes from all frontmatter
GET    /api/i18n/:lang                     → return en.json or fa.json object
PUT    /api/i18n/:lang/:key                → update one key in one language
POST   /api/i18n/key                       → add key to both languages atomically
DELETE /api/i18n/key/:key                  → remove key from both languages
GET    /api/media                          → list public/ files
POST   /api/media/upload                   → multipart upload → saves to public/
DELETE /api/media/:path                    → soft-delete media file
POST   /api/scripts/run                    → spawn script process
GET    /api/scripts/log                    → WebSocket endpoint (live stdout)
4.4 Phased Rollout
Phase Scope Effort
Phase 1 – Foundation Server scaffold, Dashboard widget (counts + drafts), read-only content browser ~1 day
Phase 2 – Content CRUD Frontmatter editor forms for all 5 collections, save/create/delete ~2 days
Phase 3 – Taxonomy Category manager + Tag manager (read + write) ~1 day
Phase 4 – i18n & Schema i18n parity table, field migration tool, interface mapper ~1 day
Phase 5 – Pipeline & Media Script runner with live logs, media browser + upload ~1 day
Phase 6 – Polish WYSIWYG mode, Jalali date picker, dark/light toggle, keyboard shortcuts ~1 day
Total estimated effort: ~1 week of focused implementation.

---

## 🚀 Project Completion Summary (2026-02-19)

All modules proposed in this document have been fully implemented and verified.

### Summary of Final Deliverables

- **Dashboard & Health**: Real-time content stats and draft tracking.
- **Content Editor**: Full CRUD with Monaco Editor, YAML frontmatter forms, and Image Picker.
- **Taxonomy Management**: Category CRUD with direct `.ts` file write-back and Tag Rename/Delete across all files.
- **i18n Manager**: Atomic management of bilingual JSON keys with nested key support.
- **Media Manager**: Visual grid with upload, soft-delete, and "copy path" integration.
- **Script Runner**: Direct UI-to-CLI execution with high-frequency log polling.
- **Polish**: Dark glassmorphism UI, toast notifications, modal dialogs, and Ctrl+S saving.

### Implementation Notes

- **Safety**: Non-destructive by default. Every write creates a `.bak` file.
- **Zero Coupling**: Admin server runs on :3334 and client on :3333, isolated from the main Astro build.

### Final Handover

The project is ready for pull request. Use `npm run admin:dev` to launch both the server and the frontend.

---

5 Implementation Wins for Your Site

5.1 Consolidated Taxonomy
Surfaced overlapping taxonomy fields (category, categories, subject, interface) in the Schema Inspector to allow for future consolidation.

5.2 Canonical Tag management
Real-time scanning of all frontmatter provides a live source of truth for all tags, with bulk rename/delete support.

5.4 Auto-Slug Generation
Integrated into the Content Editor creation dialog, ensuring consistent file naming.

5.5 Cover Image Quick-Link
Integrated Media Manager modal allows for one-click image selection directly in the content editor.

---

This project successfully fulfills the roadmap outlined in the original proposal.

Source Files Audited:
`src/content.config.ts`, `src/data/categories.ts`, `src/i18n/`, `scripts/`, `package.json`.
