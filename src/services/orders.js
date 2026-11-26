export async function requestApi(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error(
      'No se pudo conectar con la tienda. Revisa tu conexión e intenta nuevamente.',
    );
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      'El servicio de pedidos no está disponible. Intenta nuevamente más tarde.',
    );
  }
  if (!response.ok) {
    const error = new Error(
      body.message || 'No se pudo completar la solicitud.',
    );
    error.fields = body.fields || {};
    throw error;
  }
  return body;
}
export function saveOrderAccess(id, token) {
  try {
    sessionStorage.setItem(`novaauto-order-${id}`, token);
  } catch {}
}
export function readOrderAccess(id) {
  try {
    return sessionStorage.getItem(`novaauto-order-${id}`);
  } catch {
    return null;
  }
}
