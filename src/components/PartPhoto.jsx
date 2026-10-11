import { useState } from 'react';
import { partImages } from '../data/partImages';
export function getPartImage(product) {
  return partImages[product.id];
}
export default function PartPhoto({ product, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  const image = getPartImage(product);
  if (!image || failed)
    return (
      <div className={`photo-unavailable ${className}`}>
        Fotografía no disponible
      </div>
    );
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}${image.file}`}
      alt={`Fotografía de referencia: ${image.alt}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      width="600"
      height="450"
      onError={() => setFailed(true)}
    />
  );
}
