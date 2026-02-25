import { useState, useEffect, useRef } from 'react';

interface ScriptAction {
    flag: string;
    label: string;
    icon: string;
    desc: string;
    group: 'primary' | 'secondary' | 'utility';
}

const SCRIPTS: ScriptAction[] = [
    { flag: '--all', label: 'Process All', icon: '▶', desc: 'Full pipeline: LaTeX + HTML + Markdown → MDX', group: 'primary' },
    { flag: '--book', label: 'Process Books', icon: '📚', desc: 'Convert LaTeX/PDF books only', group: 'secondary' },
    { flag: '--zip', label: 'Process ZIP', icon: '📦', desc: 'Extract and convert ZIP archives', group: 'secondary' },
    { flag: '--html', label: 'Process HTML', icon: '🌐', desc: 'Convert raw HTML files to MDX', group: 'secondary' },
    { flag: 'fix:mermaid', label: 'Fix Mermaid', icon: '🔧', desc: 'Fix smart quotes & Unicode issues in Mermaid blocks', group: 'utility' },
    { flag: 'fix:mermaid:dry', label: 'Fix Mermaid (Dry)', icon: '👀', desc: 'Preview Mermaid fixes without saving', group: 'utility' },
    { flag: 'test:mermaid', label: 'Test Mermaid', icon: '🧪', desc: 'Validate Mermaid code block extraction', group: 'utility' },
];

export default function ScriptRunner() {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const [polling, setPolling] = useState(false);
    const [activeScript, setActiveScript] = useState<string | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!polling) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scripts/output?since=${output.length}`);
                const data = await res.json();
                if (data.lines?.length > 0) setOutput(prev => [...prev, ...data.lines]);
                if (!data.isRunning) { setIsRunning(false); setPolling(false); setActiveScript(null); }
            } catch { /* ignore */ }
        }, 1000);
        return () => clearInterval(interval);
    }, [polling, output.length]);

    useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [output]);

    const runScript = async (flag: string) => {
        setOutput([`> Running: ${flag}\n`]);
        setIsRunning(true);
        setPolling(true);
        setActiveScript(flag);
        try {
            const res = await fetch('/api/scripts/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: flag }),
            });
            const data = await res.json();
            if (!data.success) {
                setOutput(prev => [...prev, `❌ ${data.error}`]);
                setIsRunning(false); setPolling(false); setActiveScript(null);
            }
        } catch (err) {
            setOutput(prev => [...prev, `❌ ${(err as Error).message}`]);
            setIsRunning(false); setPolling(false); setActiveScript(null);
        }
    };

    const groupedScripts = {
        primary: SCRIPTS.filter(s => s.group === 'primary'),
        secondary: SCRIPTS.filter(s => s.group === 'secondary'),
        utility: SCRIPTS.filter(s => s.group === 'utility'),
    };

    const ScriptButton = ({ s }: { s: ScriptAction }) => (
        <button
            className={`btn ${s.group === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
            disabled={isRunning}
            onClick={() => runScript(s.flag)}
            title={s.desc}
            style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 18px', minWidth: 130, textAlign: 'center', position: 'relative',
                opacity: isRunning && activeScript !== s.flag ? 0.5 : 1,
            }}
        >
            {isRunning && activeScript === s.flag
                ? <span className="spinner" style={{ width: 20, height: 20 }} />
                : <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            }
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{s.desc}</span>
        </button>
    );

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">⚡ Script Runner</h1>
                <p className="page-subtitle">Run content processing pipelines, utilities, and fixes from the browser.</p>
            </div>

            {/* ─── Primary Actions ─── */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>
                    Main Pipeline
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {groupedScripts.primary.map(s => <ScriptButton key={s.flag} s={s} />)}
                </div>
            </div>

            {/* ─── Secondary Actions ─── */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>
                    Individual Processors
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {groupedScripts.secondary.map(s => <ScriptButton key={s.flag} s={s} />)}
                </div>
            </div>

            {/* ─── Utility Actions ─── */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10 }}>
                    Utilities & Diagnostics
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {groupedScripts.utility.map(s => <ScriptButton key={s.flag} s={s} />)}
                </div>
            </div>

            {/* ─── Running indicator ─── */}
            {isRunning && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'hsla(220, 85%, 60%, 0.08)',
                    border: '1px solid hsla(220, 85%, 60%, 0.2)', borderRadius: 'var(--radius-md)',
                    marginBottom: 16, fontSize: '0.85rem', color: 'var(--accent)',
                }}>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                    Running <code>{activeScript}</code>...
                </div>
            )}

            {/* ─── Output Log ─── */}
            <div style={{
                background: '#0d0d0d', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                padding: 20, fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '0.8rem',
                lineHeight: 1.6, maxHeight: 500, overflowY: 'auto', whiteSpace: 'pre-wrap',
                wordBreak: 'break-all', color: '#aaa',
            }}>
                {output.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>
                        Click a button above to run a script. Output will appear here.
                    </span>
                ) : output.map((line, i) => (
                    <div key={i} style={{
                        color: line.includes('[ERROR]') ? 'var(--danger)'
                            : line.startsWith('>') ? 'var(--accent)'
                                : line.includes('✅') || line.includes('success') ? 'var(--success)'
                                    : '#aaa',
                    }}>{line}</div>
                ))}
                <div ref={logEndRef} />
            </div>

            {output.length > 0 && !isRunning && (
                <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setOutput([])}>
                    🗑️ Clear Log
                </button>
            )}
        </div>
    );
}
