import { useEffect, useState, useRef } from 'react';

interface MediaItem {
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
    modifiedAt: string;
    type: string;
}

interface MediaManagerProps {
    onSelect?: (path: string) => void;
    isPicker?: boolean;
}

export default function MediaManager({ onSelect, isPicker = false }: MediaManagerProps) {
    const [items, setItems] = useState<MediaItem[]>([]);
    const [currentDir, setCurrentDir] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState('');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        } else if (isPicker && onSelect) {
            onSelect(item.path);
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

    const handleDelete = async (item: MediaItem) => {
        if (!confirm(`Delete ${item.name}? It will be soft-deleted (.deleted suffix added).`)) return;

        try {
            const res = await fetch(`/api/media${item.path}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMessage(`✅ Deleted ${item.name}`);
                load(currentDir);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('dir', currentDir);

        try {
            const res = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setMessage(`✅ Uploaded ${data.filename}`);
                load(currentDir);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
        <div className={isPicker ? 'media-picker' : ''}>
            {!isPicker && (
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className="page-title">Media Manager</h1>
                        <p className="page-subtitle">Browse and manage files in public/</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? '📤 Uploading...' : '📤 Upload File'}
                        </button>
                    </div>
                </div>
            )}

            {isPicker && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Select Image</h2>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            style={{ display: 'none' }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                        >
                            {uploading ? '...' : 'Upload'}
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                    fontSize: '0.8rem',
                    background: message.startsWith('✅') ? 'hsla(150, 70%, 50%, 0.1)' : 'hsla(0, 75%, 60%, 0.1)',
                    color: message.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
                    border: `1px solid ${message.startsWith('✅') ? 'hsla(150,70%,50%,0.2)' : 'hsla(0,75%,60%,0.2)'}`,
                }}>
                    {message}
                    <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

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
                <button className="btn btn-secondary" onClick={goUp} style={{ marginBottom: 16, padding: '4px 12px', fontSize: '0.8rem' }}>
                    ← Back
                </button>
            )}

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="loading-skeleton" style={{ height: 100 }} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {items.map((item) => (
                        <div
                            key={item.name}
                            onClick={() => navigate(item)}
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                padding: 14,
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                                position: 'relative',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: 8, textAlign: 'center' }}>
                                {typeIcons[item.type] || '📋'}
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 500, wordBreak: 'break-all', marginBottom: 4, height: '2.4em', overflow: 'hidden' }}>
                                {item.name}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                {item.isDirectory ? 'Folder' : formatSize(item.size)}
                            </div>

                            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                                {!item.isDirectory && (
                                    <>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ padding: '2px 6px', fontSize: '0.65rem', flex: 1 }}
                                            onClick={(e) => { e.stopPropagation(); copyPath(item.path); }}
                                        >
                                            {copied === item.path ? '✅' : '🔗'}
                                        </button>
                                        <button
                                            className="btn btn-danger"
                                            style={{ padding: '2px 6px', fontSize: '0.65rem', flex: 1 }}
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                        >
                                            🗑️
                                        </button>
                                    </>
                                )}
                            </div>
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
