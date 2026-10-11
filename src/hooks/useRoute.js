import { useEffect, useState } from 'react';
export const pageNames = {
  inicio: 'Inicio',
  catalogo: 'Catálogo',
  carrito: 'Carrito',
  compra: 'Finalizar compra',
  pedido: 'Tu pedido',
  servicios: 'Servicios',
  nosotros: 'Nosotros',
  contacto: 'Contacto',
  creditos: 'Créditos de fotografías',
};
export function readRoute(hash = window.location.hash) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const page = path || 'inicio';
  return {
    page,
    category: new URLSearchParams(query).get('categoria') || '',
    id: new URLSearchParams(query).get('id') || '',
    exists: Object.hasOwn(pageNames, page),
  };
}
export default function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  useEffect(() => {
    document.title = `${pageNames[route.page] || 'Página no encontrada'} | NovaAuto Repuestos`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('contenido')?.focus({ preventScroll: true });
  }, [route.page]);
  return route;
}
