import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Stats {
    totalItems: number;
    totalDrafts: number;
    missingTaxonomy: number;
    collections: Record<
        string,
        { total: number; drafts: number; languages: Record<string, number> }
    >;
    generatedAt: string;
}

interface DraftItem {
    collection: string;
    slug: string;
    title: string;
    lang: string;
}

interface RecentItem {
    file: string;
    collection: string;
    slug: string;
    title: string;
    modifiedAt: string;
}

const collectionIcons: Record<string, string> = {
    books: '📚',
    articles: '📰',
    statements: '📜',
    multimedia: '🎬',
    wiki: '📖',
};

const quickActions = [
    { label: 'New Article', icon: '📝', to: '/content/articles/new', color: 'hsl(150, 70%, 50%)' },
    { label: 'New Book', icon: '📕', to: '/content/books/new', color: 'hsl(220, 85%, 60%)' },
    { label: 'Content Browser', icon: '🔍', to: '/content', color: 'hsl(200, 80%, 60%)' },
    { label: 'Run Scripts', icon: '⚡', to: '/scripts', color: 'hsl(40, 90%, 55%)' },
    { label: 'Media Manager', icon: '🖼️', to: '/media', color: 'hsl(280, 70%, 60%)' },
];

/* ─── Inline styles scoped to Dashboard ─── */

const styles = {
    section: {
        marginTop: 40,
    } as React.CSSProperties,
    sectionHeader: {
        fontSize: '0.72rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border)',
    } as React.CSSProperties,
    quickActionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
    } as React.CSSProperties,
    quickActionCard: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 8,
        padding: '20px 12px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        color: 'var(--text-primary)',
        transition: 'all 250ms ease',
        cursor: 'pointer',
        textAlign: 'center' as const,
    } as React.CSSProperties,
    quickActionIcon: {
        fontSize: '1.6rem',
        lineHeight: 1,
    } as React.CSSProperties,
    quickActionLabel: {
        fontSize: '0.82rem',
        fontWeight: 550,
    } as React.CSSProperties,
    healthGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
    } as React.CSSProperties,
    healthCard: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 6,
        padding: '18px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        textDecoration: 'none',
        transition: 'all 250ms ease',
        cursor: 'pointer',
    } as React.CSSProperties,
    healthLabel: {
        fontSize: '0.75rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        color: 'var(--text-muted)',
        fontWeight: 600,
    } as React.CSSProperties,
    healthValue: {
        fontSize: '1.8rem',
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: '-0.03em',
    } as React.CSSProperties,
    healthHint: {
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
    } as React.CSSProperties,
    recentList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 2,
    } as React.CSSProperties,
    recentRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        transition: 'background 150ms ease',
        textDecoration: 'none',
        color: 'var(--text-primary)',
    } as React.CSSProperties,
    recentTitle: {
        fontSize: '0.88rem',
        fontWeight: 500,
        flex: 1,
        minWidth: 0,
        overflow: 'hidden' as const,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    recentMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
    } as React.CSSProperties,
    recentTime: {
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap' as const,
    } as React.CSSProperties,
    emptyState: {
        padding: '24px 16px',
        textAlign: 'center' as const,
        color: 'var(--text-muted)',
        fontSize: '0.88rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
    } as React.CSSProperties,
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 32,
    } as React.CSSProperties,
};

function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
    const [recentError, setRecentError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/stats').then((r) => r.json()),
            fetch('/api/stats/drafts').then((r) => r.json()),
        ])
            .then(([statsData, draftsData]) => {
                setStats(statsData);
                setDrafts(draftsData.drafts || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });

        // Fetch recent activity separately — gracefully handle 404
        fetch('/api/stats/recent')
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json();
            })
            .then((data) => {
                setRecentItems(Array.isArray(data.items) ? data.items.slice(0, 10) : []);
            })
            .catch(() => {
                setRecentError(true);
            });
    }, []);

    /* ─── Loading state ─── */
    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Loading site health overview...</p>
                </div>
                <div className="stats-grid">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="stat-card">
                            <div className="loading-skeleton" style={{ width: '60%', height: 14, marginBottom: 12 }} />
                            <div className="loading-skeleton" style={{ width: '40%', height: 36 }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    /* ─── Error state ─── */
    if (error) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle" style={{ color: 'var(--danger)' }}>
                        Could not connect to admin server. Is it running on port 3334?
                    </p>
                </div>
                <div className="stat-card" style={{ borderColor: 'var(--danger)', maxWidth: 500 }}>
                    <pre style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                        {error}
                    </pre>
                    <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Run: <code style={{ color: 'var(--accent)' }}>cd admin/server && npm install && npm run dev</code>
                    </p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const collections = Object.entries(stats.collections);

    /* Compute content-health counts from what we already have */
    const totalMissingCover = 0;       // Would need an API field; placeholder for future
    const totalMissingDesc = 0;        // Same — placeholder
    const totalMissingTaxonomy = stats.missingTaxonomy;
    const totalDrafts = stats.totalDrafts;

    return (
        <div>
            {/* ═══ Page Header ═══ */}
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">
                    Site health overview  ·  {stats.totalItems} items across {collections.length} collections
                    {stats.generatedAt && (
                        <span style={{ marginLeft: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Updated {formatRelativeTime(stats.generatedAt)}
                        </span>
                    )}
                </p>
            </div>

            {/* ═══ Collection Stat Cards ═══ */}
            <div className="stats-grid">
                {collections.map(([name, data]) => (
                    <Link
                        key={name}
                        to={`/content?collection=${name}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <div className={`stat-card ${name}`}>
                            <div className="stat-label">
                                {collectionIcons[name] || '📄'} {name}
                            </div>
                            <div className="stat-value">{data.total}</div>
                            <div className="stat-detail">
                                {Object.entries(data.languages)
                                    .map(([lang, count]) => `${lang}: ${count}`)
                                    .join(' · ')}
                                {data.drafts > 0 && ` · ${data.drafts} drafts`}
                            </div>
                        </div>
                    </Link>
                ))}

                {/* Drafts card */}
                <Link to="/content?draft=true" style={{ textDecoration: 'none' }}>
                    <div className="stat-card drafts">
                        <div className="stat-label">📝 Drafts</div>
                        <div className="stat-value">{stats.totalDrafts}</div>
                        <div className="stat-detail">
                            unpublished items awaiting review
                        </div>
                    </div>
                </Link>

                {/* Taxonomy gaps */}
                <Link to="/content?q=missing-taxonomy" style={{ textDecoration: 'none' }}>
                    <div className="stat-card">
                        <div className="stat-label">🏷️ Missing Taxonomy</div>
                        <div className="stat-value">{stats.missingTaxonomy}</div>
                        <div className="stat-detail">
                            items without category or interface
                        </div>
                    </div>
                </Link>
            </div>

            {/* ═══ Quick Actions ═══ */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>Quick Actions</div>
                <div style={styles.quickActionsGrid}>
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
                            to={action.to}
                            style={styles.quickActionCard}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.borderColor = action.color;
                                el.style.transform = 'translateY(-2px)';
                                el.style.boxShadow = `0 4px 16px ${action.color}22`;
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.borderColor = 'var(--border)';
                                el.style.transform = 'none';
                                el.style.boxShadow = 'none';
                            }}
                        >
                            <span style={styles.quickActionIcon}>{action.icon}</span>
                            <span style={styles.quickActionLabel}>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* ═══ Two-Column: Recent Activity + Content Health ═══ */}
            <div
                style={{
                    ...styles.twoCol,
                    marginTop: 40,
                }}
            >
                {/* ── Recent Activity ── */}
                <div>
                    <div style={styles.sectionHeader}>Recent Activity</div>
                    {recentError ? (
                        <div style={styles.emptyState}>
                            Recent activity not available.
                            <br />
                            <span style={{ fontSize: '0.78rem' }}>
                                The <code>/api/stats/recent</code> endpoint may not be implemented yet.
                            </span>
                        </div>
                    ) : recentItems.length === 0 ? (
                        <div style={styles.emptyState}>
                            No recent activity to show.
                        </div>
                    ) : (
                        <div style={styles.recentList}>
                            {recentItems.map((item, idx) => (
                                <Link
                                    key={`${item.collection}-${item.slug}-${idx}`}
                                    to={`/content/${item.collection}/${item.slug}`}
                                    style={styles.recentRow}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-card)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', flexShrink: 0, width: 22, textAlign: 'center' }}>
                                        {collectionIcons[item.collection] || '📄'}
                                    </span>
                                    <span style={styles.recentTitle}>
                                        {item.title || item.slug}
                                    </span>
                                    <span style={styles.recentMeta}>
                                        <span className="badge collection" style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                                            {item.collection}
                                        </span>
                                        <span style={styles.recentTime}>
                                            {formatRelativeTime(item.modifiedAt)}
                                        </span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Content Health ── */}
                <div>
                    <div style={styles.sectionHeader}>Content Health</div>
                    <div style={styles.healthGrid}>
                        <Link
                            to="/content?q=missing-cover"
                            style={{
                                ...styles.healthCard,
                                borderLeftColor: 'var(--warning)',
                                borderLeftWidth: 3,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <span style={styles.healthLabel}>Missing Cover Image</span>
                            <span style={{ ...styles.healthValue, color: totalMissingCover > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                {totalMissingCover > 0 ? totalMissingCover : '---'}
                            </span>
                            <span style={styles.healthHint}>
                                {totalMissingCover > 0 ? 'Items need a coverImage' : 'Stat not yet tracked'}
                            </span>
                        </Link>

                        <Link
                            to="/content?q=missing-description"
                            style={{
                                ...styles.healthCard,
                                borderLeftColor: 'var(--info)',
                                borderLeftWidth: 3,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <span style={styles.healthLabel}>Missing Description</span>
                            <span style={{ ...styles.healthValue, color: totalMissingDesc > 0 ? 'var(--info)' : 'var(--success)' }}>
                                {totalMissingDesc > 0 ? totalMissingDesc : '---'}
                            </span>
                            <span style={styles.healthHint}>
                                {totalMissingDesc > 0 ? 'Items need a description' : 'Stat not yet tracked'}
                            </span>
                        </Link>

                        <Link
                            to="/content?q=missing-taxonomy"
                            style={{
                                ...styles.healthCard,
                                borderLeftColor: 'var(--danger)',
                                borderLeftWidth: 3,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <span style={styles.healthLabel}>Missing Taxonomy</span>
                            <span style={{ ...styles.healthValue, color: totalMissingTaxonomy > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {totalMissingTaxonomy}
                            </span>
                            <span style={styles.healthHint}>
                                {totalMissingTaxonomy > 0
                                    ? 'No interface or category set'
                                    : 'All items categorized'}
                            </span>
                        </Link>

                        <Link
                            to="/content?draft=true"
                            style={{
                                ...styles.healthCard,
                                borderLeftColor: 'hsl(40, 90%, 55%)',
                                borderLeftWidth: 3,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card-hover)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--bg-card)';
                                e.currentTarget.style.transform = 'none';
                            }}
                        >
                            <span style={styles.healthLabel}>Draft Items</span>
                            <span style={{ ...styles.healthValue, color: totalDrafts > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                {totalDrafts}
                            </span>
                            <span style={styles.healthHint}>
                                {totalDrafts > 0
                                    ? 'Unpublished, awaiting review'
                                    : 'All items published'}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ Draft List Table ═══ */}
            {drafts.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        Draft Items ({drafts.length})
                    </div>
                    <table className="content-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Collection</th>
                                <th>Language</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drafts.map((d) => (
                                <tr key={`${d.collection}-${d.slug}`}>
                                    <td>{d.title}</td>
                                    <td>
                                        <span className="badge collection">{d.collection}</span>
                                    </td>
                                    <td>
                                        <span className={`badge lang-${d.lang}`}>{d.lang.toUpperCase()}</span>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/content/${d.collection}/${d.slug}`}
                                            className="btn btn-secondary"
                                            style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
