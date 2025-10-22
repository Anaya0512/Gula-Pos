import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";
import "../styles/ProductosAdmin.css";

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [imagenFile, setImagenFile] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: 0,
    valor_compra: 0,
    imagen_url: "",
    categoria_id: "",
    proveedor_id: "",
    stock_minimo: 0,
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);



  // Cargar datos de productos, categorías y proveedores desde Supabase
  const cargarDatos = async () => {
    try {
      const [{ data: productosData }, { data: categoriasData }, { data: proveedoresData }] = await Promise.all([
        supabase.from("productos").select("*"),
        supabase.from("categorias").select("*").eq("activo", true),
        supabase.from("proveedores").select("*").eq("activo", true),
      ]);
      setProductos(productosData || []);
      setCategorias(categoriasData || []);
      setProveedores(proveedoresData || []);
    } catch (error) {
      mostrarNotificacionGlobal("Error al cargar datos", "error");
      setProductos([]);
      setCategorias([]);
      setProveedores([]);
    }
  };

  // Filtro de productos según búsqueda y categoría
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre?.toLowerCase().includes(buscar.toLowerCase());
    const coincideCategoria = categoriaFiltro === "todos" || prod.categoria_id === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

  // Iniciar edición de producto
  const iniciarEdicion = (prod) => {
    setModoEdicion(prod.id);
    setNuevoProducto({ ...prod });
    setImagenPreview(prod.imagen_url);
  };

  // Eliminar producto
  const eliminarProducto = async (id) => {
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      mostrarNotificacionGlobal("Error al eliminar", "error");
    } else {
      mostrarNotificacionGlobal("Eliminado", "exito");
      await cargarDatos();
    }
  };

  // Manejar archivo de imagen
  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    setImagenFile(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  // Resetear formulario
  const resetFormulario = () => {
    setModoEdicion(null);
    setImagenPreview(null);
    setNuevoProducto({
      nombre: "",
      precio: 0,
      valor_compra: 0,
      imagen_url: "",
      categoria_id: "",
      proveedor_id: "",
      stock_minimo: 0,
      activo: true,
    });
  };

  // Actualizar producto
  const actualizarProducto = async () => {
    let imagen_url = nuevoProducto.imagen_url;
    if (imagenFile) {
      // Subir nueva imagen si se seleccionó
      const extension = imagenFile.name.split('.').pop();
      const nombreArchivo = `producto-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from("imagenes").upload(nombreArchivo, imagenFile);
      if (error) {
        mostrarNotificacionGlobal("Error al subir imagen", "error");
        return;
      }
      // Generar URL pública manualmente
      imagen_url = `https://kxymgcmgjlakgtzhfden.supabase.co/storage/v1/object/public/imagenes/${nombreArchivo}`;
    }
    const { id, ...resto } = nuevoProducto;
    const { error } = await supabase.from("productos").update({ ...resto, imagen_url }).eq("id", id);
    if (error) {
      mostrarNotificacionGlobal("Error al actualizar", "error");
    } else {
      mostrarNotificacionGlobal("Guardado", "exito");
      await cargarDatos();
    }
    resetFormulario();
  };

  // Agregar producto
  const agregarProducto = async () => {
    if (!imagenFile || !imagenFile.name) {
      mostrarNotificacionGlobal("La imagen es obligatoria", "error");
      console.log("[ERROR] No hay archivo de imagen válido", imagenFile);
      return;
    }
    // Generar nombre de archivo igual al formato anterior
    const extension = imagenFile.name.split('.').pop();
    const nombreArchivo = `producto-${Date.now()}.${extension}`;
    console.log("[INFO] Subiendo imagen:", nombreArchivo, imagenFile);
    const { data, error: imgError } = await supabase.storage.from("imagenes").upload(nombreArchivo, imagenFile);
    console.log("[RESULT] upload:", { data, imgError });
    if (imgError) {
      mostrarNotificacionGlobal("Error al subir imagen", "error");
      return;
    }
    // Generar URL pública manualmente
    const urlPublica = `https://kxymgcmgjlakgtzhfden.supabase.co/storage/v1/object/public/imagenes/${nombreArchivo}`;
    console.log("[INFO] URL pública:", urlPublica);
    const productoFinal = { ...nuevoProducto, imagen_url: urlPublica };
    console.log("[INFO] Guardando producto en base:", productoFinal);
    const { error } = await supabase.from("productos").insert([productoFinal]);
    console.log("[RESULT] insert:", { error });
    if (error) {
      mostrarNotificacionGlobal("Error al guardar", "error");
    } else {
      mostrarNotificacionGlobal("Guardado", "exito");
      await cargarDatos();
    }
    resetFormulario();
  };




  // Tabla de productos
  const renderTablaProductos = () => (
    <table className="tabla-productos">
      <thead>
        <tr style={{ background: "#f5f5f5" }}>
          <th style={{ textAlign: "center" }}>Imagen</th>
          <th>Categoría</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Proveedor</th>
          <th>Estado</th>
          <th style={{ textAlign: "center" }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productosFiltrados.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ textAlign: "center", color: "#222" }}>
              No hay productos registrados.
            </td>
          </tr>
        ) : null}
        {productosFiltrados.length > 0 && productosFiltrados.map((prod) => {
          const categoria = categorias.find((c) => c.id === prod.categoria_id);
          const proveedor = proveedores.find((p) => p.id === prod.proveedor_id);
          return (
            <tr key={prod.id} style={{ verticalAlign: "middle", color: "#222" }}>
              <td style={{ textAlign: "center" }}>
                <img
                  src={`${prod.imagen_url}?v=${Date.now()}`}
                  alt={prod.nombre}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </td>
              <td>{categoria?.nombre || "Sin categoría"}</td>
              <td>{prod.nombre}</td>
              <td>${prod.precio}</td>
              <td>{proveedor?.nombre || "Sin proveedor"}</td>
              <td>
                <span
                  style={{
                    background: prod.activo ? "#00c853" : "#d50000",
                    color: "#fff",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontWeight: "bold",
                  }}
                >
                  {prod.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td style={{ textAlign: "center" }}>
                <button
                  style={{
                    background: "#007aff",
                    color: "#fff",
                    marginRight: 8,
                  }}
                  onClick={() => {
                    iniciarEdicion(prod);
                    setMostrarFormulario(true);
                  }}
                >
                  Editar
                </button>
                <button
                  style={{
                    background: "#d50000",
                    color: "#fff",
                  }}
                  onClick={() => eliminarProducto(prod.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  if (categorias.length === 0 || proveedores.length === 0) {
    return (
      <div className="productos-admin">
        <div className="formulario-container">
          <h2>Agregar nuevo producto</h2>
          {categorias.length === 0 && (
            <p className="alerta">⚠️ No hay categorías activas disponibles. Por favor, crea una categoría primero.</p>
          )}
          {proveedores.length === 0 && (
            <p className="alerta">⚠️ No hay proveedores activos disponibles. Por favor, crea un proveedor primero.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="productos-admin">
      {/* Barra de categorías */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          style={{
            background: categoriaFiltro === "todos" ? "#b71c1c" : "#eee",
            color: categoriaFiltro === "todos" ? "#fff" : "#222",
            fontWeight: "bold",
            border: "none",
            borderRadius: 6,
            padding: "0.5rem 1.2rem",
          }}
          onClick={() => setCategoriaFiltro("todos")}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            style={{
              background: categoriaFiltro === cat.id ? "#b71c1c" : "#eee",
              color: categoriaFiltro === cat.id ? "#fff" : "#222",
              fontWeight: "bold",
              border: "none",
              borderRadius: 6,
              padding: "0.5rem 1.2rem",
            }}
            onClick={() => setCategoriaFiltro(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Barra de búsqueda y botón nuevo */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem", gap: "1rem", justifyContent: "space-between" }}>
        <input
          type="text"
          placeholder="Buscar..."
          style={{ maxWidth: 220 }}
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <button
          style={{
            background: "#222",
            color: "#fff",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
          onClick={() => setMostrarFormulario(true)}
        >
          <span style={{ fontSize: "1.2em", fontWeight: "bold" }}>+</span> Nuevo
        </button>
      </div>

      {/* Modal de formulario de producto */}
      {mostrarFormulario && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="formulario-container"
            style={{
              maxWidth: 600,
              margin: "0 auto",
              marginBottom: "2rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                marginBottom: "1rem",
                color: "#222",
              }}
            >
              {modoEdicion ? "Editar producto" : "Agregar nuevo producto"}
            </h2>
            <form
              className="formulario-producto"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <label>Nombre*</label>
                <input
                  type="text"
                  value={nuevoProducto.nombre}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                  required
                />
                <label>Precio venta</label>
                <input
                  type="number"
                  value={nuevoProducto.precio || ""}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) || 0 })}
                  required
                />
                <label>Valor de compra</label>
                <input
                  type="number"
                  value={nuevoProducto.valor_compra || ""}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, valor_compra: parseFloat(e.target.value) || 0 })}
                  required
                />
                <label>Stock mínimo</label>
                <input
                  type="number"
                  value={nuevoProducto.stock_minimo || ""}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock_minimo: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label>Categoría*</label>
                <select
                  value={nuevoProducto.categoria_id}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria_id: e.target.value })}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <label>Proveedor</label>
                <select
                  value={nuevoProducto.proveedor_id}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, proveedor_id: e.target.value })}
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
                <label>Imagen</label>
                <input type="file" accept="image/*" onChange={manejarArchivo} />
                {imagenPreview && <img src={imagenPreview} alt="Preview" className="preview" style={{ marginTop: 8 }} />}
                <label>
                  <span style={{ marginRight: 8 }}>Activo</span>
                  <span className="switch-toggle">
                    <input
                      type="checkbox"
                      id="activo-switch"
                      checked={nuevoProducto.activo}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, activo: e.target.checked })}
                      style={{ display: 'none' }}
                    />
                    <span className="slider"></span>
                  </span>
                </label>
              </div>
              <div
                style={{
                  gridColumn: "1/3",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  type="button"
                  style={{
                    background: "#d50000",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    resetFormulario();
                    setMostrarFormulario(false);
                  }}
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  style={{
                    background: "#007aff",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    modoEdicion ? actualizarProducto() : agregarProducto();
                    setMostrarFormulario(false);
                  }}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      {renderTablaProductos()}
    </div>
  );
}
