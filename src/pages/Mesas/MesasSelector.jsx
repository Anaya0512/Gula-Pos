
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/MesasSelector.css";


export default function MesasSelector() {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState({});

  useEffect(() => {
    const fetchMesas = async () => {
      setLoading(true);
      // Traer también el campo 'estado' de la mesa
  const { data, error } = await supabase.from("mesas").select("id, nombre, estado, x_pos, y_pos");
      console.log("[MesasSelector] Mesas desde Supabase:", data, error);
      setMesas(data || []);
      setLoading(false);
    };
    fetchMesas();
  }, []);

  // Cargar ventas activas por mesa (opcional, para mostrar debajo de cada mesa)
  useEffect(() => {
    const fetchVentas = async () => {
      if (mesas.length === 0) return;
      const ids = mesas.map(m => m.id);
      // Traer todas las ventas pendientes de todas las mesas en una sola consulta
      const { data } = await supabase
        .from("ventas")
        .select("id, mesa_id, estado, total")
        .in("mesa_id", ids)
        .eq("estado", "pendiente");
      // Mapear por mesa
      const ventasObj = {};
      if (data) {
        for (const venta of data) {
          ventasObj[venta.mesa_id] = venta;
        }
      }
      setVentas(ventasObj);
    };
    fetchVentas();
  }, [mesas]);

  return (
    <div style={{width: '100%', maxWidth: '100vw', margin: 0, padding: 0}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0 18px 0', padding: '0 2vw'}}>
        <h2 style={{margin: 0}}>Selecciona una mesa</h2>
      </div>
      <div style={{position: 'relative', width: '100vw', height: '75vh', minHeight: 400, background: '#f5f6fa', borderRadius: 0, overflow: 'auto', margin: 0, padding: 0}}>
        {loading && <div>Cargando mesas...</div>}
        {!loading && mesas.length === 0 && <div>No hay mesas disponibles</div>}
        {!loading && mesas.map((mesa) => {
          const venta = ventas[mesa.id];
          const ocupado = venta && venta.estado === 'pendiente';
          let estadoClase = 'disponible';
          let estadoTexto = 'Disponible';
          if (ocupado) {
            estadoClase = 'ocupada';
            estadoTexto = 'Ocupada';
          } else if (mesa.estado === 'reservada') {
            estadoClase = 'reservada';
            estadoTexto = 'Reservada';
          }
          return (
            <div
              key={mesa.id}
              className={`mesa-admin-item-grid mesa-admin-profesional mesa-selector-btn`}
              style={{ position: 'absolute', left: mesa.x_pos || 100, top: mesa.y_pos || 100, zIndex: 10, minWidth: 160, cursor: 'pointer' }}
              onClick={() => navigate(`/mesa/${mesa.id}`)}
              aria-label={`Mesa ${mesa.nombre} - ${estadoTexto}`}
            >
              <span className="mesa-admin-nombre">{mesa.nombre}</span>
              <div className={`mesa-barra-estado ${estadoClase}`}>{estadoTexto}</div>
              {ocupado && venta && (
                <div className="mesa-venta-info" style={{marginTop: 8, fontWeight: 500, color: '#333'}}>
                  <div>Total: ${venta.total?.toFixed(2) ?? 0}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
