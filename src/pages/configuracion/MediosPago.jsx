import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/InformacionNegocio.css";

export default function MediosPago() {
  const [medios, setMedios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarMedios();
  }, []);

  const cargarMedios = async () => {
    const { data } = await supabase.from("medios_pago").select("*").order("id");
    setMedios(data || []);
  };

  const handleChange = (idx, value) => {
    setMedios(medios => medios.map((m, i) => i === idx ? { ...m, nombre: value } : m));
  };

  const handleAdd = () => {
    setMedios([...medios, { nombre: "" }]);
  };

  const handleRemove = idx => {
    setMedios(medios => medios.filter((_, i) => i !== idx));
  };

  const handleGuardar = async () => {
    setLoading(true);
    setMensaje("");
    // Limpia y guarda todos los medios
    await supabase.from("medios_pago").delete().neq("id", 0);
    const nuevos = medios.filter(m => m.nombre && m.nombre.trim() !== "");
    if (nuevos.length) {
      const { error } = await supabase.from("medios_pago").insert(nuevos);
      if (error) setMensaje("❌ Error al guardar: " + error.message);
      else setMensaje("✅ Cambios guardados");
    } else {
      setMensaje("✅ Cambios guardados");
    }
    setLoading(false);
    cargarMedios();
  };

  return (
    <div style={{width: "100%", maxWidth: 900, margin: '0 auto', padding: '32px 0'}}>
      <h2 style={{fontWeight:700,fontSize:28,marginBottom:24,textAlign:'center'}}>Medios de pago</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'32px',marginBottom:32}}>
        {medios.map((medio, idx) => (
          <div key={idx} style={{background:'#fff',borderRadius:18,boxShadow:'0 4px 18px #0002',padding:'2.2rem 1.2rem 1.2rem 1.2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:18,position:'relative'}}>
            <input
              className="medio-input"
              value={medio.nombre}
              onChange={e => handleChange(idx, e.target.value)}
              placeholder="Nombre del medio"
              style={{fontWeight:600,fontSize:'1.15rem',textAlign:'center',border:'none',background:'none',outline:'none',marginBottom:10,padding:'0.5rem 0',width:'100%'}}
            />
            <div style={{display:'flex',gap:12,marginTop:8}}>
              <button className="medio-btn eliminar" style={{background:'#f8d7da',color:'#d32f2f',borderRadius:8,padding:'8px 16px',fontWeight:600,border:'none',boxShadow:'0 2px 8px #d32f2f22',cursor:'pointer'}} onClick={() => handleRemove(idx)}>
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
        <div style={{background:'#f7fafd',borderRadius:18,boxShadow:'0 2px 8px #1976d222',padding:'2.2rem 1.2rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10}}>
          <input className="medio-input" disabled placeholder="Agregar nuevo..." style={{textAlign:'center',fontWeight:600,fontSize:'1.12rem',background:'none',border:'none',marginBottom:10}} />
          <button className="medio-btn agregar" style={{background:'#e3f2fd',color:'#1976d2',borderRadius:8,padding:'8px 16px',fontWeight:600,border:'none',boxShadow:'0 2px 8px #1976d222',cursor:'pointer'}} onClick={handleAdd}>
            ➕ Agregar
          </button>
        </div>
      </div>
      <div className="guardar-derecha" style={{width: "100%", display: "flex", justifyContent: "flex-end", marginTop: 16}}>
        <button className="btn-guardar-negocio" style={{ minWidth: 140, fontSize:'1.12rem',fontWeight:600,borderRadius:8,padding:'0.7rem 2.2rem',background:'#1976d2',color:'#fff',border:'none',boxShadow:'0 2px 8px #1976d222' }} onClick={handleGuardar} disabled={loading}>
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
      {mensaje && <div style={{marginTop: "1rem", fontWeight: "bold", color: "#222",textAlign:'center'}}>{mensaje}</div>}
    </div>
  );
}
