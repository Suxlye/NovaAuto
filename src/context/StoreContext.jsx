import { createContext, useContext, useEffect, useState } from 'react';
import { products, money } from '../data/products';
const StoreContext = createContext(null);
export function sanitizeCart(saved) {
  return Object.fromEntries(
    products
      .filter(
        (p) =>
          Number.isInteger(saved?.[p.id]) && saved[p.id] > 0 && p.stock > 0,
      )
      .map((p) => [p.id, Math.min(saved[p.id], p.stock)]),
  );
}
function loadCart() {
  try {
    return sanitizeCart(
      JSON.parse(localStorage.getItem('novaauto-cart') || '{}'),
    );
  } catch {
    return {};
  }
}
export function StoreProvider({ children }) {
  const [cart, setCart] = useState(loadCart);
  const [message, setMessage] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  useEffect(() => {
    try {
      localStorage.setItem('novaauto-cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);
  const lines = products.filter((p) => cart[p.id]);
  const count = lines.reduce((sum, p) => sum + cart[p.id], 0);
  const total = lines.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  function updateCart(id, delta) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setCart((current) => {
      const next = { ...current };
      const quantity = Math.max(
        0,
        Math.min(product.stock, (next[id] || 0) + delta),
      );
      if (quantity) next[id] = quantity;
      else delete next[id];
      return next;
    });
    setMessage(
      delta > 0
        ? `${product.name} agregado al carrito.`
        : 'Carrito actualizado.',
    );
  }
  function removeItem(id) {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
    setMessage('Producto eliminado.');
  }
  function clearCart() {
    setCart({});
    setMessage('Carrito vaciado.');
  }
  function completeOrder(order, accessToken) {
    setLastOrder({ order, accessToken });
    setCart((current) => {
      const next = { ...current };
      for (const item of order.items) {
        const remaining = (next[item.id] || 0) - item.quantity;
        if (remaining > 0) next[item.id] = remaining;
        else delete next[item.id];
      }
      return next;
    });
    setMessage('Pedido registrado correctamente.');
  }
  function downloadQuote() {
    const content = [
      'NOVA AUTO · COTIZACIÓN DE DEMOSTRACIÓN',
      `Fecha: ${new Date().toLocaleDateString('es-SV', { timeZone: 'America/El_Salvador' })}`,
      '',
      ...lines.map(
        (p) =>
          `${p.id} | ${p.name} | ${p.brand} | ${cart[p.id]} × ${money(p.price)} = ${money(p.price * cart[p.id])}`,
      ),
      '',
      `Total de productos: ${money(total)}`,
      'Envío: pendiente de cotización.',
      'Precios e inventario ilustrativos. No constituye pedido ni pago.',
      'Confirmar compatibilidad, impuestos, disponibilidad y garantía con la tienda.',
    ].join('\n');
    const url = URL.createObjectURL(
      new Blob([content], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cotizacion-novaauto.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Cotización descargada.');
  }
  return (
    <StoreContext.Provider
      value={{
        cart,
        lines,
        count,
        total,
        message,
        updateCart,
        removeItem,
        clearCart,
        downloadQuote,
        lastOrder,
        completeOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  return useContext(StoreContext);
}
