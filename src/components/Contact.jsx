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
            <p>Pendiente de confirmar</p>
          </div>
          <div>
            <span>Dirección</span>
            <p>Pendiente de confirmar con el negocio</p>
          </div>
          <div>
            <span>Horario de atención</span>
            <p>Pendiente de confirmar</p>
          </div>
          <p className="contact-note">
            Los canales de contacto se habilitarán al recibir los datos
            oficiales del negocio. Mientras tanto, puedes descargar tu lista de
            repuestos desde el carrito.
          </p>
        </div>
      </div>
    </section>
  );
}
