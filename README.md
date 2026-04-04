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

```powershell
Get-ChildItem *.svg | ForEach { svgexport $_.Name (".\pngs\" + $_.BaseName + ".png")  }
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

All content is managed through Astro Content Collections in `src/content/`. Each collection has specific rules:

- **Articles**: Single `.mdx` files in `src/content/articles/{fa|en}/`.
- **Books**: Folder-based structure in `src/content/books/{fa|en}/`. Each folder represents a book and contains:
  - `index.mdx`: The main book entry (metadata for the cover, description, etc.).
  - `chapter-*.mdx`: Individual chapter files.
- **Multimedia**: Single `.mdx` files in `src/content/multimedia/{fa|en}/`.
- **Statements/Wiki**: Markdown/MDX files in their respective folders.

### Metadata (Frontmatter) Rules

The site uses a rich schema defined in `src/content.config.ts`. Every piece of content should include:

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | string | The headline of the content. |
| `description` | string | A short summary for SEO and cards. |
| `lang` | "fa" \| "en" | Language of the content. |
| `publishDate` | date | ISO date (e.g., 2024-04-03). |
| `coverImage` | string | Path to image (e.g., `/images/articles/covers/my-img.png`). |
| `imageDisplay` | enum | `full` (banner), `side` (beside title), `thumbnail`, `hidden`. |
| `cardImage` | enum | `show` or `hidden` (control visibility in lists). |
| `draft` | boolean | If `true`, only shown in admin/dev. |
| `hidden` | boolean | If `true`, hidden from site unless forced. |
| `aiRole` | enum | `human`, `ai-visual`, `ai-generated`, etc. (Track AI usage). |

**Book-Specific Metadata:**
- `bookSlug`: (For chapters) The slug of the parent book folder.
- `chapterNumber`: (For chapters) Numeric order for navigation.
- `pdfUrl`: Path to a downloadable PDF.
- `showPdfViewer`: `true` to enable the in-page PDF reader.

### Pushing Content & Real-Time Updates

The website is deployed via **Cloudflare Pages**, which automatically builds and deploys on every push to the `main` branch.

1. **Local Prep**: Use the Admin Panel (`npm run admin:dev`) to create/edit content and metadata.
2. **Commit**: `git add .` then `git commit -m "feat: add new article [title]"`
3. **Push**: `git push origin main`
4. **Build**: Cloudflare will start a build automatically. Monitor progress at `https://dash.cloudflare.com`.
5. **Verify**: The deployment is live within 2-3 minutes.

- **`cardImage`**: Controls image rendering in **card/list views**.
  - `show` (default) — cover image is visible in article/book cards
  - `hidden` — cover image is hidden in card/list views

Both fields are available as dropdown selects in the Admin Panel content editor.

### Taxonomy (Categories & Tags)

- **Interface:** Use `interface` inside frontmatter to assign the primary category identifier (e.g., `ontology`, `descriptive-politics`). The complete hierarchical list is maintained in `src/data/categories.ts`.
- **Tags:** Use the `tags` array for topical grouping.
- **AI Tagging:** You can use the Admin Panel's AI Tagging tool to automatically classify text into the correct strict taxonomy.

### How to Add/Update Books

The content pipeline (`npm run content:all`) automatically processes books from `content-source/books/`.

1. **Format Options**:
    - **Folder**: Create a folder (e.g., `My-Book/`). Place `.tex` files for chapters inside. It will automatically find `main.tex` and chapters.
    - **Standalone LaTeX**: Drop a single `.tex` file (e.g., `My-Book.tex`).
    - **ZIP File**: Drop a `.zip` file containing a LaTeX project.
    - **Standalone PDF**: Drop a `.pdf` file. It will extract text for the web view and provide a PDF viewer.
2. **PDF Association**:
    - If you have a PDF version of a LaTeX book, name it the same as the folder or file (e.g., `My-Book.pdf` for `My-Book.tex` or `My-Book/` folder).
    - The pipeline will automatically link it and store it in `public/documents/books/`.
3. **Language Detection**:
    - If files are placed in `content-source/books/en/` or `content-source/books/fa/`, the language is explicitly set.
    - Otherwise, the pipeline detects Persian characters to decide between `fa` and `en`.
4. **Admin Panel**:
    - Use the **"Process Book"** or **"Process All"** buttons in the Admin Panel (`npm run admin:dev`) to trigger the conversion.

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
