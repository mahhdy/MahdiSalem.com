import { useEffect, useState } from 'react';

interface Category {
    slug: string;
    nameFa: string;
    nameEn: string;
    descriptionFa?: string;
    descriptionEn?: string;
    parentCategory?: string;
    contentTypes?: string[];
}

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/categories')
            .then((r) => r.json())
            .then((data) => {
                setCategories(data.categories || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Group by parent
    const parents = new Map<string, Category[]>();
    const topLevel: Category[] = [];

    for (const cat of categories) {
        if (cat.parentCategory) {
            if (!parents.has(cat.parentCategory)) parents.set(cat.parentCategory, []);
            parents.get(cat.parentCategory)!.push(cat);
        } else {
            topLevel.push(cat);
        }
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Category Manager</h1>
                    <p className="page-subtitle">{categories.length} categories across your taxonomy</p>
                </div>
                <button className="btn btn-primary" disabled>
                    + Add Category (Phase 3)
                </button>
            </div>

            {loading ? (
                <div>{[1, 2, 3].map(i => <div key={i} className="loading-skeleton" style={{ height: 60, marginBottom: 8 }} />)}</div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {/* Top-level categories */}
                    {topLevel.map((cat) => (
                        <CategoryGroup key={cat.slug} category={cat} children={parents.get(cat.slug) || []} />
                    ))}

                    {/* Categories with parentCategory but whose parent slug doesn't exist as top-level */}
                    {[...parents.entries()]
                        .filter(([parent]) => !topLevel.find((t) => t.slug === parent))
                        .map(([parent, children]) => (
                            <div key={parent} style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em' }}>
                                    {parent}
                                </div>
                                {children.map((cat) => (
                                    <CategoryCard key={cat.slug} category={cat} />
                                ))}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

function CategoryGroup({ category, children }: { category: Category; children: Category[] }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div
                style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setExpanded(!expanded)}
            >
                <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{category.nameEn}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', direction: 'rtl' }}>{category.nameFa}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge collection">{children.length} sub</span>
                    <span style={{ color: 'var(--text-muted)' }}>{expanded ? '▼' : '▶'}</span>
                </div>
            </div>

            {expanded && children.length > 0 && (
                <div style={{ padding: '0 12px 12px', display: 'grid', gap: 4 }}>
                    {children.map((cat) => (
                        <CategoryCard key={cat.slug} category={cat} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CategoryCard({ category }: { category: Category }) {
    return (
        <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--border)',
            transition: 'border-color 150ms ease',
        }}>
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{category.nameEn}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', direction: 'rtl' }}>{category.nameFa}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{category.slug}</span>
            </div>
        </div>
    );
}
