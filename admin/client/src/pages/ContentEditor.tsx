import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import MediaManager from './MediaManager';

interface ContentFile {
    collection: string;
    slug: string;
    filePath: string;
    frontmatter: Record<string, unknown>;
    body: string;
}

export default function ContentEditor() {
    const params = useParams();
    const collection = params.collection || '';
    const fullSlug = params['*'] || params.slug || '';

    const navigate = useNavigate();
    const [file, setFile] = useState<ContentFile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [body, setBody] = useState('');
    const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
    const [message, setMessage] = useState('');
    const [showDelete, setShowDelete] = useState(false);
    
    // Custom field state
    const [newCustomKey, setNewCustomKey] = useState('');
    const [newCustomVal, setNewCustomVal] = useState('');

    // Image Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [activePickerField, setActivePickerField] = useState<string | null>(null);

    // AI Tagging State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);

    const handleAITagging = async () => {
        setAiLoading(true);
        setShowAiModal(true);
        setAiResult(null);
        try {
            const res = await fetch('/api/ai/tag', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: body || '',
                    title: frontmatter.title || fullSlug,
                    lang: frontmatter.lang || 'fa'
                })
            });
            const data = await res.json();
            if (data.success) {
                setAiResult(data.result);
            } else {
                setMessage(`❌ AI Error: ${data.error}`);
                setShowAiModal(false);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
            setShowAiModal(false);
        }
        setAiLoading(false);
    };

    const applyAITags = () => {
        if (!aiResult) return;
        setFrontmatter(prev => ({
            ...prev,
            tags: aiResult.tags || prev.tags,
            keywords: aiResult.keywords || prev.keywords,
            description: aiResult.description || prev.description,
            interface: aiResult.category?.primary || prev.interface,
        }));
        setShowAiModal(false);
        setMessage('✅ AI suggestions applied (not saved yet).');
    };

    const isDevelopment = (import.meta as any).env.MODE === 'development';

    const loadContent = useCallback(() => {
        if (!collection || !fullSlug) return;
        fetch(`/api/content/${collection}/${fullSlug}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setMessage(`Error: ${data.error}`);
                } else {
                    setFile(data);
                    setFrontmatter(data.frontmatter || {});
                    setBody(data.body || '');
                }
                setLoading(false);
            })
            .catch((err) => {
                setMessage(`Connection error: ${err.message}`);
                setLoading(false);
            });
    }, [collection, fullSlug]);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`/api/content/${collection}/${fullSlug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ frontmatter, body }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ Saved successfully!');
            } else {
                setMessage(`❌ ${data.error || 'Save failed'}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
        setSaving(false);
    }, [collection, fullSlug, frontmatter, body]);

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/content/${collection}/${fullSlug}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                navigate('/content', { replace: true });
            } else {
                setMessage(`❌ ${data.error || 'Delete failed'}`);
            }
        } catch (err) {
            setMessage(`❌ ${(err as Error).message}`);
        }
        setShowDelete(false);
    };

    // Ctrl+S / Cmd+S to save
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    const updateField = (key: string, value: unknown) => {
        setFrontmatter((prev) => ({ ...prev, [key]: value }));
    };

    const openPicker = (key: string) => {
        setActivePickerField(key);
        setShowPicker(true);
    };

    const handlePickImage = (path: string) => {
        if (activePickerField) {
            updateField(activePickerField, path);
        }
        setShowPicker(false);
        setActivePickerField(null);
    };

    if (loading) {
        return (
            <div>
                <div className="page-header">
                    <h1 className="page-title">Loading...</h1>
                </div>
                <div className="loading-skeleton" style={{ height: 400 }} />
            </div>
        );
    }

    if (!file) {
        return (
            <div className="placeholder-page">
                <div className="placeholder-icon">❌</div>
                <div className="placeholder-text">File not found</div>
                <div className="placeholder-detail">{message}</div>
                <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/content')}>
                    ← Back to Browser
                </button>
            </div>
        );
    }

    const fields = getFieldsForCollection(collection);
    const standardKeys = new Set(fields.map(f => f.key));
    const customKeys = Object.keys(frontmatter).filter(k => !standardKeys.has(k) && k !== 'layout');

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">{String(frontmatter.title || fullSlug)}</h1>
                    <p className="page-subtitle">
                        <span className="badge collection">{collection}</span>{' '}
                        <span className={`badge lang-${frontmatter.lang || 'fa'}`}>
                            {String(frontmatter.lang || 'fa').toUpperCase()}
                        </span>{' '}
                        <span className={`badge ${frontmatter.draft ? 'draft' : 'published'}`}>
                            {frontmatter.draft ? 'Draft' : 'Published'}
                        </span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => navigate('/content')}>
                        ← Back
                    </button>
                    <button className="btn btn-secondary" onClick={handleAITagging} disabled={aiLoading}>
                        🤖 AI Tagging
                    </button>
                    <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
                        🗑️ Delete
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? '💾 Saving...' : '💾 Save (Ctrl+S)'}
                    </button>
                </div>
            </div>

            {/* Delete Confirmation */}
            {showDelete && (
                <div style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                    background: 'hsla(0, 75%, 60%, 0.08)',
                    border: '1px solid hsla(0, 75%, 60%, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                        ⚠️ Soft-delete the file? (Recoverable via .deleted suffix)
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Confirm Delete</button>
                    </div>
                </div>
            )}

            {message && (
                <div
                    className="toast"
                    style={{
                        background: message.startsWith('✅') ? 'hsla(150, 70%, 50%, 0.1)' : 'hsla(0, 75%, 60%, 0.1)',
                        color: message.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${message.startsWith('✅') ? 'hsla(150,70%,50%,0.2)' : 'hsla(0,75%,60%,0.2)'}`,
                    }}
                >
                    {message}
                    <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            {/* Image Picker Modal */}
            {showPicker && (
                <div className="modal-overlay" onClick={() => setShowPicker(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <MediaManager isPicker onSelect={handlePickImage} />
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <button className="btn btn-secondary" onClick={() => setShowPicker(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Tagging Modal */}
            {showAiModal && (
                <div className="modal-overlay" onClick={() => !aiLoading && setShowAiModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: 16 }}>🤖 AI Content Analysis</h2>
                        {aiLoading ? (
                            <div style={{ padding: 40, textAlign: 'center' }}>
                                <div className="loading-skeleton" style={{ height: 20, width: '60%', margin: '0 auto 16px' }} />
                                <div className="loading-skeleton" style={{ height: 20, width: '40%', margin: '0 auto' }} />
                                <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Analyzing text and generating taxonomy...</p>
                            </div>
                        ) : aiResult ? (
                            <div style={{ fontSize: '0.9rem' }}>
                                <div style={{ marginBottom: 12 }}><strong>Category (interface):</strong> <span className="badge collection">{aiResult.category?.primary}</span></div>
                                <div style={{ marginBottom: 12 }}><strong>Tags:</strong>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                                        {aiResult.tags?.map((t: string) => <span key={t} className="badge" style={{ background: 'var(--bg-tertiary)' }}>{t}</span>)}
                                    </div>
                                </div>
                                <div style={{ marginBottom: 12 }}><strong>Keywords:</strong> {aiResult.keywords?.join(', ')}</div>
                                <div style={{ marginBottom: 12 }}><strong>Description:</strong> {aiResult.description}</div>
                                <div style={{ marginBottom: 12 }}><strong>Summary:</strong> {aiResult.summary}</div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--danger)' }}>Failed to load results.</div>
                        )}
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>Close</button>
                            <button className="btn btn-primary" onClick={applyAITags} disabled={aiLoading || !aiResult}>
                                ✨ Apply Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Frontmatter Fields */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {fields.map((field) => (
                    <FieldEditor
                        key={field.key}
                        field={field}
                        value={frontmatter[field.key]}
                        onChange={(v) => updateField(field.key, v)}
                        onOpenPicker={() => openPicker(field.key)}
                    />
                ))}

                {/* Custom Fields */}
                {customKeys.map(key => {
                    const val = frontmatter[key];
                    let valStr = '';
                    if (val !== undefined && val !== null) {
                        valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);
                    }
                    
                    return (
                        <div key={key}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                                <span>{key} <i style={{ textTransform: 'none', fontWeight: 400, opacity: 0.7 }}>(custom)</i></span>
                                <button
                                    onClick={() => {
                                        const newFm = { ...frontmatter };
                                        delete newFm[key];
                                        setFrontmatter(newFm);
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0 }}
                                    title="Delete field"
                                >
                                    ✕
                                </button>
                            </label>
                            <input
                                type="text"
                                style={{
                                    width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                    color: 'var(--text-primary)', padding: '8px 14px', fontSize: '0.85rem', outline: 'none'
                                }}
                                value={valStr}
                                onChange={(e) => {
                                    let newVal: any = e.target.value;
                                    try { 
                                        if (newVal === 'true') newVal = true;
                                        else if (newVal === 'false') newVal = false;
                                        else if (!isNaN(Number(newVal)) && newVal.trim() !== '') newVal = Number(newVal);
                                        else newVal = JSON.parse(newVal); 
                                    } catch { /* keep as string if not JSON parsable */ }
                                    updateField(key, newVal);
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Cover Image Preview */}
            {(frontmatter.coverImage || frontmatter.thumbnailUrl) && (
                <div style={{ marginBottom: 24, background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
                        Cover Image Preview
                        {frontmatter.imageDisplay && (
                            <span style={{ marginLeft: 8, textTransform: 'none', fontWeight: 400, opacity: 0.7 }}>
                                (Page: {String(frontmatter.imageDisplay)} · Card: {String(frontmatter.cardImage || 'show')})
                            </span>
                        )}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img
                            src={`http://localhost:4321${String(frontmatter.coverImage || frontmatter.thumbnailUrl)}`}
                            alt="Cover preview"
                            style={{
                                maxHeight: 120,
                                maxWidth: 200,
                                borderRadius: 'var(--radius-md)',
                                objectFit: 'cover',
                                border: '1px solid var(--border)',
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {String(frontmatter.coverImage || frontmatter.thumbnailUrl)}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Custom Field */}
            <div style={{ marginBottom: 32, background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>ADD NEW FIELD</label>
                    <input type="text" className="filter-input" style={{ width: '100%' }} value={newCustomKey} onChange={e => setNewCustomKey(e.target.value)} placeholder="Field key (e.g. featured)" />
                </div>
                <div style={{ flex: '2 1 300px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'transparent', marginBottom: 4 }}>Value</label>
                    <input type="text" className="filter-input" style={{ width: '100%' }} value={newCustomVal} onChange={e => setNewCustomVal(e.target.value)} placeholder="Field value..." onKeyDown={e => {
                        if (e.key === 'Enter') document.getElementById('add-field-btn')?.click();
                    }} />
                </div>
                <button id="add-field-btn" className="btn btn-secondary" onClick={() => {
                    const key = newCustomKey.trim();
                    if (!key) return;
                    let parsedVal: any = newCustomVal;
                    if (newCustomVal === 'true') parsedVal = true;
                    else if (newCustomVal === 'false') parsedVal = false;
                    else if (!isNaN(Number(newCustomVal)) && newCustomVal.trim() !== '') parsedVal = Number(newCustomVal);
                    else {
                        try { parsedVal = JSON.parse(newCustomVal); } catch {}
                    }
                    
                    updateField(key, parsedVal);
                    setNewCustomKey('');
                    setNewCustomVal('');
                }}>
                    + Add Field
                </button>
            </div>

            {/* Body Editor */}
            <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>
                    Content Body (Markdown)
                </label>
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <Editor
                        height="500px"
                        language="markdown"
                        theme="vs-dark"
                        value={body}
                        onChange={(v: string | undefined) => setBody(v || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            padding: { top: 16 },
                            renderWhitespace: 'selection',
                            automaticLayout: true,
                        }}
                    />
                </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                File: {file.filePath}
            </div>
        </div>
    );
}

// --- Field definitions ---

interface FieldDef {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'boolean' | 'select' | 'tags' | 'number' | 'image' | 'file';
    options?: string[];
    placeholder?: string;
}

function getFieldsForCollection(collection: string): FieldDef[] {
    const common: FieldDef[] = [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'lang', label: 'Language', type: 'select', options: ['fa', 'en'] },
        { key: 'draft', label: 'Draft', type: 'boolean' },
        { key: 'tags', label: 'Tags', type: 'tags' },
    ];

    switch (collection) {
        case 'books':
            return [
                ...common,
                { key: 'author', label: 'Author', type: 'text' },
                { key: 'publishDate', label: 'Publish Date', type: 'date' },
                { key: 'coverImage', label: 'Cover Image', type: 'image' },
                { key: 'imageDisplay', label: 'Image in Page', type: 'select', options: ['full', 'side', 'thumbnail', 'hidden'] },
                { key: 'cardImage', label: 'Image in Card', type: 'select', options: ['show', 'hidden'] },
                { key: 'pdfUrl', label: 'PDF URL', type: 'file' },
                { key: 'order', label: 'Order', type: 'number' },
            ];
        case 'articles':
            return [
                ...common,
                { key: 'author', label: 'Author', type: 'text' },
                { key: 'publishDate', label: 'Publish Date', type: 'date' },
                { key: 'type', label: 'Type', type: 'select', options: ['statement', 'press', 'position'] },
                { key: 'coverImage', label: 'Cover Image', type: 'image' },
                { key: 'imageDisplay', label: 'Image in Page', type: 'select', options: ['full', 'side', 'thumbnail', 'hidden'] },
                { key: 'cardImage', label: 'Image in Card', type: 'select', options: ['show', 'hidden'] },
            ];
        case 'multimedia':
            return [
                ...common,
                { key: 'type', label: 'Media Type', type: 'select', options: ['video', 'audio', 'podcast'] },
                { key: 'mediaUrl', label: 'Media URL', type: 'text' },
                { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'image' },
                { key: 'coverImage', label: 'Cover Image', type: 'image' },
                { key: 'imageDisplay', label: 'Image in Page', type: 'select', options: ['full', 'side', 'thumbnail', 'hidden'] },
                { key: 'cardImage', label: 'Image in Card', type: 'select', options: ['show', 'hidden'] },
                { key: 'platform', label: 'Platform', type: 'select', options: ['youtube', 'vimeo', 'soundcloud'] },
            ];
        default:
            return common;
    }
}

function FieldEditor({
    field,
    value,
    onChange,
    onOpenPicker
}: {
    field: FieldDef;
    value: unknown;
    onChange: (v: unknown) => void;
    onOpenPicker: () => void;
}) {
    const baseStyle = {
        width: '100%',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        padding: '8px 14px',
        fontSize: '0.85rem',
        outline: 'none',
    } as const;

    return (
        <div>
            <label style={{ display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
                {field.label}
            </label>

            {field.type === 'text' && (
                <input type="text" style={baseStyle} value={String(value || '')} onChange={(e) => onChange(e.target.value)} />
            )}

            {(field.type === 'image' || field.type === 'file') && (
                <div style={{ display: 'flex', gap: 6 }}>
                    <input type="text" style={{ ...baseStyle, flex: 1 }} value={String(value || '')} onChange={(e) => onChange(e.target.value)} />
                    <button className="btn btn-secondary" style={{ padding: '8px 12px', fontSize: '0.75rem' }} onClick={onOpenPicker}>
                        {field.type === 'image' ? '🖼️ Select' : '📁 Select'}
                    </button>
                </div>
            )}

            {field.type === 'textarea' && (
                <textarea style={{ ...baseStyle, minHeight: 80, resize: 'vertical' }} value={String(value || '')} onChange={(e) => onChange(e.target.value)} />
            )}

            {field.type === 'date' && (
                <input type="date" style={baseStyle} value={value ? String(value).split('T')[0] : ''} onChange={(e) => onChange(e.target.value)} />
            )}

            {field.type === 'number' && (
                <input type="number" style={baseStyle} value={value !== undefined ? Number(value) : ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )}

            {field.type === 'boolean' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{Boolean(value) ? 'Yes' : 'No'}</span>
                </label>
            )}

            {field.type === 'select' && (
                <select style={baseStyle} value={String(value || '')} onChange={(e) => onChange(e.target.value)}>
                    <option value="">— Select —</option>
                    {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            )}

            {field.type === 'tags' && (
                <input type="text" style={baseStyle} value={Array.isArray(value) ? value.join(', ') : String(value || '')} placeholder="tag1, tag2" onChange={(e) => onChange(e.target.value.split(',').map(t => t.trim()).filter(Boolean))} />
            )}
        </div>
    );
}
