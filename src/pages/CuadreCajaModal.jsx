import React, { useState, useEffect } from "react";
import "../styles/CuadreCaja.css";
import { obtenerInfoUsuario } from "../utils/usuarioActual";
import { obtenerUsuariosActivos } from "../services/usuariosService";

export default function CuadreCajaModal({ visible, onClose, onSave }) {
  const [usuario, setUsuario] = useState({ nombre: "", rol: "" });
  const [usuariosCocina, setUsuariosCocina] = useState([]);
  const [responsableCocina, setResponsableCocina] = useState("");
  const [efectivo, setEfectivo] = useState(0);
  const [moneda, setMoneda] = useState(0);
  const [transferencia, setTransferencia] = useState(0);

  useEffect(() => {
    async function fetchUsuario() {
      const info = await obtenerInfoUsuario();
      setUsuario(info);
    }
    async function fetchUsuariosCocina() {
      const lista = await obtenerUsuariosActivos();
      setUsuariosCocina(lista);
      if (lista.length > 0) setResponsableCocina(lista[0].nombre);
    }
    if (visible) {
      fetchUsuario();
      fetchUsuariosCocina();
    }
  }, [visible]);

  const total = Number(efectivo) + Number(moneda) + Number(transferencia);

  if (!visible) return null;

  return (
    <div className="cuadre-caja-modal-overlay">
      <div className="cuadre-caja-modal">
        <div className="cuadre-caja-modal-header">
          <span>Cuadre de caja</span>
          <button className="cuadre-caja-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="cuadre-caja-modal-body">
          <div className="cuadre-caja-modal-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
            <label style={{ marginBottom: 4 }}>Responsable Caja</label>
            <input type="text" value={usuario.nombre} readOnly style={{ fontWeight: 600, background: '#f5f5f5', color: '#222', width: '100%', marginBottom: 8 }} />
            <label style={{ marginBottom: 4 }}> Responsable Cocina</label>
            <select value={responsableCocina} onChange={e => setResponsableCocina(e.target.value)} style={{ fontWeight: 500, background: '#f5f5f5', color: '#222', borderRadius: 6, padding: '8px 12px', border: '1px solid #e0e0e0', fontSize: '1rem', width: '100%' }}>
              <option value="">Seleccione</option>
              {usuariosCocina.map(u => (
                <option key={u.id} value={u.nombre}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div className="cuadre-caja-modal-row cuadre-caja-modal-title" style={{ justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, color: '#e53935', textAlign: 'center', marginBottom: 18, letterSpacing: '1px' }}>Inicial</div>
          <div className="cuadre-caja-modal-row">
            <label>Efectivo</label>
            <input type="text" value={formateaPesos(efectivo)} onChange={e => setEfectivo(filtraNumero(e.target.value))} placeholder="$" style={{ fontWeight: 500, textAlign: 'right', width: '100%' }} />
          </div>
          <div className="cuadre-caja-modal-row">
            <label>Moneda</label>
            <input type="text" value={formateaPesos(moneda)} onChange={e => setMoneda(filtraNumero(e.target.value))} placeholder="$" style={{ fontWeight: 500, textAlign: 'right', width: '100%' }} />
          </div>
          <div className="cuadre-caja-modal-row">
            <label>Transferencia</label>
            <input type="text" value={formateaPesos(transferencia)} onChange={e => setTransferencia(filtraNumero(e.target.value))} placeholder="$" style={{ fontWeight: 500, textAlign: 'right', width: '100%' }} />
          </div>
          <div className="cuadre-caja-modal-row cuadre-caja-modal-total">
            <label>Total</label>
            <input type="text" value={formateaPesos(total)} readOnly style={{ fontWeight: 700, color: '#1976d2', background: '#f5f5f5', textAlign: 'right', width: '100%' }} />
          </div>
          <div className="cuadre-caja-modal-footer" style={{ marginTop: 12, width: '100%' }}>
            <button className="cuadre-caja-nueva" style={{ width: '100%' }} onClick={() => onSave({ efectivo, moneda, transferencia, total, responsableCaja: usuario.nombre, responsableCocina })}>Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Formatea número como pesos sin decimales
function formateaPesos(valor) {
  valor = String(valor).replace(/\D/g, "");
  if (!valor) return "$ 0";
  return "$ " + Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 0 });
}
// Solo permite números
function filtraNumero(valor) {
  return valor.replace(/\D/g, "");
}
