import PartPhoto from './PartPhoto';
import { products } from '../data/products';
export default function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> NOVAAUTO REPUESTOS
          </p>
          <h1 id="hero-title">
            Cada pieza.
            <br />
            Un nuevo <em>camino.</em>
          </h1>
          <p className="hero-description">
            Frenos, filtros, suspensión y mucho más. Explora nuestro catálogo
            por marca, modelo y año para encontrar la próxima pieza de tu
            vehículo.
          </p>
          <div className="actions">
            <a className="button" href="#/catalogo">
              Explorar catálogo <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#/contacto">
              Consultar una pieza <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="hero-footnote">
            Encuentra repuestos. Revisa compatibilidad. Prepara tu cotización.
          </p>
        </div>
        <div className="hero-art hero-photo">
          <span className="art-label">PRECISIÓN EN CADA DETALLE</span>
          <PartPhoto product={products[1]} className="brake-art" eager />
          <div className="art-caption">
            <span className="caption-mark" aria-hidden="true">
              +
            </span>
            <div>
              El detalle hace la diferencia.
              <small>Fotografía de referencia · Sistema de frenos</small>
            </div>
            <span className="art-number" aria-hidden="true">
              01 / 08
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
