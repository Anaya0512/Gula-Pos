import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { obtenerInfoUsuario } from "../utils/usuarioActual";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";
import "../styles/CategoriasAdmin.css";

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoImagenFile, setNuevoImagenFile] = useState(null);
  const [nuevoImagenPreview, setNuevoImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    const { data, error } = await supabase.from("categorias").select("*");
    if (!error) setCategorias(data || []);
  };

  const obtenerNombreArchivo = (url) => {
    const partes = url.split("/");
    return partes[partes.length - 1].split("?")[0];
  };

  const eliminarImagen = async (url) => {
    const nombreArchivo = obtenerNombreArchivo(url);
    await supabase.storage.from("imagenes").remove([nombreArchivo]);
  };



  const agregarCategoria = async () => {
    setLoading(true);
    let urlImagen = "";
    if (nuevoImagenFile) {
      const nombreArchivo = `categoria-${Date.now()}.${nuevoImagenFile.name.split(".").pop()}`;
      const { error: imgError } = await supabase.storage.from("imagenes").upload(nombreArchivo, nuevoImagenFile);
      if (!imgError) {
        urlImagen = supabase.storage.from("imagenes").getPublicUrl(nombreArchivo).data.publicUrl;
      }
    }
  await obtenerInfoUsuario();
  const categoriaFinal = { nombre: nuevoNombre, imagen: urlImagen };
    const { error } = await supabase.from("categorias").insert([categoriaFinal]);
    setLoading(false);
    if (error) {
      mostrarNotificacionGlobal("❌ Error al agregar categoría", "error");
    } else {
  mostrarNotificacionGlobal(`✅ Categoría creada`, "exito");
      setModalNuevo(false);
      setNuevoNombre("");
      setNuevoImagenFile(null);
      setNuevoImagenPreview(null);
      cargarCategorias();
    }
  };

  const iniciarEdicion = (cat) => {
    setEditandoId(cat.id);
    setEditNombre(cat.nombre);
  };


  const actualizarCategoria = async () => {
    setLoading(true);
    // Aquí deberías subir la imagen a supabase y obtener la URL
    await supabase.from("categorias").update({ nombre: editNombre }).eq("id", editandoId);
    setEditandoId(null);
    setEditNombre("");
    const { data } = await supabase.from("categorias").select("*").eq("activo", true);
    setCategorias(data || []);
    setLoading(false);
  };

  const eliminarCategoria = async (id) => {
  await obtenerInfoUsuario();
    const categoria = categorias.find((cat) => cat.id === id);
    if (categoria?.imagen) await eliminarImagen(categoria.imagen);
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) {
      mostrarNotificacionGlobal("❌ No se pudo eliminar la categoría", "error");
    } else {
  mostrarNotificacionGlobal(`✅ Categoría eliminada`, "exito");
      cargarCategorias();
    }
  };


  return (
    <div className="categorias-admin-container">
      <h2>Categorías</h2>
      <div className="categorias-admin-bar">
        <button className="btn-primary" onClick={()=>setModalNuevo(true)}>
          <span className="icono-mas">+</span> Nueva categoría
        </button>
      </div>

      {modalNuevo && (
        <div className="modal-bg">
          <div className="modal-categoria">
            <h3>Nueva categoría</h3>
            <div className="formulario-categoria">
              <label>Nombre</label>
              <input type="text" value={nuevoNombre} onChange={e=>setNuevoNombre(e.target.value)} placeholder="Nombre de categoría" />
              <label>Imagen</label>
              <input type="file" accept="image/*" onChange={e=>{
                const file = e.target.files[0];
                setNuevoImagenFile(file);
                setNuevoImagenPreview(file ? URL.createObjectURL(file) : null);
              }} />
              {nuevoImagenPreview && <img src={nuevoImagenPreview} alt="preview" className="preview" />}
              <div className="modal-actions">
                <button className="btn-primary" onClick={agregarCategoria} disabled={loading || !nuevoNombre.trim()}>Guardar</button>
                <button className="btn-secondary" onClick={()=>setModalNuevo(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="categorias-table">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th style={{ textAlign: "center" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((cat) => (
              <tr key={cat.id}>
                <td style={{ width: "70px", textAlign: "center" }}>
                  {cat.imagen ? (
                    <img src={cat.imagen} alt={cat.nombre} className="categoria-img" />
                  ) : (
                    <span className="categoria-img-placeholder">Sin imagen</span>
                  )}
                </td>
                <td style={{ verticalAlign: "middle" }}>
                  {editandoId === cat.id ? (
                    <input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />
                  ) : (
                    <span className="categoria-nombre">{cat.nombre}</span>
                  )}
                </td>
                <td className="acciones-cell">
                  {editandoId === cat.id ? (
                    <>
                      <button className="btn-primary" onClick={actualizarCategoria} disabled={loading}>Guardar</button>
                      <button className="btn-secondary" onClick={() => setEditandoId(null)}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-primary" onClick={() => iniciarEdicion(cat)}>Editar</button>
                      <button className="btn-secondary" onClick={() => eliminarCategoria(cat.id)} title="Eliminar">Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
