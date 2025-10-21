
import React, { useState } from "react";

export default function ImagenProductoConPlaceholder({ imagen_url, nombre }) {
  const [imgError, setImgError] = useState(false);
  const urlValida = imagen_url && typeof imagen_url === 'string' && imagen_url.trim() !== '';
  if (urlValida && !imgError) {
    return (
      <img
        src={imagen_url}
        alt={nombre}
        className="imagen-redonda"
        onError={() => setImgError(true)}
      />
    );
  }
  // Si no hay imagen válida o falló la carga, mostrar placeholder
  const iniciales = nombre && nombre.trim().length > 0
    ? nombre.trim().split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase()
    : "?";
  return (
    <div className="producto-placeholder-circle">{iniciales}</div>
  );
}
