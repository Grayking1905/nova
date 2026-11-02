// Never print credentials in Prisma CLI output or errors.
import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const require = createRequire(import.meta.url);
const cli = require.resolve('prisma/build/index.js');
const redact = text => {
  let result = text.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[database URL redacted]');
  for (const [key, value] of Object.entries(process.env)) if (/SECRET|PASSWORD|TOKEN|DATABASE_URL|API_KEY/.test(key) && value) {
    result = result.split(value).join('[redacted]');
    if (key === 'DATABASE_URL') { try { const url = new URL(value); for (const part of [url.username, url.password]) if (part) result = result.split(part).join('[redacted]'); } catch { /* Report configuration without its value. */ } }
  }
  return result;
};
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], { cwd: fileURLToPath(new URL('..', import.meta.url)), windowsHide: true, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
child.stdout.on('data', data => { output += data; }); child.stderr.on('data', data => { output += data; });
child.on('error', () => { console.error('Unable to start Prisma CLI.'); process.exitCode = 1; });
child.on('close', code => { process.stdout.write(redact(output)); process.exitCode = code ?? 1; });
