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

const collectionIcons: Record<string, string> = {
    books: '📚',
    articles: '📰',
    statements: '📜',
    multimedia: '🎬',
    wiki: '📖',
};

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
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
    }, []);

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

    if (error) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle" style={{ color: 'var(--danger)' }}>
                        ⚠️ Could not connect to admin server. Is it running on port 3334?
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

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">
                    Site health overview · {stats.totalItems} items across {collections.length} collections
                </p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                {collections.map(([name, data]) => (
                    <div key={name} className={`stat-card ${name}`}>
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
                ))}

                {/* Drafts card */}
                <div className="stat-card drafts">
                    <div className="stat-label">📝 Drafts</div>
                    <div className="stat-value">{stats.totalDrafts}</div>
                    <div className="stat-detail">
                        unpublished items awaiting review
                    </div>
                </div>

                {/* Taxonomy gaps */}
                <div className="stat-card">
                    <div className="stat-label">🏷️ Missing Taxonomy</div>
                    <div className="stat-value">{stats.missingTaxonomy}</div>
                    <div className="stat-detail">
                        items without category or interface
                    </div>
                </div>
            </div>

            {/* Draft List */}
            {drafts.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                        📋 Draft Items
                    </h2>
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
                                            Edit →
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
