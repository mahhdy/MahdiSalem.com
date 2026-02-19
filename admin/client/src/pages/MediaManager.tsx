import { useEffect, useState } from 'react';

interface MediaItem {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modifiedAt: string;
    type: string;
}

export default function MediaManager() {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [currentDir, setCurrentDir] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');

    const load = (dir: string) => {
        setLoading(true);
        fetch(`/api/media?dir=${encodeURIComponent(dir)}`)
            .then((r) => r.json())
            .then((data) => {
                setItems(data.items || []);
                setCurrentDir(dir);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { load(''); }, []);

    const navigate = (item: MediaItem) => {
        if (item.isDirectory) {
            load(currentDir ? `${currentDir}/${item.name}` : item.name);
        }
    };

    const goUp = () => {
        const parts = currentDir.split('/').filter(Boolean);
        parts.pop();
        load(parts.join('/'));
    };

    const copyPath = (p: string) => {
        navigator.clipboard.writeText(p);
        setCopied(p);
        setTimeout(() => setCopied(''), 2000);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const typeIcons: Record<string, string> = {
        directory: '📁',
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        document: '📄',
        file: '📋',
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Media Manager</h1>
                <p className="page-subtitle">Browse and manage files in public/</p>
            </div>

            {/* Breadcrumb */}
            <div style={{ marginBottom: 20, display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.85rem' }}>
                <span
                    style={{ cursor: 'pointer', color: 'var(--accent)' }}
                    onClick={() => load('')}
                >
                    public/
                </span>
                {currentDir.split('/').filter(Boolean).map((part, i, arr) => (
                    <span key={i}>
                        <span style={{ color: 'var(--text-muted)' }}>/</span>
                        <span
                            style={{ cursor: 'pointer', color: i === arr.length - 1 ? 'var(--text-primary)' : 'var(--accent)' }}
                            onClick={() => load(arr.slice(0, i + 1).join('/'))}
                        >
                            {part}
                        </span>
                    </span>
                ))}
            </div>

            {/* Back button */}
            {currentDir && (
                <button className="btn btn-secondary" onClick={goUp} style={{ marginBottom: 16 }}>
                    ← Back
                </button>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="loading-skeleton" style={{ height: 80 }} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {items.map((item) => (
                        <div
                            key={item.name}
                            onClick={() => navigate(item)}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: 14,
                                cursor: item.isDirectory ? 'pointer' : 'default',
                                transition: 'all 150ms ease',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>
                                {typeIcons[item.type] || '📋'}
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 500, wordBreak: 'break-all', marginBottom: 4 }}>
                                {item.name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {item.isDirectory ? 'Folder' : formatSize(item.size)}
                            </div>
                            {!item.isDirectory && (
                                <button
                                    className="btn btn-secondary"
                                    style={{ marginTop: 8, padding: '3px 8px', fontSize: '0.7rem' }}
                                    onClick={(e) => { e.stopPropagation(); copyPath(item.path); }}
                                >
                                    {copied === item.path ? '✅ Copied!' : '📋 Copy Path'}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="placeholder-page">
                    <div className="placeholder-icon">📁</div>
                    <div className="placeholder-text">Empty directory</div>
                </div>
            )}
        </div>
    );
}
