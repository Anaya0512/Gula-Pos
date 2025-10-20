import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { obtenerInfoUsuario } from "../utils/usuarioActual";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";
import "../styles/ProductosAdmin.css";

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos");

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    precio: 0,
    imagen_url: "",
    categoria_id: "",
    proveedor_id: "",
    activo: true,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

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
      console.error("Error al cargar datos:", error);
    }
  };

  const obtenerNombreArchivo = (url) => {
    const partes = url.split("/");
    return partes[partes.length - 1].split("?")[0];
  };

  const eliminarImagen = async (url) => {
    const nombreArchivo = obtenerNombreArchivo(url);
    const { error } = await supabase.storage.from("imagenes").remove([nombreArchivo]);
    if (error) {
      console.error("❌ Error al eliminar imagen:", error);
    }
  };

  const subirImagen = async () => {
    if (!imagenFile) return null;
    const nombreArchivo = `producto-${Date.now()}.${imagenFile.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("imagenes").upload(nombreArchivo, imagenFile);
    if (error) {
      mostrarNotificacionGlobal("❌ No se pudo subir la imagen", "error");
      return null;
    }
    const urlPublica = supabase.storage.from("imagenes").getPublicUrl(nombreArchivo).data.publicUrl;
    return urlPublica;
  };

  const resetFormulario = () => {
    setNuevoProducto({
      nombre: "",
      precio: 0,
      imagen_url: "",
      categoria_id: "",
      proveedor_id: "",
      activo: true,
    });
    setImagenPreview(null);
    setImagenFile(null);
    setModoEdicion(null);
  };

  const agregarProducto = async () => {
  await obtenerInfoUsuario();
    const urlImagen = await subirImagen();
    const productoFinal = { ...nuevoProducto, imagen_url: urlImagen || "" };
    const { error } = await supabase.from("productos").insert([productoFinal]);
    if (error) {
      mostrarNotificacionGlobal("❌ Error al agregar producto", "error");
    } else {
  mostrarNotificacionGlobal(`✅ Producto creado`, "exito");
      resetFormulario();
      cargarDatos();
    }
  };

  const actualizarProducto = async () => {
  await obtenerInfoUsuario();
    let urlImagen = nuevoProducto.imagen_url;
    if (imagenFile) {
      const subida = await subirImagen();
      if (subida) urlImagen = subida;
      else {
        mostrarNotificacionGlobal("❌ No se pudo subir la nueva imagen", "error");
        return;
      }
    }
    const productoFinal = { ...nuevoProducto, imagen_url: urlImagen };
    const { error } = await supabase.from("productos").update(productoFinal).eq("id", modoEdicion);
    if (error) {
      mostrarNotificacionGlobal("❌ Error al actualizar producto", "error");
    } else {
  mostrarNotificacionGlobal(`✅ Producto editado`, "exito");
      resetFormulario();
      cargarDatos();
    }
  };

  const eliminarProducto = async (id) => {
  await obtenerInfoUsuario();
    const producto = productos.find((p) => p.id === id);
    if (producto?.imagen_url) await eliminarImagen(producto.imagen_url);
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      mostrarNotificacionGlobal("❌ Error al eliminar producto", "error");
    } else {
  mostrarNotificacionGlobal(`✅ Producto eliminado`, "exito");
      cargarDatos();
    }
  };

  const iniciarEdicion = (prod) => {
    setModoEdicion(prod.id);
    setNuevoProducto({ ...prod });
    setImagenPreview(prod.imagen_url);
    setImagenFile(null);
  };

  const manejarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenFile(archivo);
      setImagenPreview(URL.createObjectURL(archivo));
    }
  };
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre.toLowerCase().includes(buscar.toLowerCase());
    const coincideCategoria = categoriaFiltro === "todos" || prod.categoria_id === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

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
                <label>Precio</label>
                <input
                  type="number"
                  value={nuevoProducto.precio}
                  onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: parseFloat(e.target.value) })}
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
                  <input
                    type="checkbox"
                    checked={nuevoProducto.activo}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, activo: e.target.checked })}
                  />{" "}
                  Activo
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
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de productos actualizada */}
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: 8,
          padding: "1rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", color: "#222" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th></th>
              <th>Categoría</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#222" }}>
                  No hay productos registrados.
                </td>
              </tr>
            ) : (
              productosFiltrados.map((prod) => {
                const categoria = categorias.find((c) => c.id === prod.categoria_id);
                const proveedor = proveedores.find((p) => p.id === prod.proveedor_id);
                return (
                  <tr key={prod.id} style={{ verticalAlign: "middle", color: "#222" }}>
                    <td>
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
                    <td>
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
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
