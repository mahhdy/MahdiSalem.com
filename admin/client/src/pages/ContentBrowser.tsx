import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

interface ContentItem {
    collection: string;
    slug: string;
    title: string;
    lang: string;
    draft: boolean;
    publishDate?: string;
    tags?: string[];
    interface?: string;
    frontmatter: Record<string, unknown>;
}

const PROTECTED_FIELDS = ['collection', 'lang', 'slug'];

export default function ContentBrowser() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
    const [targetField, setTargetField] = useState<string>('');
    const [batchValue, setBatchValue] = useState<string>('');
    const [batchBool, setBatchBool] = useState<boolean | null>(null);
    const [arrayMode, setArrayMode] = useState<'merge' | 'remove' | 'replace'>('merge');
    const [batchMsg, setBatchMsg] = useState<{ text: string, type: 'error' | 'success' | '' }>({ text: '', type: '' });
    
    // Frontmatter Inspector State
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const collectionFilter = searchParams.get('collection') || '';
    const langFilter = searchParams.get('lang') || '';
    const draftFilter = searchParams.get('draft') || '';
    const searchQuery = searchParams.get('q') || '';

    const loadContent = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (collectionFilter) params.set('collection', collectionFilter);
        if (langFilter) params.set('lang', langFilter);
        if (draftFilter) params.set('draft', draftFilter);

        fetch(`/api/content?${params}`)
            .then((r) => r.json())
            .then((data) => {
                setItems(data.items || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadContent();
    }, [collectionFilter, langFilter, draftFilter]);

    const filteredItems = useMemo(() => {
        return searchQuery
            ? items.filter(
                (i) =>
                    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    i.slug.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : items;
    }, [items, searchQuery]);

    const updateFilter = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        setSearchParams(next);
        setSelectedDocs(new Set()); // Reset selection on filter change
    };

    const toggleSelect = (slug: string) => {
        setSelectedDocs(prev => {
            const next = new Set(prev);
            next.has(slug) ? next.delete(slug) : next.add(slug);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedDocs.size === filteredItems.length) {
            setSelectedDocs(new Set());
        } else {
            setSelectedDocs(new Set(filteredItems.map(i => `${i.collection}/${i.slug}`)));
        }
    };

    const toggleRowExpand = (slug: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(slug) ? next.delete(slug) : next.add(slug);
            return next;
        });
    };

    const isArrayField = ['tags', 'categories', 'category', 'keywords'].includes(targetField.toLowerCase());
    const isBoolField = ['draft', 'hidden', 'showincontents', 'featured'].includes(targetField.toLowerCase());

    const commonFields = [
        'draft', 'hidden', 'showInContents', 'tags', 'categories', 'interface', 'featured'
    ];

    // Mixed state detection
    useEffect(() => {
        if (!targetField || selectedDocs.size === 0) return;
        
        let firstVal: unknown;
        let isMixed = false;
        let isFirst = true;

        for (const fullSlug of selectedDocs) {
            const item = items.find(i => `${i.collection}/${i.slug}` === fullSlug);
            if (!item) continue;
            
            const val = item.frontmatter?.[targetField];
            const strVal = Array.isArray(val) ? val.join(', ') : String(val ?? '');

            if (isFirst) {
                firstVal = strVal;
                isFirst = false;
            } else if (firstVal !== strVal) {
                isMixed = true;
                break;
            }
        }

        if (isBoolField && !isMixed && firstVal !== undefined) {
            setBatchBool(firstVal === 'true');
        } else if (!isMixed && firstVal !== undefined) {
            setBatchValue(firstVal as string);
        } else {
            setBatchBool(null);
            setBatchValue('');
        }
    }, [targetField, selectedDocs, items, isBoolField]);

    const handleBatchUpdate = async () => {
        if (selectedDocs.size === 0) return setBatchMsg({ text: 'Select documents first', type: 'error' });
        if (!targetField) return setBatchMsg({ text: 'No target field selected', type: 'error' });
        if (PROTECTED_FIELDS.includes(targetField)) return setBatchMsg({ text: 'Cannot modify protected field', type: 'error' });

        setBatchMsg({ text: 'Updating...', type: '' });

        let finalValue: unknown;
        if (isArrayField) {
            finalValue = batchValue.split(',').map(s => s.trim()).filter(Boolean);
        } else if (isBoolField) {
            // Revert back to false if mixed and explicitly saving false
            finalValue = batchBool === null ? false : batchBool;
        } else {
            finalValue = batchValue;
        }

        try {
            const r = await fetch('/api/bulk-content/update-frontmatter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slugs: Array.from(selectedDocs),
                    fields: { [targetField]: finalValue },
                    arrayMode: isArrayField ? arrayMode : 'replace'
                }),
            });
            const data = await r.json();
            if (data.error) throw new Error(data.error);

            setBatchMsg({ text: `✓ Updated ${data.succeeded} out of ${data.total} documents`, type: 'success' });
            loadContent(); // Refresh live data
        } catch (err) {
            setBatchMsg({ text: String(err), type: 'error' });
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Content Browser</h1>
                    <p className="page-subtitle">{filteredItems.length} items</p>
                </div>
                <button 
                    className={`btn ${editorOpen ? 'btn-secondary' : 'btn-primary'}`} 
                    onClick={() => setEditorOpen(!editorOpen)}
                >
                    {editorOpen ? 'Close Batch Editor' : 'Open Batch Editor'}
                </button>
            </div>

            {/* Batch Editor Panel */}
            {editorOpen && (
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                        🛠 Batch Frontmatter Editor
                        <span style={{ fontSize: '0.8rem', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: 12, fontWeight: 'normal', color: 'var(--text-muted)' }}>
                            {selectedDocs.size} docs selected
                        </span>
                    </h3>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 4, fontWeight: 500, color: 'var(--text-secondary)' }}>Field Name</label>
                            <input
                                list="common-fields"
                                value={targetField}
                                onChange={e => setTargetField(e.target.value)}
                                placeholder="e.g. tags, draft"
                                className="filter-input"
                                style={{ width: 200 }}
                            />
                            <datalist id="common-fields">
                                {commonFields.map(f => <option key={f} value={f} />)}
                            </datalist>
                        </div>

                        {targetField && !PROTECTED_FIELDS.includes(targetField) && (
                            <>
                                {isArrayField && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 4, fontWeight: 500, color: 'var(--text-secondary)' }}>Operation</label>
                                        <select 
                                            value={arrayMode} 
                                            onChange={e => setArrayMode(e.target.value as any)}
                                            className="filter-select"
                                        >
                                            <option value="merge">Add / Merge</option>
                                            <option value="remove">Remove</option>
                                            <option value="replace">Replace Entirely</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: 4, fontWeight: 500, color: 'var(--text-secondary)' }}>Value</label>
                                    {isBoolField ? (
                                        <select 
                                            value={batchBool === null ? 'mixed' : batchBool ? 'true' : 'false'}
                                            onChange={e => setBatchBool(e.target.value === 'mixed' ? null : e.target.value === 'true')}
                                            className="filter-select"
                                        >
                                            <option value="mixed" disabled>--- Mixed Values ---</option>
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={batchValue}
                                            onChange={e => setBatchValue(e.target.value)}
                                            placeholder={isArrayField ? "comma, separated, tags" : "Enter value..."}
                                            className="filter-input"
                                            style={{ width: 250 }}
                                        />
                                    )}
                                </div>

                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleBatchUpdate}
                                    style={{ height: '36px', marginBottom: '2px' }}
                                    disabled={selectedDocs.size === 0}
                                >
                                    Apply to Selected ({selectedDocs.size})
                                </button>
                            </>
                        )}
                        {PROTECTED_FIELDS.includes(targetField) && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 6 }}>
                                ⚠️ Cannot edit protected field "{targetField}"
                            </div>
                        )}
                    </div>
                    {batchMsg.text && (
                        <div style={{ marginTop: '1rem', color: batchMsg.type === 'error' ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>
                            {batchMsg.text}
                        </div>
                    )}
                </div>
            )}

            {/* Filters */}
            <div className="filter-bar">
                <input
                    className="filter-input"
                    type="text"
                    placeholder="Search by title or slug..."
                    value={searchQuery}
                    onChange={(e) => updateFilter('q', e.target.value)}
                    style={{ minWidth: 250 }}
                />

                <select
                    className="filter-select"
                    value={collectionFilter}
                    onChange={(e) => updateFilter('collection', e.target.value)}
                >
                    <option value="">All Collections</option>
                    <option value="books">📚 Books</option>
                    <option value="articles">📰 Articles</option>
                    <option value="statements">📜 Statements</option>
                    <option value="multimedia">🎬 Multimedia</option>
                    <option value="wiki">📖 Wiki</option>
                </select>

                <select
                    className="filter-select"
                    value={langFilter}
                    onChange={(e) => updateFilter('lang', e.target.value)}
                >
                    <option value="">All Languages</option>
                    <option value="fa">🇮🇷 Persian</option>
                    <option value="en">🇬🇧 English</option>
                </select>

                <select
                    className="filter-select"
                    value={draftFilter}
                    onChange={(e) => updateFilter('draft', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="true">📝 Drafts</option>
                    <option value="false">✅ Published</option>
                </select>
            </div>

            {/* Content Table */}
            {loading ? (
                <div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="loading-skeleton"
                            style={{ height: 48, marginBottom: 4 }}
                        />
                    ))}
                </div>
            ) : (
                <table className="content-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedDocs.size > 0 && selectedDocs.size === filteredItems.length}
                                    ref={el => { if (el) el.indeterminate = selectedDocs.size > 0 && selectedDocs.size < filteredItems.length; }}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th style={{ width: 40 }}></th>
                            <th>Title</th>
                            <th>Collection</th>
                            <th>Lang</th>
                            {targetField && (
                                <th style={{ background: '#fffae6' }}>Current: {targetField}</th>
                            )}
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => {
                            const fullSlug = `${item.collection}/${item.slug}`;
                            const isSelected = selectedDocs.has(fullSlug);
                            const isExpanded = expandedRows.has(fullSlug);
                            
                            let currentValRaw = item.frontmatter?.[targetField];
                            let currentValDisplay = '';
                            if (currentValRaw !== undefined) {
                                currentValDisplay = Array.isArray(currentValRaw) ? `[${currentValRaw.join(', ')}]` : String(currentValRaw);
                            } else if (targetField) {
                                currentValDisplay = '—';
                            }
                            
                            return (
                                <React.Fragment key={fullSlug}>
                                    <tr style={{ background: isSelected ? '#f0f7ff' : 'transparent' }}>
                                        <td style={{ textAlign: 'center' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleSelect(fullSlug)}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button 
                                                onClick={() => toggleRowExpand(fullSlug)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                                                title="View Frontmatter"
                                            >
                                                {isExpanded ? '▼' : '▶'}
                                            </button>
                                        </td>
                                        <td>
                                            <Link to={`/content/${item.collection}/${item.slug}`} style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}>
                                                {item.title}
                                            </Link>
                                            {item.draft && <span style={{ marginLeft: 6, fontSize: '0.75rem', background: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: 4 }}>Draft</span>}
                                            {item.frontmatter?.hidden === true && <span style={{ marginLeft: 6, fontSize: '0.75rem', background: '#eeeeee', color: '#616161', padding: '2px 6px', borderRadius: 4 }}>Hidden</span>}
                                        </td>
                                        <td>
                                            <span className="badge collection">{item.collection}</span>
                                        </td>
                                        <td>
                                            <span className={`badge lang-${item.lang}`}>
                                                {item.lang.toUpperCase()}
                                            </span>
                                        </td>
                                        {targetField && (
                                            <td style={{ background: '#fffef9', color: '#666', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                {String(currentValDisplay)}
                                            </td>
                                        )}
                                        <td style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {item.publishDate
                                                ? new Date(item.publishDate).toLocaleDateString()
                                                : '—'}
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={targetField ? 7 : 6} style={{ padding: '1rem', background: '#1e1e1e', color: '#d4d4d4' }}>
                                                <pre style={{ margin: 0, fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                                                    {JSON.stringify(item.frontmatter, null, 2)}
                                                </pre>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {!loading && filteredItems.length === 0 && (
                <div className="placeholder-page">
                    <div className="placeholder-icon">🔍</div>
                    <div className="placeholder-text">No items match your filters</div>
                    <div className="placeholder-detail">Try adjusting the filters above</div>
                </div>
            )}
        </div>
    );
}
