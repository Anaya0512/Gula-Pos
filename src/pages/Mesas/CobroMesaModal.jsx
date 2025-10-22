
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { guardarDocumentoVenta } from "../../services/documentosService";
import "../../styles/CobroMesaModal.css";
import NotificacionFlotante from "../../components/NotificacionFlotante";
import FacturaVenta from "./FacturaVenta";



export default function CobroMesaModal({ productos, total, onClose, onCobrar, mesaId, usuarioId, ordenId }) {
  console.log('--- CobroMesaModal MOUNT ---');
  console.log('productos prop:', productos);
  console.log('total prop:', total);
  console.log('mesaId:', mesaId, 'usuarioId:', usuarioId, 'ordenId:', ordenId);
  // Obtener nombre del usuario desde localStorage
  const usuarioLocal = localStorage.getItem("usuario_actual");
  const usuario = usuarioLocal ? JSON.parse(usuarioLocal) : null;
  const [items, setItems] = useState([]);
  // Seleccionar todos los productos por defecto cada vez que se abre el modal
  useEffect(() => {
  console.log('useEffect productos:', productos);
  setItems(productos.map(p => ({ ...p, seleccionado: true })));
  console.log('items state after set:', productos.map(p => ({ ...p, seleccionado: true })));
  }, [productos]);
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState(null);
  const [showFactura, setShowFactura] = useState(false);
  // Cargar clientes y seleccionar por defecto 'Cliente final'
  useEffect(() => {
    const fetchClientes = async () => {
      const { data } = await supabase.from("clientes").select("*").order("id");
      console.log('Clientes cargados:', data);
      setClientes(data || []);
      // Buscar cliente por defecto: consumidor final, cliente final, o el primero
      let clienteFinal = data?.find(c => c.nombre?.toLowerCase().includes("consumidor final"));
      if (!clienteFinal) clienteFinal = data?.find(c => c.nombre?.toLowerCase().includes("cliente final"));
      if (!clienteFinal && data?.length) clienteFinal = data[0];
      setClienteId(clienteFinal?.id || null);
    };
    fetchClientes();
  }, []);
  const [processing, setProcessing] = useState(false);
  const [consumoInterno, setConsumoInterno] = useState(false);
  const [mediosPago, setMediosPago] = useState([]);
  const [medioSeleccionado, setMedioSeleccionado] = useState("");
  const [notificacion, setNotificacion] = useState("");

  useEffect(() => {
    const cargarMedios = async () => {
      const { data } = await supabase.from("medios_pago").select("*").order("id");
      setMediosPago(data || []);
      if (data && data.length > 0) setMedioSeleccionado(data[0].nombre);
    };
    cargarMedios();
  }, []);

  const toggleSeleccionado = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, seleccionado: !i.seleccionado } : i));
  };
  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = items.filter(it => it.seleccionado).reduce((acc, it) => acc + (consumoInterno ? 0 : it.precio * it.cantidad), 0);

  // Guardar venta y detalles en las tablas nuevas
  const realizarVenta = async () => {
  console.log('--- realizarVenta ---');
  console.log('items:', items);
  // seleccionados se declara más abajo
  console.log('mesaId:', mesaId, 'usuarioId:', usuarioId, 'clienteId:', clienteId, 'medioSeleccionado:', medioSeleccionado);
    const seleccionados = items.filter(i => i.seleccionado);
    if (!seleccionados || seleccionados.length === 0) {
      setNotificacion("No hay productos seleccionados para facturar");
      setTimeout(() => setNotificacion("") , 2000);
      return;
    }
    if (!mesaId || !usuarioId || !medioSeleccionado || !clienteId) {
      setNotificacion("Faltan datos requeridos para la venta");
      setTimeout(() => setNotificacion("") , 3000);
      return;
    }
    setProcessing(true);
    try {
      let ventaId = ordenId;
      let errorVenta = null;
      // Si hay una venta pendiente, actualizarla a vendida
      if (ordenId) {
        const { error } = await supabase.from("ventas").update({
          estado: "vendida",
          total: subtotal,
          cliente_id: clienteId,
          usuario_id: usuarioId,
          metodo_pago: medioSeleccionado
        }).eq("id", ordenId);
        errorVenta = error;
      } else {
        // Si no hay venta pendiente, crear una nueva
        const ventaPayload = {
          mesa_id: mesaId,
          cliente_id: clienteId,
          usuario_id: usuarioId,
          estado: "vendida",
          total: subtotal,
          creado_en: new Date().toISOString(),
          metodo_pago: medioSeleccionado
        };
        const { data: nuevaVenta, error } = await supabase.from("ventas").insert([ventaPayload]).select();
        errorVenta = error;
        if (!error && nuevaVenta && nuevaVenta[0]?.id) {
          ventaId = nuevaVenta[0].id;
        }
      }
      if (errorVenta || !ventaId) {
        setNotificacion("No se pudo completar la venta");
        setProcessing(false);
        return;
      }
      // Eliminar detalles anteriores si existían (solo si era venta pendiente)
      if (ordenId) {
        await supabase.from("detalle_venta").delete().eq("venta_id", ordenId);
      }
      // Insertar detalles de la venta
      const detalles = seleccionados.map(prod => ({
        venta_id: ventaId,
        producto_id: prod.id,
        cantidad: prod.cantidad,
        precio_unitario: prod.precio,
        subtotal: prod.precio * prod.cantidad
      }));
      const { error: errorDetalle } = await supabase.from("detalle_venta").insert(detalles);
      if (errorDetalle) {
        setNotificacion("Error al guardar detalles de la venta: " + errorDetalle.message);
        setProcessing(false);
        return;
      }
      // Guardar comprobante/factura en documentos_ventas
      const clienteObj = clientes.find(c => c.id === clienteId);
      const docVenta = {
        fecha: new Date().toISOString(),
        mesa: mesaId,
        vendedor: usuario?.nombre || "—",
        cliente: clienteObj?.nombre || "—",
        documento: ventaId,
        telefono: clienteObj?.telefono || "",
        mediopago: medioSeleccionado,
        pagadocon: medioSeleccionado,
        valorventa: subtotal
      };
      const { error: errorDoc } = await guardarDocumentoVenta(docVenta);
      if (errorDoc) {
        setNotificacion("Error al guardar comprobante de venta: " + errorDoc.message);
      } else {
        setNotificacion("Venta realizada correctamente");
      }
      setItems([]);
      setShowFactura(ventaId);
    } catch (err) {
      setNotificacion("Error al realizar la venta: " + (err.message || err.toString()));
      setTimeout(() => setNotificacion("") , 4000);
    }
    setProcessing(false);
  };

  if (showFactura) {
    // Mostrar factura profesional y solo cerrar el modal al cerrar la factura
    return <FacturaVenta ordenId={showFactura} onClose={() => {
      setShowFactura(false);
      // Limpiar carrito y productos pendientes al cerrar factura
      setItems([]);
      if (typeof onClose === 'function') onClose([], true);
    }} />;
  }
  return (
  <div className="cobro-modal-bg">
    <div className="cobro-modal cobro-modal-cart" style={{maxWidth:'900px', width:'100%', minWidth:'520px', padding:'32px 32px 24px 32px', boxSizing:'border-box'}}>
      {notificacion && <NotificacionFlotante mensaje={notificacion} tipo={notificacion.includes("Error") ? "error" : "success"} />}
      <h2>Atendido por: {usuario?.nombre || "—"}</h2>
      <div className="cart-list robust">
        <div className="cart-row header">
          <div className="cart-check-col"></div>
          <div className="cart-name-col">Producto</div>
          <div className="cart-qty-col">Cant.</div>
          <div className="cart-price-col">Precio</div>
          <div className="cart-action-col"></div>
        </div>
        {items.map(item => (
          <div className="cart-row robust" key={item.id}>
            <div className="cart-check-col">
              <input type="checkbox" className="robust-checkbox" checked={!!item.seleccionado} onChange={()=>toggleSeleccionado(item.id)} />
            </div>
            <div className="cart-name-col">{item.nombre}</div>
            <div className="cart-qty-col">{item.cantidad}</div>
            <div className="cart-price-col">{(consumoInterno && item.seleccionado) ? '$0' : `$${(item.precio * item.cantidad).toLocaleString('es-CO')}`}</div>
            <div className="cart-action-col">
              <button className="remove-btn robust" onClick={()=>removeItem(item.id)}>Cancelar</button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total robust">Total: ${subtotal.toFixed(2)}</div>
      <div className="cart-options-bar">
        {/* Organización vertical de forma de pago y cliente */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24,width:'100%',margin:'24px 0'}}>
          <div className="cart-payment-bar" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,width:'100%'}}>
            <span className="pago-label" style={{fontWeight:600,marginBottom:2}}>Forma de pago:</span>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',width:'100%'}}>
              {mediosPago.map((medio, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={
                    'btn-pago' + (medioSeleccionado === medio.nombre ? ' btn-pago-activo' : '')
                  }
                  style={{
                    padding:'4px 12px',
                    borderRadius:6,
                    border: medioSeleccionado === medio.nombre ? '2px solid #1976d2' : '1px solid #ccc',
                    background: medioSeleccionado === medio.nombre ? '#e3f2fd' : '#fff',
                    color: medioSeleccionado === medio.nombre ? '#1976d2' : '#333',
                    fontWeight:500,
                    cursor:'pointer',
                    fontSize:15,
                    minWidth:'80px',
                    height:'36px',
                    boxSizing:'border-box'
                  }}
                  onClick={()=>setMedioSeleccionado(medio.nombre)}
                >
                  {medio.nombre}
                </button>
              ))}
              <button
                type="button"
                className={consumoInterno ? 'btn-pago btn-pago-activo' : 'btn-pago'}
                style={{
                  padding:'4px 12px',
                  borderRadius:6,
                  border: consumoInterno ? '2px solid #1976d2' : '1px solid #ccc',
                  background: consumoInterno ? '#e3f2fd' : '#fff',
                  color: consumoInterno ? '#1976d2' : '#333',
                  fontWeight:500,
                  cursor:'pointer',
                  fontSize:15,
                  minWidth:'80px',
                  height:'36px',
                  boxSizing:'border-box'
                }}
                onClick={()=>setConsumoInterno(v=>!v)}
              >
                Consumo interno
              </button>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',gap:8}}>
            <label style={{fontWeight:600,marginBottom:4}}>Cliente:</label>
            <select value={clienteId || ""} onChange={e=>setClienteId(e.target.value)} style={{padding:'8px 16px',borderRadius:6,border:'1px solid #ccc',minWidth:220,fontSize:15}}>
              {clientes.map(c=>(
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:'16px',width:'100%'}}>
              <button className="btn-secondary" onClick={()=>onClose()} disabled={processing} style={{padding:'6px 18px',height:'36px',fontSize:'15px',borderRadius:'6px'}}>Cancelar</button>
              <button className="btn-primary" onClick={realizarVenta} disabled={processing || items.filter(i => i.seleccionado).length === 0} style={{padding:'6px 18px',height:'36px',fontSize:'15px',borderRadius:'6px'}}>Vender</button>
            </div>
          </div>
        </div>
        <div className="cart-actions robust">
          {/* Botones eliminados, ahora solo están debajo del selector de cliente */}
        </div>
      </div>
    </div>
  </div>
  );
}
