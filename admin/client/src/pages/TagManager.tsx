import { useEffect, useState } from 'react';

interface TagEntry {
    name: string;
    count: number;
    collections: string[];
}

export default function TagManager() {
    const [tags, setTags] = useState<TagEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/tags')
            .then((r) => r.json())
            .then((data) => {
                setTags(data.tags || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = search
        ? tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
        : tags;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Tag Manager</h1>
                <p className="page-subtitle">{tags.length} unique tags across all content</p>
            </div>

            <div className="filter-bar">
                <input
                    className="filter-input"
                    placeholder="Search tags..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ minWidth: 280 }}
                />
            </div>

            {loading ? (
                <div>{[1, 2, 3, 4, 5].map(i => <div key={i} className="loading-skeleton" style={{ height: 44, marginBottom: 4 }} />)}</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 }}>
                    {filtered.map((tag) => (
                        <div
                            key={tag.name}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 16px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{tag.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {tag.collections.join(', ')}
                                </div>
                            </div>
                            <div style={{
                                background: 'hsla(220, 85%, 60%, 0.12)',
                                color: 'var(--accent)',
                                padding: '3px 10px',
                                borderRadius: 100,
                                fontSize: '0.78rem',
                                fontWeight: 600,
                            }}>
                                {tag.count}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="placeholder-page">
                    <div className="placeholder-icon">🔖</div>
                    <div className="placeholder-text">No tags found</div>
                </div>
            )}
        </div>
    );
}
