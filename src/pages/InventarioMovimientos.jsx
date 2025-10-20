
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/InventarioMovimientos.css";

export default function InventarioMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState({ producto: "", tipo: "", fecha: "" });

  const cargarProductos = useCallback(async () => {
    const { data } = await supabase.from("productos").select("id, nombre");
    setProductos(data || []);
  }, []);

  const cargarMovimientos = useCallback(async () => {
    let query = supabase.from("inventario_movimientos").select("*, producto:producto_id(nombre), usuario:usuario_id(nombre)").order("fecha", { ascending: false });
    if (filtro.producto) query = query.eq("producto_id", filtro.producto);
    if (filtro.tipo) query = query.eq("tipo", filtro.tipo);
    // No filtro por fecha para simplificar
    const { data } = await query;
    setMovimientos(data || []);
  }, [filtro]);

  useEffect(() => {
    cargarProductos();
    cargarMovimientos();
  }, [cargarProductos, cargarMovimientos]);

  const handleFiltro = e => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  return (
    <div className="inventario-movimientos-panel">
      <h2>Historial de Movimientos de Inventario</h2>
      <div className="inventario-filtros">
        <select name="producto" value={filtro.producto} onChange={handleFiltro}>
          <option value="">Todos los productos</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select name="tipo" value={filtro.tipo} onChange={handleFiltro}>
          <option value="">Todos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
      </div>
      <div className="inventario-movimientos-tabla">
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock Antes</th>
              <th>Stock Después</th>
              <th>Usuario</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#888" }}>No hay movimientos</td></tr>
            ) : movimientos.map(m => (
              <tr key={m.id}>
                <td>{new Date(m.fecha).toLocaleString()}</td>
                <td>{m.producto?.nombre || ""}</td>
                <td>{m.tipo}</td>
                <td>{m.cantidad}</td>
                <td>{m.stock_antes}</td>
                <td>{m.stock_después || m.stock_despues}</td>
                <td>{m.usuario?.nombre || ""}</td>
                <td>{m.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
