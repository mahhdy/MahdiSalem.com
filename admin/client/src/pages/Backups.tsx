import { useEffect, useState } from 'react';

interface BackupItem {
    path: string;
    name: string;
    type: 'bak' | 'archive';
    size: number;
    modifiedAt: string;
}

export default function Backups() {
    const [items, setItems] = useState<BackupItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Check if the current theme is dark
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const obs = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/backups');
            if (!res.ok) throw new Error('Failed to fetch backup files');
            const data = await res.json();
            setItems(data.items || []);
            setSelected(new Set());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const toggleSelect = (path: string) => {
        const next = new Set(selected);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        setSelected(next);
    };

    const toggleAll = () => {
        if (selected.size === items.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(items.map(i => i.path)));
        }
    };

    const handleDelete = async () => {
        if (selected.size === 0) return;
        if (!confirm(`Are you sure you want to permanently delete ${selected.size} file(s)?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/backups', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: Array.from(selected) })
            });

            if (!res.ok) throw new Error('Delete failed');
            await fetchBackups();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDownload = async () => {
        if (selected.size === 0) return;
        setIsDownloading(true);

        try {
            const res = await fetch('/api/backups/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files: Array.from(selected) })
            });

            if (!res.ok) throw new Error('Download failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `archive-backups-${new Date().getTime()}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    const bakCount = items.filter(i => i.type === 'bak').length;
    const bakSize = items.filter(i => i.type === 'bak').reduce((sum, item) => sum + item.size, 0);
    const archiveCount = items.filter(i => i.type === 'archive').length;
    const archiveSize = items.filter(i => i.type === 'archive').reduce((sum, item) => sum + item.size, 0);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Backups & Archives Cleanup</h1>
                    <p className="page-subtitle">Manage .bak recovery files and archived generated HTML.</p>
                </div>
            </div>

            {error && (
                <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderLeft: '4px solid var(--danger)', color: 'var(--danger)', marginBottom: '20px' }}>
                    {error}
                </div>
            )}

            <div className="stats-grid" style={{ marginBottom: 32 }}>
                <div className="stat-card">
                    <div className="stat-label">📋 Total Items</div>
                    <div className="stat-value">{items.length}</div>
                    <div className="stat-detail">{formatSize(bakSize + archiveSize)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🗑️ .bak Files</div>
                    <div className="stat-value">{bakCount}</div>
                    <div className="stat-detail">{formatSize(bakSize)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">🗄️ Archived Source</div>
                    <div className="stat-value">{archiveCount}</div>
                    <div className="stat-detail">{formatSize(archiveSize)}</div>
                </div>
            </div>

            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                checked={items.length > 0 && selected.size === items.length}
                                onChange={toggleAll}
                                style={{ width: 16, height: 16, cursor: 'pointer' }}
                            />
                            Select All
                        </label>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ({selected.size} selected)
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleDownload}
                            disabled={selected.size === 0 || isDownloading}
                        >
                            {isDownloading ? 'Zipping...' : '⬇️ Zip & Download'}
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={selected.size === 0 || isDeleting}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--danger)',
                                color: 'var(--danger)',
                                opacity: selected.size === 0 ? 0.5 : 1,
                                cursor: selected.size === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isDeleting ? 'Deleting...' : '🗑️ Delete Selected'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : items.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No backup or archive files found. Your system is totally clean!
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                        <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, boxShadow: '0 1px 0 var(--border)' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', width: 40 }}></th>
                                    <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>File</th>
                                    <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Location</th>
                                    <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                                    <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Size</th>
                                    <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.path}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            background: selected.has(item.path) ? (isDark ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.05)') : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <td style={{ padding: '12px 20px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selected.has(item.path)}
                                                onChange={() => toggleSelect(item.path)}
                                                style={{ cursor: 'pointer', width: 16, height: 16 }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px 20px', fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {item.name}
                                        </td>
                                        <td style={{ padding: '12px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem', wordBreak: 'break-all', maxWidth: 300 }}>
                                            {item.path}
                                        </td>
                                        <td style={{ padding: '12px 20px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '2px 8px',
                                                borderRadius: '20px',
                                                background: item.type === 'bak' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: item.type === 'bak' ? '#ef4444' : '#10b981',
                                                fontWeight: 600,
                                            }}>
                                                {item.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>
                                            {formatSize(item.size)}
                                        </td>
                                        <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>
                                            {new Date(item.modifiedAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
