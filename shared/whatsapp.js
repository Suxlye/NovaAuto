export function whatsappRequest(input, products) {
  const lines = input.items.map((item) => {
    const product = products.find((product) => product.id === item.id);
    if (!product) throw new Error('Repuesto no encontrado.');
    return `${item.quantity} × ${product.name} (${product.id}) · USD ${(item.quantity * product.price).toFixed(2)}`;
  });
  const total = input.items.reduce(
    (sum, item) =>
      sum +
      products.find((product) => product.id === item.id).price * item.quantity,
    0,
  );
  const text = [
    'SOLICITUD DE REPUESTOS · NOVAAUTO',
    `Hola Mauricio, soy ${input.customer.name}.`,
    `Contacto: ${input.customer.phone} · ${input.customer.email}`,
    ...lines,
    `Total de productos de referencia: USD ${total.toFixed(2)}`,
    input.delivery === 'home'
      ? `Entrega a domicilio: ${input.address.street}, ${input.address.municipality}, ${input.address.department}. Referencia: ${input.address.reference || 'Sin referencia'}. Envío por confirmar.`
      : 'Retiro: coordinar ubicación y horario.',
    input.note ? `Indicaciones: ${input.note}` : '',
    'Solicito confirmar compatibilidad, precios, existencias, costo de envío y forma de pago. Esta solicitud no confirma una compra ni un pago.',
  ]
    .filter(Boolean)
    .join('\n');
  return `https://wa.me/50377256463?text=${encodeURIComponent(text)}`;
}
