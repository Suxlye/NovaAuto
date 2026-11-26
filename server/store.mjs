import { DatabaseSync } from 'node:sqlite';
import {
  randomUUID,
  randomBytes,
  createHash,
  timingSafeEqual,
} from 'node:crypto';
import { products } from '../src/data/products.js';
import { CheckoutError, validateOrderInput } from '../shared/checkout.js';

export function createOrderStore(filename, { deliveryFeeCents = null } = {}) {
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  db.exec(`CREATE TABLE IF NOT EXISTS inventory (id TEXT PRIMARY KEY, stock INTEGER NOT NULL CHECK(stock >= 0));
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL, access_token TEXT NOT NULL, receipt TEXT NOT NULL);`);
  const seed = db.prepare(
    'INSERT OR IGNORE INTO inventory (id, stock) VALUES (?, ?)',
  );
  for (const product of products) seed.run(product.id, product.stock);
  const inventory = () =>
    Object.fromEntries(
      db
        .prepare('SELECT id, stock FROM inventory')
        .all()
        .map((p) => [p.id, p.stock]),
    );
  function createOrder(input, key) {
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(key || ''))
      throw new CheckoutError(
        'La referencia del pedido no es válida. Recarga e intenta de nuevo.',
      );
    const data = validateOrderInput(input);
    const fingerprint = createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
    db.exec('BEGIN IMMEDIATE');
    try {
      const previous = db
        .prepare('SELECT * FROM orders WHERE request_key = ?')
        .get(key);
      if (previous) {
        if (previous.fingerprint !== fingerprint)
          throw new CheckoutError(
            'Los datos cambiaron. Revisa el pedido y vuelve a intentarlo.',
            409,
          );
        db.exec('COMMIT');
        return {
          order: JSON.parse(previous.receipt),
          accessToken: previous.access_token,
          replayed: true,
        };
      }
      const items = data.items.map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product)
          throw new CheckoutError(
            'Un repuesto ya no está en el catálogo.',
            409,
          );
        const available =
          db.prepare('SELECT stock FROM inventory WHERE id = ?').get(item.id)
            ?.stock || 0;
        if (item.quantity > available)
          throw new CheckoutError(
            `Solo quedan ${available} unidades de ${product.name}. Ajusta el carrito.`,
            409,
            { items: `Existencias insuficientes: ${product.name}.` },
          );
        const unitPriceCents = Math.round(product.price * 100);
        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          quantity: item.quantity,
          unitPriceCents,
          lineTotalCents: unitPriceCents * item.quantity,
        };
      });
      const subtotalCents = items.reduce(
        (sum, item) => sum + item.lineTotalCents,
        0,
      );
      const shippingCents = data.delivery === 'pickup' ? 0 : deliveryFeeCents;
      const order = {
        id: randomUUID(),
        number: `NA-${randomBytes(5).toString('hex').toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: 'registered',
        paymentStatus: 'pending_on_receipt',
        ...data,
        items,
        subtotalCents,
        shippingCents,
        totalCents:
          shippingCents === null ? null : subtotalCents + shippingCents,
      };
      const accessToken = randomBytes(32).toString('hex');
      for (const item of items)
        db.prepare('UPDATE inventory SET stock = stock - ? WHERE id = ?').run(
          item.quantity,
          item.id,
        );
      db.prepare(
        'INSERT INTO orders (id, request_key, fingerprint, access_token, receipt) VALUES (?, ?, ?, ?, ?)',
      ).run(order.id, key, fingerprint, accessToken, JSON.stringify(order));
      db.exec('COMMIT');
      return { order, accessToken, replayed: false };
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
  function getOrder(id, token) {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (
      !row ||
      typeof token !== 'string' ||
      !/^[a-f0-9]{64}$/.test(token) ||
      !timingSafeEqual(Buffer.from(token), Buffer.from(row.access_token))
    )
      throw new CheckoutError('No se pudo acceder a este pedido.', 404);
    return JSON.parse(row.receipt);
  }
  return { createOrder, getOrder, inventory, close: () => db.close() };
}
