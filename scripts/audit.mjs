import { spawn } from 'node:child_process';
import { mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const directory = 'docs/evidencias/lighthouse';
await mkdir(directory, { recursive: true });
const temporary = await mkdtemp(join(tmpdir(), 'novaauto-audit-'));
const server = spawn(process.execPath, ['server/index.mjs'], {
  windowsHide: true,
  stdio: 'ignore',
  env: {
    ...process.env,
    API_PORT: '3015',
    API_HOST: '127.0.0.1',
    ORDER_DATA_DIRECTORY: temporary,
  },
});
let chrome;
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      ready = (await fetch('http://127.0.0.1:3015/api/health')).ok;
    } catch {}
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Servidor de auditoría no disponible');
  chrome = await launch({
    chromePath:
      process.env.BROWSER_PATH ||
      'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
    chromeFlags: ['--headless', '--disable-gpu', '--no-first-run'],
  });
  const scores = [];
  for (const formFactor of ['mobile', 'desktop']) {
    const result = await lighthouse('http://127.0.0.1:3015/', {
      port: chrome.port,
      output: ['html', 'json'],
      logLevel: 'error',
      ...(formFactor === 'desktop' ? { preset: 'desktop' } : {}),
    });
    await writeFile(`${directory}/${formFactor}.html`, result.report[0]);
    await writeFile(`${directory}/${formFactor}.json`, result.report[1]);
    const summary = {
      formFactor,
      url: result.lhr.finalDisplayedUrl,
      fetchedAt: result.lhr.fetchTime,
      lighthouseVersion: result.lhr.lighthouseVersion,
      scores: Object.fromEntries(
        Object.entries(result.lhr.categories).map(([key, value]) => [
          key,
          Math.round(value.score * 100),
        ]),
      ),
    };
    scores.push(summary);
    console.log(JSON.stringify(summary));
  }
  await writeFile(`${directory}/resumen.json`, JSON.stringify(scores, null, 2));
} finally {
  await chrome?.kill();
  server.kill();
}
