import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const desktop = path.join(root, 'apps/desktop');
const require = createRequire(path.join(desktop, 'package.json'));
const children = [];
function run(script, args = [], cwd = root) { const child = spawn(process.execPath, [script, ...args], { cwd, stdio: 'inherit', windowsHide: true }); children.push(child); child.on('exit', code => { if (code) shutdown(code); }); return child; }
function shutdown(code = 0) { for (const child of children) child.kill(); process.exit(code); }
run(path.join(root, 'services/realtime/server.mjs'));
run(path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js'), ['--host', '127.0.0.1', '--strictPort'], desktop);
if (!process.argv.includes('--web')) {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) { try { const response = await fetch('http://localhost:5173'); if (response.ok) { ready = true; break; } } catch { /* wait for Vite */ } await new Promise(resolve => setTimeout(resolve, 500)); }
  if (ready) { const electron = spawn(require('electron'), [path.join(desktop, 'electron/main.cjs')], { cwd: desktop, stdio: 'inherit', windowsHide: true }); children.push(electron); electron.on('exit', () => shutdown()); } else shutdown(1);
}
process.on('SIGINT', () => shutdown()); process.on('SIGTERM', () => shutdown());
