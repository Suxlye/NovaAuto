export default function Services() {
  return (
    <section
      className="services section"
      id="servicios"
      aria-labelledby="services-title"
    >
      <div className="container services-grid">
        <div>
          <p className="eyebrow">02 / SERVICIOS PROPUESTOS</p>
          <h1 className="page-title" id="services-title">
            Información útil.
            <br />
            Decisiones más claras.
          </h1>
          <p className="muted">
            Esta sección se ajustará a los servicios que confirme NovaAuto
            Repuestos durante el levantamiento de requerimientos.
          </p>
        </div>
        <div className="service-list">
          <article>
            <span>01</span>
            <div>
              <h3>Orientación sobre repuestos</h3>
              <p>
                Una vía para consultar qué información de tu vehículo necesitas
                al buscar una pieza.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Consulta de disponibilidad</h3>
              <p>
                Un espacio para conocer los medios de contacto y consultar
                productos con el negocio.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Información comercial</h3>
              <p>
                Acceso a ubicación, horarios y canales de atención una vez que
                sean confirmados.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
