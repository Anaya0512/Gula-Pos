import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { obtenerInfoUsuario } from "../utils/usuarioActual";
import "../styles/InventarioRegistroMovimiento.css";
const IMAGEN_PROVEEDOR_DEFAULT = "https://kxymgcmgjlakgtzhfden.supabase.co/storage/v1/object/public/imagenes/proveedor-1759852335508.png";

export default function InventarioRegistroMovimiento() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({
    producto_id: "",
    proveedor_id: "",
    tipo: "entrada",
    cantidad: "",
    motivo: "",
  });
  const [stockActual, setStockActual] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    cargarProductos();
    cargarProveedores();
    // Suscripción en tiempo real a la tabla productos
    const subscription = supabase
      .channel('public:productos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => {
        cargarProductos();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  const cargarProveedores = async () => {
    const { data } = await supabase.from("proveedores").select("id, nombre");
    setProveedores(data || []);
  };

  useEffect(() => {
    if (form.producto_id) {
      obtenerStockActual(form.producto_id);
    } else {
      setStockActual(null);
    }
  }, [form.producto_id]);

  const cargarProductos = async () => {
    // Traer también valor_compra y solo productos activos
    const { data, error, status, statusText } = await supabase
      .from("productos_con_stock")
      .select("id, nombre, stock_actual, valor_compra, activo")
      .eq("activo", true);
    console.log("Productos response:", { data, error, status, statusText });
    setProductos(data || []);
  };

  const obtenerStockActual = async (producto_id) => {
    const { data } = await supabase.from("productos_con_stock").select("stock_actual").eq("id", producto_id).single();
    setStockActual(data?.stock_actual ?? null);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.producto_id || !form.cantidad || isNaN(form.cantidad) || Number(form.cantidad) <= 0) {
      setError("Completa todos los campos correctamente.");
      return;
    }
    if (form.tipo === "entrada" && !form.proveedor_id) {
      setError("Debes seleccionar el proveedor para entradas.");
      return;
    }
    if (form.tipo === "salida" && Number(form.cantidad) > stockActual) {
      setError("No hay suficiente stock para realizar la salida.");
      return;
    }
    // Obtener usuario actual
    const usuario = await obtenerInfoUsuario();
    if (!usuario.id) {
      setError("No se pudo obtener el usuario actual. Inicia sesión nuevamente.");
      return;
    }
    // Registrar movimiento en inventario_movimientos
  const stock_antes = stockActual;
  const cantidad = Number(form.cantidad);
  const stock_despues = form.tipo === "entrada" ? stock_antes + cantidad : stock_antes - cantidad;
    // Obtener valor_compra del producto seleccionado
    let valor_compra = null;
    const productoSel = productos.find(p => p.id === form.producto_id);
    valor_compra = productoSel?.valor_compra ?? null;
    const { error: movError } = await supabase.from("inventario_movimientos").insert([
      {
        producto_id: form.producto_id,
        proveedor_id: form.tipo === "entrada" ? form.proveedor_id : null,
        tipo: form.tipo,
        cantidad,
        stock_antes,
        stock_despues,
        motivo: form.motivo,
        fecha: new Date().toISOString(),
        usuario_id: usuario.id,
        valor_compra: form.tipo === "entrada" ? valor_compra : null
      }
    ]);
    if (movError) {
      setError("Error al registrar movimiento: " + movError.message);
      return;
    }
    // Ya no se actualiza el stock en productos, se calcula dinámicamente
    setSuccess("Movimiento registrado correctamente.");
    setForm({ producto_id: "", proveedor_id: "", tipo: "entrada", cantidad: "", motivo: "" });
    setStockActual(null);
    cargarProductos();
  };

  return (
    <div className="inventario-registro-panel">
      <h2>Registrar Movimiento de Inventario</h2>
      <form className="inventario-registro-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Producto</label>
          <select name="producto_id" value={form.producto_id} onChange={handleChange} required>
            <option value="">Selecciona un producto</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label>Tipo</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} required>
            <option value="entrada">Entrada</option>
            <option value="baja">Baja</option>
            <option value="consumo">Consumo</option>
          </select>
        </div>
        {form.tipo === "entrada" && (
          <div className="form-row">
            <label>Proveedor</label>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <select name="proveedor_id" value={form.proveedor_id} onChange={handleChange} required>
                <option value="">Selecciona un proveedor</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              {form.proveedor_id && (
                <img
                  src={`${(proveedores.find(p=>p.id===form.proveedor_id)?.imagen_url)||IMAGEN_PROVEEDOR_DEFAULT}`}
                  alt="Proveedor"
                  style={{width:40,height:40,borderRadius:8,objectFit:'cover',border:'1px solid #eee'}}
                />
              )}
            </div>
          </div>
        )}
        <div className="form-row">
          <label>Cantidad</label>
          <input type="number" name="cantidad" value={form.cantidad} onChange={handleChange} min="1" required />
        </div>
        <div className="form-row">
          <label>Motivo</label>
          <input type="text" name="motivo" value={form.motivo} onChange={handleChange} maxLength={100} />
        </div>
        {stockActual !== null && (
          <div className="form-row">
            <span>Stock actual: <b>{stockActual}</b></span>
          </div>
        )}
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <button type="submit" className="btn-registrar">Registrar movimiento</button>
      </form>
    </div>
  );
}
