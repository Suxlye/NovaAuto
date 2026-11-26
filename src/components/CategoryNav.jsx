import { categories } from '../data/categories';
export default function CategoryNav() {
  return (
    <div className="category-strip">
      <div className="container">
        <span>EXPLORA POR SISTEMA</span>
        {categories.map((c) => (
          <a key={c.id} href={`#/catalogo?categoria=${c.id}`}>
            {c.label}
          </a>
        ))}
      </div>
    </div>
  );
}
