import React, { useState } from "react";
import "../styles/DocumentosVentas.css";
import { obtenerDocumentosVentas } from "../services/documentosService";

export default function DocumentosVentas() {
  const [datos, setDatos] = useState([]);
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [filtroMesa, setFiltroMesa] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [cargando, setCargando] = useState(false);

  const buscarDocumentos = async () => {
    setCargando(true);
    let docs = await obtenerDocumentosVentas({ desde: filtroDesde, hasta: filtroHasta });
    // Filtros adicionales en frontend
    if (filtroMesa) docs = docs.filter(d => d.mesa?.toLowerCase().includes(filtroMesa.toLowerCase()));
    if (filtroVendedor) docs = docs.filter(d => d.vendedor?.toLowerCase().includes(filtroVendedor.toLowerCase()));
    if (filtroCliente) docs = docs.filter(d => d.cliente?.toLowerCase().includes(filtroCliente.toLowerCase()));
    setDatos(docs);
    setCargando(false);
  };

  return (
    <div className="documentos-ventas-container" style={{maxWidth: '1400px', margin: '32px auto', padding: '24px 32px', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)'}}>
      <h2 className="documentos-ventas-title">RESUMEN DE DOCUMENTOS</h2>
      <div className="documentos-ventas-filtros" style={{marginBottom: '24px', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '16px'}}>
        <input type="datetime-local" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} />
        <input type="datetime-local" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} />
        <input type="text" placeholder="Mesa" value={filtroMesa} onChange={e => setFiltroMesa(e.target.value)} />
        <input type="text" placeholder="Vendedor" value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)} />
        <input type="text" placeholder="Cliente" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />
        <button className="documentos-ventas-buscar" onClick={buscarDocumentos} disabled={cargando}>{cargando ? "Buscando..." : "Buscar"}</button>
      </div>
      <div style={{width: '100%', overflowX: 'auto'}}>
        <table className="documentos-ventas-table" style={{minWidth: '900px', width: '100%'}}>
          <thead>
            <tr>
              <th>Fecha de creación</th>
              <th>No.</th>
              <th>Mesa</th>
              <th>Vendedor</th>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Medio de Pago</th>
              <th>Pagado con</th>
              <th>Valor Venta</th>
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>No hay documentos para mostrar</td></tr>
            ) : (
              datos.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.fecha}</td>
                  <td>{`POS${40 + idx}`}</td>
                  <td>{row.mesa}</td>
                  <td>{row.vendedor}</td>
                  <td>{row.cliente}</td>
                  <td>{row.documento}</td>
                  <td>{row.telefono}</td>
                  <td>{row.medioPago}</td>
                  <td>{row.pagadoCon}</td>
                  <td>$ {Number(row.valorVenta).toLocaleString("es-CO")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
