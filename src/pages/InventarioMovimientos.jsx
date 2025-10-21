
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/InventarioMovimientos.css";

export default function InventarioMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState({ producto: "", tipo: "", estado: "", fechaInicio: "", fechaFin: "", usuario: "" });
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  const cargarProductos = useCallback(async () => {
    const { data } = await supabase.from("productos_con_stock").select("id, nombre");
    setProductos(data || []);
  }, []);

  const cargarMovimientos = useCallback(async () => {
  let query = supabase.from("inventario_movimientos").select("*, valor_compra").order("fecha", { ascending: false });
    if (filtro.producto) query = query.eq("producto_id", filtro.producto);
    if (filtro.tipo) query = query.eq("tipo", filtro.tipo);
    // No filtro por fecha para simplificar
    const { data, error } = await query;
    if (error) {
      console.warn('Error al cargar movimientos:', error.message);
      setMovimientos([]);
      return;
    }
    if (!data || data.length === 0) {
      console.warn('No hay datos en la tabla inventario_movimientos');
    } else {
      console.log('Movimientos cargados:', data);
    }
    // Hacer join manual con productos, proveedores y usuarios
  const { data: productosAll } = await supabase.from("productos_con_stock").select("id, nombre");
    const { data: proveedoresAll } = await supabase.from("proveedores").select("id, nombre");
    const { data: usuariosAll } = await supabase.from("usuarios").select("id, nombre");
    const movimientosConDatos = (data || []).map(mov => ({
      ...mov,
      producto: productosAll?.find(p => p.id === mov.producto_id) || null,
      proveedor: proveedoresAll?.find(p => p.id === mov.proveedor_id) || null,
      usuario: usuariosAll?.find(u => u.id === mov.usuario_id) || null
    }));
    setMovimientos(movimientosConDatos);
  }, [filtro]);


  // Cargar usuarios reales desde la base de datos
  const cargarUsuarios = useCallback(async () => {
    const { data } = await supabase.from("usuarios").select("id, nombre");
    setUsuarios([{ id: '', nombre: 'Todos los usuarios' }, ...(data || [])]);
  }, []);

  useEffect(() => {
    cargarProductos();
    cargarMovimientos();
    cargarUsuarios();
  }, [cargarProductos, cargarMovimientos, cargarUsuarios]);

  const handleFiltro = e => {
    setFiltro({ ...filtro, [e.target.name]: e.target.value });
  };

  // Filtrado avanzado
  const movimientosFiltrados = movimientos.filter(m => {
    // Producto
    if (filtro.producto && m.producto?.id !== filtro.producto) return false;
    // Tipo
    if (filtro.tipo && m.tipo !== filtro.tipo) return false;
    // Estado
    if (filtro.estado && m.estado !== filtro.estado) return false;
    // Usuario
    if (filtro.usuario && m.usuario?.id !== filtro.usuario) return false;
    // Fecha
    if (filtro.fechaInicio) {
      const fechaMov = new Date(m.fecha);
      const fechaIni = new Date(filtro.fechaInicio);
      if (fechaMov < fechaIni) return false;
    }
    if (filtro.fechaFin) {
      const fechaMov = new Date(m.fecha);
      const fechaFin = new Date(filtro.fechaFin);
      if (fechaMov > fechaFin) return false;
    }
    return true;
  });
  // Paginación
  const totalPaginas = Math.ceil(movimientosFiltrados.length / porPagina);
  const movimientosPagina = movimientosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <>
  <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 24, color: '#222', textAlign: 'center', width: '100%' }}>Historial de Movimientos de Inventario</h2>
  <div className="inventario-filtros" style={{ width: '98%', minWidth: '950px', maxWidth: '1400px', margin: '0 auto 18px auto', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
        <select name="producto" value={filtro.producto} onChange={handleFiltro}>
          <option value="">Todos los productos</option>
          {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select name="tipo" value={filtro.tipo} onChange={handleFiltro}>
          <option value="">Todos los tipos</option>
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
          <option value="ajuste">Ajuste</option>
          <option value="transferencia">Transferencia</option>
        </select>
        <select name="estado" value={filtro.estado} onChange={handleFiltro}>
          <option value="">Todos los estados</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendiente">Pendiente</option>
          <option value="anulado">Anulado</option>
        </select>
        <select name="usuario" value={filtro.usuario} onChange={handleFiltro}>
          {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
        <label style={{ fontWeight: 500, color: '#232323' }}>
          Fecha inicio:
          <input type="date" name="fechaInicio" value={filtro.fechaInicio} onChange={handleFiltro} style={{ marginLeft: 4 }} />
        </label>
        <label style={{ fontWeight: 500, color: '#232323' }}>
          Fecha fin:
          <input type="date" name="fechaFin" value={filtro.fechaFin} onChange={handleFiltro} style={{ marginLeft: 4 }} />
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
          <span style={{ fontWeight: 700, color: '#232323', marginBottom: 2 }}>Mostrar</span>
          <select value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1); }} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem' }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="inventario-movimientos-tabla" style={{ width: '98%', minWidth: '950px', maxWidth: '1400px', margin: '0 auto 0 auto' }}>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Proveedor</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Valor compra</th>
              <th>Stock Antes</th>
              <th>Stock Después</th>
              <th>Usuario</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movimientosPagina.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: "center", color: "#888" }}>No hay movimientos</td></tr>
            ) : movimientosPagina.map(m => (
              <tr key={m.id}>
                <td>{new Date(m.fecha).toLocaleString()}</td>
                <td>{m.producto?.nombre || ""}</td>
                <td>{m.proveedor?.nombre || ""}</td>
                <td>{m.tipo}</td>
                <td>{m.cantidad}</td>
                <td>{m.valor_compra ? `$${m.valor_compra}` : "-"}</td>
                <td>{m.stock_antes}</td>
                <td>{m.stock_después || m.stock_despues}</td>
                <td>{m.usuario?.nombre || ""}</td>
                <td>{m.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginTop: 18 }}>
          <button disabled={pagina === 1} onClick={() => setPagina(pagina - 1)}>
            Anterior
          </button>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <button disabled={pagina === totalPaginas || totalPaginas === 0} onClick={() => setPagina(pagina + 1)}>
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
