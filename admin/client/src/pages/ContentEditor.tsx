import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ContentFile {
    collection: string;
    slug: string;
    filePath: string;
    frontmatter: Record<string, unknown>;
    body: string;
}

export default function ContentEditor() {
    const { collection, '*': slug } = useParams();
    const navigate = useNavigate();
    const [file, setFile] = useState<ContentFile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [body, setBody] = useState('');
    const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
    const [message, setMessage] = useState('');

    // Reconstruct slug from wildcard param
    const fullSlug = slug || useParams().slug || '';

    useEffect(() => {
        fetch(`/api/content/${collection}/${fullSlug}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setMessage(`Error: ${data.error}`);
                } else {
                    setFile(data);
                    setFrontmatter(data.frontmatter || {});
                    setBody(data.body || '');
                }
                setLoading(false);
            })
            .catch((err) => {
                setMessage(`Connection error: ${err.message}`);
                setLoading(false);
            });
    }, [collection, fullSlug]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`/api/content/${collection}/${fullSlug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frontmatter, body }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ Saved successfully!');
            } else {
                setMessage(`❌ ${data.error || 'Save failed'}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
        setSaving(false);
    };

    const updateField = (key: string, value: unknown) => {
        setFrontmatter((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Loading...</h1>
                </div>
                <div className="loading-skeleton" style={{ height: 400 }} />
            </div>
        );
    }

    if (!file) {
        return (
            <div className="placeholder-page">
                <div className="placeholder-icon">❌</div>
                <div className="placeholder-text">File not found</div>
                <div className="placeholder-detail">{message}</div>
                <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/content')}>
                    ← Back to Browser
                </button>
            </div>
        );
    }

    // Determine which fields to show based on collection type
    const fields = getFieldsForCollection(collection || '');

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">{String(frontmatter.title || fullSlug)}</h1>
                    <p className="page-subtitle">
                        <span className="badge collection">{collection}</span>{' '}
                        <span className={`badge lang-${frontmatter.lang || 'fa'}`}>
                            {String(frontmatter.lang || 'fa').toUpperCase()}
                        </span>{' '}
                        <span className={`badge ${frontmatter.draft ? 'draft' : 'published'}`}>
                            {frontmatter.draft ? 'Draft' : 'Published'}
                        </span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/content')}>
                        ← Back
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? '💾 Saving...' : '💾 Save'}
                    </button>
                </div>
            </div>

            {message && (
                <div
                    style={{
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 16,
                        fontSize: '0.85rem',
                        background: message.startsWith('✅')
                            ? 'hsla(150, 70%, 50%, 0.1)'
                            : 'hsla(0, 75%, 60%, 0.1)',
                        color: message.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${message.startsWith('✅') ? 'hsla(150,70%,50%,0.2)' : 'hsla(0,75%,60%,0.2)'}`,
                    }}
                >
                    {message}
                </div>
            )}

            {/* Frontmatter Fields */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 16,
                    marginBottom: 32,
                }}
            >
                {fields.map((field) => (
                    <FieldEditor
                        key={field.key}
                        field={field}
                        value={frontmatter[field.key]}
                        onChange={(v) => updateField(field.key, v)}
                    />
                ))}
            </div>

            {/* Body Editor */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
                    Content Body (Markdown)
                </label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={{
                        width: '100%',
                        minHeight: 400,
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-primary)',
                        padding: 16,
                        fontFamily: "'Fira Code', 'Consolas', monospace",
                        fontSize: '0.85rem',
                        lineHeight: 1.7,
                        resize: 'vertical',
                        outline: 'none',
                    }}
                />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                File: {file.filePath}
            </div>
        </div>
    );
}

// --- Field definitions per collection ---

interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'boolean' | 'select' | 'tags' | 'number';
    options?: string[];
    placeholder?: string;
}

function getFieldsForCollection(collection: string): FieldDef[] {
    const common: FieldDef[] = [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'lang', label: 'Language', type: 'select', options: ['fa', 'en'] },
        { key: 'draft', label: 'Draft', type: 'boolean' },
        { key: 'interface', label: 'Interface (Taxonomy)', type: 'text', placeholder: 'e.g. ontology' },
        { key: 'tags', label: 'Tags', type: 'tags' },
    ];

    switch (collection) {
        case 'books':
            return [
                ...common,
                { key: 'author', label: 'Author', type: 'text' },
                { key: 'publishDate', label: 'Publish Date', type: 'date' },
                { key: 'coverImage', label: 'Cover Image', type: 'text', placeholder: '/images/covers/...' },
                { key: 'pdfUrl', label: 'PDF URL', type: 'text' },
                { key: 'showPdfViewer', label: 'Show PDF Viewer', type: 'boolean' },
                { key: 'bookSlug', label: 'Book Slug', type: 'text' },
                { key: 'chapterNumber', label: 'Chapter Number', type: 'number' },
                { key: 'order', label: 'Order', type: 'number' },
            ];
        case 'articles':
            return [
                ...common,
                { key: 'author', label: 'Author', type: 'text' },
                { key: 'publishDate', label: 'Publish Date', type: 'date' },
                { key: 'type', label: 'Type', type: 'select', options: ['statement', 'press', 'position'] },
                { key: 'coverImage', label: 'Cover Image', type: 'text' },
            ];
        case 'multimedia':
            return [
                ...common,
                { key: 'publishDate', label: 'Publish Date', type: 'date' },
                { key: 'type', label: 'Media Type', type: 'select', options: ['video', 'audio', 'podcast'] },
                { key: 'mediaUrl', label: 'Media URL', type: 'text' },
                { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'text' },
                { key: 'duration', label: 'Duration (seconds)', type: 'number' },
                { key: 'platform', label: 'Platform', type: 'select', options: ['youtube', 'vimeo', 'soundcloud', 'self-hosted'] },
                { key: 'episodeNumber', label: 'Episode #', type: 'number' },
                { key: 'seasonNumber', label: 'Season #', type: 'number' },
                { key: 'podcastName', label: 'Podcast Name', type: 'text' },
            ];
        case 'statements':
            return [
                ...common,
                { key: 'publishDate', label: 'Publish Date', type: 'date' },
                { key: 'type', label: 'Type', type: 'select', options: ['statement', 'press', 'position'] },
            ];
        case 'wiki':
            return [
                ...common,
                { key: 'section', label: 'Section', type: 'text' },
                { key: 'order', label: 'Order', type: 'number' },
                { key: 'lastUpdated', label: 'Last Updated', type: 'date' },
            ];
        default:
            return common;
    }
}

// --- Field Editor Component ---

function FieldEditor({
    field,
    value,
    onChange,
}: {
    field: FieldDef;
    value: unknown;
    onChange: (v: unknown) => void;
}) {
    const baseStyle = {
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        padding: '8px 14px',
        fontSize: '0.85rem',
        fontFamily: 'inherit',
        outline: 'none',
    } as const;

    return (
        <div>
            <label
                style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    marginBottom: 6,
                }}
            >
                {field.label}
            </label>

            {field.type === 'text' && (
                <input
                    type="text"
                    style={baseStyle}
                    value={String(value || '')}
                    placeholder={field.placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}

            {field.type === 'textarea' && (
                <textarea
                    style={{ ...baseStyle, minHeight: 80, resize: 'vertical' }}
                    value={String(value || '')}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}

            {field.type === 'date' && (
                <input
                    type="date"
                    style={baseStyle}
                    value={value ? String(value).split('T')[0] : ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}

            {field.type === 'number' && (
                <input
                    type="number"
                    style={baseStyle}
                    value={value !== undefined && value !== null ? Number(value) : ''}
                    onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
            )}

            {field.type === 'boolean' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => onChange(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {Boolean(value) ? 'Yes' : 'No'}
                    </span>
                </label>
            )}

            {field.type === 'select' && (
                <select
                    style={baseStyle}
                    value={String(value || '')}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">— Select —</option>
                    {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            )}

            {field.type === 'tags' && (
                <input
                    type="text"
                    style={baseStyle}
                    value={Array.isArray(value) ? value.join(', ') : String(value || '')}
                    placeholder="tag1, tag2, tag3"
                    onChange={(e) =>
                        onChange(
                            e.target.value
                                .split(',')
                                .map((t) => t.trim())
                                .filter(Boolean)
                        )
                    }
                />
            )}
        </div>
    );
}
