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
    const [renaming, setRenaming] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState('');

    const loadTags = () => {
        setLoading(true);
        fetch('/api/tags')
            .then((r) => r.json())
            .then((data) => {
                setTags(data.tags || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { loadTags(); }, []);

    const handleRename = async (oldName: string) => {
        if (!newName.trim() || newName === oldName) {
            setRenaming(null);
            return;
        }
        try {
            const res = await fetch(`/api/tags/${encodeURIComponent(oldName)}/rename`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newName: newName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`✅ Renamed "${oldName}" → "${newName.trim()}" in ${data.filesUpdated} files`);
                loadTags();
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
        setRenaming(null);
        setNewName('');
    };

    const handleDelete = async (tag: string) => {
        if (!confirm(`Remove tag "${tag}" from all content files?`)) return;
        try {
            const res = await fetch(`/api/tags/${encodeURIComponent(tag)}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMessage(`✅ Removed "${tag}" from ${data.filesUpdated} files`);
                loadTags();
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
    };

    const filtered = search
        ? tags.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
        : tags;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Tag Manager</h1>
                <p className="page-subtitle">{tags.length} unique tags across all content</p>
            </div>

            {message && (
                <div style={{
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                    fontSize: '0.85rem',
                    background: message.startsWith('✅') ? 'hsla(150,70%,50%,0.1)' : 'hsla(0,75%,60%,0.1)',
                    color: message.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${message.startsWith('✅') ? 'hsla(150,70%,50%,0.2)' : 'hsla(0,75%,60%,0.2)'}`,
                }}>
                    {message}
                    <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 8 }}>
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
                                gap: 12,
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {renaming === tag.name ? (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <input
                                            className="filter-input"
                                            style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.name)}
                                            autoFocus
                                        />
                                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleRename(tag.name)}>Save</button>
                                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setRenaming(null)}>✕</button>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{tag.name}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {tag.collections.join(', ')}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <span style={{
                                    background: 'hsla(220, 85%, 60%, 0.12)',
                                    color: 'var(--accent)',
                                    padding: '3px 10px',
                                    borderRadius: 100,
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                }}>
                                    {tag.count}
                                </span>
                                <button
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                    onClick={() => { setRenaming(tag.name); setNewName(tag.name); }}
                                    title="Rename tag"
                                >✏️</button>
                                <button
                                    className="btn btn-danger"
                                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                    onClick={() => handleDelete(tag.name)}
                                    title="Delete tag"
                                >🗑️</button>
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
