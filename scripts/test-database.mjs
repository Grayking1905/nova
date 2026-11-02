import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const child = spawn(process.execPath, ['--test', 'services/realtime/database.test.mjs', 'services/realtime/auth.test.mjs'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)), windowsHide: true,
  env: { ...process.env, NOVA_DATABASE_TEST: '1' }, stdio: 'inherit',
});
child.on('exit', code => { process.exitCode = code ?? 1; });
