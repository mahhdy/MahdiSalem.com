# MahdiSalem.com

Personal website for **Mehdi Salem** (مهدی سالم) — exploring philosophy, ethics, politics, and democracy.

## 🚀 Quick Start & Setup

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mahhdy/MahdiSalem.com.git
cd MahdiSalem.com
npm install
```

### 2. Local Development

Run the main website locally (Astro Dev Server):

```bash
npm run dev
```

Visit `http://localhost:4321` to view the site.

### 3. Build & Production Preview

To test the production build locally:

```bash
npm run build
npm run preview
```

## 🛠️ Content Pipelines

The project relies on specific Node.js pipelines to process content (LaTeX, Markdown, files) and generate search indexes.

### Process Content (HTML/LaTeX to MDX)

Automatically converts LaTeX, raw Markdown, and updates Mermaid diagrams to `.mdx` format:

```bash
npm run content:all
```

*Note: This script is automatically triggered before `npm run build`.*

### Generate Search Index

Indexes the output static files for the client-side search functionality using Pagefind:

```bash
npx pagefind --site dist
```

## 🖥️ Admin Panel

A zero-database, flat-file CMS is included for safe local content management. It allows you to create articles, manage categories/tags, and interact with the AI Tagger directly from the browser.

### Running the Admin Panel

Start both the backend API and the frontend React application concurrently:

```bash
npm run admin:dev
```

Alternatively, you can run them individually:

- **Backend (Hono):** `npm run admin:server` (localhost:3334)
- **Frontend (React):** `npm run admin:client` (localhost:3333)

**Access the UI at:** `http://localhost:3333`

## 📖 Technical Guidelines

### Content Structure

All content must be placed in `src/content/` under the respective collection (`articles`, `books`, `statements`, `multimedia`) and localized folder (`fa/` or `en/`).

- **Format:** All content uses MDX (`.mdx`).
- **Books:** Books use a single `index.mdx` entry containing all chapters.
- **Frontmatter Headers:** By default, layout components hide the primary `H1` in articles/books to prevent redundancy. Override with `show-header: true` if needed.

### Taxonomy (Categories & Tags)

- **Interface:** Use `interface` inside frontmatter to assign the primary category identifier (e.g., `ontology`, `descriptive-politics`). The complete hierarchical list is maintained in `src/data/categories.ts`.
- **Tags:** Use the `tags` array for topical grouping.
- **AI Tagging:** You can use the Admin Panel's AI Tagging tool to automatically classify text into the correct strict taxonomy.

### Integrations

- **Cloudflare Workers:** Check `workers/README.md` for deploying the Telegram Feed bot.
- **AI Tagger:** Requires an API Key in the `.env` file (e.g., `OPENAI_API_KEY`).

## 📁 Project Organization

- `src/` — Astro website source code, configuration, and flat-file content.
- `admin/` — Self-contained local Admin CMS (Hono backend + React frontend).
- `scripts/` — Content processing pipelines and AI tools.
- `developments/` — Internal design documents, phase strategies, and milestone tracking.
- `public/` — Static assets, images, and localized diagrams.

## 🤝 Contributing

Feature suggestions, bug reports, and improvement ideas can be submitted via GitHub Issues or Pull Requests. See `CONTRIBUTING.md` for guidelines.

## 📄 License

Content © Mehdi Salem. Code MIT licensed.
