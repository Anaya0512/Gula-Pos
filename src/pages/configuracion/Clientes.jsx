import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/Roles.css";
import "../../styles/Modal.css";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [form, setForm] = useState({ nombre: "", cedula_nit: "", telefono: "", direccion: "", correo: "" });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const usuarioLocal = localStorage.getItem("usuario_actual");
  const usuario = usuarioLocal ? JSON.parse(usuarioLocal) : null;

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    const { data } = await supabase.from("clientes").select("*").order("nombre");
    setClientes(data || []);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.nombre) return;
    if (editId) {
      await supabase.from("clientes").update({ ...form }).eq("id", editId);
    } else {
      await supabase.from("clientes").insert({ ...form, creado_por: usuario?.nombre || "Desconocido" });
    }
    setForm({ nombre: "", cedula_nit: "", telefono: "", direccion: "", correo: "" });
    setEditId(null);
    setShowForm(false);
    fetchClientes();
  };

  const handleEdit = cliente => {
    setForm({
      nombre: cliente.nombre,
      cedula_nit: cliente.cedula_nit,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      correo: cliente.correo
    });
    setEditId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    await supabase.from("clientes").delete().eq("id", id);
    fetchClientes();
  };

  return (
    <div className="roles-panel moderno">
  <div style={{maxWidth:'900px', margin:'0 auto', width:'100%'}}>
  <h2 style={{margin:'0 0 8px 0', textAlign:'center', fontWeight:'bold'}}>Clientes</h2>
        <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:12, flexWrap:'wrap'}}>
          <div style={{display:'flex', flexDirection:'column', flex:1, minWidth:180}}>
            <label style={{fontWeight:'bold', fontSize:'1rem', color:'#222', marginBottom:2}}>Buscar</label>
            <input
              type="text"
              className="roles-buscar"
              placeholder="Buscar por nombre, cédula/NIT, teléfono o correo..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              style={{width: "100%", maxWidth: 320, padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc"}}
            />
          </div>
          <button className="btn-primary" style={{fontWeight:600, fontSize:16, height:40, marginTop:22, minWidth:110}} onClick={()=>{setShowForm(true); setEditId(null); setForm({ nombre: "", cedula_nit: "", telefono: "", direccion: "", correo: "" });}}>+ Nuevo</button>
        </div>
        <div style={{background:'#fff',borderRadius:16,boxShadow:'0 2px 16px rgba(0,0,0,0.08)',padding:'18px 0 8px 0',marginTop:0,marginBottom:24, overflowX:'auto'}}>
          <div className="roles-lista" style={{width:'100%',padding:'0 12px', minWidth:320}}>
            <div className="roles-header compacto" style={{display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid #eee',paddingBottom:8,background:'#f8f9fa'}}>
              <span style={{width:160, textAlign:'center', fontWeight:'bold', color:'#222', fontSize:'1.08rem', letterSpacing:'0.5px'}}>Nombre</span>
              <span style={{width:180, textAlign:'center', fontWeight:'bold', color:'#222', fontSize:'1.08rem', letterSpacing:'0.5px'}}>Correo</span>
              <span style={{width:120, textAlign:'center', fontWeight:'bold', color:'#222', fontSize:'1.08rem', letterSpacing:'0.5px'}}>Teléfono</span>
              <span style={{width:90, textAlign:'center', fontWeight:'bold', color:'#222', fontSize:'1.08rem', letterSpacing:'0.5px'}}>Estado</span>
              <span style={{width:160, textAlign:'center', fontWeight:'bold', color:'#222', fontSize:'1.08rem', letterSpacing:'0.5px'}}>Acciones</span>
            </div>
            {clientes
              .filter(cliente => {
                const val = filtro.toLowerCase();
                return (
                  cliente.nombre?.toLowerCase().includes(val) ||
                  cliente.cedula_nit?.toLowerCase().includes(val) ||
                  cliente.telefono?.toLowerCase().includes(val) ||
                  cliente.correo?.toLowerCase().includes(val)
                );
              })
              .map(cliente => (
              <div key={cliente.id} className="roles-item compacto" style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #f3f3f3'}}>
                <span style={{width:160, textAlign:'center', fontSize:'1rem'}}>{cliente.nombre}</span>
                <span style={{width:180, textAlign:'center', fontSize:'1rem'}}>{cliente.correo || ''}</span>
                <span style={{width:120, textAlign:'center', fontSize:'1rem'}}>{cliente.telefono}</span>
                <span style={{width:90, textAlign:'center'}}>
                  <span style={{background:'#19c37d',color:'#fff',padding:'4px 16px',borderRadius:6,fontWeight:600,fontSize:15, display:'inline-block'}}>Activo</span>
                </span>
                <span style={{width:160,display:'flex',gap:8, justifyContent:'center'}}>
                  <button className="btn-editar" onClick={() => handleEdit(cliente)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleDelete(cliente.id)}>Eliminar</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{minWidth: '480px', maxWidth: '600px', width: '100%'}}>
            <h3 style={{marginTop:0, fontSize:'2rem', fontWeight:'bold', color:'#222', textAlign:'center'}}>{editId ? "Editar cliente" : "Nuevo cliente"}</h3>
            <form className="roles-form" onSubmit={handleSubmit}>
              <div className="cliente-modal-grid">
                <div className="cliente-modal-field">
                  <label htmlFor="nombre">Nombre</label>
                  <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="cliente-modal-field">
                  <label htmlFor="cedula_nit">Cédula o NIT</label>
                  <input id="cedula_nit" name="cedula_nit" value={form.cedula_nit} onChange={handleChange} />
                </div>
                <div className="cliente-modal-field">
                  <label htmlFor="telefono">Teléfono</label>
                  <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} />
                </div>
                <div className="cliente-modal-field">
                  <label htmlFor="direccion">Dirección</label>
                  <input id="direccion" name="direccion" value={form.direccion} onChange={handleChange} />
                </div>
                <div className="cliente-modal-field" style={{gridColumn:'1/3'}}>
                  <label htmlFor="correo">Correo</label>
                  <input id="correo" name="correo" value={form.correo} onChange={handleChange} />
                </div>
              </div>
              <div style={{display:"flex", gap:8, marginTop:18, justifyContent:'center'}}>
                <button type="submit" style={{background:'#19c37d',color:'#fff',fontWeight:600,padding:'8px 20px',borderRadius:6,border:'none',fontSize:'1rem'}}>Guardar</button>
                <button type="button" style={{background:'#e53935',color:'#fff',fontWeight:600,padding:'8px 20px',borderRadius:6,border:'none',fontSize:'1rem'}} onClick={()=>{ setShowForm(false); setEditId(null); setForm({ nombre: "", cedula_nit: "", telefono: "", direccion: "", correo: "" }); }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
