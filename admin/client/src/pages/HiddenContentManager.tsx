import { useEffect, useState } from 'react';

interface ContentItem {
    collection: string;
    slug: string;
    title: string;
    lang: string;
    hidden?: boolean;
}

export default function HiddenContentManager() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'hidden' | 'visible'>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [msg, setMsg] = useState('');

    const load = () => {
        setLoading(true);
        fetch('/api/content')
            .then(r => r.json())
            .then(data => { setItems(data.items || []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(load, []);

    const visible = items.filter(i => !i.hidden);
    const hidden = items.filter(i => i.hidden);
    const displayed = filter === 'hidden' ? hidden : filter === 'visible' ? visible : items;

    const toggle = (slug: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(slug) ? next.delete(slug) : next.add(slug);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === displayed.length) setSelected(new Set());
        else setSelected(new Set(displayed.map(i => i.slug)));
    };

    const bulkSet = async (hiddenValue: boolean) => {
        const slugs = Array.from(selected);
        if (!slugs.length) return setMsg('Select items first');
        setMsg('');
        try {
            const r = await fetch('/api/bulk-content/update-frontmatter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slugs, fields: { hidden: hiddenValue } }),
            });
            const data = await r.json();
            setMsg(`✓ Updated ${data.succeeded}/${data.total}`);
            setSelected(new Set());
            load();
        } catch {
            setMsg('Update failed');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Hidden Content</h1>
                <p className="page-subtitle">
                    {items.length} total · {hidden.length} hidden · {visible.length} visible
                </p>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {(['all', 'visible', 'hidden'] as const).map(f => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => { setFilter(f); setSelected(new Set()); }}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {f} ({f === 'all' ? items.length : f === 'hidden' ? hidden.length : visible.length})
                    </button>
                ))}
                <span style={{ marginLeft: 8 }}>|</span>
                <button className="btn btn-secondary" onClick={toggleAll}>
                    {selected.size === displayed.length ? 'Deselect All' : 'Select All'}
                </button>
                {selected.size > 0 && <>
                    <button className="btn btn-primary" onClick={() => bulkSet(false)}>
                        Make Visible ({selected.size})
                    </button>
                    <button className="btn btn-secondary" onClick={() => bulkSet(true)}>
                        Hide ({selected.size})
                    </button>
                </>}
                {msg && <span style={{ fontSize: 13, marginLeft: 8 }}>{msg}</span>}
            </div>

            {loading ? <div className="page-loading">Loading…</div> : (
                <table className="content-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 36 }}></th>
                            <th>Title</th>
                            <th>Collection</th>
                            <th>Lang</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.map(item => (
                            <tr key={item.slug}
                                style={{ opacity: item.hidden ? 0.5 : 1 }}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selected.has(item.slug)}
                                        onChange={() => toggle(item.slug)}
                                    />
                                </td>
                                <td>{item.title}</td>
                                <td>{item.collection}</td>
                                <td>{item.lang}</td>
                                <td style={{ color: item.hidden ? '#e55' : '#5a5' }}>
                                    {item.hidden ? '🔒 Hidden' : '👁 Visible'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
