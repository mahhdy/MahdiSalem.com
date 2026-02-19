import { useEffect, useState } from 'react';

interface Category {
    slug: string;
    nameFa: string;
    nameEn: string;
    descriptionFa?: string;
    descriptionEn?: string;
    imagePath?: string;
    parentCategory?: string;
    contentTypes?: string[];
}

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [message, setMessage] = useState('');

    const loadCategories = () => {
        setLoading(true);
        fetch('/api/categories')
            .then((r) => r.json())
            .then((data) => {
                setCategories(data.categories || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { loadCategories(); }, []);

    const handleDelete = async (slug: string) => {
        if (!confirm(`Delete category "${slug}"? This will fail if subcategories reference it.`)) return;
        try {
            const res = await fetch(`/api/categories/${slug}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setMessage(`✅ Deleted category "${slug}"`);
                loadCategories();
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
    };

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
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    + Add Category
                </button>
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

            {showAdd && (
                <AddCategoryDialog
                    parentOptions={categories.filter(c => !c.parentCategory).map(c => c.slug)}
                    onClose={() => setShowAdd(false)}
                    onCreated={() => { loadCategories(); setShowAdd(false); setMessage('✅ Category created!'); }}
                />
            )}

            {loading ? (
                <div>{[1, 2, 3].map(i => <div key={i} className="loading-skeleton" style={{ height: 60, marginBottom: 8 }} />)}</div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {topLevel.map((cat) => (
                        <CategoryGroup
                            key={cat.slug}
                            category={cat}
                            children={parents.get(cat.slug) || []}
                            onDelete={handleDelete}
                        />
                    ))}

                    {[...parents.entries()]
                        .filter(([parent]) => !topLevel.find((t) => t.slug === parent))
                        .map(([parent, children]) => (
                            <div key={parent} style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8, letterSpacing: '0.06em' }}>
                                    {parent}
                                </div>
                                {children.map((cat) => (
                                    <CategoryCard key={cat.slug} category={cat} onDelete={handleDelete} />
                                ))}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

/* ═══ Add Category Dialog ═══ */

function AddCategoryDialog({ parentOptions, onClose, onCreated }: {
    parentOptions: string[];
    onClose: () => void;
    onCreated: () => void;
}) {
    const [slug, setSlug] = useState('');
    const [nameFa, setNameFa] = useState('');
    const [nameEn, setNameEn] = useState('');
    const [parent, setParent] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!slug || !nameFa || !nameEn) {
            setError('Slug, Persian name, and English name are required');
            return;
        }
        setCreating(true);
        try {
            const body: Record<string, unknown> = { slug, nameFa, nameEn };
            if (parent) body.parentCategory = parent;

            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                onCreated();
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError((err as Error).message);
        }
        setCreating(false);
    };

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 24,
            boxShadow: 'var(--shadow-lg)',
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>✨ Add New Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Slug</label>
                    <input className="filter-input" style={{ width: '100%' }} placeholder="my-category" value={slug} onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase())} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Name (Persian)</label>
                    <input className="filter-input" style={{ width: '100%', direction: 'rtl' }} placeholder="نام فارسی" value={nameFa} onChange={(e) => setNameFa(e.target.value)} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Name (English)</label>
                    <input className="filter-input" style={{ width: '100%' }} placeholder="English Name" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Parent Category</label>
                    <select className="filter-select" style={{ width: '100%' }} value={parent} onChange={(e) => setParent(e.target.value)}>
                        <option value="">— None (top-level) —</option>
                        {parentOptions.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
            {error && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: 12 }}>❌ {error}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : '✅ Create'}</button>
                <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

/* ═══ Category Group ═══ */

function CategoryGroup({ category, children, onDelete }: { category: Category; children: Category[]; onDelete: (slug: string) => void }) {
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
                    <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                        onClick={(e) => { e.stopPropagation(); onDelete(category.slug); }}
                        title="Delete category"
                    >🗑️</button>
                    <span style={{ color: 'var(--text-muted)' }}>{expanded ? '▼' : '▶'}</span>
                </div>
            </div>

            {expanded && children.length > 0 && (
                <div style={{ padding: '0 12px 12px', display: 'grid', gap: 4 }}>
                    {children.map((cat) => (
                        <CategoryCard key={cat.slug} category={cat} onDelete={onDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══ Category Card ═══ */

function CategoryCard({ category, onDelete }: { category: Category; onDelete: (slug: string) => void }) {
    return (
        <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid var(--border)',
        }}>
            <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{category.nameEn}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', direction: 'rtl' }}>{category.nameFa}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{category.slug}</span>
                <button
                    className="btn btn-danger"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    onClick={() => onDelete(category.slug)}
                    title="Delete category"
                >🗑️</button>
            </div>
        </div>
    );
}
