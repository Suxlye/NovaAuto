export default function Contact() {
  return (
    <section
      className="contact-section contact-page"
      aria-labelledby="contact-title"
    >
      <div className="container contact-grid">
        <div>
          <p className="eyebrow">CONTACTO</p>
          <h1 id="contact-title" className="page-title">
            Encuentra orientación para tu próxima pieza.
          </h1>
          <p>
            Ten a mano la marca, modelo, año, motor y VIN de tu vehículo, además
            del nombre o código de la pieza que buscas.
          </p>
          <a className="button" href="#/carrito">
            Preparar mi cotización ↗
          </a>
        </div>
        <div className="contact-details">
          <div>
            <span>Teléfono / WhatsApp</span>
            <p>
              <a
                href="https://wa.me/50377256463"
                target="_blank"
                rel="noreferrer"
              >
                +503 7725-6463 · WhatsApp
              </a>
            </p>
          </div>
          <div>
            <span>Persona de contacto</span>
            <p>Mauricio Benitez</p>
          </div>
          <div>
            <span>Atención y retiro</span>
            <p>
              Coordina ubicación y horario por WhatsApp antes de visitarnos.
            </p>
          </div>
          <p className="contact-note">
            Consulta compatibilidad, disponibilidad y entrega con Mauricio.
            Puedes descargar tu lista de repuestos desde el carrito y
            compartirla por WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
