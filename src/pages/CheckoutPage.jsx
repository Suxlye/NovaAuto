import { useEffect, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { money } from '../data/products';
import { departments, validateOrderInput } from '../../shared/checkout';
import { requestApi, saveOrderAccess } from '../services/orders';
const emptyForm = {
  name: '',
  email: '',
  phone: '',
  delivery: 'pickup',
  department: '',
  municipality: '',
  street: '',
  reference: '',
  note: '',
};
function Field({ id, label, error, ...props }) {
  return (
    <div className={`checkout-field ${props.wide ? 'field-wide' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        {...Object.fromEntries(
          Object.entries(props).filter(([key]) => key !== 'wide'),
        )}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
export default function CheckoutPage() {
  const { lines, cart, total, completeOrder } = useStore();
  const [form, setForm] = useState(emptyForm);
  const [fields, setFields] = useState({});
  const [config, setConfig] = useState(null);
  const [configError, setConfigError] = useState('');
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const intent = useRef(null);
  const submitLock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    setConfigError('');
    requestApi('/api/checkout-config', { signal: controller.signal })
      .then(setConfig)
      .catch((e) => {
        if (e.name !== 'AbortError') setConfigError(e.message);
      });
    return () => controller.abort();
  }, [retry]);
  function change(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFields((current) => ({ ...current, [name]: '' }));
    setError('');
  }
  const shippingCents =
    form.delivery === 'pickup' ? 0 : config?.deliveryFeeCents;
  const insufficient = config
    ? lines.filter((p) => cart[p.id] > (config.inventory[p.id] || 0))
    : [];
  async function submit(event) {
    event.preventDefault();
    if (submitLock.current || !config || insufficient.length) return;
    const input = {
      customer: { name: form.name, email: form.email, phone: form.phone },
      delivery: form.delivery,
      address: {
        department: form.department,
        municipality: form.municipality,
        street: form.street,
        reference: form.reference,
      },
      note: form.note,
      items: lines.map((p) => ({ id: p.id, quantity: cart[p.id] })),
    };
    let payload;
    try {
      payload = validateOrderInput(input);
    } catch (e) {
      setFields(e.fields);
      setError(e.message);
      return;
    }
    const signature = JSON.stringify(payload);
    if (intent.current?.signature !== signature)
      intent.current = { signature, key: crypto.randomUUID() };
    submitLock.current = true;
    setBusy(true);
    setError('');
    setFields({});
    try {
      const result = await requestApi('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': intent.current.key,
        },
        body: JSON.stringify(payload),
      });
      saveOrderAccess(result.order.id, result.accessToken);
      completeOrder(result.order, result.accessToken);
      window.location.hash = `/pedido?id=${encodeURIComponent(result.order.id)}`;
    } catch (e) {
      setError(e.message);
      setFields(e.fields || {});
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  }
  if (!lines.length)
    return (
      <section className="container section">
        <p className="eyebrow">FINALIZAR COMPRA</p>
        <h1 className="page-title">Tu carrito está vacío.</h1>
        <p className="muted">
          Agrega los repuestos que necesitas para realizar tu pedido.
        </p>
        <a className="button" href="#/catalogo">
          Explorar catálogo →
        </a>
      </section>
    );
  const fieldProps = (name) => ({
    value: form[name],
    onChange: (e) => change(name, e.target.value),
    error: fields[name],
    required: true,
    disabled: busy,
  });
  return (
    <section className="container section" aria-labelledby="checkout-title">
      <a className="text-link" href="#/carrito">
        ← Volver al carrito
      </a>
      <div className="section-heading checkout-heading">
        <div>
          <p className="eyebrow">FINALIZAR COMPRA</p>
          <h1 id="checkout-title" className="page-title">
            Completa tu pedido.
          </h1>
        </div>
        <p>
          Elige cómo recibir tus repuestos y revisa los datos antes de
          confirmar.
        </p>
      </div>
      <form onSubmit={submit} className="checkout-layout" noValidate>
        <div className="checkout-form">
          <fieldset disabled={busy}>
            <legend>
              <span>01</span> Datos de contacto
            </legend>
            <div className="checkout-fields">
              <Field
                id="customer-name"
                label="Nombre completo"
                autoComplete="name"
                maxLength={100}
                wide
                {...fieldProps('name')}
              />
              <Field
                id="customer-email"
                label="Correo electrónico"
                type="email"
                autoComplete="email"
                maxLength={150}
                {...fieldProps('email')}
              />
              <Field
                id="customer-phone"
                label="Teléfono"
                type="tel"
                autoComplete="tel"
                placeholder="Ej. 7000 0000"
                maxLength={30}
                {...fieldProps('phone')}
              />
            </div>
          </fieldset>
          <fieldset disabled={busy}>
            <legend>
              <span>02</span> Forma de entrega
            </legend>
            <div className="delivery-options">
              <label
                className={
                  form.delivery === 'pickup'
                    ? 'delivery-option selected'
                    : 'delivery-option'
                }
              >
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={form.delivery === 'pickup'}
                  onChange={() => change('delivery', 'pickup')}
                />
                <div>
                  <strong>Retiro en tienda</strong>
                  <span>
                    Sin costo de envío. Lugar y horario por confirmar.
                  </span>
                </div>
              </label>
              <label
                className={
                  form.delivery === 'home'
                    ? 'delivery-option selected'
                    : 'delivery-option'
                }
              >
                <input
                  type="radio"
                  name="delivery"
                  value="home"
                  checked={form.delivery === 'home'}
                  onChange={() => change('delivery', 'home')}
                />
                <div>
                  <strong>Entrega a domicilio</strong>
                  <span>
                    Recibe tus repuestos en la dirección que indiques.
                  </span>
                </div>
              </label>
            </div>
            {form.delivery === 'home' && (
              <div className="address-fields">
                <h2>Dirección de entrega</h2>
                <div className="checkout-fields">
                  <div className="checkout-field">
                    <label htmlFor="delivery-department">Departamento</label>
                    <select
                      id="delivery-department"
                      value={form.department}
                      required
                      onChange={(e) => change('department', e.target.value)}
                      aria-invalid={!!fields.department}
                      aria-describedby={
                        fields.department ? 'department-error' : undefined
                      }
                    >
                      <option value="">Selecciona un departamento</option>
                      {departments.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    {fields.department && (
                      <span className="field-error" id="department-error">
                        {fields.department}
                      </span>
                    )}
                  </div>
                  <Field
                    id="delivery-municipality"
                    label="Municipio o distrito"
                    autoComplete="address-level2"
                    maxLength={100}
                    {...fieldProps('municipality')}
                  />
                  <Field
                    id="delivery-street"
                    label="Colonia, calle y número de casa"
                    autoComplete="street-address"
                    placeholder="Ej. Colonia Centro, calle 2, casa 15"
                    maxLength={250}
                    wide
                    {...fieldProps('street')}
                  />
                  <Field
                    id="delivery-reference"
                    label="Punto de referencia (opcional)"
                    value={form.reference}
                    onChange={(e) => change('reference', e.target.value)}
                    maxLength={250}
                    wide
                  />
                </div>
                <p className="checkout-note">
                  Entrega en El Salvador. La cobertura y el plazo se confirmarán
                  con la tienda.
                  {shippingCents == null &&
                    ' El costo del envío está pendiente de confirmación.'}
                </p>
              </div>
            )}
          </fieldset>
          <fieldset disabled={busy}>
            <legend>
              <span>03</span> Pago
            </legend>
            <div className="payment-on-receipt">
              <strong>
                {form.delivery === 'home'
                  ? 'Pago al recibir tu pedido'
                  : 'Pago al retirar en tienda'}
              </strong>
              <p>El pago queda pendiente hasta la entrega de los repuestos.</p>
            </div>
            <div className="checkout-field">
              <label htmlFor="order-note">
                Indicaciones para el pedido (opcional)
              </label>
              <textarea
                id="order-note"
                value={form.note}
                onChange={(e) => change('note', e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Puedes indicar motor, VIN o detalles de la pieza."
              />
            </div>
          </fieldset>
        </div>
        <aside className="checkout-summary" aria-labelledby="summary-title">
          <h2 id="summary-title">Resumen del pedido</h2>
          <ul>
            {lines.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {cart[p.id]} × {money(p.price)}
                  </small>
                </div>
                <span>{money(p.price * cart[p.id])}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>Productos</dt>
              <dd>{money(total)}</dd>
            </div>
            <div>
              <dt>
                {form.delivery === 'pickup'
                  ? 'Retiro en tienda'
                  : 'Envío a domicilio'}
              </dt>
              <dd>
                {form.delivery === 'pickup'
                  ? 'Gratis'
                  : shippingCents == null
                    ? 'Por confirmar'
                    : money(shippingCents / 100)}
              </dd>
            </div>
            <div className="checkout-total">
              <dt>
                {shippingCents == null
                  ? 'Total de productos'
                  : 'Total del pedido'}
              </dt>
              <dd>{money(total + (shippingCents || 0) / 100)}</dd>
            </div>
          </dl>
          {form.delivery === 'home' && shippingCents == null && (
            <p className="checkout-note">
              El total de productos no incluye el envío. La tienda confirmará
              ese costo antes de la entrega.
            </p>
          )}
          {configError && (
            <div className="checkout-error" role="alert">
              <p>{configError}</p>
              <button
                type="button"
                className="plain-button"
                onClick={() => setRetry((r) => r + 1)}
              >
                Reintentar conexión
              </button>
            </div>
          )}
          {!config && !configError && (
            <p role="status">Verificando disponibilidad…</p>
          )}
          {insufficient.length > 0 && (
            <p className="checkout-error" role="alert">
              Las existencias cambiaron:{' '}
              {insufficient.map((p) => p.name).join(', ')}.{' '}
              <a href="#/carrito">Ajusta las cantidades en el carrito.</a>
            </p>
          )}
          {error && (
            <div className="checkout-error" role="alert">
              <p>{error}</p>
              {fields.items && <a href="#/carrito">Revisar carrito</a>}
            </div>
          )}
          <button
            type="submit"
            className="catalog-button checkout-submit"
            disabled={busy || !config || insufficient.length > 0}
          >
            {busy ? 'Guardando pedido…' : 'Confirmar pedido'}
          </button>
          <p className="checkout-note">
            Al confirmar se registra tu pedido. La tienda debe confirmar
            compatibilidad, disponibilidad y entrega.
          </p>
        </aside>
      </form>
    </section>
  );
}
