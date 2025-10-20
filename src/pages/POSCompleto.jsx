import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";
import "../styles/POSCompleto.css";

export default function POSCompleto() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada) {
      cargarProductosPorCategoria(categoriaSeleccionada);
    }
  }, [categoriaSeleccionada]);

  const cargarCategorias = async () => {
    const { data } = await supabase.from("categorias").select("*").eq("activo", true);
    setCategorias(data || []);
  };

  const cargarProductosPorCategoria = async (categoriaId) => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("categoria_id", categoriaId)
      .eq("activo", true);
    setProductos(data || []);
  };

  const agregarAlCarrito = (producto) => {
    const item = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      observacion: "",
      total: producto.precio,
    };
    setCarrito((prev) => [...prev, item]);
    mostrarNotificacionGlobal(`✅ ${producto.nombre} agregado al carrito`, "exito");
  };

  const registrarVenta = async () => {
    if (carrito.length === 0) {
      mostrarNotificacionGlobal("⚠️ No hay productos para registrar", "advertencia");
      return;
    }

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
      mostrarNotificacionGlobal("❌ Error al registrar ventas", "error");
    } else {
      mostrarNotificacionGlobal("✅ Venta registrada exitosamente", "exito");
      setCarrito([]);
    }
  };

  const totalVenta = carrito.reduce((acc, item) => acc + item.total, 0);
  return (
    <div className="pos-completo">
      <h2>Selecciona una categoría</h2>
      <div className="categorias-grid">
        {categorias.map((cat) => (
          <div
            key={cat.id}
            className={`categoria-card ${categoriaSeleccionada === cat.id ? "seleccionada" : ""}`}
            onClick={() => setCategoriaSeleccionada(cat.id)}
          >
            <img src={cat.imagen} alt={cat.nombre} />
            <h3>{cat.nombre}</h3>
          </div>
        ))}
      </div>

      {categoriaSeleccionada && (
        <>
          <h3>Productos</h3>
          <div className="productos-grid">
            {productos.map((prod) => (
              <div
                key={prod.id}
                className="producto-card producto-touch"
                onClick={() => agregarAlCarrito(prod)}
                title="Toca para agregar"
              >
                <img src={prod.imagen_url} alt={prod.nombre} />
                <h3>{prod.nombre}</h3>
                <p>${prod.precio}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="carrito">
        <h3>🛒 Carrito de venta</h3>
        {carrito.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          <ul>
            {carrito.map((item, index) => (
              <li key={index}>
                {item.cantidad} × {item.nombre} (${item.total})
              </li>
            ))}
          </ul>
        )}
        <p><strong>Total acumulado:</strong> ${totalVenta}</p>
        <button onClick={registrarVenta}>Registrar venta</button>
      </div>
    </div>
  );
}
