import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { obtenerInfoUsuario } from "../utils/usuarioActual";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";
import "../styles/ProductosAdmin.css";
const IMAGEN_PROVEEDOR_DEFAULT = "https://kxymgcmgjlakgtzhfden.supabase.co/storage/v1/object/public/imagenes/proveedor-1759852335508.png";

export default function ProveedoresAdmin() {
  const [proveedores, setProveedores] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [buscar, setBuscar] = useState("");

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    contacto: "",
    imagen_url: "",
    activo: true,
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    const { data, error } = await supabase.from("proveedores").select("*").order("nombre");
    if (error) console.error("Error cargar proveedores:", error);
    else setProveedores(data || []);
  };

  const obtenerNombreArchivo = (url) => {
    const partes = url.split("/");
    return partes[partes.length - 1].split("?")[0];
  };

  const eliminarImagen = async (url) => {
    const nombreArchivo = obtenerNombreArchivo(url);
    await supabase.storage.from("imagenes").remove([nombreArchivo]);
  };

  const manejarArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenFile(archivo);
      setImagenPreview(URL.createObjectURL(archivo));
    }
  };

  const subirImagen = async () => {
    if (!imagenFile) return null;
    const nombreArchivo = `proveedor-${Date.now()}.${imagenFile.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("imagenes").upload(nombreArchivo, imagenFile);
    if (error) {
      mostrarNotificacionGlobal("❌ Error al subir imagen", "error");
      return null;
    }
    return supabase.storage.from("imagenes").getPublicUrl(nombreArchivo).data.publicUrl;
  };

  const resetFormulario = () => {
    setNuevoProveedor({ nombre: "", contacto: "", imagen_url: "", activo: true });
    setImagenPreview(null);
    setImagenFile(null);
    setModoEdicion(null);
  };

  const agregarProveedor = async () => {
  await obtenerInfoUsuario();
    const urlImagen = await subirImagen();
    const proveedorFinal = { ...nuevoProveedor, imagen_url: urlImagen || "" };
    const { error } = await supabase.from("proveedores").insert([proveedorFinal]);
    if (error) mostrarNotificacionGlobal("❌ Error al agregar proveedor", "error");
    else {
  mostrarNotificacionGlobal(`✅ Proveedor creado`, "exito");
      resetFormulario();
      setMostrarFormulario(false);
      cargarProveedores();
    }
  };

  const iniciarEdicion = (p) => {
    setModoEdicion(p.id);
    setNuevoProveedor({ nombre: p.nombre, contacto: p.contacto || "", imagen_url: p.imagen_url || "", activo: p.activo });
    setImagenPreview(p.imagen_url);
    setImagenFile(null);
    setMostrarFormulario(true);
  };

  const actualizarProveedor = async () => {
  await obtenerInfoUsuario();
    let urlImagen = nuevoProveedor.imagen_url;
    if (imagenFile) {
      const subida = await subirImagen();
      if (subida) urlImagen = subida;
      else {
        mostrarNotificacionGlobal("❌ No se pudo subir la nueva imagen", "error");
        return;
      }
    }
    const proveedorFinal = { ...nuevoProveedor, imagen_url: urlImagen };
    const { error } = await supabase.from("proveedores").update(proveedorFinal).eq("id", modoEdicion);
    if (error) mostrarNotificacionGlobal("❌ Error al actualizar proveedor", "error");
    else {
  mostrarNotificacionGlobal(`✅ Proveedor editado`, "exito");
      resetFormulario();
      setMostrarFormulario(false);
      cargarProveedores();
    }
  };

  const eliminarProveedor = async (id) => {
  await obtenerInfoUsuario();
    const proveedor = proveedores.find((p) => p.id === id);
    if (proveedor?.imagen_url) await eliminarImagen(proveedor.imagen_url);
    const { error } = await supabase.from("proveedores").delete().eq("id", id);
    if (error) mostrarNotificacionGlobal("❌ Error al eliminar proveedor", "error");
    else {
  mostrarNotificacionGlobal(`✅ Proveedor eliminado`, "exito");
      cargarProveedores();
    }
  };

  const proveedoresFiltrados = proveedores.filter(p => p.nombre.toLowerCase().includes(buscar.toLowerCase()));

  return (
    <div className="productos-admin">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
        <input type="text" placeholder="Buscar..." style={{maxWidth:220}} value={buscar} onChange={e=>setBuscar(e.target.value)} />
        <button style={{background:'#222',color:'#fff',fontWeight:'bold',display:'flex',alignItems:'center',gap:'6px'}} onClick={()=>setMostrarFormulario(true)}>
          <span style={{fontSize:'1.2em',fontWeight:'bold'}}>+</span> Nuevo
        </button>
      </div>

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content" style={{minWidth:'480px',maxWidth:'600px',width:'100%'}}>
            <h3 style={{textAlign:'center',marginBottom:'1rem',color:'#222',fontSize:'2rem',fontWeight:'bold'}}>{modoEdicion ? "Editar proveedor" : "Agregar nuevo proveedor"}</h3>
            <form onSubmit={e=>{e.preventDefault(); modoEdicion?actualizarProveedor():agregarProveedor();}}>
              <div className="proveedor-modal-grid">
                <div className="proveedor-modal-field">
                  <label htmlFor="nombre">Nombre*</label>
                  <input id="nombre" value={nuevoProveedor.nombre} onChange={e=>setNuevoProveedor({...nuevoProveedor,nombre:e.target.value})} required />
                </div>
                <div className="proveedor-modal-field">
                  <label htmlFor="contacto">Contacto</label>
                  <input id="contacto" value={nuevoProveedor.contacto} onChange={e=>setNuevoProveedor({...nuevoProveedor,contacto:e.target.value})} />
                </div>
                <div className="proveedor-modal-field" style={{gridColumn:'1/3'}}>
                  <label htmlFor="imagen">Imagen</label>
                  <input id="imagen" type="file" accept="image/*" onChange={manejarArchivo} />
                  {imagenPreview && <img src={imagenPreview} alt="Preview" className="preview" style={{marginTop:8,maxWidth:120,borderRadius:8}} />}
                </div>
                <div className="proveedor-modal-field" style={{gridColumn:'1/3'}}>
                  <label htmlFor="activo" style={{display:'flex',alignItems:'center',gap:8}}>
                    <input id="activo" type="checkbox" checked={nuevoProveedor.activo} onChange={e=>setNuevoProveedor({...nuevoProveedor,activo:e.target.checked})} /> Activo
                  </label>
                </div>
              </div>
              <div style={{display:'flex',gap:12,marginTop:18,justifyContent:'center'}}>
                <button type="button" style={{background:'#d50000',color:'#fff',fontWeight:600,padding:'8px 20px',borderRadius:6,border:'none',fontSize:'1rem'}} onClick={()=>{resetFormulario();setMostrarFormulario(false);}}>Cerrar</button>
                <button type="submit" style={{background:'#19c37d',color:'#fff',fontWeight:600,padding:'8px 20px',borderRadius:6,border:'none',fontSize:'1rem'}}>{modoEdicion? 'Actualizar':'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{overflowX:'auto',background:'#fff',borderRadius:8,padding:'1rem',boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',color:'#222'}}>
          <thead>
            <tr style={{background:'#f5f5f5'}}>
              <th style={{textAlign:'center'}}>Imagen</th>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th style={{textAlign:'center'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.length === 0 ? (
              <tr><td colSpan={5} style={{textAlign:'center',color:'#222'}}>No hay proveedores registrados.</td></tr>
            ) : (
              proveedoresFiltrados.map(p=> (
                <tr key={p.id} style={{verticalAlign:'middle',color:'#222'}}>
                  <td style={{textAlign:'center'}}>
                    <img
                      src={`${p.imagen_url ? p.imagen_url : IMAGEN_PROVEEDOR_DEFAULT}?v=${Date.now()}`}
                      alt={p.nombre}
                      style={{width:40,height:40,borderRadius:8,objectFit:'cover'}}
                    />
                  </td>
                  <td>{p.nombre}</td>
                  <td>{p.contacto}</td>
                  <td><span style={{background:p.activo?'#00c853':'#d50000',color:'#fff',borderRadius:4,padding:'2px 8px',fontWeight:'bold'}}>{p.activo?'Activo':'Inactivo'}</span></td>
                  <td style={{textAlign:'center'}}>
                    <button style={{background:'#007aff',color:'#fff',marginRight:8}} onClick={()=>iniciarEdicion(p)}>Editar</button>
                    <button style={{background:'#d50000',color:'#fff'}} onClick={()=>eliminarProveedor(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
