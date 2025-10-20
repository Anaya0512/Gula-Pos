import React from "react";
import { Link } from "react-router-dom";
import "../../styles/InformacionNegocio.css";

export default function ConfiguracionMenu() {
  // Menú central clásico con botones
  return (
    <div className="config-menu-panel" style={{maxWidth:600,margin:'0 auto',padding:'32px 0'}}>
      <h2 style={{fontWeight:700,fontSize:32,marginBottom:24}}>Configuración</h2>
      <div style={{display:'flex',flexDirection:'column',gap:18}}>
        <Link to="/configuracion/info-negocio" className="config-menu-btn" style={{padding:'16px 24px',fontSize:'1.12rem',borderRadius:8,background:'#f8fafc',boxShadow:'0 2px 8px #0001'}}>Información del negocio</Link>
        <Link to="/mesas/admin" className="config-menu-btn" style={{padding:'16px 24px',fontSize:'1.12rem',borderRadius:8,background:'#f8fafc',boxShadow:'0 2px 8px #0001'}}>Mesas</Link>
        <Link to="/configuracion/medios-pago" className="config-menu-btn" style={{padding:'16px 24px',fontSize:'1.12rem',borderRadius:8,background:'#f8fafc',boxShadow:'0 2px 8px #0001'}}>Medios de pago</Link>
        <Link to="/configuracion/roles" className="config-menu-btn" style={{padding:'16px 24px',fontSize:'1.12rem',borderRadius:8,background:'#f8fafc',boxShadow:'0 2px 8px #0001'}}>Gestión de roles</Link>
        <Link to="/configuracion/usuarios" className="config-menu-btn" style={{padding:'16px 24px',fontSize:'1.12rem',borderRadius:8,background:'#f8fafc',boxShadow:'0 2px 8px #0001'}}>Gestión de usuarios</Link>
      </div>
    </div>
  );
}
