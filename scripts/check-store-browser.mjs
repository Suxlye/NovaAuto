import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = 'http://127.0.0.1:5175';
const browserPath =
  process.env.BROWSER_PATH ||
  'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe';
const profile = await mkdtemp(join(tmpdir(), 'novaauto-browser-'));
const api = spawn(process.execPath, ['server/index.mjs'], {
  windowsHide: true,
  stdio: 'ignore',
  env: {
    ...process.env,
    API_PORT: '3001',
    API_HOST: '127.0.0.1',
    ORDER_DATA_DIRECTORY: join(profile, 'orders'),
  },
});
const server = spawn(
  process.execPath,
  [
    'node_modules/vite/bin/vite.js',
    '--host',
    '127.0.0.1',
    '--port',
    '5175',
    '--strictPort',
  ],
  { windowsHide: true, stdio: 'ignore' },
);
const browser = spawn(
  browserPath,
  [
    '--headless',
    '--disable-gpu',
    '--no-first-run',
    '--disable-extensions',
    '--disable-background-networking',
    '--remote-debugging-port=9235',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready(url) {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json().catch(() => ({}));
    } catch {}
    await sleep(250);
  }
  throw new Error(`No disponible: ${url}`);
}
let ws;
try {
  await ready('http://127.0.0.1:3001/api/checkout-config');
  await ready(base);
  await ready('http://127.0.0.1:9235/json/version');
  const target = await (
    await fetch('http://127.0.0.1:9235/json/new?about:blank', { method: 'PUT' })
  ).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let nextId = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      message.error ? item.reject(message.error) : item.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(message.params.exceptionDetails.text);
  };
  function call(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await call('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }
  async function waitFor(expression) {
    for (let i = 0; i < 50; i++) {
      if (await evaluate(`Boolean(${expression})`)) return;
      await sleep(100);
    }
    throw new Error(`No se cumplió: ${expression}`);
  }
  async function route(page) {
    await evaluate(`location.hash = ${JSON.stringify(`/${page}`)}`);
    await waitFor(
      `document.querySelector('header a[aria-current="page"]')?.getAttribute('href') === ${JSON.stringify(`#/${page}`)}`,
    );
  }
  async function checkImages() {
    await evaluate(
      `Promise.all([...document.querySelectorAll('main img')].map(img => { img.loading = 'eager'; return img.complete ? Promise.resolve() : new Promise(resolve => { img.addEventListener('load', resolve, {once:true}); img.addEventListener('error', resolve, {once:true}); }); }))`,
    );
    assert.equal(
      await evaluate(
        `[...document.querySelectorAll('main img')].filter(i=>!i.naturalWidth).length`,
      ),
      0,
      'Fotografías cargadas',
    );
  }
  await call('Runtime.enable');
  await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await call('Page.navigate', { url: base });
  await waitFor(`document.querySelectorAll('.home-category').length === 8`);
  await checkImages();
  await route('catalogo');
  await waitFor(`document.querySelectorAll('.catalog-card').length === 9`);
  await checkImages();
  await evaluate(
    `document.querySelector('.catalog-card .catalog-button').click()`,
  );
  await waitFor(`document.querySelector('.cart-count').textContent === '1'`);
  await evaluate(
    `document.querySelector('.pagination button:nth-child(3)').click()`,
  );
  await waitFor(`document.querySelectorAll('.catalog-card').length === 6`);
  await checkImages();
  await evaluate(`location.hash='/catalogo?categoria=frenos'`);
  await waitFor(`document.querySelectorAll('.catalog-card').length === 3`);
  await checkImages();
  await route('carrito');
  await waitFor(`document.querySelectorAll('.cart-list li').length === 1`);
  await evaluate(
    `document.querySelector('.quantity-control button:last-child').click()`,
  );
  await waitFor(`document.querySelector('.cart-count').textContent === '2'`);
  await call('Page.reload');
  await waitFor(`document.querySelector('.cart-count')?.textContent === '2'`);
  for (const page of ['servicios', 'nosotros', 'contacto']) {
    await route(page);
    assert.equal(
      await evaluate(`document.querySelectorAll('main h1').length`),
      1,
    );
    assert.equal(
      await evaluate(
        `document.querySelectorAll('main .catalog-card, main .cart-section').length`,
      ),
      0,
    );
  }
  await route('catalogo');
  await call('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await checkImages();
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth`),
    'Sin desbordamiento móvil',
  );
  await mkdir('scripts/image-research', { recursive: true });
  const screenshot = await call('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });
  await writeFile(
    'scripts/image-research/catalog-mobile.png',
    Buffer.from(screenshot.data, 'base64'),
  );
  await evaluate(`location.hash='/creditos'`);
  await waitFor(
    `document.querySelectorAll('.credits-grid article').length === 23`,
  );
  await checkImages();
  await evaluate(`location.hash='/compra'`);
  await waitFor(
    `document.querySelector('.checkout-submit') && !document.querySelector('.checkout-submit').disabled`,
  );
  await evaluate(`document.querySelector('.checkout-submit').click()`);
  await waitFor(`document.querySelector('#customer-name-error')`);
  async function fill(selector, value) {
    await evaluate(
      `(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', {bubbles:true})); })()`,
    );
  }
  await fill('#customer-name', 'Cliente de prueba');
  await fill('#customer-email', 'prueba@example.com');
  await fill('#customer-phone', '70000000');
  await evaluate(`document.querySelector('input[value="home"]').click()`);
  await waitFor(`document.querySelector('#delivery-street')`);
  await evaluate(`document.querySelector('.checkout-submit').click()`);
  await waitFor(`document.querySelector('#delivery-street-error')`);
  await evaluate(
    `(() => { const input=document.querySelector('#delivery-department');input.value='San Salvador';input.dispatchEvent(new Event('change',{bubbles:true})); })()`,
  );
  await fill('#delivery-municipality', 'San Salvador');
  await fill('#delivery-street', 'Colonia de prueba, calle 2, casa 15');
  assert.ok(
    await evaluate(`document.documentElement.scrollWidth <= innerWidth`),
    'Compra sin desbordamiento móvil',
  );
  await evaluate(`document.querySelector('.checkout-submit').click()`);
  await waitFor(`document.querySelector('.order-success-mark')`);
  assert.equal(
    await evaluate(`document.querySelector('.cart-count').textContent`),
    '0',
  );
  assert.ok(
    await evaluate(
      `document.querySelector('.order-page').textContent.includes('Colonia de prueba, calle 2, casa 15')`,
    ),
  );
  assert.ok(
    await evaluate(
      `document.querySelector('.order-page').textContent.includes('Pago pendiente al recibir')`,
    ),
  );
  await call('Page.reload');
  await waitFor(`document.querySelector('.order-success-mark')`);
  assert.ok(
    await evaluate(
      `document.querySelector('.order-page').textContent.includes('Cliente de prueba')`,
    ),
  );
  console.log(
    'OK: formulario, dirección obligatoria, pedido guardado, confirmación, carrito vaciado y pedido recuperado al recargar.',
  );
  await evaluate(`location.hash='/no-existe'`);
  await waitFor(
    `document.querySelector('main h1')?.textContent === 'Página no encontrada'`,
  );
  assert.deepEqual(errors, [], 'Sin errores de ejecución');
  console.log(
    'OK: páginas, 24 fotografías, paginación, categorías, carrito entre páginas y recargas, créditos, 404 y diseño móvil.',
  );
} finally {
  ws?.close();
  api.kill();
  browser.kill();
  server.kill();
}
