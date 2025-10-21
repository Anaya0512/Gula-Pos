import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/InventarioVer.css";

export default function InventarioVer() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [proveedorFiltro, setProveedorFiltro] = useState("");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [modalEditar, setModalEditar] = useState(null); // producto a editar o null
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  // Filtros adicionales
  const [estadoFiltro, setEstadoFiltro] = useState(''); // '', 'activo', 'inactivo'
  const [stockBajo, setStockBajo] = useState(false);
  const [movimientosFiltro, setMovimientosFiltro] = useState(''); // '', 'con', 'sin'
  // Eliminar producto de Supabase y del estado
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    setLoadingEliminar(true);
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (!error) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setLoadingEliminar(false);
    } else {
      alert("Error al eliminar producto");
      setLoadingEliminar(false);
    }
  };

  // Guardar cambios de edición (solo stub, puedes expandirlo)
  const guardarEdicion = (productoEditado) => {
    // Aquí deberías actualizar en Supabase y en el estado
    setProductos((prev) => prev.map((p) => p.id === productoEditado.id ? productoEditado : p));
    setModalEditar(null);
    // Puedes agregar lógica real de actualización aquí
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const [{ data: productosData }, { data: categoriasData }, { data: proveedoresData }] = await Promise.all([
      supabase.from("productos_con_stock").select("*"),
      supabase.from("categorias").select("*"),
      supabase.from("proveedores").select("*"),
    ]);
    setProductos(productosData || []);
    setCategorias(categoriasData || []);
    setProveedores(proveedoresData || []);
  };

  // Filtros y búsqueda
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre?.toLowerCase().includes(buscar.toLowerCase());
    const coincideCategoria = categoriaFiltro ? prod.categoria_id === categoriaFiltro : true;
    const coincideProveedor = proveedorFiltro ? prod.proveedor_id === proveedorFiltro : true;
    const coincideEstado = estadoFiltro === '' ? true : (estadoFiltro === 'activo' ? prod.activo : !prod.activo);
  const coincideStock = stockBajo ? (prod.stock_actual !== undefined && prod.stock_minimo !== undefined && Number(prod.stock_actual) <= Number(prod.stock_minimo)) : true;
    const coincideMovimientos = movimientosFiltro === '' ? true : (
      movimientosFiltro === 'con' ? (Array.isArray(prod.movimientos) ? prod.movimientos.length > 0 : Number(prod.movimientos) > 0)
      : (Array.isArray(prod.movimientos) ? prod.movimientos.length === 0 : !prod.movimientos || Number(prod.movimientos) === 0)
    );
    return coincideNombre && coincideCategoria && coincideProveedor && coincideEstado && coincideStock && coincideMovimientos;
  });

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / porPagina);
  const productosPagina = productosFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <>
      <div className="inventario-header">
        <h2>Inventario detallado</h2>
        <div className="filtros-inventario">
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Nombre
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            style={{ minWidth: 120 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Categoría
          <select value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">Seleccionar...</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Proveedor
          <select value={proveedorFiltro} onChange={(e) => setProveedorFiltro(e.target.value)} style={{ minWidth: 120 }}>
            <option value="">Seleccionar...</option>
            {proveedores.map((prov) => (
              <option key={prov.id} value={prov.id}>{prov.nombre}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Estado
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} style={{ minWidth: 100 }}>
            <option value="">Seleccionar...</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </label>
        {/* ...otros filtros... */}
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Movimientos
          <select value={movimientosFiltro} onChange={e => setMovimientosFiltro(e.target.value)} style={{ minWidth: 100 }}>
            <option value="">Seleccionar...</option>
            <option value="con">Con movimientos</option>
            <option value="sin">Sin movimientos</option>
          </select>
        </label>
        <label className="toggle-label-stock" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Stock bajo
          <span className="toggle-switch" style={{ marginTop: 4 }}>
            <input type="checkbox" id="stockBajoToggle" checked={stockBajo} onChange={e => setStockBajo(e.target.checked)} />
            <span className="slider"></span>
          </span>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontWeight: 700, color: '#232323', marginRight: 12 }}>
          Mostrar
          <select value={porPagina} onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1); }} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem', marginTop: 4 }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        </div>
      </div>
      <table className="tabla-inventario">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Cantidad</th>
            <th>Precio venta</th>
            <th>Valor compra</th>
            <th>Estado</th>
            <th>Movimientos</th>
            <th>Fecha ingreso</th>
            <th>Última actualización</th>
            <th>Stock mínimo</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosPagina.map((prod) => {
            const categoria = categorias.find((cat) => cat.id === prod.categoria_id);
            const proveedor = proveedores.find((prov) => prov.id === prod.proveedor_id);
            return (
              <tr key={prod.id}>
                <td>
                  {prod.imagen_url ? (
                    <img src={prod.imagen_url} alt={prod.nombre} className="img-inventario" />
                  ) : (
                    <span className="img-placeholder">Sin imagen</span>
                  )}
                </td>
                <td>{prod.nombre}</td>
                <td>{categoria ? categoria.nombre : "-"}</td>
                <td>{proveedor ? proveedor.nombre : "-"}</td>
                <td>{prod.stock_actual ?? 0}</td>
                <td>${prod.precio !== undefined && prod.precio !== null ? prod.precio : '-'}</td>
                <td>${prod.valor_compra !== undefined && prod.valor_compra !== null ? prod.valor_compra : '-'}</td>
                <td>
                  <span style={{
                    background: prod.activo ? '#00c853' : '#d50000',
                    color: '#fff',
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontWeight: 'bold',
                  }}>{prod.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td>-</td>
                <td>{prod.created_at ? new Date(prod.created_at).toLocaleDateString() : "-"}</td>
                <td>{prod.updated_at ? new Date(prod.updated_at).toLocaleDateString() : "-"}</td>
                <td>{prod.stock_minimo ?? '-'}</td>
                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {/* Icono editar */}
                    <button
                      title="Editar"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        margin: 0,
                        padding: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={() => setModalEditar(prod)}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00c853" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                      </svg>
                    </button>
                    {/* Icono eliminar */}
                    <button
                      title="Eliminar"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: loadingEliminar ? 'not-allowed' : 'pointer',
                        margin: 0,
                        padding: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: loadingEliminar ? 0.5 : 1,
                      }}
                      onClick={() => eliminarProducto(prod.id)}
                      disabled={loadingEliminar}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d50000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                  </div>
                </td>
      {/* Modal de edición de producto */}
      {modalEditar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
            <h3 style={{ marginBottom: 16 }}>Editar producto</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label>Nombre
                <input type="text" value={modalEditar.nombre} onChange={e => setModalEditar({ ...modalEditar, nombre: e.target.value })} />
              </label>
              <label>Precio venta
                <input type="number" value={modalEditar.precio} onChange={e => setModalEditar({ ...modalEditar, precio: e.target.value })} />
              </label>
              <label>Valor compra
                <input type="number" value={modalEditar.valor_compra} onChange={e => setModalEditar({ ...modalEditar, valor_compra: e.target.value })} />
              </label>
              <label>Stock mínimo
                <input type="number" value={modalEditar.stock_minimo} onChange={e => setModalEditar({ ...modalEditar, stock_minimo: e.target.value })} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button onClick={() => setModalEditar(null)} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold' }}>Cancelar</button>
              <button onClick={() => guardarEdicion(modalEditar)} style={{ background: '#00c853', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 'bold' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="paginacion-inventario" style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
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
    </>
  );
}
