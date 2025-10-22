import React, { useState, useEffect } from "react";
import "../styles/ContabilidadTipoGastos.css";
import { supabase } from "../lib/supabaseClient";
import { mostrarNotificacionGlobal } from "../utils/notificacionGlobal";

const iconTrash = (
  <span role="img" aria-label="Eliminar" style={{fontSize:'1.1em'}}>🗑️</span>
);
const iconAdd = (
  <span role="img" aria-label="Agregar" style={{fontSize:'1.1em'}}>➕</span>
);

export default function ContabilidadTipoGastos() {
  const [tipos, setTipos] = useState([]);
  const cargarTipos = async () => {
    const { data, error } = await supabase.from("tipos_gastos").select();
    if (!error && data) {
      setTipos(data);
    }
  };
  useEffect(() => {
    cargarTipos();
  }, []);
  const [nuevo, setNuevo] = useState("");

  const eliminarTipo = async idx => {
    const tipo = tipos[idx];
    if (tipo.id) {
      const { error } = await supabase.from("tipos_gastos").delete().eq("id", tipo.id);
      if (error) {
        mostrarNotificacionGlobal("Error al eliminar", "error");
        return;
      } else {
        mostrarNotificacionGlobal("Eliminado", "exito");
        await cargarTipos();
        return;
      }
    }
    setTipos(tipos.filter((_, i) => i !== idx));
  mostrarNotificacionGlobal("Eliminado", "exito");
  };
  const agregarTipo = () => {
    if (nuevo.trim() && !tipos.some(t => t.nombre.toLowerCase() === nuevo.trim().toLowerCase())) {
      setTipos([...tipos, { nombre: nuevo.trim() }]);
      setNuevo("");
    }
  };

  const [guardando, setGuardando] = useState(false);
  const [mensaje] = useState("");

  const guardarTiposGastos = async () => {
    setGuardando(true);
    try {
      // Solo guarda los tipos que no tienen id (nuevos)
      const nuevos = tipos.filter(t => !t.id);
      if (nuevos.length > 0) {
        const { error } = await supabase.from("tipos_gastos").insert(
          nuevos.map(t => ({ nombre: t.nombre }))
        );
        if (error) {
          mostrarNotificacionGlobal("Error al guardar", "error");
        } else {
          mostrarNotificacionGlobal("Guardado", "exito");
          await cargarTipos();
        }
      } else {
        mostrarNotificacionGlobal("Guardado", "exito");
      }
    } catch (err) {
      mostrarNotificacionGlobal("Error inesperado", "error");
    }
    setGuardando(false);
  };

  return (
    <div style={{width:'100%', minHeight:'100vh', background:'#fafbfc', paddingTop:32}}>
      <h2 style={{textAlign:'center', fontWeight:800, fontSize:'2rem', marginBottom:24}}>Tipos de gastos</h2>
      <div className="tipos-gastos-container">
        {tipos.map((tipo, idx) => (
          <div className="tipos-gastos-card" key={idx}>
            <div style={{marginBottom:16}}>{tipo.nombre}</div>
            <button className="tipos-gastos-eliminar" onClick={() => eliminarTipo(idx)}>
              {iconTrash} Eliminar
            </button>
          </div>
        ))}
        <div className="tipos-gastos-agregar-card">
          Agregar nuevo...
          <input
            type="text"
            value={nuevo}
            onChange={e => setNuevo(e.target.value)}
            placeholder="Nombre del tipo"
            style={{marginTop:12, padding:'8px 12px', borderRadius:8, border:'1px solid #e0e0e0', fontSize:'1rem', width:'90%'}}
          />
          <button className="tipos-gastos-agregar-btn" onClick={agregarTipo}>
            {iconAdd} Agregar
          </button>
        </div>
      </div>
      <div style={{width:'100%', display:'flex', justifyContent:'center', marginTop:32}}>
        <button className="tipos-gastos-guardar" onClick={guardarTiposGastos} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
      {mensaje && (
        <div style={{textAlign:'center', marginTop:18, color: mensaje.includes("exitoso") ? '#1976d2' : '#d32f2f', fontWeight:600}}>
          {mensaje}
        </div>
      )}
    </div>
  );
}
