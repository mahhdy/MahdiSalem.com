import { useEffect, useState } from 'react';

interface ParityData {
    enKeyCount: number;
    faKeyCount: number;
    missingInEn: string[];
    missingInFa: string[];
    inSync: boolean;
}

export default function I18nManager() {
    const [parity, setParity] = useState<ParityData | null>(null);
    const [enData, setEnData] = useState<Record<string, unknown> | null>(null);
    const [faData, setFaData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/i18n/check/parity').then((r) => r.json()),
            fetch('/api/i18n/en').then((r) => r.json()),
            fetch('/api/i18n/fa').then((r) => r.json()),
        ])
            .then(([parityData, en, fa]) => {
                setParity(parityData);
                setEnData(en.data || {});
                setFaData(fa.data || {});
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Translations (i18n)</h1>
                <p className="page-subtitle">Manage en.json ↔ fa.json parity</p>
            </div>

            {loading ? (
                <div className="loading-skeleton" style={{ height: 300 }} />
            ) : (
                <>
                    {/* Parity Status */}
                    {parity && (
                        <div className="stats-grid" style={{ marginBottom: 32 }}>
                            <div className="stat-card">
                                <div className="stat-label">🇬🇧 English Keys</div>
                                <div className="stat-value">{parity.enKeyCount}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">🇮🇷 Persian Keys</div>
                                <div className="stat-value">{parity.faKeyCount}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">📊 Sync Status</div>
                                <div className="stat-value" style={{ color: parity.inSync ? 'var(--success)' : 'var(--warning)' }}>
                                    {parity.inSync ? '✅' : '⚠️'}
                                </div>
                                <div className="stat-detail">
                                    {parity.inSync
                                        ? 'All keys in sync'
                                        : `${parity.missingInEn.length + parity.missingInFa.length} missing keys`}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Missing Keys */}
                    {parity && !parity.inSync && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                            {parity.missingInEn.length > 0 && (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--warning)' }}>
                                        Missing in en.json ({parity.missingInEn.length})
                                    </h3>
                                    {parity.missingInEn.map((key) => (
                                        <div key={key} style={{ padding: '4px 0', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                            {key}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {parity.missingInFa.length > 0 && (
                                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12, color: 'var(--warning)' }}>
                                        Missing in fa.json ({parity.missingInFa.length})
                                    </h3>
                                    {parity.missingInFa.map((key) => (
                                        <div key={key} style={{ padding: '4px 0', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                            {key}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Key Table */}
                    {enData && (
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>All Keys</h2>
                            <table className="content-table">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>English</th>
                                        <th>Persian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(enData).slice(0, 50).map((key) => (
                                        <tr key={key}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{key}</td>
                                            <td style={{ fontSize: '0.82rem' }}>
                                                {typeof enData[key] === 'object' ? JSON.stringify(enData[key]).substring(0, 60) + '...' : String(enData[key]).substring(0, 60)}
                                            </td>
                                            <td style={{ fontSize: '0.82rem', direction: 'rtl' }}>
                                                {faData && typeof faData[key] === 'object' ? JSON.stringify(faData[key]).substring(0, 60) + '...' : faData ? String(faData[key] || '—').substring(0, 60) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
