export const departments = [
  'Ahuachapán',
  'Cabañas',
  'Chalatenango',
  'Cuscatlán',
  'La Libertad',
  'La Paz',
  'La Unión',
  'Morazán',
  'San Miguel',
  'San Salvador',
  'San Vicente',
  'Santa Ana',
  'Sonsonate',
  'Usulután',
];

export class CheckoutError extends Error {
  constructor(message, status = 400, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const clean = (value, max = 150) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export function validateOrderInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new CheckoutError('El pedido no es válido.');
  const fields = {};
  const customer = {
    name: clean(input.customer?.name, 100),
    email: clean(input.customer?.email, 150),
    phone: clean(input.customer?.phone, 30),
  };
  if (customer.name.length < 2) fields.name = 'Escribe tu nombre completo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
    fields.email = 'Escribe un correo válido.';
  if (
    !/^[+\d\s()-]+$/.test(customer.phone) ||
    !/^\d{7,15}$/.test(customer.phone.replace(/\D/g, ''))
  )
    fields.phone = 'Escribe un teléfono válido de 7 a 15 dígitos.';
  const delivery = input.delivery;
  if (!['pickup', 'home'].includes(delivery))
    fields.delivery = 'Elige retiro en tienda o entrega a domicilio.';
  let address = null;
  if (delivery === 'home') {
    address = {
      department: clean(input.address?.department, 40),
      municipality: clean(input.address?.municipality, 100),
      street: clean(input.address?.street, 250),
      reference: clean(input.address?.reference, 250),
      country: 'El Salvador',
    };
    if (!departments.includes(address.department))
      fields.department = 'Selecciona tu departamento.';
    if (address.municipality.length < 2)
      fields.municipality = 'Escribe tu municipio o distrito.';
    if (address.street.length < 6)
      fields.street = 'Escribe calle, colonia y número de casa.';
  }
  if (
    !Array.isArray(input.items) ||
    !input.items.length ||
    input.items.length > 100
  )
    fields.items = 'Agrega al menos un repuesto al carrito.';
  const seen = new Set();
  const items = Array.isArray(input.items)
    ? input.items
        .map((item) => {
          if (
            !item ||
            typeof item.id !== 'string' ||
            !/^NA-\d{4}$/.test(item.id) ||
            !Number.isSafeInteger(item.quantity) ||
            item.quantity < 1 ||
            item.quantity > 1000 ||
            seen.has(item.id)
          )
            fields.items =
              'Hay cantidades o repuestos no válidos en el carrito.';
          seen.add(item?.id);
          return { id: item?.id, quantity: item?.quantity };
        })
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    : [];
  if (Object.keys(fields).length)
    throw new CheckoutError(
      'Revisa los datos indicados antes de continuar.',
      400,
      fields,
    );
  return { customer, delivery, address, items, note: clean(input.note, 500) };
}
