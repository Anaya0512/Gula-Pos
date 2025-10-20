import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "../styles/CategoriasBarra.css";

export default function CategoriasBarra() {
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      const { data } = await supabase.from("categorias").select("*").eq("activo", true);
      setCategorias(data || []);
    };
    fetchCategorias();
  }, []);

  const agregarCategoria = async () => {
    if (!nuevaCategoria.trim()) return;
    setLoading(true);
    await supabase.from("categorias").insert([{ nombre: nuevaCategoria, activo: true }]);
    setNuevaCategoria("");
    const { data } = await supabase.from("categorias").select("*").eq("activo", true);
    setCategorias(data || []);
    setLoading(false);
  };

  const eliminarCategoria = async (id) => {
    setLoading(true);
    await supabase.from("categorias").update({ activo: false }).eq("id", id);
    const { data } = await supabase.from("categorias").select("*").eq("activo", true);
    setCategorias(data || []);
    setLoading(false);
  };

  return (
    <div className="categorias-barra-container">
      <div className="categorias-barra">
        {categorias.map(cat => (
          <div className="categoria-card" key={cat.id}>
            <span>{cat.nombre}</span>
            <button className="eliminar-btn" onClick={() => eliminarCategoria(cat.id)} title="Eliminar">✕</button>
          </div>
        ))}
        <div className="categoria-card nueva">
          <input
            type="text"
            value={nuevaCategoria}
            onChange={e => setNuevaCategoria(e.target.value)}
            placeholder="Nueva categoría"
            disabled={loading}
          />
          <button className="agregar-btn" onClick={agregarCategoria} disabled={loading || !nuevaCategoria.trim()}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}
