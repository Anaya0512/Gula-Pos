import React, { useEffect, useState } from "react";
import NotificacionFlotante from "../../components/NotificacionFlotante";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import CobroMesaModal from "./CobroMesaModal";
import { useNavigate } from "react-router-dom";
import "../../styles/MesaPedido.css";
import "../../styles/ProductosAdmin.css";

export default function MesaPedido() {
  // Estado visual de la mesa
  const [estadoMesa, setEstadoMesa] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  // Obtener usuario logueado desde localStorage
  const usuarioLocal = localStorage.getItem("usuario_actual");
  const usuario = usuarioLocal ? JSON.parse(usuarioLocal) : null;
  const [categorias, setCategorias] = useState([]);
  // Estado para detectar si el carrito ha cambiado desde el último guardado
  const [carritoGuardado, setCarritoGuardado] = useState(true);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [pedidoId, setPedidoId] = useState(null);
  const [showCobro, setShowCobro] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [nombreMesa, setNombreMesa] = useState("");

  // Cargar datos iniciales y nombre de la mesa
  const fetchPedido = async () => {
    const { data, error } = await supabase
      .from("ventas")
      .select("id,mesa_id,estado,total,creado_en")
      .eq("mesa_id", id)
      .in("estado", ["pendiente", "vendida"])
      .order("creado_en", { ascending: false })
      .limit(1);
    if (error) {
      console.error('Error al consultar pedidos:', error);
  setCarrito([]);
  setPedidoId(null);
      return;
    }
    if (data && data.length > 0) {
      const venta = data[0];
  setPedidoId(venta.id);
      if (venta.estado === "pendiente") {
        // Consultar productos del pedido pendiente en detalle_venta
        const { data: detalles } = await supabase
          .from("detalle_venta")
          .select("cantidad, precio_unitario, producto_id")
          .eq("venta_id", venta.id);
        if (detalles && detalles.length > 0) {
          // Buscar productos faltantes en el estado
          const idsFaltantes = detalles
            .filter(d => !productos.find(p => p.id === d.producto_id))
            .map(d => d.producto_id);
          let productosExtra = [];
          if (idsFaltantes.length > 0) {
            const { data: extra } = await supabase
              .from("productos")
              .select("id, nombre, imagen_url")
              .in("id", idsFaltantes);
            productosExtra = extra || [];
          }
          const carritoInicial = detalles.map(d => {
            let prod = productos.find(p => p.id === d.producto_id);
            if (!prod) prod = productosExtra.find(p => p.id === d.producto_id) || {};
            return {
              id: d.producto_id,
              nombre: prod.nombre || "",
              precio: d.precio_unitario,
              cantidad: d.cantidad,
              imagen_url: prod.imagen_url || ""
            };
          });
          setCarrito(carritoInicial);
          setCarritoGuardado(true);
        } else {
          setCarrito([]);
          setCarritoGuardado(true);
        }
      } else {
        // Si el pedido está vendido, limpiar el carrito
        setCarrito([]);
        setCarritoGuardado(true);
      }
    }
  };

  const fetchMesa = async () => {
  const { data } = await supabase.from("mesas").select("nombre, estado").eq("id", id).single();
  setNombreMesa(data?.nombre || "");
  setEstadoMesa(data?.estado || "");
  // Estado visual de la mesa
  // (ya está definido arriba)
  };

  const fetchData = async () => {
    const { data: categoriasData } = await supabase.from("categorias").select("*").eq("activo", true);
    const { data: productosData } = await supabase.from("productos").select("*").eq("activo", true);
    setCategorias(categoriasData || []);
    setProductos(productosData || []);
    setCategoriaSeleccionada((categoriasData && categoriasData[0]?.id) || null);
  };

  useEffect(() => {
    fetchMesa();
    fetchData();
    fetchPedido();
    // Las funciones no cambian, solo el id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Funciones de carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setCarritoGuardado(false);
  };

  const eliminarDelCarrito = (idProducto) => {
    setCarrito((prev) => prev.filter((item) => item.id !== idProducto));
  setCarritoGuardado(false);
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  // Notificación flotante
  const [notificacion, setNotificacion] = useState("");

  // Guardar pedido
  const handleGuardar = async () => {
    console.log('Mesa ID:', id);
    console.log('Carrito a guardar:', carrito);
    setGuardando(true);
    if (carrito.length === 0) {
      setGuardando(false);
      setNotificacion("No hay productos para guardar");
      setTimeout(() => setNotificacion(""), 3000);
      return;
    }
    // Usar cliente y método de pago por defecto si no se especifican
    const CLIENTE_DEFECTO = "53835c2d-0cfe-47e6-a36e-090bd8c9450f"; // UUID del cliente final
    const METODO_PAGO_DEFECTO = "Efectivo";
    let ventaId = pedidoId;
    let error = null;
    if (pedidoId) {
      // Si ya hay pedido pendiente, actualizar total, estado y productos
      const { error: errorUpdate } = await supabase.from("ventas").update({
        total,
        estado: "pendiente",
        cliente_id: CLIENTE_DEFECTO,
        metodo_pago: METODO_PAGO_DEFECTO,
        usuario_id: usuario?.id || null
      }).eq("id", pedidoId);
      error = errorUpdate;
      // Eliminar detalles anteriores
      await supabase.from("detalle_venta").delete().eq("venta_id", pedidoId);
    } else {
      // Insertar venta pendiente nueva
      const ventaPayload = {
        mesa_id: id,
        estado: "pendiente",
        total,
        creado_en: new Date().toISOString(),
        cliente_id: CLIENTE_DEFECTO,
        metodo_pago: METODO_PAGO_DEFECTO,
        usuario_id: usuario?.id || null
      };
      const { data: nuevaVenta, error: errorInsert } = await supabase.from("ventas").insert([ventaPayload]).select();
      error = errorInsert;
      if (!error && nuevaVenta && nuevaVenta[0]?.id) {
        ventaId = nuevaVenta[0].id;
      }
    }
    if (!error && ventaId) {
      // Insertar productos en detalle_venta
      const detalles = carrito.map(item => ({
        venta_id: ventaId,
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad
      }));
      await supabase.from("detalle_venta").insert(detalles);
      // Cambiar estado de la mesa a ocupada
      await supabase.from("mesas").update({ estado: "ocupada" }).eq("id", id);
      setPedidoId(ventaId);
      setNotificacion("Guardado");
      setCarritoGuardado(true);
      setEstadoMesa("ocupada");
    } else {
      setNotificacion("Error al guardar pedido");
    }
    setGuardando(false);
    setTimeout(() => setNotificacion(""), 3000);
    // No volver a llamar setCarritoGuardado aquí, ya se hace arriba si fue exitoso
  };

  // Cobrar y guardar detalle en orden_detalle
  // Eliminar función no utilizada cobrarYGuardarDetalle

  // Render principal
  return (
  <div className={`mesa-pedido-flex mesa-estado-${estadoMesa}`}>
      {notificacion && <NotificacionFlotante mensaje={notificacion} tipo={notificacion.includes("Error") ? "error" : "success"} />}
      <div className="mesa-pedido-main">
        <h2>Mesa {nombreMesa ? nombreMesa : id}</h2>
        <div className="categorias-bar">
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={categoriaSeleccionada === cat.id ? "cat-btn selected" : "cat-btn"}
              onClick={() => setCategoriaSeleccionada(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        <div className="productos-lista">
          {productos.filter((prod) => prod.categoria_id === categoriaSeleccionada).length === 0 && (
            <p>No hay productos en esta categoría.</p>
          )}
          {productos.filter((prod) => prod.categoria_id === categoriaSeleccionada).map((prod) => (
            <div
              key={prod.id}
              className="producto-card compact clickable"
              onClick={() => agregarAlCarrito(prod)}
              tabIndex={0}
              role="button"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') agregarAlCarrito(prod); }}
            >
              {prod.imagen_url && (
                <img
                  src={prod.imagen_url}
                  alt={prod.nombre}
                  className="producto-img-pequena"
                />
              )}
              <div className="producto-nombre-precio">
                <span className="producto-nombre">{prod.nombre}</span>
                <span className="producto-precio">${prod.precio}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="carrito-panel mesa-pedido-carrito moderno">
        <h3>Carrito</h3>
        {carrito.length === 0 && <div className="carrito-vacio">Sin productos</div>}
        <div className="carrito-items-lista">
          {carrito.map((item) => (
            <div key={item.id} className="carrito-item compacto">
              <div className="carrito-item-info">
                <span className="carrito-item-nombre">{item.nombre}</span>
                <span className="carrito-item-precio">${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
              </div>
              <div className="carrito-item-controles centrado">
                <button className="carrito-cantidad-btn" onClick={() => {
                  setCarrito((prev) => prev.map((prod) => prod.id === item.id && prod.cantidad > 1 ? { ...prod, cantidad: prod.cantidad - 1 } : prod));
                  setCarritoGuardado(false);
                }}>-</button>
                <span className="carrito-cantidad">{item.cantidad}</span>
                <button className="carrito-cantidad-btn" onClick={() => {
                  setCarrito((prev) => prev.map((prod) => prod.id === item.id ? { ...prod, cantidad: prod.cantidad + 1 } : prod));
                  setCarritoGuardado(false);
                }}>+</button>
                <button className="carrito-eliminar-btn" onClick={() => eliminarDelCarrito(item.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="carrito-total moderno">Total: ${(total).toLocaleString('es-CO', {minimumFractionDigits: 0})}</div>
        <div className="carrito-acciones moderno">
          <button
            className="guardar-btn"
            onClick={handleGuardar}
            disabled={guardando || carrito.length === 0 || carritoGuardado}
          >
            {guardando ? "Guardando..." : "Hacer pedido"}
          </button>
          <button className="vender-btn" onClick={() => setShowCobro(true)} disabled={carrito.length === 0}>
            Vender
          </button>
        </div>
      </div>
      {showCobro && (
        <CobroMesaModal
          productos={carrito}
          total={total}
          mesaId={id}
          usuarioId={usuario?.id}
          ordenId={pedidoId}
          onClose={(restantes, ventaExitosa) => {
            setShowCobro(false);
            if (ventaExitosa) {
              setCarrito([]);
              supabase.from("mesas").update({ estado: "libre" }).eq("id", id);
              setEstadoMesa("libre");
              navigate("/mesas");
            } else if (Array.isArray(restantes)) {
              setCarrito(restantes);
            }
            setTimeout(() => {
              fetchPedido();
            }, 300);
          }}
        />
      )}
    </div>
  );
}
