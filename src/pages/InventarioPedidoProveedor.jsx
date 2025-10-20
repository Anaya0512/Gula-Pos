import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/InventarioPedidoProveedor.css";
// Imagen por defecto para proveedores
const IMAGEN_PROVEEDOR_DEFAULT = "https://kxymgcmgjlakgtzhfden.supabase.co/storage/v1/object/public/imagenes/proveedor-1759852335508.png";

export default function InventarioPedidoProveedor() {
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedorId, setProveedorId] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cargarProveedores();
    cargarProductos();
  }, []);

  const cargarProveedores = async () => {
    const { data } = await supabase.from("proveedores").select("id, nombre, imagen_url");
    setProveedores(data || []);
  };
  const cargarProductos = async () => {
    const { data } = await supabase.from("productos").select("id, nombre, stock");
    setProductos(data || []);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado || !cantidad || isNaN(cantidad) || Number(cantidad) <= 0) {
      setError("Completa todos los campos correctamente.");
      return;
    }
    setCarrito([...carrito, {
      producto_id: productoSeleccionado,
      cantidad: Number(cantidad),
      motivo,
    }]);
    setProductoSeleccionado("");
    setCantidad("");
    setMotivo("");
    setError("");
  };

  const eliminarDelCarrito = idx => {
    setCarrito(carrito.filter((_, i) => i !== idx));
  };

  const handleRegistrarPedido = async () => {
    setError("");
    setSuccess("");
    if (!proveedorId || carrito.length === 0) {
      setError("Selecciona proveedor y agrega al menos un producto.");
      return;
    }
    // Registrar movimientos en inventario_movimientos
    let errorMov = null;
    for (const item of carrito) {
      // Obtener stock actual
      const { data: prod } = await supabase.from("productos").select("stock").eq("id", item.producto_id).single();
      const stock_antes = prod?.stock ?? 0;
      const stock_despues = stock_antes + item.cantidad;
      const { error: movError } = await supabase.from("inventario_movimientos").insert([
        {
          producto_id: item.producto_id,
          proveedor_id: proveedorId,
          tipo: "entrada",
          cantidad: item.cantidad,
          stock_antes,
          stock_despues,
          motivo: item.motivo,
          fecha: new Date().toISOString(),
          usuario_id: null // Asignar usuario si tienes auth
        }
      ]);
      if (movError) errorMov = movError;
      // Actualizar stock
      await supabase.from("productos").update({ stock: stock_despues }).eq("id", item.producto_id);
    }
    if (errorMov) {
      setError("Error al registrar movimientos: " + errorMov.message);
      return;
    }
    setSuccess("Pedido registrado correctamente.");
    setCarrito([]);
    setProveedorId("");
  };

  return (
    <div className="inventario-pedido-panel">
      <h2>Registrar Pedido a Proveedor</h2>
      <div className="pedido-form">
        <div className="form-row">
          <label>Proveedor</label>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <select value={proveedorId} onChange={e => setProveedorId(e.target.value)} required>
              <option value="">Selecciona un proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {proveedorId && (
              <img
                src={`${(proveedores.find(p=>p.id===proveedorId)?.imagen_url)||IMAGEN_PROVEEDOR_DEFAULT}`}
                alt="Proveedor"
                style={{width:40,height:40,borderRadius:8,objectFit:'cover',border:'1px solid #eee'}}
              />
            )}
          </div>
        </div>
        <div className="form-row">
          <label>Producto</label>
          <select value={productoSeleccionado} onChange={e => setProductoSeleccionado(e.target.value)} required>
            <option value="">Selecciona un producto</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Cantidad</label>
          <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} min="1" required />
        </div>
        <div className="form-row">
          <label>Motivo</label>
          <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={100} />
        </div>
        <button type="button" className="btn-agregar" onClick={agregarAlCarrito}>Agregar producto</button>
      </div>
      <div className="carrito-lista">
        <h3>Productos en el pedido</h3>
        {carrito.length === 0 ? <div style={{color:'#888'}}>No hay productos agregados</div> : (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {carrito.map((item, idx) => {
                const prod = productos.find(p => p.id === item.producto_id);
                return (
                  <tr key={idx}>
                    <td>{prod?.nombre || item.producto_id}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.motivo}</td>
                    <td><button className="btn-eliminar" onClick={() => eliminarDelCarrito(idx)}>Eliminar</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      <button type="button" className="btn-registrar-pedido" onClick={handleRegistrarPedido}>Registrar pedido completo</button>
    </div>
  );
}
