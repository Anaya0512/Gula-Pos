import { useEffect } from "react";
import { obtenerInfoUsuario } from "../utils/usuarioActual";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";
import "../styles/Estadisticas.css"; // opcional para estilos futuros

export default function Estadisticas() {
  useEffect(() => {
    const anunciar = async () => {
  await obtenerInfoUsuario();
  mostrarNotificacionGlobal(`📊 Vista de estadísticas abierta`, "informacion");
    };
    anunciar();
  }, []);

  return (
    <div className="estadisticas-panel" style={{ padding: "2rem" }}>
      <h2>📈 Módulo de Estadísticas</h2>

      <p style={{ marginBottom: "1rem", color: "#555" }}>
        Explora análisis de ventas, productos más vendidos, uso de mesas y desempeño general del negocio.
      </p>

      <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div className="card-metrica">
          <h3>Ventas del día</h3>
          <p><em>Conectado a la base</em></p>
        </div>
        <div className="card-metrica">
          <h3>Mesas ocupadas</h3>
          <p><em>Conectado a la base</em></p>
        </div>
        <div className="card-metrica">
          <h3>Producto más vendido</h3>
          <p><em>Conectado a la base</em></p>
        </div>
      </div>

      <div style={{ marginTop: "3rem", textAlign: "center", color: "#aaa", fontStyle: "italic" }}>
        📌 Puedes filtrar estadísticas por fecha, categoría o turno una vez habilitado.
      </div>
    </div>
  );
}
