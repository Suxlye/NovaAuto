# NovaAuto Repuestos

Tienda de repuestos con React y Vite. Incluye páginas de inicio, catálogo, carrito, compra, comprobante de pedido, servicios, nosotros y contacto. Requiere Node.js 24.

## Ejecutar

```powershell
npm.cmd install
npm.cmd run dev
```

`dev` inicia la web y el servidor de pedidos juntos. Abre la dirección que muestra Vite. Si ya tenías Vite iniciado antes de estos cambios, detén ese proceso y vuelve a ejecutar el comando.

```powershell
npm.cmd run build
npm.cmd start
```

Para usar la compilación, abre `http://localhost:3001`. El servidor sirve tanto `dist/` como `/api/`. `npm.cmd run preview` necesita el servidor de pedidos iniciado en otra terminal con `npm.cmd run server`.

## Comprar

Agrega repuestos al carrito, selecciona **Realizar compra**, completa nombre, correo y teléfono, elige retiro o domicilio y confirma el pedido. El domicilio requiere departamento, municipio o distrito y calle con número de casa; la referencia es opcional. Las entregas del formulario se configuran para El Salvador.

El servidor valida las cantidades y calcula los precios desde el catálogo, registra el pedido y descuenta las existencias en una transacción. Los reintentos con la misma referencia no duplican el pedido. El cliente recibe un número de pedido y puede descargar el comprobante. El carrito se actualiza solamente después de guardar correctamente.

Los pedidos y existencias se conservan en `.data/orders.sqlite`, incluso después de reiniciar. Esta carpeta se excluye de Git. El acceso al comprobante requiere la referencia privada guardada en la sesión del navegador. Los pedidos se guardan en el servidor que ejecuta esta aplicación; no se envían por correo o WhatsApp ni a un sistema externo del negocio.

El pago queda pendiente al recibir o retirar. Las tarjetas quedan pendientes de confirmación y no se recopilan datos de tarjeta.

## Costo del envío

Sin configuración, el envío aparece **Por confirmar**; el comprobante distingue el importe de los productos del costo pendiente. El retiro tiene costo de envío cero.

Para establecer una tarifa, copia `.env.example` como `.env`, configura `DELIVERY_FEE_CENTS` en centavos y reinicia el servidor. Por ejemplo, `500` representa USD 5.00; es un ejemplo de configuración, no una tarifa establecida para el negocio.

## Organización

- `src/pages/`: páginas, formulario y comprobante.
- `src/context/StoreContext.jsx`: carrito y pedido recién registrado.
- `src/data/products.js`: catálogo de ejemplo y precios usados por el servidor.
- `src/data/partImages.js` y `public/images/parts/`: fotografías de referencia y créditos.
- `shared/checkout.js`: validación del pedido compartida por navegador y servidor.
- `server/`: API y almacenamiento SQLite.
- `scripts/dev.mjs`: inicio conjunto de los servidores.

El catálogo, compatibilidades y datos comerciales continúan siendo ilustrativos. La tienda debe confirmar las piezas y coordinar la entrega de los pedidos registrados.

## Verificación

```powershell
npm.cmd run test:checkout
npm.cmd run build
node scripts/check-store-browser.mjs
```

Las pruebas cubren dirección obligatoria, cantidades, precios calculados en servidor, acceso privado al comprobante, existencias, reintentos, persistencia, navegación, imágenes y compra en pantalla móvil. La prueba de navegador usa Brave instalado en Windows; puede configurarse otro navegador Chromium con `BROWSER_PATH`. Los pedidos de prueba se guardan en una base temporal independiente.
