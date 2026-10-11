import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { money } from '../data/products';
import { requestApi, readOrderAccess } from '../services/orders';
export default function OrderPage({ id }) {
  const { lastOrder } = useStore();
  const [order, setOrder] = useState(
    lastOrder?.order.id === id ? lastOrder.order : null,
  );
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setOrder(lastOrder?.order.id === id ? lastOrder.order : null);
    const token =
      lastOrder?.order.id === id ? lastOrder.accessToken : readOrderAccess(id);
    if (!id || !token) {
      setError(
        'No hay un pedido disponible en esta sesión. Puedes realizar uno desde el carrito.',
      );
      return;
    }
    requestApi(`/api/orders/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((data) => setOrder(data.order))
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      });
    return () => controller.abort();
  }, [id, lastOrder, retry]);
  function downloadReceipt() {
    const address = order.address;
    const text = [
      'NOVA AUTO · COMPROBANTE DE PEDIDO',
      order.number,
      `Fecha: ${new Date(order.createdAt).toLocaleString('es-SV', { timeZone: 'America/El_Salvador' })}`,
      `Cliente: ${order.customer.name}`,
      `Correo: ${order.customer.email}`,
      `Teléfono: ${order.customer.phone}`,
      '',
      ...order.items.map(
        (i) =>
          `${i.name} | ${i.quantity} × ${money(i.unitPriceCents / 100)} = ${money(i.lineTotalCents / 100)}`,
      ),
      '',
      `Productos: ${money(order.subtotalCents / 100)}`,
      `Envío: ${order.shippingCents === null ? 'Por confirmar' : money(order.shippingCents / 100)}`,
      ...(order.totalCents === null
        ? []
        : [`Total: ${money(order.totalCents / 100)}`]),
      `Entrega: ${order.delivery === 'home' ? 'Domicilio' : 'Retiro en tienda'}`,
      ...(address
        ? [
            `Dirección: ${address.street}, ${address.municipality}, ${address.department}, ${address.country}`,
            `Referencia: ${address.reference}`,
          ]
        : []),
      `Indicaciones: ${order.note || 'Ninguna'}`,
      'Pago pendiente al recibir. La entrega y compatibilidad están por confirmar.',
      'Este documento es un comprobante de pedido; no es una factura ni un comprobante de pago.',
    ].join('\n');
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `pedido-${order.number}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      className="container section order-page"
      aria-labelledby="order-title"
    >
      {error && (
        <div className="checkout-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="plain-button"
            onClick={() => setRetry((n) => n + 1)}
          >
            Reintentar
          </button>
        </div>
      )}
      {!order ? (
        <>
          <h1 id="order-title" className="page-title">
            Consultar pedido
          </h1>
          {!error && <p role="status">Cargando pedido…</p>}
          <a className="button" href="#/carrito">
            Ir al carrito →
          </a>
        </>
      ) : (
        <>
          <div className="order-success-mark" aria-hidden="true">
            ✓
          </div>
          <p className="eyebrow">PEDIDO REGISTRADO</p>
          <h1 id="order-title" className="page-title">
            Gracias, {order.customer.name}.
          </h1>
          <p>
            Tu pedido <strong>{order.number}</strong> se guardó correctamente.
            Conserva este comprobante.
          </p>
          <div className="order-status">
            <span>Pedido registrado</span>
            <span>Pago pendiente al recibir</span>
            <span>Entrega por confirmar</span>
          </div>
          <div className="order-details-grid">
            <article>
              <h2>Entrega</h2>
              <strong>
                {order.delivery === 'home'
                  ? 'Entrega a domicilio'
                  : 'Retiro en tienda'}
              </strong>
              {order.address ? (
                <>
                  <p>
                    {order.address.street}
                    <br />
                    {order.address.municipality}, {order.address.department}
                    <br />
                    {order.address.country}
                  </p>
                  {order.address.reference && (
                    <p>Referencia: {order.address.reference}</p>
                  )}
                </>
              ) : (
                <p>
                  El lugar y horario de retiro se confirmarán con la tienda.
                </p>
              )}
              <p>
                Costo de envío:{' '}
                {order.shippingCents === null
                  ? 'por confirmar'
                  : money(order.shippingCents / 100)}
              </p>
            </article>
            <article>
              <h2>Contacto del pedido</h2>
              <p>
                {order.customer.name}
                <br />
                {order.customer.email}
                <br />
                {order.customer.phone}
              </p>
              {order.note && <p>Indicaciones: {order.note}</p>}
            </article>
          </div>
          <div className="order-items">
            <h2>Repuestos pedidos</h2>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  <span>
                    <strong>{item.name}</strong>
                    <small>
                      {item.brand} · {item.quantity} ×{' '}
                      {money(item.unitPriceCents / 100)}
                    </small>
                  </span>
                  <strong>{money(item.lineTotalCents / 100)}</strong>
                </li>
              ))}
            </ul>
            <p className="order-total">
              {order.totalCents === null
                ? 'Total de productos'
                : 'Total del pedido'}{' '}
              <strong>
                {money((order.totalCents ?? order.subtotalCents) / 100)}
              </strong>
            </p>
            {order.totalCents === null && (
              <p className="checkout-note">
                El envío se cotiza por separado antes de la entrega.
              </p>
            )}
          </div>
          <div className="actions">
            <button
              type="button"
              className="catalog-button"
              onClick={downloadReceipt}
            >
              Descargar comprobante
            </button>
            <a className="text-link" href="#/catalogo">
              Seguir comprando →
            </a>
          </div>
          <p className="checkout-note">
            La tienda debe confirmar la compatibilidad de las piezas y coordinar
            la entrega. El pedido aún no está pagado.
          </p>
        </>
      )}
    </section>
  );
}
