import React, { useEffect, useState, useRef } from "react";
import Draggable from "react-draggable";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/MesasAdmin.css";



export default function MesasAdmin() {
  const [mesas, setMesas] = useState([]);
  const mesaRefs = useRef({});
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMesa, setEditMesa] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMesas();
  }, []);

  const fetchMesas = async () => {
    setLoading(true);
  const { data } = await supabase.from("mesas").select("id, nombre, x_pos, y_pos");
  setMesas(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (editMesa) {
      await supabase.from("mesas").update({ nombre }).eq("id", editMesa.id);
    } else {
      await supabase.from("mesas").insert([{ nombre }]);
    }
    setNombre("");
    setEditMesa(null);
    setShowForm(false);
    fetchMesas();
  };

  const handleEdit = (mesa) => {
    setEditMesa(mesa);
    setNombre(mesa.nombre);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar esta mesa?")) {
      setLoading(true);
      await supabase.from("mesas").delete().eq("identificación", id);
      fetchMesas();
    }
  };

  return (
    <div style={{width: '100%', maxWidth: '100vw', margin: 0, padding: 0}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0 18px 0', padding: '0 2vw'}}>
        <h2 style={{margin: 0}}>Configurar Mesas</h2>
        <button className="mesas-admin-add-btn" onClick={()=>{setShowForm(true);setEditMesa(null);setNombre("");}}>+ Nueva mesa</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mesas-admin-form" style={{margin: '0 2vw 24px 2vw'}}>
          <input
            type="text"
            placeholder="Nombre de la mesa"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{editMesa ? "Actualizar" : "Agregar"}</button>
          <button type="button" onClick={()=>{setEditMesa(null);setShowForm(false);setNombre("");}}>Cancelar</button>
        </form>
      )}
      <div style={{position: 'relative', width: '100vw', height: '75vh', minHeight: 400, background: '#f5f6fa', borderRadius: 0, overflow: 'auto', margin: 0, padding: 0}}>
        {loading && <div>Cargando...</div>}
        {mesas.map(mesa => {
          if (!mesaRefs.current[mesa.id]) {
            mesaRefs.current[mesa.id] = React.createRef();
          }
          return (
            <Draggable
              key={mesa.id}
              nodeRef={mesaRefs.current[mesa.id]}
              defaultPosition={{ x: mesa.x_pos || 100, y: mesa.y_pos || 100 }}
              onStop={async (e, data) => {
                await supabase.from("mesas").update({ x_pos: Math.round(data.x), y_pos: Math.round(data.y) }).eq("id", mesa.id);
                fetchMesas();
              }}
              bounds="parent"
            >
              <div
                ref={mesaRefs.current[mesa.id]}
                className="mesa-admin-item-grid mesa-admin-profesional"
                style={{ position: 'absolute', left: 0, top: 0, zIndex: 10, cursor: 'move', minWidth: 160 }}
              >
                <span className="mesa-admin-nombre">{mesa.nombre}</span>
                <div className="mesa-admin-actions mesa-admin-actions-icons">
                  <span className="icono-editar" aria-label="Editar" title="Editar" onClick={e => { e.stopPropagation(); handleEdit(mesa); }} style={{cursor:'pointer', marginRight: '8px', position:'relative', display:'inline-flex', alignItems:'center'}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#18e622ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                  </span>
                  <span className="icono-eliminar" aria-label="Eliminar" title="Eliminar" onClick={e => { e.stopPropagation(); handleDelete(mesa.id); }} style={{cursor:'pointer', position:'relative', display:'inline-flex', alignItems:'center'}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </span>
                </div>
              </div>
            </Draggable>
          );
        })}
      </div>
    </div>
  );
}
