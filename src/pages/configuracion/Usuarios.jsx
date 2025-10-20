import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { FaUserEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import "../../styles/Roles.css";

export default function Usuarios() {
  const [subiendoImagenEdit, setSubiendoImagenEdit] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  // ...existing code...
  // Manejo de imagen para nuevo usuario
  const handleImagenChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoImagen(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('usuarios').upload(fileName, file);
    console.log('Resultado upload:', { data, error });
    if (!error && data) {
  console.log('data:', data);
  console.log('data.fullPath:', data.fullPath);
  const { data: urlData } = supabase.storage.from('usuarios').getPublicUrl(data.path);
  setNuevoUsuario({ ...nuevoUsuario, imagen: urlData.publicUrl });
    } else {
      setNuevoUsuario({ ...nuevoUsuario, imagen: "" });
    }
    setSubiendoImagen(false);
  };

  // Manejo de imagen para edición de usuario
  const handleEditImagenChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendoImagenEdit(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('usuarios').upload(fileName, file);
    console.log('Resultado upload (edit):', { data, error });
    if (!error && data) {
  console.log('data (edit):', data);
  console.log('data.fullPath (edit):', data.fullPath);
  const { data: urlData } = supabase.storage.from('usuarios').getPublicUrl(data.path);
  setEditUsuario({ ...editUsuario, imagen: urlData.publicUrl });
    } else {
      setEditUsuario({ ...editUsuario, imagen: "" });
    }
    setSubiendoImagenEdit(false);
  };
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    correo: "",
    imagen: "",
    telefono: "",
    activo: true,
    password: "",
    rol_id: ""
  });
  const [editId, setEditId] = useState(null);
  const [editUsuario, setEditUsuario] = useState({
    nombre: "",
    correo: "",
    imagen: "",
    telefono: "",
    activo: true,
    password: "",
    rol_id: ""
  });
  const [mensaje, setMensaje] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    const { data } = await supabase.from("usuarios").select("*, rol:rol_id(nombre)");
    setUsuarios(data || []);
  };

  const cargarRoles = async () => {
    const { data } = await supabase.from("roles").select("*");
    setRoles(data || []);
  };

  const agregarUsuario = async () => {
    if (!nuevoUsuario.nombre || !nuevoUsuario.correo || !nuevoUsuario.rol_id || !nuevoUsuario.password) return;
    if (subiendoImagen) return; // Esperar a que la imagen termine de subir
    if (!nuevoUsuario.imagen || !nuevoUsuario.imagen.startsWith('http')) {
      setMensaje("Debes subir una imagen válida antes de guardar");
  setTimeout(() => setMensaje(""), 2000);
      return;
    }
    const usuarioInsert = {
      id: uuidv4(),
      correo: nuevoUsuario.correo,
      nombre: nuevoUsuario.nombre,
      imagen: nuevoUsuario.imagen,
      telefono: nuevoUsuario.telefono || "",
      activo: !!nuevoUsuario.activo,
      password: nuevoUsuario.password,
      rol_id: nuevoUsuario.rol_id
    };
    const { error } = await supabase.from("usuarios").insert([usuarioInsert]);
    if (!error) {
      setMensaje("Usuario agregado correctamente");
      setNuevoUsuario({
        nombre: "",
        correo: "",
        imagen: "",
        telefono: "",
        activo: true,
        password: "",
        rol_id: ""
      });
      cargarUsuarios();
    } else {
      setMensaje("Error al agregar usuario");
    }
    setTimeout(() => setMensaje(""), 2000);
  };

  const eliminarUsuario = async (id) => {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);
    if (!error) {
      setMensaje("Usuario eliminado");
      cargarUsuarios();
    } else {
      setMensaje("Error al eliminar usuario");
    }
    setTimeout(() => setMensaje(""), 2000);
  };

  const editarUsuario = (usuario) => {
    setEditId(usuario.id);
    setEditUsuario({
      nombre: usuario.nombre,
      correo: usuario.correo,
      imagen: usuario.imagen || "",
      telefono: usuario.telefono || "",
      activo: usuario.activo,
      password: usuario.password || "",
      rol_id: usuario.rol_id
    });
  };

  const guardarEdicion = async (id) => {
    if (!editUsuario.nombre || !editUsuario.correo || !editUsuario.rol_id) return;
    // Solo actualizar los campos válidos
    const usuarioUpdate = {
      correo: editUsuario.correo,
      nombre: editUsuario.nombre,
      imagen: editUsuario.imagen || "",
      telefono: editUsuario.telefono || "",
      activo: !!editUsuario.activo,
      password: editUsuario.password,
      rol_id: editUsuario.rol_id
    };
    const { error } = await supabase.from("usuarios").update(usuarioUpdate).eq("id", id);
    if (!error) {
      setMensaje("Usuario editado correctamente");
      setEditId(null);
      cargarUsuarios();
    } else {
      setMensaje("Error al editar usuario");
    }
    setTimeout(() => setMensaje(""), 2000);
  };

  const usuariosFiltrados = usuarios.filter(u =>
    (!busqueda || u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.correo.toLowerCase().includes(busqueda.toLowerCase())) &&
    (!rolFiltro || u.rol_id === rolFiltro)
  );

  return (
    <div className="panel-roles" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Gestión de Usuarios</h2>
      {mensaje && (
        <div style={{ marginBottom: 18, color: '#007aff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          {mensaje}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button onClick={() => setMostrarModal(true)} style={{ background: '#007aff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: 16 }}>Nuevo</button>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
        <input
          type="text"
          placeholder="Buscar usuario"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={rolFiltro} onChange={e => setRolFiltro(e.target.value)} style={{ minWidth: 160 }}>
          <option value="">Todos los roles</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
        </select>
        <button onClick={cargarUsuarios} title="Buscar" style={{ background: '#007aff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600 }}><FaSearch /></button>
        </div>
      </div>
      {mostrarModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 4px 32px #0003', position: 'relative' }}>
            <button onClick={() => setMostrarModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'transparent', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, textAlign: 'center' }}>Agregar usuario</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="text" placeholder="Nombre" value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
              <input type="email" placeholder="Correo" value={nuevoUsuario.correo} onChange={e => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })} />
              <input type="text" placeholder="Teléfono" value={nuevoUsuario.telefono} onChange={e => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })} />
              <input type="file" accept="image/*" onChange={handleImagenChange} />
              {nuevoUsuario.imagen && (
                <img src={nuevoUsuario.imagen} alt="Preview" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginLeft: 8 }} />
              )}
              <input type={showPassword ? "text" : "password"} placeholder="Contraseña" value={nuevoUsuario.password} onChange={e => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600, marginBottom: 4 }}> {showPassword ? "Ocultar" : "Ver"} </button>
              <select value={nuevoUsuario.rol_id} onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol_id: e.target.value })} style={{ minWidth: 160 }}>
                <option value="">Selecciona rol</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <input type="checkbox" checked={nuevoUsuario.activo} onChange={e => setNuevoUsuario({ ...nuevoUsuario, activo: e.target.checked })} /> Activo
              </label>
              <button onClick={async () => { await agregarUsuario(); setMostrarModal(false); }} disabled={subiendoImagen || !nuevoUsuario.imagen} style={{ background: subiendoImagen ? '#ccc' : '#00b894', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600 }}>
                {subiendoImagen ? 'Subiendo imagen...' : <><FaPlus /> Agregar</>}
              </button>
            </div>
          </div>
        </div>
      )}
  <div className="lista-usuarios" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        {usuariosFiltrados.map(usuario => (
          <div key={usuario.id} className="usuario-card" style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <img src={usuario.imagen || "https://i.imgur.com/x1aZ8gg.png"} alt="Foto" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', marginBottom: 7, boxShadow: '0 1px 5px #0002' }} />
            {editId === usuario.id ? (
              <>
                <input value={editUsuario.nombre} onChange={e => setEditUsuario({ ...editUsuario, nombre: e.target.value })} style={{ fontWeight: 600, fontSize: 16, textAlign: 'center', marginBottom: 6 }} />
                <input value={editUsuario.correo} onChange={e => setEditUsuario({ ...editUsuario, correo: e.target.value })} style={{ fontWeight: 500, fontSize: 15, textAlign: 'center', marginBottom: 6 }} />
                <input value={editUsuario.telefono} onChange={e => setEditUsuario({ ...editUsuario, telefono: e.target.value })} style={{ fontWeight: 500, fontSize: 15, textAlign: 'center', marginBottom: 6 }} placeholder="Teléfono" />
                <input type="file" accept="image/*" onChange={handleEditImagenChange} style={{ marginBottom: 6 }} />
                {editUsuario.imagen && (
                  <img src={editUsuario.imagen} alt="Preview" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginBottom: 6 }} />
                )}
                <input type={showPassword ? "text" : "password"} value={editUsuario.password} onChange={e => setEditUsuario({ ...editUsuario, password: e.target.value })} style={{ fontWeight: 500, fontSize: 15, textAlign: 'center', marginBottom: 6 }} placeholder="Contraseña" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, marginBottom: 6 }}> {showPassword ? "Ocultar" : "Ver"} </button>
                <select value={editUsuario.rol_id} onChange={e => setEditUsuario({ ...editUsuario, rol_id: e.target.value })} style={{ minWidth: 120, marginBottom: 8 }}>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, marginBottom: 8 }}>
                  <input type="checkbox" checked={editUsuario.activo} onChange={e => setEditUsuario({ ...editUsuario, activo: e.target.checked })} /> Activo
                </label>
                <button onClick={() => guardarEdicion(usuario.id)} disabled={subiendoImagenEdit} style={{ background: subiendoImagenEdit ? '#ccc' : '#007aff', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, marginRight: 8 }}>
                  {subiendoImagenEdit ? 'Subiendo imagen...' : <><FaUserEdit /> Guardar</>}
                </button>
                <button onClick={() => setEditId(null)} style={{ background: '#ccc', color: '#333', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600 }}>Cancelar</button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 600, fontSize: 17, marginBottom: 4 }}>{usuario.nombre}</span>
                <span style={{ fontSize: 15, color: '#555', marginBottom: 4 }}>{usuario.correo}</span>
                <span style={{ fontSize: 15, color: '#888', marginBottom: 4 }}>{usuario.telefono}</span>
                <span style={{ fontSize: 15, color: '#888', marginBottom: 4 }}>{usuario.rol?.nombre || "Sin rol"}</span>
                <span style={{ fontSize: 14, color: usuario.activo ? '#00b894' : '#d63031', marginBottom: 4 }}>{usuario.activo ? "Activo" : "Inactivo"}</span>
                <span style={{ fontSize: 13, color: '#aaa', marginBottom: 2 }}>Creado: {usuario.creado_en ? new Date(usuario.creado_en).toLocaleString() : "-"}</span>
                <span style={{ fontSize: 13, color: '#aaa', marginBottom: 2 }}>Último login: {usuario.ultimo_login ? new Date(usuario.ultimo_login).toLocaleString() : "-"}</span>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button title="Editar" onClick={() => editarUsuario(usuario)} style={{ background: '#007aff', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><FaUserEdit /></button>
                  <button title="Eliminar" onClick={() => eliminarUsuario(usuario.id)} style={{ background: '#d63031', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><FaTrash /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
