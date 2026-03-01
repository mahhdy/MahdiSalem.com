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

const FIELD_GROUPS: { label: string; fields: { value: string; label: string }[] }[] = [
    {
        label: 'Metadata',
        fields: [
            { value: 'title', label: 'title' },
            { value: 'description', label: 'description' },
            { value: 'author', label: 'author' },
            { value: 'participants', label: 'participants' },
            { value: 'lang', label: 'lang' },
            { value: 'publishDate', label: 'publishDate' },
            { value: 'updatedDate', label: 'updatedDate' },
        ],
    },
    {
        label: 'Visibility',
        fields: [
            { value: 'draft', label: 'draft' },
            { value: 'hidden', label: 'hidden' },
            { value: 'showInContents', label: 'showInContents' },
        ],
    },
    {
        label: 'Taxonomy',
        fields: [
            { value: 'tags', label: 'tags' },
            { value: 'categories', label: 'categories' },
            { value: 'interface', label: 'interface' },
            { value: 'keywords', label: 'keywords' },
        ],
    },
    {
        label: 'Display',
        fields: [
            { value: 'coverImage', label: 'coverImage' },
            { value: 'imageDisplay', label: 'imageDisplay' },
            { value: 'cardImage', label: 'cardImage' },
            { value: 'show-header', label: 'show-header' },
        ],
    },
    {
        label: 'Media',
        fields: [
            { value: 'pdfUrl', label: 'pdfUrl' },
            { value: 'hasSlide', label: 'hasSlide' },
            { value: 'slideArray', label: 'slideArray' },
            { value: 'pdfOnly', label: 'pdfOnly' },
            { value: 'showPdfViewer', label: 'showPdfViewer' },
            { value: 'mediaUrl', label: 'mediaUrl' },
            { value: 'thumbnailUrl', label: 'thumbnailUrl' },
        ],
    },
    {
        label: 'Books',
        fields: [
            { value: 'order', label: 'order' },
            { value: 'bookSlug', label: 'bookSlug' },
            { value: 'chapterNumber', label: 'chapterNumber' },
        ],
    },
    {
        label: 'Type',
        fields: [
            { value: 'type', label: 'type' },
            { value: 'sourceType', label: 'sourceType' },
        ],
    },
];

const ARRAY_FIELDS = ['tags', 'categories', 'category', 'keywords'];
const BOOL_FIELDS = ['draft', 'hidden', 'showincontents', 'featured', 'pdfonly', 'showpdfviewer', 'show-header'];

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

    const clearSelection = () => {
        setSelectedDocs(new Set());
    };

    const toggleRowExpand = (slug: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(slug) ? next.delete(slug) : next.add(slug);
            return next;
        });
    };

    const isArrayField = ARRAY_FIELDS.includes(targetField.toLowerCase());
    const isBoolField = BOOL_FIELDS.includes(targetField.toLowerCase());

    // When the user picks a new field, reset the value inputs
    const handleFieldChange = (newField: string) => {
        setTargetField(newField);
        setBatchValue('');
        setBatchBool(null);
        setBatchMsg({ text: '', type: '' });
    };

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

            setBatchMsg({ text: `Updated ${data.succeeded} out of ${data.total} documents`, type: 'success' });
            loadContent(); // Refresh live data
        } catch (err) {
            setBatchMsg({ text: String(err), type: 'error' });
        }
    };

    const isProtectedField = PROTECTED_FIELDS.includes(targetField);

    // Subtitle text showing filtered vs total
    const subtitleText = useMemo(() => {
        if (searchQuery || collectionFilter || langFilter || draftFilter) {
            return `${filteredItems.length} of ${items.length} items (filtered)`;
        }
        return `${items.length} items`;
    }, [filteredItems.length, items.length, searchQuery, collectionFilter, langFilter, draftFilter]);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">Content Browser</h1>
                    <p className="page-subtitle">{subtitleText}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link
                        to={collectionFilter ? `/content/${collectionFilter}/new` : `/content/new`}
                        className="btn btn-primary"
                        style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                        + New Content
                    </Link>
                    <button
                        className={`btn ${editorOpen ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => setEditorOpen(!editorOpen)}
                    >
                        {editorOpen ? 'Close Batch Editor' : 'Open Batch Editor'}
                    </button>
                </div>
            </div>

            {/* Batch Editor Panel */}
            {editorOpen && (
                <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 8, marginBottom: '1rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                            Batch Frontmatter Editor
                            <span style={{
                                fontSize: '0.8rem',
                                background: selectedDocs.size > 0 ? 'var(--primary)' : 'var(--bg-primary)',
                                color: selectedDocs.size > 0 ? '#fff' : 'var(--text-muted)',
                                padding: '2px 10px',
                                borderRadius: 12,
                                fontWeight: 'normal',
                                transition: 'all 0.15s ease',
                            }}>
                                {selectedDocs.size} selected
                            </span>
                        </h3>
                        {selectedDocs.size > 0 && (
                            <button
                                className="btn btn-secondary"
                                onClick={clearSelection}
                                style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        {/* Field Selector */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                Target Field
                            </label>
                            <select
                                value={targetField}
                                onChange={e => handleFieldChange(e.target.value)}
                                className="filter-select"
                                style={{ width: 220, height: 36 }}
                            >
                                <option value="">-- Select a field --</option>
                                {FIELD_GROUPS.map(group => (
                                    <optgroup key={group.label} label={group.label}>
                                        {group.fields.map(f => (
                                            <option key={f.value} value={f.value}>
                                                {f.label}
                                                {PROTECTED_FIELDS.includes(f.value) ? ' (protected)' : ''}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {/* Value controls -- only shown when a valid non-protected field is chosen */}
                        {targetField && !isProtectedField && (
                            <>
                                {isArrayField && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                            Array Operation
                                        </label>
                                        <select
                                            value={arrayMode}
                                            onChange={e => setArrayMode(e.target.value as any)}
                                            className="filter-select"
                                            style={{ height: 36 }}
                                        >
                                            <option value="merge">Add / Merge</option>
                                            <option value="remove">Remove</option>
                                            <option value="replace">Replace Entirely</option>
                                        </select>
                                    </div>
                                )}

                                <div style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 350 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Value
                                    </label>
                                    {isBoolField ? (
                                        <select
                                            value={batchBool === null ? 'mixed' : batchBool ? 'true' : 'false'}
                                            onChange={e => setBatchBool(e.target.value === 'mixed' ? null : e.target.value === 'true')}
                                            className="filter-select"
                                            style={{ height: 36, width: '100%' }}
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
                                            placeholder={isArrayField ? "comma, separated, values" : "Enter value..."}
                                            className="filter-input"
                                            style={{ width: '100%', height: 36, boxSizing: 'border-box' }}
                                        />
                                    )}
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleBatchUpdate}
                                    style={{ height: 36, whiteSpace: 'nowrap' }}
                                    disabled={selectedDocs.size === 0}
                                >
                                    Apply to {selectedDocs.size} Doc{selectedDocs.size !== 1 ? 's' : ''}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Protected field warning */}
                    {isProtectedField && (
                        <div style={{ marginTop: '0.75rem', color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 500 }}>
                            Cannot edit protected field "{targetField}" -- this field is managed by the file system.
                        </div>
                    )}

                    {/* Status message */}
                    {batchMsg.text && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '8px 12px',
                            borderRadius: 6,
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            background: batchMsg.type === 'error' ? '#ffebee' : batchMsg.type === 'success' ? '#e8f5e9' : 'var(--bg-primary)',
                            color: batchMsg.type === 'error' ? 'var(--danger)' : batchMsg.type === 'success' ? 'var(--success)' : 'var(--text-secondary)',
                        }}>
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
                    <option value="books">Books</option>
                    <option value="articles">Articles</option>
                    <option value="dialogues">Dialogues</option>
                    <option value="statements">Statements</option>
                    <option value="multimedia">Multimedia</option>
                    <option value="wiki">Wiki</option>
                </select>

                <select
                    className="filter-select"
                    value={langFilter}
                    onChange={(e) => updateFilter('lang', e.target.value)}
                >
                    <option value="">All Languages</option>
                    <option value="fa">Persian</option>
                    <option value="en">English</option>
                </select>

                <select
                    className="filter-select"
                    value={draftFilter}
                    onChange={(e) => updateFilter('draft', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="true">Drafts</option>
                    <option value="false">Published</option>
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
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedDocs.size > 0 && selectedDocs.size === filteredItems.length}
                                        ref={el => { if (el) el.indeterminate = selectedDocs.size > 0 && selectedDocs.size < filteredItems.length; }}
                                        onChange={toggleSelectAll}
                                        title={selectedDocs.size === filteredItems.length ? 'Deselect all' : 'Select all'}
                                    />
                                </div>
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
                                currentValDisplay = '\u2014';
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
                                                {isExpanded ? '\u25BC' : '\u25B6'}
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
                                                : '\u2014'}
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
                    <div className="placeholder-icon">?</div>
                    <div className="placeholder-text">No items match your filters</div>
                    <div className="placeholder-detail">Try adjusting the filters above</div>
                </div>
            )}
        </div>
    );
}
