import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createOrderStore } from '../server/store.mjs';
import { validateOrderInput } from '../shared/checkout.js';
const input = (changes = {}) => ({
  customer: {
    name: 'Cliente de prueba',
    email: 'prueba@example.com',
    phone: '70000000',
  },
  delivery: 'pickup',
  items: [{ id: 'NA-0001', quantity: 2 }],
  ...changes,
});
const homeAddress = {
  department: 'San Salvador',
  municipality: 'San Salvador',
  street: 'Colonia de prueba, calle 2, casa 15',
  reference: 'Frente al parque',
};
test('domicilio exige dirección; retiro no la guarda', () => {
  assert.throws(
    () => validateOrderInput(input({ delivery: 'home' })),
    (error) =>
      !!error.fields.street &&
      !!error.fields.municipality &&
      !!error.fields.department,
  );
  const pickup = validateOrderInput(input({ address: homeAddress }));
  assert.equal(pickup.address, null);
  assert.equal(
    validateOrderInput(input({ delivery: 'home', address: homeAddress }))
      .address.country,
    'El Salvador',
  );
});
test('rechaza carrito vacío, cantidades negativas y productos duplicados', () => {
  for (const items of [
    [],
    [{ id: 'NA-0001', quantity: -1 }],
    [{ id: 'NA-0001', quantity: 1.5 }],
    [
      { id: 'NA-0001', quantity: 1 },
      { id: 'NA-0001', quantity: 1 },
    ],
  ])
    assert.throws(() => validateOrderInput(input({ items })));
});
test('valida contacto y no almacena campos de tarjetas o precios enviados', () => {
  assert.throws(
    () =>
      validateOrderInput(
        input({ customer: { name: '', email: 'incorrecto', phone: 'texto' } }),
      ),
    (error) => Object.keys(error.fields).length === 3,
  );
  const result = validateOrderInput(
    input({
      card: 'dato-que-no-debe-guardarse',
      items: [{ id: 'NA-0001', quantity: 1, price: 0.01 }],
    }),
  );
  assert.equal(result.card, undefined);
  assert.equal(result.items[0].price, undefined);
});
test('calcula precios en servidor, guarda pedido y descuenta existencias', () => {
  const store = createOrderStore(':memory:');
  try {
    const result = store.createOrder(
      input({
        totalCents: 1,
        items: [{ id: 'NA-0001', quantity: 2, price: 0.01 }],
      }),
      randomUUID(),
    );
    assert.equal(result.order.subtotalCents, 7700);
    assert.equal(result.order.totalCents, 7700);
    assert.equal(result.order.paymentStatus, 'pending_on_receipt');
    assert.equal(store.inventory()['NA-0001'], 10);
    assert.deepEqual(
      store.getOrder(result.order.id, result.accessToken),
      result.order,
    );
    assert.throws(
      () => store.getOrder(result.order.id, '0'.repeat(64)),
      (e) => e.status === 404,
    );
  } finally {
    store.close();
  }
});
test('el costo de envío pendiente no se presenta como cero', () => {
  const store = createOrderStore(':memory:');
  try {
    const { order } = store.createOrder(
      input({ delivery: 'home', address: homeAddress }),
      randomUUID(),
    );
    assert.equal(order.shippingCents, null);
    assert.equal(order.totalCents, null);
  } finally {
    store.close();
  }
  const configured = createOrderStore(':memory:', { deliveryFeeCents: 500 });
  try {
    const { order } = configured.createOrder(
      input({ delivery: 'home', address: homeAddress }),
      randomUUID(),
    );
    assert.equal(order.totalCents, 8200);
    assert.equal(order.shippingCents, 500);
  } finally {
    configured.close();
  }
});
test('reintentar el mismo pedido no crea otro ni descuenta existencias otra vez', () => {
  const store = createOrderStore(':memory:');
  try {
    const key = randomUUID();
    const first = store.createOrder(input(), key);
    const second = store.createOrder(input(), key);
    assert.equal(first.order.id, second.order.id);
    assert.equal(first.accessToken, second.accessToken);
    assert.equal(second.replayed, true);
    assert.equal(store.inventory()['NA-0001'], 10);
    assert.throws(
      () =>
        store.createOrder(
          input({ items: [{ id: 'NA-0001', quantity: 1 }] }),
          key,
        ),
      (e) => e.status === 409,
    );
  } finally {
    store.close();
  }
});
test('sin existencias no se guarda un pedido parcial ni se descuenta otro producto', () => {
  const store = createOrderStore(':memory:');
  try {
    assert.throws(
      () =>
        store.createOrder(
          input({
            items: [
              { id: 'NA-0001', quantity: 2 },
              { id: 'NA-0013', quantity: 1 },
            ],
          }),
          randomUUID(),
        ),
      (e) => e.status === 409,
    );
    assert.equal(store.inventory()['NA-0001'], 12);
    assert.throws(
      () =>
        store.createOrder(
          input({ items: [{ id: 'NA-0001', quantity: 13 }] }),
          randomUUID(),
        ),
      (e) => e.status === 409,
    );
    assert.throws(
      () =>
        store.createOrder(
          input({ items: [{ id: 'NA-9999', quantity: 1 }] }),
          randomUUID(),
        ),
      (e) => e.status === 409,
    );
  } finally {
    store.close();
  }
});
test('los pedidos y las existencias persisten al reiniciar el servidor', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'novaauto-order-test-'));
  const file = join(directory, 'orders.sqlite');
  let store = createOrderStore(file);
  try {
    const result = store.createOrder(input(), randomUUID());
    store.close();
    store = createOrderStore(file);
    assert.deepEqual(
      store.getOrder(result.order.id, result.accessToken),
      result.order,
    );
    assert.equal(store.inventory()['NA-0001'], 10);
  } finally {
    store.close();
    for (const path of [file, `${file}-wal`, `${file}-shm`])
      await rm(path, { force: true });
    await rmdir(directory);
  }
});
