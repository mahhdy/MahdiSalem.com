import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ContentCreator() {
    const params = useParams();
    const initialCollection = params.collection || 'articles';

    const navigate = useNavigate();
    const [collection, setCollection] = useState(initialCollection);
    const [title, setTitle] = useState('');
    const [lang, setLang] = useState('fa');
    const [slug, setSlug] = useState('');
    const [autoSlug, setAutoSlug] = useState(true);
    const [draft, setDraft] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (autoSlug) {
            setSlug(generateSlug(newTitle));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value);
        setAutoSlug(false); // User manually edited slug
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!title.trim() || !slug.trim()) {
            setError('Title and folder/file name (slug) are required.');
            setLoading(false);
            return;
        }

        // Prefix the slug with the language folder depending on the system's setup.
        // Actually the backend just writes to `<collection>/<slug>.md`, so if it's fa it's `fa/<slug>` or just `<slug>`?
        // Looking at how the site works, typically it's `<locale>/<slug>` or similar.
        // Let's assume the slug input is the actual relative path.
        // E.g., `fa/my-article` or `en/my-article`

        const finalSlug = lang === 'fa' ? `fa/${slug}` : `en/${slug}`;

        try {
            const res = await fetch(`/api/content/${collection}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: finalSlug,
                    frontmatter: {
                        title: title.trim(),
                        lang: lang,
                        draft: draft,
                        publishDate: new Date().toISOString(),
                    },
                    body: '\nStart writing your content here...\n',
                }),
            });

            const data = await res.json();
            if (data.success) {
                // Navigate to the editor for this new file
                // Important: `finalSlug` might contain a slash, so encode or pass it correctly depending on your routing setup.
                navigate(`/content/${collection}/${finalSlug}`);
            } else {
                setError(data.error || 'Failed to create content.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        }
        setLoading(false);
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        marginBottom: '1rem',
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '0.5rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    };

    return (
        <div style={{ maxWidth: 600, margin: '40px auto' }}>
            <div className="page-header">
                <h1 className="page-title">Create New Content</h1>
                <p className="page-subtitle">Add a new file to your site.</p>
            </div>

            {error && (
                <div style={{
                    padding: '12px 16px',
                    background: 'hsla(0, 75%, 60%, 0.1)',
                    border: '1px solid hsla(0, 75%, 60%, 0.25)',
                    color: 'var(--danger)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 24,
                    fontWeight: 500,
                }}>
                    ❌ {error}
                </div>
            )}

            <form onSubmit={handleCreate} style={{
                background: 'var(--bg-card)',
                padding: '30px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <label style={labelStyle}>Collection</label>
                <select
                    style={inputStyle}
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                >
                    <option value="articles">Articles</option>
                    <option value="books">Books</option>
                    <option value="proposals">Proposals</option>
                    <option value="statements">Statements</option>
                    <option value="dialogues">Dialogues</option>
                    <option value="multimedia">Multimedia</option>
                    <option value="wiki">Wiki</option>
                </select>

                <label style={labelStyle}>Language</label>
                <div style={{ display: 'flex', gap: 16, marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="lang"
                            value="fa"
                            checked={lang === 'fa'}
                            onChange={() => setLang('fa')}
                        />
                        Persian (fa)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="lang"
                            value="en"
                            checked={lang === 'en'}
                            onChange={() => setLang('en')}
                        />
                        English (en)
                    </label>
                </div>

                <label style={labelStyle}>Title</label>
                <input
                    type="text"
                    style={inputStyle}
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter title..."
                    required
                />

                <label style={labelStyle}>URL Slug / File Name</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {lang}/
                    </span>
                    <input
                        type="text"
                        style={{ ...inputStyle, marginBottom: 0 }}
                        value={slug}
                        onChange={handleSlugChange}
                        placeholder="my-awesome-post"
                        required
                    />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
                    This decides the filename (e.g. <code>src/content/{collection}/{lang}/{slug || '...'}.md</code>)
                </p>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: '2rem' }}>
                    <input
                        type="checkbox"
                        checked={draft}
                        onChange={(e) => setDraft(e.target.checked)}
                        style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Save as Draft immediately</span>
                </label>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Content'}
                    </button>
                </div>
            </form>
        </div>
    );
}
