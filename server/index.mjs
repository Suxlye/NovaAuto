import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
import { createOrderStore } from './store.mjs';
import { CheckoutError } from '../shared/checkout.js';

try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const root = fileURLToPath(new URL('../', import.meta.url));
const dataDirectory = process.env.ORDER_DATA_DIRECTORY
  ? resolve(process.env.ORDER_DATA_DIRECTORY)
  : resolve(root, '.data');
await mkdir(dataDirectory, { recursive: true });
const port = Number(process.env.API_PORT || 3001);
const fee = process.env.DELIVERY_FEE_CENTS;
if (fee !== undefined && !/^\d+$/.test(fee))
  throw new Error('DELIVERY_FEE_CENTS debe ser un entero no negativo.');
const deliveryFeeCents = fee === undefined ? null : Number(fee);
if (deliveryFeeCents !== null && !Number.isSafeInteger(deliveryFeeCents))
  throw new Error('DELIVERY_FEE_CENTS fuera de rango.');
const store = createOrderStore(resolve(dataDirectory, 'orders.sqlite'), {
  deliveryFeeCents,
});
const dist = resolve(root, 'dist');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};
function json(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': mime['.json'],
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(payload));
}
async function readBody(request) {
  if (!request.headers['content-type']?.startsWith('application/json'))
    throw new CheckoutError('El formato del pedido no es válido.', 415);
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 24000)
      throw new CheckoutError('El pedido excede el tamaño permitido.', 413);
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new CheckoutError('El pedido no es válido.');
  }
}
const limits = new Map();
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/api/checkout-config')
      return json(response, 200, {
        deliveryFeeCents,
        inventory: store.inventory(),
        payment: 'on_receipt',
      });
    if (request.method === 'POST' && url.pathname === '/api/orders') {
      const origin = request.headers.origin;
      if (origin && new URL(origin).host !== request.headers.host)
        throw new CheckoutError('La solicitud no está permitida.', 403);
      const ip = request.socket.remoteAddress;
      const now = Date.now();
      const count = limits.get(ip);
      if (count && count.until > now && count.count >= 30)
        throw new CheckoutError(
          'Demasiados intentos. Espera un minuto y vuelve a intentar.',
          429,
        );
      limits.set(
        ip,
        count && count.until > now
          ? { ...count, count: count.count + 1 }
          : { until: now + 60000, count: 1 },
      );
      if (limits.size > 1000)
        for (const [key, value] of limits)
          if (value.until <= now) limits.delete(key);
      const result = store.createOrder(
        await readBody(request),
        request.headers['idempotency-key'],
      );
      return json(response, result.replayed ? 200 : 201, result);
    }
    const match = url.pathname.match(/^\/api\/orders\/([a-f0-9-]{36})$/);
    if (request.method === 'GET' && match)
      return json(response, 200, {
        order: store.getOrder(
          match[1],
          request.headers.authorization?.replace(/^Bearer /, ''),
        ),
      });
    if (url.pathname.startsWith('/api/'))
      return json(response, 404, { message: 'Servicio no encontrado.' });
    if (!['GET', 'HEAD'].includes(request.method))
      return json(response, 405, { message: 'Método no permitido.' });
    const filename = resolve(
      dist,
      `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`,
    );
    if (!filename.startsWith(dist + sep))
      throw new CheckoutError('Ruta no válida.', 404);
    let content;
    try {
      content = await readFile(filename);
    } catch {
      return json(response, 404, {
        message:
          'Archivo no encontrado. Ejecuta npm run build antes de iniciar la versión de producción.',
      });
    }
    response.writeHead(200, {
      'Content-Type': mime[extname(filename)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch (error) {
    if (!(error instanceof CheckoutError))
      console.error('Error al procesar una solicitud de la tienda.');
    json(response, error instanceof CheckoutError ? error.status : 500, {
      message:
        error instanceof CheckoutError
          ? error.message
          : 'No se pudo guardar el pedido. Intenta nuevamente.',
      fields: error.fields || {},
    });
  }
});
server.listen(port, process.env.API_HOST || '127.0.0.1', () =>
  console.log(`NovaAuto: pedidos disponibles en http://localhost:${port}`),
);
function stop() {
  server.close(() => {
    store.close();
    process.exit(0);
  });
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
