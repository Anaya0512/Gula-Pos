import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/ProductosPOS.css";

export default function ProductosPOS() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    const cargarProductos = async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true);

      if (error) {
        console.error("Error al cargar productos:", error);
      } else {
        setProductos(data);
      }
    };

    cargarProductos();
  }, []);

  const agregarAlCarrito = () => {
    const item = {
      id: productoSeleccionado.id,
      nombre: productoSeleccionado.nombre,
      precio: productoSeleccionado.precio,
      cantidad,
      observacion,
      total: cantidad * productoSeleccionado.precio,
    };

    setCarrito([...carrito, item]);
    cerrarModal();
  };

  const cerrarModal = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
    setObservacion("");
  };

  const registrarVenta = async () => {
    if (carrito.length === 0) return;

    const fecha = new Date().toISOString();
    const usuario_id = "25ebf2b5-e2e6-4544-a76e-e7cfceca5357"; // temporal
    const mesa = "A1"; // temporal

    const ventas = carrito.map((item) => ({
      producto: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      total: item.total,
      fecha,
      usuario_id,
      mesa,
    }));

    const { error } = await supabase.from("ventas").insert(ventas);

    if (error) {
      console.error("Error al registrar ventas:", error);
      alert("❌ Error al registrar ventas.");
    } else {
      alert("✅ Venta registrada exitosamente.");
      setCarrito([]);
    }
  };

  return (
    <div className="pos-container">
      <h2>Selecciona un producto</h2>
      <div className="productos-grid">
        {productos.map((prod) => (
          <div key={prod.id} className="producto-card">
            <img src={prod.imagen_url} alt={prod.nombre} />
            <h3>{prod.nombre}</h3>
            <p>${prod.precio}</p>
            <button onClick={() => setProductoSeleccionado(prod)}>Agregar</button>
          </div>
        ))}
      </div>

      {productoSeleccionado && (
        <div className="modal">
          <div className="modal-content">
            <h3>{productoSeleccionado.nombre}</h3>
            <p>Precio: ${productoSeleccionado.precio}</p>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value))}
              placeholder="Cantidad"
            />
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Observación"
            />
            <p><strong>Total:</strong> ${cantidad * productoSeleccionado.precio}</p>
            <button onClick={agregarAlCarrito}>Confirmar</button>
            <button onClick={cerrarModal}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="carrito">
        <h3>Carrito de venta</h3>
        {carrito.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          <ul>
            {carrito.map((item, index) => (
              <li key={index}>
                {item.cantidad} × {item.nombre} (${item.total}) {item.observacion && `- ${item.observacion}`}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={registrarVenta}
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#e5ff00ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Registrar venta
        </button>
      </div>
    </div>
  );
}
