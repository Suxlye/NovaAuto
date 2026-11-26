# Entrega final · NovaAuto Repuestos

Fecha de preparación: 25 de noviembre de 2026 (El Salvador).
Contacto indicado por el responsable del proyecto: **Mauricio Benitez · +503 7725-6463**.

## Índice de los doce entregables

| Requisito                    | Archivo o acceso                                                         | Estado / alcance                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 1. Sitio funcional           | `src/`, `server/`, `shared/`                                             | Catálogo, filtros, carrito, cotización y compra con Node.js/SQLite.                                              |
| 2. URL pública               | https://suxlye.github.io/NovaAuto/                                       | Publicación verificada mediante GitHub Actions y navegador. Permite solicitudes por WhatsApp; no ejecuta SQLite. |
| 3. Repositorio final         | https://github.com/Suxlye/NovaAuto/tree/novaauto-store                   | Rama de entrega `novaauto-store`.                                                                                |
| 4. Código completo           | Repositorio, `package-lock.json`, `.env.example`                         | Incluye cliente, API, pruebas y configuración de despliegue.                                                     |
| 5. Evidencias del proceso    | `PROCESO.md`, historial Git, `PROPUESTA-UX-UI.md`, `/public/wireframes/` | Historial verificable y diseño inicial.                                                                          |
| 6. Lighthouse                | `evidencias/lighthouse/`                                                 | Informes HTML y JSON, móvil y escritorio, sobre compilación local.                                               |
| 7. Responsive                | `evidencias/responsive/`                                                 | Capturas y resultados a 320, 390, 768 y 1440 píxeles.                                                            |
| 8. Revisión con beneficiario | `BENEFICIARIO.html`                                                      | Formato pendiente de reunión real.                                                                               |
| 9. Cambios solicitados       | `BENEFICIARIO.html`                                                      | Registro listo para documentar solicitudes reales.                                                               |
| 10. Evidencia de entrega     | `BENEFICIARIO.html`                                                      | Acta pendiente de aceptación y firma.                                                                            |
| 11. Encuesta                 | `BENEFICIARIO.html`                                                      | Encuesta pendiente de respuesta del beneficiario.                                                                |
| 12. Presentación             | `PRESENTACION.html`                                                      | HTML interactivo y PDF de 10 diapositivas.                                                                       |

## Ejecutar la versión completa

Requiere Node.js 24. Ejecutar `npm ci`, `npm run build` y `npm start`. Abrir http://localhost:3001. Para desarrollo: `npm run dev`.

La URL de GitHub Pages es una demostración pública del catálogo, cotización y solicitudes por WhatsApp. El checkout prepara una solicitud que el usuario revisa y envía por WhatsApp; no guarda datos en un servidor de la web. Para demostrar el registro real, ejecutar la versión completa o desplegarla con `render.yaml`.

## Publicar el servidor

El archivo `render.yaml` prepara un servicio Node.js y un disco persistente para SQLite. Abrir https://dashboard.render.com/select-repo?type=blueprint y seleccionar este repositorio y la rama `novaauto-store`. Revisar el costo del servicio y disco antes de crearlo. No se ha contratado ni activado ese servicio automáticamente.

El servidor acepta `PORT`, `API_HOST` y `ORDER_DATA_DIRECTORY`; `/api/health` permite comprobar su estado. Debe conservarse el directorio de datos entre despliegues. Referencias de configuración: https://render.com/docs/blueprint-spec y https://render.com/docs/disks.

## Demostración de cinco minutos

1. Mostrar inicio, categorías y catálogo.
2. Buscar una pieza y aplicar filtros; limpiar y cambiar de página.
3. Agregar al carrito, modificar cantidades y descargar cotización.
4. En versión completa, realizar un pedido con datos ficticios. Mostrar validación de domicilio, confirmación y recuperación tras recargar.
5. Mostrar contacto, créditos, capturas responsive e informes Lighthouse.

## Límites y pendientes reales

El catálogo y las compatibilidades son ilustrativos. El número y nombre fueron proporcionados para el proyecto; no se ha verificado la titularidad del número. La ubicación y el horario se coordinan con el contacto, sin inventar una dirección de visita. Los pedidos se almacenan en el servidor; no hay cobro electrónico ni envío automático al negocio. La aprobación del beneficiario, su encuesta y la recepción de la entrega necesitan participación real. Los formatos preparados no constituyen evidencias de reuniones o firmas realizadas.
