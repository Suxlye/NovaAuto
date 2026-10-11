import { useStore } from '../context/StoreContext';
export default function Header({ page }) {
  const { count } = useStore();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          className="brand"
          href="#/inicio"
          aria-label="NovaAuto Repuestos, inicio"
        >
          <span className="brand-symbol" aria-hidden="true">
            N<span>↗</span>
          </span>
          <span>
            Nova<span className="brand-auto">Auto</span>
            <small>REPUESTOS</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          {[
            ['inicio', 'Inicio'],
            ['catalogo', 'Catálogo'],
            ['servicios', 'Servicios'],
            ['nosotros', 'Nosotros'],
            ['contacto', 'Contacto'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#/${id}`}
              aria-current={page === id ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
          <a
            className="nav-contact cart-nav"
            href="#/carrito"
            aria-current={
              ['carrito', 'compra', 'pedido'].includes(page)
                ? 'page'
                : undefined
            }
          >
            Carrito <span className="cart-count">{count}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
