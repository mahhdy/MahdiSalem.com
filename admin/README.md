# MahdiSalem.com Local Admin Panel

A robust, glassmorphic local management interface for the MahdiSalem.com Astro site.

## Architecture

- **Backend**: Hono (Node.js) running on port `3334`.
- **Frontend**: Vite + React 19 SPA running on port `3333`.
- **Data**: Direct flat-file manipulation (Markdown/MDX, TypeScript data files, JSON i18n).

## Key Features

- **Dashboard**: High-level stats and draft content tracking.
- **Content Browser**: Filterable tree view of all content collections.
- **Content Editor**: Markdown editing with Monaco (VS Code core), YAML/JSON frontmatter management, and an integrated Image Picker.
- **Tag Manager**: Canonical tag scanning, renaming (recursive update), and deletion.
- **Category Manager**: Full CRUD for `src/data/categories.ts` with parent-child relationship validation.
- **I18n Manager**: Atomic management of English/Persian translation keys with nested key support.
- **Media Manager**: Browse `public/` files, upload new media, and soft-delete files.
- **Script Runner**: Trigger site maintenance scripts (like `process-content.mjs`) directly from the UI.

## Safety & Backups

Every destructive operation (Content delete, Tag rename, Category update, I18n change) automatically creates a `.bak` file in the same directory before performing the write.

## Usage

Run the following command from the project root:

```bash
npm run admin:dev
```

This will concurrently start both the API server and the frontend development server.

## Troubleshooting

- **Port Conflicts**: Ensure ports `3333` and `3334` are available.
- **Node Version**: Requires Node.js 18+ (Node 22 recommended).
- **File Permissions**: Ensure the process has write access to the `src/` and `public/` directories.
