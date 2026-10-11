export default function Footer() {
  return (
    <footer className="container footer">
      <a className="brand footer-brand" href="#/inicio">
        Nova<span className="brand-auto">Auto</span>
      </a>
      <p>NovaAuto Repuestos · Proyecto académico · Fotografías de referencia</p>
      <a href="#/creditos">Créditos de fotografías ↗</a>
      <a href={`${import.meta.env.BASE_URL}wireframes/index.html`}>
        Ver wireframes ↗
      </a>
    </footer>
  );
}
