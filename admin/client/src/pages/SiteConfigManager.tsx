import { useEffect, useState } from 'react';

interface SiteConfig {
    telegramView: 'full' | 'compact';
    telegramHomeLimit: number;
    social: {
        telegram: string;
        x: string;
        instagram: string;
        facebook: string;
        linkedin: string;
    };
}

export default function SiteConfigManager() {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetch('/api/site-config')
            .then(r => r.json())
            .then(setConfig)
            .catch(() => setMsg('Failed to load config'));
    }, []);

    const save = async () => {
        if (!config) return;
        setSaving(true);
        setMsg('');
        try {
            const r = await fetch('/api/site-config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const data = await r.json();
            setMsg(data.success ? '✓ Saved successfully' : `Error: ${data.error}`);
        } catch {
            setMsg('Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (!config) return <div className="page-loading">Loading config…</div>;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Site Config</h1>
                <p className="page-subtitle">Telegram display and social media settings</p>
            </div>

            <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Telegram */}
                <section className="card" style={{ padding: 20 }}>
                    <h2 style={{ marginBottom: 16 }}>Telegram Homepage View</h2>
                    <div style={{ display: 'flex', gap: 24 }}>
                        {(['full', 'compact'] as const).map(v => (
                            <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="telegramView"
                                    value={v}
                                    checked={config.telegramView === v}
                                    onChange={() => setConfig({ ...config, telegramView: v })}
                                />
                                <span>{v === 'full' ? 'Full cards (1-col)' : 'Compact grid (2-col)'}</span>
                            </label>
                        ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span>Posts shown on homepage:</span>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={config.telegramHomeLimit}
                                onChange={e => setConfig({ ...config, telegramHomeLimit: parseInt(e.target.value) || 5 })}
                                style={{ width: 70, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                            />
                        </label>
                    </div>
                </section>

                {/* Social */}
                <section className="card" style={{ padding: 20 }}>
                    <h2 style={{ marginBottom: 16 }}>Social Media Handles</h2>
                    <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                        Leave blank to hide a platform tab on /social
                    </p>
                    {Object.entries(config.social).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                            <span style={{ width: 90, textTransform: 'capitalize', fontWeight: 500 }}>{key}</span>
                            <input
                                type="text"
                                value={val}
                                placeholder={`${key} handle`}
                                onChange={e => setConfig({
                                    ...config,
                                    social: { ...config.social, [key]: e.target.value }
                                })}
                                style={{ flex: 1, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                            />
                        </div>
                    ))}
                </section>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button
                        className="btn btn-primary"
                        onClick={save}
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    {msg && <span style={{ fontSize: 13 }}>{msg}</span>}
                </div>
            </div>
        </div>
    );
}
