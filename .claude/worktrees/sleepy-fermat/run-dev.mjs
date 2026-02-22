import { spawn } from 'child_process';
import path from 'path';

const root = 'D:/Code/MahdiSalem.com';
const astro = path.join(root, 'node_modules/astro/astro.js');

const child = spawn(process.execPath, [astro, 'dev', '--root', root], {
  stdio: 'inherit',
  cwd: root,
});

child.on('exit', (code) => process.exit(code ?? 0));
