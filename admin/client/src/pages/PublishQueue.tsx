import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface DraftItem {
    collection: string;
    slug: string;
    title: string;
    lang: string;
    publishDate?: string;
    frontmatter: Record<string, unknown>;
}

interface ReadinessCheck {
    key: string;
    label: string;
    pass: (fm: Record<string, unknown>) => boolean;
    severity: 'error' | 'warning' | 'info';
}

const CHECKS: ReadinessCheck[] = [
    { key: 'title', label: 'Title', pass: (fm) => Boolean(fm.title), severity: 'error' },
    { key: 'description', label: 'Description', pass: (fm) => Boolean(fm.description), severity: 'warning' },
    { key: 'coverImage', label: 'Cover Image', pass: (fm) => Boolean(fm.coverImage || fm.thumbnailUrl), severity: 'warning' },
    { key: 'taxonomy', label: 'Category / Interface', pass: (fm) => Boolean(fm.interface || fm.category || (Array.isArray(fm.categories) && fm.categories.length > 0)), severity: 'warning' },
    { key: 'tags', label: 'Tags', pass: (fm) => Array.isArray(fm.tags) && fm.tags.length > 0, severity: 'info' },
    { key: 'publishDate', label: 'Publish Date', pass: (fm) => Boolean(fm.publishDate), severity: 'info' },
];

function getReadinessScore(fm: Record<string, unknown>): { score: number; total: number; errors: number; warnings: number } {
    let pass = 0;
    let errors = 0;
    let warnings = 0;
    for (const check of CHECKS) {
        if (check.pass(fm)) {
            pass++;
        } else if (check.severity === 'error') {
            errors++;
        } else if (check.severity === 'warning') {
            warnings++;
        }
    }
    return { score: pass, total: CHECKS.length, errors, warnings };
}

function ScoreBar({ score, total, errors }: { score: number; total: number; errors: number }) {
    const pct = Math.round((score / total) * 100);
    const color = errors > 0 ? 'var(--danger)' : pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--info)';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 34, textAlign: 'right' }}>{pct}%</span>
        </div>
    );
}

function CheckBadges({ fm }: { fm: Record<string, unknown> }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {CHECKS.map((check) => {
                const passes = check.pass(fm);
                if (passes) return null; // Only show failing checks
                const bg = check.severity === 'error'
                    ? 'hsla(0,75%,60%,0.12)'
                    : check.severity === 'warning'
                    ? 'hsla(40,90%,55%,0.12)'
                    : 'hsla(200,80%,60%,0.12)';
                const color = check.severity === 'error'
                    ? 'var(--danger)'
                    : check.severity === 'warning'
                    ? 'hsl(40,80%,40%)'
                    : 'var(--info)';
                return (
                    <span
                        key={check.key}
                        title={`Missing: ${check.label}`}
                        style={{
                            fontSize: '0.68rem',
                            padding: '2px 7px',
                            borderRadius: 10,
                            background: bg,
                            color,
                            fontWeight: 600,
                        }}
                    >
                        ✗ {check.label}
                    </span>
                );
            })}
        </div>
    );
}

export default function PublishQueue() {
    const [drafts, setDrafts] = useState<DraftItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState<Set<string>>(new Set());
    const [messages, setMessages] = useState<Record<string, string>>({});
    const [sortBy, setSortBy] = useState<'readiness' | 'title' | 'collection'>('readiness');
    const [filterCollection, setFilterCollection] = useState('');
    const [filterLang, setFilterLang] = useState('');

    const loadDrafts = () => {
        setLoading(true);
        fetch('/api/stats/drafts')
            .then((r) => r.json())
            .then((data) => {
                setDrafts(data.drafts || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadDrafts();
    }, []);

    const publishItem = async (item: DraftItem) => {
        const key = `${item.collection}/${item.slug}`;
        setPublishing((prev) => new Set([...prev, key]));
        setMessages((prev) => ({ ...prev, [key]: '' }));

        try {
            // Fetch current content first
            const getRes = await fetch(`/api/content/${item.collection}/${item.slug}`);
            const current = await getRes.json();
            if (current.error) throw new Error(current.error);

            // Set draft to false, set publishDate if missing
            const updatedFm = {
                ...current.frontmatter,
                draft: false,
                publishDate: current.frontmatter.publishDate || new Date().toISOString().split('T')[0],
            };

            const putRes = await fetch(`/api/content/${item.collection}/${item.slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frontmatter: updatedFm, body: current.body }),
            });
            const result = await putRes.json();

            if (result.success) {
                setMessages((prev) => ({ ...prev, [key]: '✅ Published!' }));
                // Remove from list after short delay
                setTimeout(() => {
                    setDrafts((prev) => prev.filter((d) => `${d.collection}/${d.slug}` !== key));
                }, 1200);
            } else {
                throw new Error(result.error || 'Failed');
            }
        } catch (err) {
            setMessages((prev) => ({ ...prev, [key]: `❌ ${(err as Error).message}` }));
        }

        setPublishing((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    };

    // Compute readiness for each draft
    const withReadiness = drafts.map((d) => ({
        ...d,
        readiness: getReadinessScore(d.frontmatter),
    }));

    // Filter
    const filtered = withReadiness.filter((d) => {
        if (filterCollection && d.collection !== filterCollection) return false;
        if (filterLang && d.lang !== filterLang) return false;
        return true;
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'readiness') {
            // Sort by errors first (blocking), then by score descending
            if (a.readiness.errors !== b.readiness.errors) return b.readiness.errors - a.readiness.errors; // more errors = worse = first (need attention)
            return b.readiness.score - a.readiness.score; // higher score = more ready = first... actually we want ready first
        }
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'collection') return a.collection.localeCompare(b.collection);
        return 0;
    });

    const readyToPublish = filtered.filter((d) => d.readiness.errors === 0 && d.readiness.warnings === 0).length;
    const needsWork = filtered.filter((d) => d.readiness.errors > 0 || d.readiness.warnings > 0).length;

    const uniqueCollections = [...new Set(drafts.map((d) => d.collection))].sort();

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Publish Queue</h1>
                    <p className="page-subtitle">
                        {loading ? 'Loading...' : `${drafts.length} draft${drafts.length !== 1 ? 's' : ''} · ${readyToPublish} ready · ${needsWork} need work`}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={loadDrafts} disabled={loading}>
                    ↺ Refresh
                </button>
            </div>

            {/* Summary boxes */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                    <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--success)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Ready to Publish</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success)', lineHeight: 1.2 }}>{readyToPublish}</div>
                    </div>
                    <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--warning)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Needs Work</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--warning)', lineHeight: 1.2 }}>{needsWork}</div>
                    </div>
                    <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--info)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Total Drafts</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2 }}>{drafts.length}</div>
                    </div>
                </div>
            )}

            {/* Filters + Sort */}
            <div className="filter-bar" style={{ marginBottom: 16 }}>
                <select className="filter-select" value={filterCollection} onChange={(e) => setFilterCollection(e.target.value)}>
                    <option value="">All Collections</option>
                    {uniqueCollections.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="filter-select" value={filterLang} onChange={(e) => setFilterLang(e.target.value)}>
                    <option value="">All Languages</option>
                    <option value="fa">Persian</option>
                    <option value="en">English</option>
                </select>
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <option value="readiness">Sort by Readiness</option>
                    <option value="title">Sort by Title</option>
                    <option value="collection">Sort by Collection</option>
                </select>
            </div>

            {/* Draft list */}
            {loading ? (
                <div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="loading-skeleton" style={{ height: 90, marginBottom: 8, borderRadius: 8 }} />
                    ))}
                </div>
            ) : sorted.length === 0 ? (
                <div className="placeholder-page">
                    <div className="placeholder-icon">🎉</div>
                    <div className="placeholder-text">No drafts in queue</div>
                    <div className="placeholder-detail">All content is published!</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sorted.map((item) => {
                        const key = `${item.collection}/${item.slug}`;
                        const isPublishing = publishing.has(key);
                        const msg = messages[key] || '';
                        const { score, total, errors, warnings } = item.readiness;
                        const isReady = errors === 0 && warnings === 0;

                        return (
                            <div
                                key={key}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: 12,
                                    padding: '14px 18px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderLeft: `3px solid ${errors > 0 ? 'var(--danger)' : warnings > 0 ? 'var(--warning)' : 'var(--success)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Left: info */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <Link
                                            to={`/content/${item.collection}/${item.slug}`}
                                            style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none' }}
                                        >
                                            {item.title}
                                        </Link>
                                        <span className="badge collection" style={{ fontSize: '0.65rem' }}>{item.collection}</span>
                                        <span className={`badge lang-${item.lang}`} style={{ fontSize: '0.65rem' }}>{item.lang.toUpperCase()}</span>
                                        {isReady && (
                                            <span style={{ fontSize: '0.65rem', background: 'hsla(150,70%,50%,0.12)', color: 'var(--success)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                                                ✓ Ready
                                            </span>
                                        )}
                                    </div>
                                    <ScoreBar score={score} total={total} errors={errors} />
                                    <CheckBadges fm={item.frontmatter} />
                                    {msg && (
                                        <div style={{ marginTop: 6, fontSize: '0.8rem', color: msg.startsWith('✅') ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                            {msg}
                                        </div>
                                    )}
                                </div>

                                {/* Right: actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                                    <button
                                        className={`btn ${isReady ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}
                                        onClick={() => publishItem(item)}
                                        disabled={isPublishing}
                                    >
                                        {isPublishing ? '⏳ Publishing...' : '🚀 Publish'}
                                    </button>
                                    <Link
                                        to={`/content/${item.collection}/${item.slug}`}
                                        className="btn btn-secondary"
                                        style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', textDecoration: 'none', textAlign: 'center' }}
                                    >
                                        ✏️ Edit
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
