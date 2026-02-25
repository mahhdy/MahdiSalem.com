/**
 * Scripts routes — run project scripts and stream output
 */

import { Hono } from 'hono';
import { spawn } from 'node:child_process';
import { PROJECT_ROOT } from '../index.js';

export const scriptsRoutes = new Hono();

// Store last run output
let lastRunOutput: string[] = [];
let isRunning = false;

/**
 * GET /status — check if a script is currently running
 */
scriptsRoutes.get('/status', (c) => {
    return c.json({ isRunning, outputLines: lastRunOutput.length });
});

/**
 * GET /output — get captured output from last/current run
 */
scriptsRoutes.get('/output', (c) => {
    const since = parseInt(c.req.query('since') || '0');
    return c.json({
        isRunning,
        lines: lastRunOutput.slice(since),
        totalLines: lastRunOutput.length,
    });
});

/**
 * POST /run — execute a script (process-content.mjs with flags)
 */
scriptsRoutes.post('/run', async (c) => {
    if (isRunning) {
        return c.json({ error: 'A script is already running' }, 409);
    }

    const { command } = await c.req.json<{ command: string }>();

    // Whitelist allowed commands for safety
    const allowedFlags = ['--all', '--zip', '--book', '--file', '--html'];
    const allowedNpmScripts = ['fix:mermaid', 'fix:mermaid:dry', 'test:mermaid', 'content:watch'];
    const flag = command || '--all';

    // Determine if this is an npm script or a process-content flag
    const isNpmScript = allowedNpmScripts.includes(flag);
    const isFlag = allowedFlags.includes(flag);

    if (!isNpmScript && !isFlag) {
        return c.json({ error: `Invalid command. Allowed flags: ${allowedFlags.join(', ')}. Allowed scripts: ${allowedNpmScripts.join(', ')}` }, 400);
    }

    isRunning = true;
    lastRunOutput = [];

    let child;
    if (isNpmScript) {
        child = spawn('npm', ['run', flag], {
            cwd: PROJECT_ROOT,
            shell: true,
        });
    } else {
        child = spawn('node', ['scripts/process-content.mjs', flag], {
            cwd: PROJECT_ROOT,
            shell: true,
        });
    }

    child.stdout.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lastRunOutput.push(...lines);
    });

    child.stderr.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lastRunOutput.push(...lines.map((l) => `[ERROR] ${l}`));
    });

    child.on('close', (code) => {
        lastRunOutput.push(`\n--- Process exited with code ${code} ---`);
        isRunning = false;
    });

    return c.json({ success: true, message: `Started: process-content.mjs ${flag}` });
});
