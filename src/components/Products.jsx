import { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { categories } from '../data/categories';
import { products, vehicles, filterProducts } from '../data/products';
import ProductCard from './ProductCard';
const initialFilters = {
  search: '',
  category: '',
  brand: '',
  vehicle: '',
  model: '',
  year: '',
  maxPrice: '',
  available: false,
  offers: false,
  sort: '',
};
export default function Products({ category, onCategoryChange }) {
  const [filters, setFilters] = useState(initialFilters);
  const { cart, count, message, updateCart } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const effectiveFilters = { ...filters, category };
  const visible = filterProducts(products, effectiveFilters);
  const selectedVehicle = vehicles.find((v) => v.brand === filters.vehicle);
  const brands = [...new Set(products.map((p) => p.brand))].sort();
  function change(name, value) {
    setFilters((f) => ({
      ...f,
      [name]: value,
      ...(name === 'vehicle' ? { model: '' } : {}),
    }));
  }
  function reset() {
    setFilters(initialFilters);
    onCategoryChange('');
  }
  const pageCount = Math.max(1, Math.ceil(visible.length / 9));
  const activePage = Math.min(currentPage, pageCount);
  const pagedProducts = visible.slice((activePage - 1) * 9, activePage * 9);
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, category]);
  return (
    <section
      className="section container"
      id="productos"
      aria-labelledby="products-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / CATÁLOGO DE REPUESTOS</p>
          <h1 id="products-title" className="page-title">
            La pieza que tu auto necesita.
          </h1>
        </div>
        <p>
          Busca por repuesto o código y selecciona tu vehículo. Todos los
          precios están expresados en dólares (USD).
        </p>
      </div>
      <div className="catalog-highlights">
        <span>
          <strong>{products.length}</strong> repuestos de ejemplo
        </span>
        <span>
          <strong>{categories.length}</strong> categorías
        </span>
        <span>
          <strong>{brands.length}</strong> marcas de repuestos
        </span>
        <a href="#/carrito">
          Carrito · {count} {count === 1 ? 'pieza' : 'piezas'}
        </a>
      </div>
      <p role="status" className="catalog-feedback">
        {message}
      </p>
      <div className="catalog-layout">
        <aside className="catalog-filters" aria-label="Filtros del catálogo">
          <div className="filter-heading">
            <h3>Filtrar repuestos</h3>
            <button type="button" className="plain-button" onClick={reset}>
              Limpiar
            </button>
          </div>
          <label htmlFor="part-search">Nombre, marca o código</label>
          <input
            id="part-search"
            type="search"
            placeholder="Ej. NGK, filtro, NA-0001"
            value={filters.search}
            onChange={(e) => change('search', e.target.value)}
          />
          <label htmlFor="part-category">Categoría</label>
          <select
            id="part-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <label htmlFor="vehicle-brand">Marca del vehículo</label>
          <select
            id="vehicle-brand"
            value={filters.vehicle}
            onChange={(e) => change('vehicle', e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {vehicles.map((v) => (
              <option key={v.brand}>{v.brand}</option>
            ))}
          </select>
          <label htmlFor="vehicle-model">Modelo</label>
          <select
            id="vehicle-model"
            disabled={!filters.vehicle}
            value={filters.model}
            onChange={(e) => change('model', e.target.value)}
          >
            <option value="">Todos los modelos</option>
            {selectedVehicle?.models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <label htmlFor="vehicle-year">Año del vehículo</label>
          <select
            id="vehicle-year"
            value={filters.year}
            onChange={(e) => change('year', e.target.value)}
          >
            <option value="">Todos los años</option>
            {Array.from({ length: 27 }, (_, i) => 2026 - i).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
          <label htmlFor="part-brand">Marca del repuesto</label>
          <select
            id="part-brand"
            value={filters.brand}
            onChange={(e) => change('brand', e.target.value)}
          >
            <option value="">Todas las marcas</option>
            {brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <label htmlFor="max-price">Precio máximo (USD)</label>
          <input
            id="max-price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Sin límite"
            value={filters.maxPrice}
            onChange={(e) => change('maxPrice', e.target.value)}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.available}
              onChange={(e) => change('available', e.target.checked)}
            />{' '}
            Solo disponibles
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.offers}
              onChange={(e) => change('offers', e.target.checked)}
            />{' '}
            Solo ofertas
          </label>
          <p className="filter-note">
            Al elegir vehículo o año se muestran únicamente piezas con
            compatibilidad registrada. Los fluidos y accesorios se consultan por
            especificación.
          </p>
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <p role="status">
              {visible.length} de {products.length} repuestos
            </p>
            <label>
              Ordenar{' '}
              <select
                value={filters.sort}
                onChange={(e) => change('sort', e.target.value)}
              >
                <option value="">Destacados</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="name">Nombre A–Z</option>
              </select>
            </label>
          </div>
          <div className="product-grid">
            {pagedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                quantity={cart[p.id] || 0}
                onAdd={(id) => updateCart(id, 1)}
              />
            ))}
          </div>
          {pageCount > 1 && (
            <nav className="pagination" aria-label="Páginas del catálogo">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    type="button"
                    aria-label={`Página ${number}`}
                    aria-current={activePage === number ? 'page' : undefined}
                    onClick={() => {
                      setCurrentPage(number);
                      document
                        .getElementById('products-title')
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                    }}
                  >
                    {number}
                  </button>
                ),
              )}
            </nav>
          )}
          {!visible.length && (
            <div className="empty-results">
              <h3>No hay repuestos con estos filtros.</h3>
              <p>
                Prueba otro año, modelo o marca. Puedes consultar una pieza
                especial en contacto.
              </p>
              <button type="button" onClick={reset}>
                Ver todo el catálogo
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="section-note">
        Catálogo de demostración: precios, ofertas, existencias y
        compatibilidades requieren validación comercial. Confirma el VIN, motor,
        versión y número de pieza antes de comprar. Fotografías reales de
        referencia; no representan necesariamente la marca o modelo anunciado.
      </p>
      <section className="store-help" aria-label="Información de compra">
        <article>
          <h3>Compatibilidad</h3>
          <p>
            Ten a mano marca, modelo, año, motor y VIN. El año por sí solo no
            garantiza que una pieza sea compatible.
          </p>
        </article>
        <article>
          <h3>Entrega y retiro</h3>
          <p>
            Consulta opciones de retiro y envío, cobertura, costo y plazo antes
            de confirmar tu pedido.
          </p>
        </article>
        <article>
          <h3>Garantía y devoluciones</h3>
          <p>
            Solicita las condiciones de garantía de cada marca y los requisitos
            de devolución antes de instalar.
          </p>
        </article>
      </section>
    </section>
  );
}
