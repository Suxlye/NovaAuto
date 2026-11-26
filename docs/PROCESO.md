# Evidencia del proceso y validación

## Diseño e implementación

La propuesta UX/UI está en `PROPUESTA-UX-UI.md` y los wireframes en `public/wireframes/`. El historial Git registra la implementación del catálogo, pedidos, fotografías, división de carga por páginas y caché de archivos. Consultar `git log --oneline --all` para los identificadores y mensajes reales.

En la preparación final se añadió contacto de Mauricio Benitez por WhatsApp, publicación automatizada, configuración de servidor con almacenamiento persistente, endpoint de salud y generación reproducible de evidencias. La versión pública prepara solicitudes por WhatsApp; el registro persistente de pedidos requiere servidor.

## Verificaciones reproducibles

```sh
npm ci
npm run test:checkout
npm run build
node scripts/check-store-browser.mjs
node scripts/audit.mjs
```

Las nueve pruebas de pedidos cubren validación, cantidades, dirección, cálculo de precios en servidor, lectura privada del comprobante, existencias, reintentos, transacciones y persistencia. El navegador comprueba navegación, categorías, paginación, imágenes, carrito persistente, errores del formulario, compra, recuperación del pedido y página inexistente. Los datos de prueba son ficticios y se guardan en bases temporales separadas de la tienda.

El script de navegador genera 24 capturas de seis páginas a cuatro anchos y comprueba que el contenido no excede el viewport. Esto verifica dimensiones y funcionamiento; la revisión visual de las capturas complementa esas comprobaciones.

Lighthouse se ejecuta en la compilación de producción local, con Brave/Chromium y los perfiles móvil y escritorio. Los resultados contienen fecha, versión, URL y detalle de auditorías; el rendimiento del alojamiento público puede variar. Los informes no representan una auditoría de cada ruta ni una certificación de accesibilidad.

## Evidencia del beneficiario

`BENEFICIARIO.html` contiene acta de revisión, tabla de cambios, acta de entrega y encuesta para Mauricio Benitez. Están pendientes de completar con respuestas y aceptación reales. No se han fabricado firmas, valoraciones ni testimonios.
