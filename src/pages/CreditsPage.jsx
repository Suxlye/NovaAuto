import { partImages } from '../data/partImages';
export default function CreditsPage() {
  const images = [
    ...new Map(
      Object.values(partImages).map((image) => [image.source, image]),
    ).values(),
  ];
  return (
    <section className="section container">
      <p className="eyebrow">FOTOGRAFÍAS</p>
      <h1 className="page-title">Créditos de imágenes</h1>
      <p className="muted">
        Fotografías reales de referencia obtenidas de Wikimedia Commons. Cada
        imagen conserva su autoría y licencia. Las fotografías no representan
        necesariamente la marca, medida o modelo de los productos del catálogo.
      </p>
      <div className="credits-grid">
        {images.map((image) => (
          <article key={image.source}>
            <img
              src={`${import.meta.env.BASE_URL}${image.file}`}
              alt={image.alt}
              loading="lazy"
              width="600"
              height="450"
            />
            <div>
              <h2>{image.alt}</h2>
              <p>Autor: {image.author}</p>
              <a href={image.source} target="_blank" rel="noreferrer">
                Ver fotografía original ↗
              </a>
              <a
                href={image.licenseUrl || image.source}
                target="_blank"
                rel="noreferrer"
              >
                {image.license} ↗
              </a>
              <small>Sin modificaciones; presentación ajustada con CSS.</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
