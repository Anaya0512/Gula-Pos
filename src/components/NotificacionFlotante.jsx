import React from "react";
import "../styles/NotificacionFlotante.css";

export default function NotificacionFlotante({ mensaje }) {
  return (
    <div className="notificacion-flotante">{mensaje}</div>
  );
}
