import { useEffect, useState } from "react";
import "../styles/NavbarSuperior.css";

export default function NavbarSuperior() {
  const [nombre, setNombre] = useState("");
  const [foto, setFoto] = useState("https://i.imgur.com/x1aZ8gg.png");

  useEffect(() => {
    const usuarioLocal = localStorage.getItem("usuario_actual");
    if (usuarioLocal) {
      const usuario = JSON.parse(usuarioLocal);
      setNombre(usuario.nombre);
      setFoto(usuario.imagen || "https://i.imgur.com/x1aZ8gg.png");
    }
  }, []);

  return (
    <div className="navbar-superior">
      <div className="navbar-nombre-sistema" style={{ fontSize: 32, fontWeight: "bold", letterSpacing: 1, color: "#fff", display: "flex", alignItems: "center", gap: 18 }}>
        Loncherías Gula - POS
      </div>
      <div className="navbar-usuario-info">
        <div className="usuario-detalle">
          <img src={foto} alt="Foto usuario" className="navbar-foto-usuario" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", marginRight: 10, boxShadow: "0 1px 6px #0002" }} />
          <span className="navbar-nombre" style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>{nombre}</span>
        </div>
        <div className="navbar-config-cerrar">
          <button
            style={{ background: "#fff", color: "#d50000", fontWeight: "bold", borderRadius: 6, padding: "6px 16px", border: "none", cursor: "pointer", fontSize: 15, boxShadow: "0 1px 4px #0001" }}
            onClick={() => {
              localStorage.removeItem("usuario_actual");
              setTimeout(() => {
                window.location.replace("/login");
              }, 100);
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
