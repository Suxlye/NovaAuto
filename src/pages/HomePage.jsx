import Hero from '../components/Hero';
import CategoryNav from '../components/CategoryNav';
import ProductCard from '../components/ProductCard';
import PartPhoto from '../components/PartPhoto';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { useStore } from '../context/StoreContext';
export default function HomePage() {
  const { cart, message, updateCart } = useStore();
  return (
    <>
      <Hero />
      <CategoryNav />
      <section className="section container" aria-labelledby="home-categories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ENCUENTRA TU REPUESTO</p>
            <h2 id="home-categories">Cada sistema, en su lugar.</h2>
          </div>
          <a className="text-link" href="#/catalogo">
            Ver catálogo completo →
          </a>
        </div>
        <div className="home-category-grid">
          {categories.map((c) => {
            const product = products.find((p) => p.category === c.id);
            return (
              <a
                className="home-category"
                key={c.id}
                href={`#/catalogo?categoria=${c.id}`}
              >
                <PartPhoto product={product} />
                <div>
                  <h3>{c.label}</h3>
                  <span>
                    {products.filter((p) => p.category === c.id).length}{' '}
                    repuestos · Explorar →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <section
        className="container section featured-section"
        aria-labelledby="featured-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">SELECCIÓN DEL CATÁLOGO</p>
            <h2 id="featured-title">Repuestos destacados.</h2>
          </div>
          <a className="text-link" href="#/catalogo">
            Explorar todos →
          </a>
        </div>
        <p role="status" className="catalog-feedback">
          {message}
        </p>
        <div className="product-grid">
          {[products[0], products[5], products[7], products[18]].map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              quantity={cart[p.id] || 0}
              onAdd={(id) => updateCart(id, 1)}
            />
          ))}
        </div>
        <p className="section-note">
          Fotografías de referencia. Precios y compatibilidades de demostración.
        </p>
      </section>
      <section className="home-cta">
        <div className="container">
          <div>
            <p className="eyebrow">ANTES DE ELEGIR UNA PIEZA</p>
            <h2>Empieza por conocer tu vehículo.</h2>
            <p>
              Marca, modelo, año, motor y VIN ayudan a encontrar el repuesto
              adecuado.
            </p>
          </div>
          <a className="button" href="#/contacto">
            Consultar información ↗
          </a>
        </div>
      </section>
    </>
  );
}
