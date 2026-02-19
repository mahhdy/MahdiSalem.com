export default function Cheatsheet() {
    return (
        <div className="page-container fade-in">
            <h1 className="page-title">📚 MDX & Git Cheatsheet</h1>
            <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
                Quick reference guide for content creation and version control.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* MDX Column */}
                <div>
                    <div className="card">
                        <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            ✍️ MDX Formatting
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Headers</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`# H1 Title
## H2 Heading
### H3 Subheading`}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Text Styling</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`**Bold Text**
*Italic Text*
~~Strikethrough~~
\`Inline Code\``}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Lists</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`- Bullet item 1
- Bullet item 2
  - Nested item

1. Numbered item
2. Second item`}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Links & Images</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`[Link Text](https://example.com)
![Alt Text](/images/path.jpg)

{/* Astro/MDX specific React Component */}
<Callout type="info">Important text!</Callout>`}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Mermaid Diagrams</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`\`\`\`mermaid
flowchart LR
    A[Start] --> B[Process]
    B --> C[End]
\`\`\``}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Important MDX Rules</h3>
                            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                                <li>HTML tags must be properly closed (e.g., <code>&lt;br /&gt;</code>, not <code>&lt;br&gt;</code>).</li>
                                <li>Angle brackets <code>&lt;</code> must be escaped as <code>&amp;lt;</code> or wrapped in code blocks if not part of an HTML/JSX tag.</li>
                                <li>JSX expressions <code>{ }</code> evaluate JavaScript.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Git Column */}
                <div>
                    <div className="card">
                        <h2 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            🐙 Git & Publishing
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Standard Workflow</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`git status                 # Review changes
git add src/content/*     # Stage content changes
git commit -m "Update"    # Commit changes
git push origin main      # Publish to server`}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Handling Errors & Rollbacks</h3>
                            <pre style={{ background: 'var(--bg-primary)', padding: '0.8rem', borderRadius: 6, fontSize: '0.9rem' }}>
                                {`# Undo unstaged changes
git restore file.mdx

# Unstage files
git restore --staged file.mdx

# Reset to last commit (DANGEROUS)
git reset --hard HEAD`}
                            </pre>
                        </div>

                        <div style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Deployment Pipeline</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                The site uses Vercel for automatic deployments. Pushing to the <code>main</code> branch will automatically trigger a build and publish the changes to production.
                            </p>
                            <br />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                Before committing, you can test changes locally by running <code>npm run dev</code> or trigger the full build pipeline locally with <code>npm run build</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
