import { useEffect, useState, CSSProperties } from 'react';

/* ═══════════════════════════════════════════════════════
   Shared small helpers
   ═══════════════════════════════════════════════════════ */

const S: Record<string, CSSProperties> = {
    card: {
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '20px 24px', marginBottom: 20,
    },
    h2: {
        fontSize: '1.15rem', fontWeight: 700, marginBottom: 14,
        color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: 8,
    },
    h3: {
        fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, marginTop: 16,
    },
    code: {
        background: '#0d0d0d', color: '#c5c8d0', padding: '14px 18px',
        borderRadius: 6, fontSize: '0.85rem', lineHeight: 1.7,
        fontFamily: "'Fira Code', 'Consolas', monospace",
        display: 'block', whiteSpace: 'pre-wrap' as const, overflowX: 'auto' as const,
    },
    output: {
        background: '#111827', color: '#9ca3af', padding: '14px 18px',
        borderRadius: 6, fontSize: '0.82rem', lineHeight: 1.7,
        fontFamily: "'Fira Code', Consolas, monospace",
        borderLeft: '3px solid var(--accent)',
        display: 'block', whiteSpace: 'pre-wrap' as const, overflowX: 'auto' as const,
    },
    tip: {
        background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: 8, padding: '12px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)',
        marginTop: 12, marginBottom: 12,
    },
    warn: {
        background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)',
        borderRadius: 8, padding: '12px 16px', fontSize: '0.88rem', color: 'var(--text-secondary)',
        marginTop: 12, marginBottom: 12,
    },
    linkCard: {
        padding: 16, background: 'var(--bg-primary)', borderRadius: 8,
        textDecoration: 'none', border: '1px solid var(--border)', display: 'block', marginBottom: 10,
    },
    pair: {
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14,
    },
    pairLabel: {
        fontSize: '0.7rem', textTransform: 'uppercase' as const, letterSpacing: '0.1em',
        color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4,
    },
};

/** Side-by-side "Write this → Get this" pair */
const Pair = ({ write, result }: { write: string; result: string }) => (
    <div style={S.pair}>
        <div>
            <div style={S.pairLabel}>✏️ You write</div>
            <pre style={S.code}>{write}</pre>
        </div>
        <div>
            <div style={S.pairLabel}>✅ It becomes</div>
            <pre style={S.output}>{result}</pre>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════
   Tab definitions
   ═══════════════════════════════════════════════════════ */

const TABS = [
    { id: 'intro', label: 'Introduction', icon: '🏠' },
    { id: 'mdx', label: 'MDX Authoring', icon: '📝' },
    { id: 'advanced', label: 'Advanced Features', icon: '⚡' },
    { id: 'cli', label: 'CLI & Scripts', icon: '💻' },
    { id: 'links', label: 'Resources & Links', icon: '🔗' },
    { id: 'readme', label: 'Project README', icon: '📖' },
    { id: 'sandbox', label: 'Sandbox', icon: '🧪' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ═══════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════ */

export default function Guides() {
    const [tab, setTab] = useState<TabId>('intro');
    const [readme, setReadme] = useState('');
    const [readmeLoading, setReadmeLoading] = useState(false);
    const [sandbox, setSandbox] = useState(() => localStorage.getItem('mdx-sandbox') || '# Sandbox\n\nWrite markdown here. It auto-saves to your browser.');

    useEffect(() => { localStorage.setItem('mdx-sandbox', sandbox); }, [sandbox]);

    useEffect(() => {
        if (tab === 'readme' && !readme) {
            setReadmeLoading(true);
            fetch('/api/stats/readme').then(r => r.json())
                .then(d => setReadme(d.content || d.error || 'Empty'))
                .catch(e => setReadme(e.message))
                .finally(() => setReadmeLoading(false));
        }
    }, [tab, readme]);

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="page-header">
                <h1 className="page-title">📚 Guides & Training</h1>
                <p className="page-subtitle">
                    Everything you need to author content, run pipelines, and manage the site — in one place.
                </p>
            </div>

            {/* ─── Tab bar ─── */}
            <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--border)', gap: 2 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} style={{
                        padding: '12px 20px', fontWeight: tab === t.id ? 600 : 400,
                        color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                        background: tab === t.id ? 'var(--bg-card)' : 'transparent',
                        border: '1px solid', borderColor: tab === t.id ? 'var(--border)' : 'transparent',
                        borderBottomColor: tab === t.id ? 'var(--bg-card)' : 'transparent',
                        borderRadius: '8px 8px 0 0', cursor: 'pointer', marginBottom: -1,
                        whiteSpace: 'nowrap', fontSize: '0.88rem', transition: 'all .15s',
                    }}>{t.icon} {t.label}</button>
                ))}
            </div>

            {/* ─── Tab body ─── */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none',
                borderRadius: '0 0 8px 8px', padding: 32, minHeight: '60vh',
            }}>
                {tab === 'intro' && <TabIntro />}
                {tab === 'mdx' && <TabMDX />}
                {tab === 'advanced' && <TabAdvanced />}
                {tab === 'cli' && <TabCLI />}
                {tab === 'links' && <TabLinks />}
                {tab === 'readme' && <TabReadme content={readme} loading={readmeLoading} />}
                {tab === 'sandbox' && <TabSandbox value={sandbox} onChange={setSandbox} />}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: Introduction
   ═══════════════════════════════════════════════════════ */
function TabIntro() {
    return (
        <div>
            <h2 style={S.h2}>Welcome to the MahdiSalem.com Content System</h2>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                This site is built with <strong>Astro</strong> — a modern static-site generator — and all content is authored
                in <strong>MDX</strong> format, which combines Markdown with JSX (React components). The entire workflow
                is designed so that you can write rich academic content — including bilingual (Persian + English) text,
                mathematical notation, Mermaid diagrams, and interactive tabs — without touching the site's infrastructure code.
            </p>

            <div style={S.card}>
                <h3 style={{ ...S.h3, marginTop: 0 }}>📂 Where Content Lives</h3>
                <pre style={S.code}>{`src/content/
├── articles/          ← Blog posts & academic papers
│   ├── fa/            ← Persian articles
│   └── en/            ← English articles
├── books/             ← Full-length books (index.mdx per book)
│   ├── fa/
│   └── en/
├── statements/        ← Short declarations & press releases
├── multimedia/        ← Videos, podcasts, clips
└── wiki/              ← Encyclopedia-style entries`}</pre>
            </div>

            <div style={S.card}>
                <h3 style={{ ...S.h3, marginTop: 0 }}>📄 What is an MDX File?</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Every content piece is a single <code>.mdx</code> file that contains two parts:
                </p>
                <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
                    <li><strong>Frontmatter</strong> — YAML metadata between <code>---</code> fences (title, lang, tags, draft status, cover image, etc.)</li>
                    <li><strong>Body</strong> — The actual content in Markdown + JSX syntax.</li>
                </ol>
                <pre style={S.code}>{`---
title: "My Article Title"
description: "A brief summary"
lang: "fa"
publishDate: "2026-02-24"
author: "مهدی سالم"
tags:
  - philosophy
  - politics
interface: descriptive-politics
draft: false
coverImage: /images/articles/covers/my-cover.png
imageDisplay: full
cardImage: show
---

Your content goes here — all standard Markdown works.`}</pre>
            </div>

            <div style={S.tip}>
                <strong>💡 Tip:</strong> Set <code>draft: true</code> to keep an article unpublished while you work on it.
                Switch to <code>false</code> when it's ready to go live.
            </div>

            <div style={S.card}>
                <h3 style={{ ...S.h3, marginTop: 0 }}>🔄 The Publishing Workflow</h3>
                <ol style={{ color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: 20 }}>
                    <li>Create or edit a <code>.mdx</code> file inside <code>src/content/</code>.</li>
                    <li>Run <code>npm run dev</code> to see it locally at <code>localhost:4321</code>.</li>
                    <li>When happy, commit and push to <code>main</code> branch.</li>
                    <li>Vercel will automatically build, run the content pipeline, and deploy.</li>
                </ol>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: MDX Authoring (side-by-side write → output)
   ═══════════════════════════════════════════════════════ */
function TabMDX() {
    return (
        <div>
            <h2 style={S.h2}>MDX Authoring — Complete Reference</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                MDX is <strong>Markdown + JSX</strong>. Everything you know about Markdown works, plus you can embed
                React/Astro components and raw HTML. Each example below shows the code you write on the left and
                the resulting output description on the right.
            </p>

            {/* --- Headings --- */}
            <h3 style={S.h3}>Headings</h3>
            <Pair
                write={`# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4`}
                result={`<h1>Heading Level 1</h1>
<h2>Heading Level 2</h2>
<h3>Heading Level 3</h3>
<h4>Heading Level 4</h4>`}
            />
            <div style={S.tip}>
                <strong>⚠️ Rule:</strong> In articles and books, the page layout already renders an <code>&lt;h1&gt;</code> from the
                frontmatter title. Start your body headings from <code>## H2</code> to avoid duplicate H1 tags (bad for SEO and accessibility).
            </div>

            {/* --- Inline text --- */}
            <h3 style={S.h3}>Text Styling</h3>
            <Pair
                write={`**Bold text** makes keywords stand out.
*Italic text* adds emphasis.
~~Strikethrough~~ for corrections.
\`inline code\` for technical terms.
> Blockquotes highlight important quotes.`}
                result={`<strong>Bold text</strong> makes keywords stand out.
<em>Italic text</em> adds emphasis.
<del>Strikethrough</del> for corrections.
<code>inline code</code> for technical terms.
<blockquote>Blockquotes highlight important quotes.</blockquote>`}
            />

            {/* --- Lists --- */}
            <h3 style={S.h3}>Lists</h3>
            <Pair
                write={`- First bullet item
- Second bullet item
  - Nested sub-item
  - Another nested item

1. First numbered item
2. Second numbered item
   1. Sub-numbered item`}
                result={`• First bullet item
• Second bullet item
    ◦ Nested sub-item
    ◦ Another nested item

1. First numbered item
2. Second numbered item
   1.1. Sub-numbered item`}
            />

            {/* --- Links & Images --- */}
            <h3 style={S.h3}>Links & Images</h3>
            <Pair
                write={`[Link text](https://example.com)

![Alt text describes the image](/images/photo.jpg)

[Open in new tab](https://example.com){:target="_blank"}`}
                result={`<a href="https://example.com">Link text</a>

<img src="/images/photo.jpg" alt="..." />

Note: target="_blank" attribute
   syntax may vary in MDX —
   use raw HTML for full control.`}
            />

            {/* --- Code Blocks --- */}
            <h3 style={S.h3}>Code Blocks</h3>
            <Pair
                write={`\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\``}
                result={`Renders as a syntax-highlighted
code block with the language
label displayed at the top.

Supported: javascript, python,
bash, css, html, json, yaml, etc.`}
            />

            {/* --- Tables --- */}
            <h3 style={S.h3}>Tables</h3>
            <Pair
                write={`| Philosopher | Era       | School       |
|-------------|-----------|--------------|
| Aristotle   | Ancient   | Virtue Ethics |
| Kant        | Modern    | Deontology   |
| Rawls       | Contemp.  | Liberalism   |`}
                result={`Renders as a styled HTML table
with header row, zebra striping,
and responsive scrolling on
small screens.`}
            />

            {/* --- Horizontal Rules --- */}
            <h3 style={S.h3}>Horizontal Rule & Line Breaks</h3>
            <Pair
                write={`Content above the line.

---

Content below the line.

Two spaces at end of a line  
creates a <br> line break.`}
                result={`A horizontal <hr> divider
appears between paragraphs.

Useful for separating
major sections visually.`}
            />

            {/* --- Footnotes --- */}
            <h3 style={S.h3}>Footnotes</h3>
            <Pair
                write={`This claim needs a source[^1].

[^1]: Berlin, I. (1958). Two Concepts
      of Liberty. Oxford University Press.`}
                result={`A superscript [1] is placed in
the text, and a footnote section
appears at the bottom of the page
with the referenced content.`}
            />

            {/* --- Mermaid --- */}
            <h3 style={S.h3}>Mermaid Diagrams</h3>
            <Pair
                write={`\`\`\`mermaid
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[End]
\`\`\``}
                result={`Renders an interactive SVG
flowchart diagram with nodes,
arrows, and labels. Supports
dark/light theme switching.

Diagram types: flowchart, mindmap,
sequenceDiagram, gantt, pie, etc.`}
            />
            <div style={S.tip}>
                <strong>💡 Mermaid tip:</strong> Use <code>mindmap</code> for concept maps, <code>sequenceDiagram</code> for protocols,
                and <code>gantt</code> for timelines. Full syntax at <a href="https://mermaid.js.org/syntax" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>mermaid.js.org/syntax</a>.
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: Advanced Features (HTML, JS, Components)
   ═══════════════════════════════════════════════════════ */
function TabAdvanced() {
    return (
        <div>
            <h2 style={S.h2}>Advanced MDX Features</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Because MDX is a superset of Markdown + JSX, you have access to raw HTML, inline JavaScript expressions,
                custom Astro components, and conditional rendering — all inside your content files.
            </p>

            {/* --- RAW HTML --- */}
            <h3 style={S.h3}>🏗️ Using Raw HTML</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                Standard HTML tags work in MDX — but they must follow JSX rules:
                self-closing tags need <code>/&gt;</code>, and <code>class</code> becomes <code>className</code> (though Astro MDX also accepts <code>class</code>).
            </p>
            <Pair
                write={`<div style="background:#1e293b; padding:20px;
     border-radius:8px; color:#e2e8f0;">
  <h3>Custom Styled Box</h3>
  <p>This is a manually styled container
     using inline HTML and CSS.</p>
</div>`}
                result={`A dark rounded card appears with
the heading and paragraph inside.

Great for callout boxes, alerts,
or special layout sections that
Markdown syntax can't achieve.`}
            />
            <div style={S.warn}>
                <strong>⚠️ MDX HTML Rules:</strong><br />
                • All tags must be closed: <code>&lt;br /&gt;</code> not <code>&lt;br&gt;</code><br />
                • Use <code>&amp;lt;</code> for literal angle brackets in text<br />
                • Don't leave blank lines inside an HTML block (MDX exits HTML-parsing mode)<br />
                • Avoid <code>&lt;img&gt;</code> — use <code>&lt;img /&gt;</code> (self-closing)
            </div>

            {/* --- Details/Summary --- */}
            <h3 style={S.h3}>📂 Collapsible Sections (details / summary)</h3>
            <Pair
                write={`<details>
  <summary>Click to expand</summary>
  <div>
    Hidden content appears here when
    the user clicks the summary.

    You can put **markdown** inside
    the div, but keep it inside the
    HTML block without blank lines.
  </div>
</details>`}
                result={`A clickable disclosure triangle
appears. When clicked, the hidden
content expands below.

Used for: Table of Contents,
spoiler text, long reference
lists, FAQ sections.`}
            />

            {/* --- JSX Expressions --- */}
            <h3 style={S.h3}>🔷 JavaScript Expressions</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                Curly braces <code>{'{}'}</code> in MDX evaluate JavaScript at build time:
            </p>
            <Pair
                write={`The current year is {new Date().getFullYear()}.

This page has {2 + 3} sections.

{/* This is an MDX comment —
    it won't appear in the output */}`}
                result={`The current year is 2026.

This page has 5 sections.

(Nothing visible — the comment
 is stripped at build time.)`}
            />

            {/* --- Importing Components --- */}
            <h3 style={S.h3}>🧩 Importing Custom Astro Components</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
                You can import and use custom Astro/React components directly inside MDX files.
                Imports go right after the frontmatter closing <code>---</code>.
            </p>
            <Pair
                write={`---
title: "My Article"
---
import Tabs from '../../../components/Tabs.astro';
import TabItem from '../../../components/TabItem.astro';

<Tabs>
  <TabItem label="فارسی">
    محتوای فارسی اینجاست.
  </TabItem>
  <TabItem label="English">
    English content goes here.
  </TabItem>
</Tabs>`}
                result={`A tabbed interface appears with
two clickable tab buttons. Only
the active tab's content is visible.

Use for: bilingual diagrams,
side-by-side code comparisons,
different perspectives of an
argument, etc.`}
            />

            {/* --- RTL / BiDi --- */}
            <h3 style={S.h3}>🌐 Right-to-Left (RTL) & BiDi Content</h3>
            <Pair
                write={`<div dir="rtl" style="text-align:right;">

## عنوان فارسی

متن فارسی به صورت راست‌چین نمایش داده می‌شود.

</div>

<div dir="ltr">

## English Title

This section is left-to-right.

</div>`}
                result={`Persian text flows from right to
left with correct alignment.

English text flows normally
from left to right.

The lang="fa" frontmatter field
automatically sets the page to RTL.`}
            />

            {/* --- Cover Image Controls --- */}
            <h3 style={S.h3}>🖼️ Cover Image Frontmatter Options</h3>
            <div style={S.card}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)' }}>Field</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)' }}>Values</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-primary)' }}>What it does</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 12px' }}><code>imageDisplay</code></td>
                            <td style={{ padding: '8px 12px' }}><code>full</code> | <code>side</code> | <code>thumbnail</code> | <code>hidden</code></td>
                            <td style={{ padding: '8px 12px' }}>Controls image on the detail page</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 12px' }}><code>cardImage</code></td>
                            <td style={{ padding: '8px 12px' }}><code>show</code> | <code>hidden</code></td>
                            <td style={{ padding: '8px 12px' }}>Controls image in card/list views</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 12px' }}><code>coverImage</code></td>
                            <td style={{ padding: '8px 12px' }}>Path string</td>
                            <td style={{ padding: '8px 12px' }}>e.g. <code>/images/articles/covers/my-img.png</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* --- Taxonomy --- */}
            <h3 style={S.h3}>🏷️ Taxonomy & Categorization</h3>
            <div style={S.card}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    Every content piece should have:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: 2, paddingLeft: 20 }}>
                    <li><code>interface</code> — Primary category slug from the taxonomy tree (e.g. <code>philosophy-of-politics</code>, <code>ontology</code>).</li>
                    <li><code>tags</code> — An array of free-form topical tags for cross-referencing.</li>
                    <li><code>categories</code> — Legacy array; prefer <code>interface</code> for new content.</li>
                    <li><code>category</code> — Simple string category ; optional if <code>interface</code> is set.</li>
                </ul>
                <pre style={S.code}>{`interface: descriptive-politics
tags:
  - آزادی
  - فلسفه سیاسی
  - عدالت`}</pre>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: CLI & Scripts
   ═══════════════════════════════════════════════════════ */

interface CmdEntry {
    cmd: string;
    desc: string;
    detail?: string;
}

const CLI_SECTIONS: { title: string; icon: string; items: CmdEntry[] }[] = [
    {
        title: 'Development & Build', icon: '🚀',
        items: [
            { cmd: 'npm run dev', desc: 'Start Astro dev server', detail: 'Serves the website at localhost:4321 with hot-reload. Use this while writing content.' },
            { cmd: 'npm run build', desc: 'Full production build', detail: 'Runs content:all → astro build → pagefind. This is the same pipeline Vercel executes on deploy.' },
            { cmd: 'npm run preview', desc: 'Preview production build', detail: 'Starts a local server serving the built /dist folder — test before deploying.' },
        ],
    },
    {
        title: 'Content Pipeline', icon: '📄',
        items: [
            { cmd: 'npm run content:all', desc: 'Process all content sources', detail: 'Scans content-source/ for LaTeX, HTML, PDF, ZIP, Markdown. Converts everything to .mdx in src/content/.' },
            { cmd: 'npm run content:book', desc: 'Process books only', detail: 'Converts LaTeX/PDF books from content-source/books/ into structured index.mdx files.' },
            { cmd: 'npm run content:zip', desc: 'Process ZIP archives', detail: 'Extracts and converts ZIP-packaged LaTeX or HTML projects.' },
            { cmd: 'npm run content:html', desc: 'Process HTML files', detail: 'Converts raw HTML files (from content-source/) into MDX format with frontmatter.' },
            { cmd: 'npm run content:html:file', desc: 'Process a single HTML file', detail: 'Same as above but for a specific file — requires --file argument.' },
            { cmd: 'npm run content:watch', desc: 'Watch for content changes', detail: 'Auto-reprocesses files when they change in content-source/. Stop with Ctrl+C.' },
            { cmd: 'npm run content:watch:no-ai', desc: 'Watch without AI tagging', detail: 'Same as above but skips the AI classification step (faster, no API calls).' },
        ],
    },
    {
        title: 'Admin Panel', icon: '🖥️',
        items: [
            { cmd: 'npm run admin:dev', desc: 'Start full admin stack', detail: 'Runs Astro dev + Hono backend (3334) + React frontend (3333) concurrently.' },
            { cmd: 'npm run admin:server', desc: 'Start backend only', detail: 'Runs the Hono REST API at localhost:3334.' },
            { cmd: 'npm run admin:client', desc: 'Start frontend only', detail: 'Runs the React admin SPA at localhost:3333.' },
        ],
    },
    {
        title: 'Utilities & Fixes', icon: '🔧',
        items: [
            { cmd: 'npm run fix:mermaid', desc: 'Fix Mermaid quote issues', detail: 'Scans all MDX files in src/content/ and fixes common Mermaid syntax issues (smart quotes → straight quotes, Unicode problems).' },
            { cmd: 'npm run fix:mermaid:dry', desc: 'Dry-run Mermaid fixes', detail: 'Shows what would change without actually modifying files. Use --verbose for details.' },
            { cmd: 'npm run test:mermaid', desc: 'Test Mermaid extraction', detail: 'Runs extract-mermaid-tests.mjs — validates that Mermaid code blocks parse correctly.' },
            { cmd: 'npm run dev:watch', desc: 'Dev server + content watch', detail: 'Runs dev server and content watcher in parallel (requires npm-run-all).' },
        ],
    },
    {
        title: 'Git & Deployment', icon: '🐙',
        items: [
            { cmd: 'git status', desc: 'Check changed files', detail: 'Shows which files are modified, staged, or untracked.' },
            { cmd: 'git add src/content/', desc: 'Stage content changes', detail: 'Adds all content files to the staging area.' },
            { cmd: 'git commit -m "message"', desc: 'Commit staged changes', detail: 'Creates a snapshot of your changes with a descriptive message.' },
            { cmd: 'git push origin main', desc: 'Deploy to production', detail: 'Pushes to GitHub → triggers Vercel build → live in ~2 minutes.' },
            { cmd: 'git restore <file>', desc: 'Undo unstaged changes', detail: 'Reverts a file to its last committed state. Careful — changes are lost.' },
            { cmd: 'git log -n 5 --oneline', desc: 'View recent commits', detail: 'Shows the last 5 commits in compact format.' },
        ],
    },
];

function TabCLI() {
    return (
        <div>
            <h2 style={S.h2}>CLI Commands & Scripts Reference</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                All commands you need to manage content, run the pipeline, fix issues, and deploy.
                Run these from the project root (<code>d:\Code\MahdiSalem.com</code>).
            </p>

            {CLI_SECTIONS.map(section => (
                <div key={section.title} style={{ marginBottom: 28 }}>
                    <h3 style={{ ...S.h3, fontSize: '1.05rem', marginBottom: 14 }}>
                        {section.icon} {section.title}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {section.items.map(item => (
                            <div key={item.cmd} style={{
                                display: 'grid', gridTemplateColumns: '280px 1fr',
                                gap: 12, padding: '12px 16px', borderRadius: 6,
                                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                                alignItems: 'start',
                            }}>
                                <code style={{
                                    fontFamily: "'Fira Code', Consolas, monospace",
                                    fontSize: '0.83rem', color: 'var(--accent)',
                                    fontWeight: 600, whiteSpace: 'nowrap',
                                }}>{item.cmd}</code>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: 2 }}>
                                        {item.desc}
                                    </div>
                                    {item.detail && (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                                            {item.detail}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: Resources & Links
   ═══════════════════════════════════════════════════════ */
function TabLinks() {
    const links = [
        { url: 'https://docs.astro.build/en/guides/markdown-content/', title: 'Astro MDX Guide', desc: 'Official docs on writing and rendering Markdown/MDX content in Astro projects.' },
        { url: 'https://mdxjs.com/docs/', title: 'MDX Documentation', desc: 'The official MDX specification — how Markdown and JSX merge, expression rules, and component patterns.' },
        { url: 'https://mermaid.js.org/syntax/mindmap.html', title: 'Mermaid Mindmap Syntax', desc: 'How to create mindmap diagrams with hierarchy, icons, and text wrapping.' },
        { url: 'https://mermaid.js.org/syntax/flowchart.html', title: 'Mermaid Flowchart Syntax', desc: 'Nodes, edges, subgraphs, and styling for flowchart diagrams.' },
        { url: 'https://mermaid.js.org/syntax/sequenceDiagram.html', title: 'Mermaid Sequence Diagrams', desc: 'Actor lifelines, messages, loops, and alt/opt blocks for protocol diagrams.' },
        { url: 'https://katex.org/docs/supported.html', title: 'KaTeX Math Functions', desc: 'Full list of supported LaTeX math commands for rendering equations in web pages.' },
        { url: 'https://www.markdownguide.org/extended-syntax/', title: 'Extended Markdown Syntax', desc: 'Tables, footnotes, task lists, definition lists, and other extended features.' },
        { url: 'https://docs.github.com/en/get-started/using-git', title: 'Git Basics (GitHub Docs)', desc: 'If you need a refresher on Git commands, branching, and collaboration.' },
        { url: 'https://tailwindcss.com/docs', title: 'Tailwind CSS Reference', desc: 'Utility-first CSS framework used in the site layout for rapid styling.' },
        { url: 'https://pagefind.app/', title: 'Pagefind Search', desc: 'The static search engine used on the site — indexes the built output automatically.' },
    ];

    return (
        <div>
            <h2 style={S.h2}>📚 Training Resources & External References</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                Bookmark these links for deeper study. Each one covers a specific technology used in this project.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map(link => (
                    <a key={link.url} href={link.url} target="_blank" rel="noreferrer" style={S.linkCard}>
                        <div style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{link.title} ↗</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{link.desc}</div>
                    </a>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: Readme
   ═══════════════════════════════════════════════════════ */
function TabReadme({ content, loading }: { content: string; loading: boolean }) {
    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading README...</div>;
    return (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, maxHeight: '65vh', overflowY: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                {content}
            </pre>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TAB: Sandbox
   ═══════════════════════════════════════════════════════ */
function TabSandbox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    ✏️ A persistent scratchpad for drafting Markdown, testing syntax, or taking notes.
                    Text auto-saves to your browser's local storage across sessions.
                </p>
                <button className="btn btn-secondary" onClick={() => { if (confirm('Clear the sandbox?')) onChange(''); }}>
                    🗑️ Clear
                </button>
            </div>
            <textarea
                value={value} onChange={e => onChange(e.target.value)} spellCheck={false}
                style={{
                    flex: 1, minHeight: '52vh', width: '100%', background: 'var(--bg-primary)',
                    border: '1px solid var(--border)', borderRadius: 8, padding: 20,
                    color: 'var(--text-primary)', fontFamily: "'Fira Code', Consolas, monospace",
                    resize: 'vertical', lineHeight: 1.7, fontSize: '0.92rem',
                }} />
        </div>
    );
}
