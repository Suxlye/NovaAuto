import { spawn } from 'node:child_process';
const processes = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of processes) child.kill();
  process.exitCode = code;
}
for (const args of [
  ['server/index.mjs'],
  ['node_modules/vite/bin/vite.js', ...process.argv.slice(2)],
]) {
  const child = spawn(process.execPath, args, {
    stdio: 'inherit',
    windowsHide: true,
  });
  processes.push(child);
  child.on('error', () => {
    console.error('No se pudo iniciar la tienda.');
    stop(1);
  });
  child.on('exit', (code) => stop(code || 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
