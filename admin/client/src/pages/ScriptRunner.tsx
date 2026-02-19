import { useState, useEffect, useRef } from 'react';

export default function ScriptRunner() {
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const [polling, setPolling] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);

    // Poll for output when running
    useEffect(() => {
        if (!polling) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/scripts/output?since=${output.length}`);
                const data = await res.json();

                if (data.lines && data.lines.length > 0) {
                    setOutput((prev) => [...prev, ...data.lines]);
                }
                if (!data.isRunning) {
                    setIsRunning(false);
                    setPolling(false);
                }
            } catch {
                // Ignore polling errors
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [polling, output.length]);

    // Auto-scroll log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [output]);

    const runScript = async (flag: string) => {
        setOutput([`> Running: process-content.mjs ${flag}\n`]);
        setIsRunning(true);
        setPolling(true);

        try {
            const res = await fetch('/api/scripts/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: flag }),
            });
            const data = await res.json();
            if (!data.success) {
                setOutput((prev) => [...prev, `❌ ${data.error}`]);
                setIsRunning(false);
                setPolling(false);
            }
        } catch (err) {
            setOutput((prev) => [...prev, `❌ ${(err as Error).message}`]);
            setIsRunning(false);
            setPolling(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Script Runner</h1>
                <p className="page-subtitle">Run content processing scripts</p>
            </div>

            {/* Run Buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <button
                    className="btn btn-primary"
                    disabled={isRunning}
                    onClick={() => runScript('--all')}
                >
                    {isRunning ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '▶'}
                    Process All
                </button>
                <button
                    className="btn btn-secondary"
                    disabled={isRunning}
                    onClick={() => runScript('--book')}
                >
                    📚 Process Books
                </button>
                <button
                    className="btn btn-secondary"
                    disabled={isRunning}
                    onClick={() => runScript('--zip')}
                >
                    📦 Process Zip
                </button>
            </div>

            {/* Status */}
            {isRunning && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    background: 'hsla(220, 85%, 60%, 0.08)',
                    border: '1px solid hsla(220, 85%, 60%, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 16,
                    fontSize: '0.85rem',
                    color: 'var(--accent)',
                }}>
                    <span className="spinner" style={{ width: 16, height: 16 }} />
                    Script is running...
                </div>
            )}

            {/* Output Log */}
            <div
                style={{
                    background: '#0d0d0d',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 20,
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    maxHeight: 500,
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    color: '#aaa',
                }}
            >
                {output.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>
                        Click a button above to run a script. Output will appear here.
                    </span>
                ) : (
                    output.map((line, i) => (
                        <div
                            key={i}
                            style={{
                                color: line.includes('[ERROR]')
                                    ? 'var(--danger)'
                                    : line.startsWith('>')
                                        ? 'var(--accent)'
                                        : line.includes('✅') || line.includes('success')
                                            ? 'var(--success)'
                                            : '#aaa',
                            }}
                        >
                            {line}
                        </div>
                    ))
                )}
                <div ref={logEndRef} />
            </div>

            {/* Clear Log */}
            {output.length > 0 && !isRunning && (
                <button
                    className="btn btn-secondary"
                    style={{ marginTop: 12 }}
                    onClick={() => setOutput([])}
                >
                    🗑️ Clear Log
                </button>
            )}
        </div>
    );
}
