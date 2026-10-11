import PartPhoto from './PartPhoto';
import { categories } from '../data/categories';
import { money } from '../data/products';
export default function ProductCard({ product, onAdd, quantity }) {
  const category = categories.find((c) => c.id === product.category);
  return (
    <article className="product-card catalog-card">
      <div className="product-visual">
        <PartPhoto product={product} />
        <span className="product-brand">{product.brand}</span>
        {product.oldPrice > 0 && <span className="offer-tag">Oferta</span>}
      </div>
      <div className="product-meta">
        <span>{category.label}</span>
        <span>{product.id}</span>
      </div>
      <h3>{product.name}</h3>
      <p className="compatibility">
        {product.vehicleBrand
          ? `${product.vehicleBrand} ${product.model} · ${product.yearFrom}–${product.yearTo}`
          : 'Aplicación según especificación'}
      </p>
      <p>{product.description}</p>
      <div className="price-line">
        <strong>{money(product.price)}</strong>
        {product.oldPrice > 0 && <del>{money(product.oldPrice)}</del>}
      </div>
      <span className={`stock-label ${product.stock ? '' : 'out-of-stock'}`}>
        {product.stock
          ? `${product.stock} unidades disponibles`
          : 'Bajo pedido · consultar'}
      </span>
      <button
        className="catalog-button"
        type="button"
        disabled={!product.stock || quantity >= product.stock}
        onClick={() => onAdd(product.id)}
      >
        {!product.stock
          ? 'Sin existencias'
          : quantity >= product.stock
            ? 'Límite de existencias'
            : 'Agregar al carrito'}
        {quantity > 0 && ` (${quantity})`}
      </button>
    </article>
  );
}
