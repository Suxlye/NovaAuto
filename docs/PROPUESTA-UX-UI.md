# NovaAuto Repuestos: wireframes y propuesta UX/UI

Primer avance del proyecto académico, Ciclo 02-2026.

## Propósito y alcance

Proponer una presencia digital informativa para facilitar la consulta de categorías de repuestos, servicios e información comercial desde computadoras, tabletas y móviles. Este avance utiliza React, JavaScript y CSS3, con componentes por sección y búsqueda de categorías. La publicación y entrega formal pertenecen a etapas posteriores.

## Arquitectura y recorrido

Una página con Inicio, Repuestos, Servicios, Nosotros y Contacto. La acción principal es «Explorar repuestos»; la secundaria es «Consultar información». Cada categoría conduce a Contacto, donde el visitante encuentra qué datos de su vehículo preparar.

Los wireframes visuales están en `public/wireframes/index.html`, con referencias para computadora y móvil y reglas de adaptación a tableta.

## Propuesta visual

- Identidad provisional: logotipo tipográfico NovaAuto con símbolo de movimiento. Requiere aprobación del beneficiario.
- Colores: fondo claro `#F8F9F7`, texto `#182127`, acento terracota `#D9472F` y superficies oscuras `#132128`.
- Tipografía: Arial / Helvetica / sans-serif, disponible localmente; títulos grandes y jerarquía mediante tamaño, peso y espacio.
- Ilustración SVG de un sistema de frenos: recurso conceptual propio, no fotografía de inventario.
- Catálogo organizado en tarjetas con descripción breve y enlace de consulta.

## Adaptabilidad y accesibilidad

Flexbox organiza encabezado, navegación y acciones. CSS Grid organiza presentación, productos y secciones. Media Queries ajustan la distribución a 1000, 700 y 360 px; el catálogo pasa de cuatro a dos y finalmente a una columna. Las secciones principales se apilan en móvil.

HTML semántico con idioma español, jerarquía de encabezados, navegación identificada, enlace para saltar al contenido y descripción accesible de la ilustración. Los enlaces tienen indicadores visibles de foco y la animación de desplazamiento respeta la preferencia de movimiento reducido. Estas decisiones requieren comprobarse en navegador, teclado y lector de pantalla antes de la entrega.

## Requerimientos pendientes de confirmar

1. Logo, colores y autorización de uso de marca.
2. Productos, categorías, marcas y servicios reales.
3. Público objetivo y consultas frecuentes.
4. Teléfono, WhatsApp, dirección, horario y redes oficiales.
5. Fotografías autorizadas e información institucional.
6. Medio de alojamiento y persona responsable de actualizar el sitio.

No se incluyen precios, testimonios, garantías ni datos de contacto inventados. El aviso del prototipo y las notas de validación deben retirarse o sustituirse cuando el contenido real sea aprobado.

## Próximas etapas

Validar contenido y diseño con el beneficiario; incorporar JavaScript para una búsqueda o filtro de categorías si se confirma esa necesidad; probar navegación, compatibilidad, accesibilidad básica y rendimiento; publicar en el alojamiento acordado; entregar archivos y guía de actualización.
