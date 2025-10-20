import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/Roles.css";
import { FaUserShield, FaUserTie, FaUser, FaTrash, FaEdit, FaUsers, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const iconos = {
  Administrador: <FaUserShield style={{ color: '#007aff', fontSize: 28 }} />,
  Cajero: <FaUserTie style={{ color: '#00b894', fontSize: 28 }} />,
  Mesero: <FaUser style={{ color: '#fdcb6e', fontSize: 28 }} />,
  Vendedor: <FaUser style={{ color: '#636e72', fontSize: 28 }} />,
  Invitado: <FaUser style={{ color: '#b2bec3', fontSize: 28 }} />,
};


export default function Roles() {
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    const { data, error } = await supabase.from("roles").select("*");
    if (!error && data) setRoles(data);
  };
  const [nuevoRol, setNuevoRol] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [usuariosRol, setUsuariosRol] = useState(null);

  const agregarRol = () => {
    if (nuevoRol.trim() === "") return;
    setRoles([...roles, { id: Date.now(), nombre: nuevoRol }]);
    setNuevoRol("");
    setMensaje("Rol agregado correctamente");
    setTimeout(() => setMensaje(""), 2000);
  };

  const eliminarRol = (id) => {
    setRoles(roles.filter(r => r.id !== id));
    setConfirmDelete(null);
    setMensaje("Rol eliminado");
    setTimeout(() => setMensaje(""), 2000);
  };

  const editarRol = (id, nombre) => {
    setEditId(id);
    setEditNombre(nombre);
  };

  const guardarEdicion = async (id) => {
    if (editNombre.trim() === "") return;
    // Actualizar en la base de datos
    const { error } = await supabase.from("roles").update({ nombre: editNombre }).eq("id", id);
    if (!error) {
      setRoles(roles.map(r => r.id === id ? { ...r, nombre: editNombre } : r));
      setMensaje("Rol editado correctamente");
    } else {
      setMensaje("Error al editar rol");
    }
    setEditId(null);
    setEditNombre("");
    setTimeout(() => setMensaje(""), 2000);
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditNombre("");
  };

  const verUsuarios = async (rolNombre) => {
    // Buscar el rol por nombre para obtener el id
    const rol = roles.find(r => r.nombre === rolNombre);
    if (!rol) {
      setUsuariosRol({ rol: rolNombre, usuarios: [] });
      return;
    }
    // Buscar usuarios reales con ese rol
    const { data: usuarios } = await supabase
      .from("usuarios")
      .select("nombre")
      .eq("rol_id", rol.id);
    setUsuariosRol({ rol: rolNombre, usuarios: usuarios || [] });
  };

  return (
    <div className="panel-roles" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: 32, marginBottom: 24 }}>Gestión de Roles</h2>
      {mensaje && (
        <div style={{ marginBottom: 18, color: '#007aff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaCheckCircle /> {mensaje}
        </div>
      )}
      <div className="nuevo-rol" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Nuevo rol"
          value={nuevoRol}
          onChange={e => setNuevoRol(e.target.value)}
          style={{ flex: 1 }}
        />
        <button onClick={agregarRol} style={{ fontWeight: 600 }}>Agregar rol</button>
      </div>
      <div className="lista-roles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {roles.map(rol => (
          <div key={rol.id} className="rol-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <div style={{ marginBottom: 12 }}>{iconos[rol.nombre] || <FaUser style={{ fontSize: 28, color: '#636e72' }} />}</div>
            {editId === rol.id ? (
              <input
                value={editNombre}
                onChange={e => setEditNombre(e.target.value)}
                onBlur={() => guardarEdicion(rol.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') guardarEdicion(rol.id);
                  if (e.key === 'Escape') cancelarEdicion();
                }}
                autoFocus
                style={{ fontWeight: 600, fontSize: 18, textAlign: 'center', marginBottom: 8 }}
              />
            ) : (
              <span style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{rol.nombre}</span>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button title="Editar" onClick={() => editarRol(rol.id, rol.nombre)} style={{ background: '#007aff', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><FaEdit /></button>
              <button title="Ver usuarios" onClick={() => verUsuarios(rol.nombre)} style={{ background: '#00b894', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><FaUsers /></button>
              <button title="Eliminar" onClick={() => setConfirmDelete(rol.id)} style={{ background: '#d63031', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}><FaTrash /></button>
            </div>
            {confirmDelete === rol.id && (
              <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', border: '1px solid #d63031', borderRadius: 8, padding: 12, zIndex: 2, minWidth: 160 }}>
                <div style={{ marginBottom: 8, color: '#d63031', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><FaTimesCircle /> ¿Eliminar rol?</div>
                <button onClick={() => eliminarRol(rol.id)} style={{ background: '#d63031', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, marginRight: 8 }}>Sí</button>
                <button onClick={() => setConfirmDelete(null)} style={{ background: '#ccc', color: '#333', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600 }}>No</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {usuariosRol && (
        <div style={{ marginTop: 32, background: '#f8f8f8', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Usuarios con rol {usuariosRol.rol}</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {usuariosRol.usuarios.length === 0 ? (
              <li style={{ color: '#888', fontStyle: 'italic' }}>No hay usuarios asignados</li>
            ) : (
              usuariosRol.usuarios.map((u, idx) => (
                <li key={idx} style={{ padding: '6px 0', fontWeight: 500, color: '#333' }}><FaUser style={{ marginRight: 8, color: '#007aff' }} /> {u.nombre}</li>
              ))
            )}
          </ul>
          <button onClick={() => setUsuariosRol(null)} style={{ marginTop: 18, background: '#007aff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 22px', fontWeight: 600 }}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
