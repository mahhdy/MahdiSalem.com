import { useEffect, useState } from 'react';
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
}

export default function ContentBrowser() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const collectionFilter = searchParams.get('collection') || '';
    const langFilter = searchParams.get('lang') || '';
    const draftFilter = searchParams.get('draft') || '';
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
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
    }, [collectionFilter, langFilter, draftFilter]);

    const filteredItems = searchQuery
        ? items.filter(
            (i) =>
                i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                i.slug.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : items;

    const updateFilter = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        setSearchParams(next);
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Content Browser</h1>
                <p className="page-subtitle">{filteredItems.length} items</p>
            </div>

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
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Collection</th>
                            <th>Lang</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={`${item.collection}-${item.slug}`}>
                                <td>
                                    <Link to={`/content/${item.collection}/${item.slug}`}>
                                        {item.title}
                                    </Link>
                                </td>
                                <td>
                                    <span className="badge collection">{item.collection}</span>
                                </td>
                                <td>
                                    <span className={`badge lang-${item.lang}`}>
                                        {item.lang.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${item.draft ? 'draft' : 'published'}`}>
                                        {item.draft ? 'Draft' : 'Published'}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>
                                    {item.publishDate
                                        ? new Date(item.publishDate).toLocaleDateString()
                                        : '—'}
                                </td>
                            </tr>
                        ))}
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
