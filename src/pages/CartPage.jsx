import { useStore } from '../context/StoreContext';
import { money } from '../data/products';
export default function CartPage() {
  const {
    cart,
    lines,
    total,
    message,
    updateCart,
    removeItem,
    clearCart,
    downloadQuote,
  } = useStore();
  return (
    <div className="container section cart-page">
      {' '}
      <section
        className="cart-section"
        id="carrito"
        aria-labelledby="cart-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">TU COTIZACIÓN</p>
            <h1 id="cart-title" className="page-title">
              Carrito de repuestos
            </h1>
          </div>
          <p>
            Revisa tus repuestos y elige retiro en tienda o domicilio para la
            tienda.
          </p>
        </div>
        <p role="status" className="cart-status">
          {message}
        </p>
        {!lines.length ? (
          <p className="empty-results">
            Tu carrito está vacío.{' '}
            <a href="#/catalogo">Explorar el catálogo →</a>
          </p>
        ) : (
          <>
            <ul className="cart-list">
              {lines.map((p) => (
                <li key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>
                      {p.brand} · {p.id} · {money(p.price)} por unidad
                    </small>
                  </div>
                  <div className="quantity-control">
                    <button
                      type="button"
                      aria-label={`Restar una unidad de ${p.name}`}
                      onClick={() => updateCart(p.id, -1)}
                    >
                      −
                    </button>
                    <span>{cart[p.id]}</span>
                    <button
                      type="button"
                      disabled={cart[p.id] >= p.stock}
                      aria-label={`Sumar una unidad de ${p.name}`}
                      onClick={() => updateCart(p.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <strong>{money(p.price * cart[p.id])}</strong>
                  <button
                    type="button"
                    className="plain-button"
                    aria-label={`Quitar ${p.name}`}
                    onClick={() => {
                      removeItem(p.id);
                    }}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <div>
                <span>Total de productos</span>
                <strong>{money(total)}</strong>
                <small>
                  El costo del envío se revisa al finalizar el pedido.
                </small>
              </div>
              <div className="actions">
                <a className="button" href="#/compra">
                  Realizar compra →
                </a>
                <button
                  type="button"
                  className="catalog-button"
                  onClick={downloadQuote}
                >
                  Descargar cotización
                </button>
                <button
                  type="button"
                  className="plain-button"
                  onClick={() => {
                    clearCart();
                  }}
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
