import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from 'chrome-launcher';
const chrome = await launch({
  chromePath:
    process.env.BROWSER_PATH ||
    'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  chromeFlags: ['--headless', '--disable-gpu', '--no-first-run'],
});
let ws;
try {
  const target = await (
    await fetch(`http://127.0.0.1:${chrome.port}/json/new?about:blank`, {
      method: 'PUT',
    })
  ).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    message.error
      ? task.reject(new Error(message.error.message))
      : task.resolve(message.result);
  };
  const call = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const key = ++id;
      pending.set(key, { resolve, reject });
      ws.send(JSON.stringify({ id: key, method, params }));
    });
  await call('Page.enable');
  for (const name of ['PRESENTACION', 'BENEFICIARIO']) {
    const url = pathToFileURL(resolve(`docs/${name}.html`)).href;
    await call('Page.navigate', { url });
    let loaded = false;
    for (let i = 0; i < 100; i++) {
      const result = await call('Runtime.evaluate', {
        expression: `location.href === ${JSON.stringify(url)} && document.readyState === 'complete'`,
        returnByValue: true,
      });
      if (result.result.value) {
        loaded = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!loaded) throw new Error(`Documento no disponible: ${name}`);
    const pdf = await call('Page.printToPDF', {
      printBackground: true,
      preferCSSPageSize: true,
    });
    await writeFile(`docs/${name}.pdf`, Buffer.from(pdf.data, 'base64'));
    console.log(`PDF generado: docs/${name}.pdf`);
  }
} finally {
  ws?.close();
  await chrome.kill();
}
