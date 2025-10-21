
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";


export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      const { data } = await supabase.from("negocio").select("logo_url").single();
      if (data && data.logo_url) setLogo(data.logo_url);
    };
    fetchLogo();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Buscar usuario por correo y contraseña
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", correo)
      .eq("password", password)
      .single();
    setLoading(false);
    if (!usuario) {
      setError("Correo o contraseña incorrectos");
      return;
    }
    // Guardar sesión en localStorage
    localStorage.setItem("usuario_actual", JSON.stringify(usuario));
    if (onLogin) onLogin();
    window.location.href = "/";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f7" }}>
      <form onSubmit={handleLogin} style={{ background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 12px #0002", minWidth: 380, maxWidth: 420, width: "100%", outline: "none" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          {logo && <img src={logo} alt="Logo Negocio" style={{ width: 200, height: 100, objectFit: "contain", marginBottom: 8, borderRadius: 8, background: "#fff" }} />}
        </div>
        <h2 style={{ textAlign: "center", marginBottom: 18, color: "#d50000" }}>Iniciar sesión</h2>
  <label style={{ fontWeight: "bold", color: "#222" }}>Correo</label>
  <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required style={{ width: "100%", padding: 10, marginBottom: 18, borderRadius: 6, border: "1px solid #bbb", background: "#f7f7f7", fontSize: 16 }} />
        <label style={{ fontWeight: "bold", color: "#222" }}>Contraseña</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: 10, marginBottom: 18, borderRadius: 6, border: "1px solid #bbb", background: "#f7f7f7", fontSize: 16 }} />
        {error && <div style={{ color: "#d50000", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", background: "#d50000", color: "#fff", fontWeight: "bold", padding: "12px 0", borderRadius: 6, fontSize: 16 }} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
