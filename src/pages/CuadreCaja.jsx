import React from "react";
import "../styles/CuadreCaja.css";

const datosCuadre = [
  {
    fechaInicio: "2024-07-29 10:33:33 a. m.",
    fechaFin: "2024-08-23 09:21:36 a. m.",
    responsable: "Isabel",
    totalInicial: "$ 0",
    cerrada: "Si",
    comprobante: true,
    inventario: true,
  },
  {
    fechaInicio: "2024-07-29 09:34:38 a. m.",
    fechaFin: "2024-07-29 09:53:23 a. m.",
    responsable: "Isabel",
    totalInicial: "$ 50.000",
    cerrada: "Si",
    comprobante: true,
    inventario: true,
  },
  {
    fechaInicio: "2024-07-24 03:01:14 p. m.",
    fechaFin: "2024-07-29 09:13:42 a. m.",
    responsable: "Isabel",
    totalInicial: "$ 0",
    cerrada: "Si",
    comprobante: true,
    inventario: true,
  },
  {
    fechaInicio: "2024-07-24 02:55:45 p. m.",
    fechaFin: "2024-07-24 02:57:03 p. m.",
    responsable: "Isabel",
    totalInicial: "$ 100.000",
    cerrada: "Si",
    comprobante: true,
    inventario: true,
  },
  {
    fechaInicio: "2024-04-12 11:43:45 a. m.",
    fechaFin: "2024-07-24 02:55:15 p. m.",
    responsable: "Diana",
    totalInicial: "$ 50.000",
    cerrada: "Si",
    comprobante: true,
    inventario: true,
  },
];

export default function CuadreCaja() {
  return (
    <div className="cuadre-caja-container">
      <h2 className="cuadre-caja-title">CUADRES DE CAJA</h2>
      <div className="cuadre-caja-table-wrapper">
        <button className="cuadre-caja-nueva">Nueva</button>
        <table className="cuadre-caja-table">
          <thead>
            <tr>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Responsable</th>
              <th>Total Inicial</th>
              <th>Cerrada</th>
              <th></th>
              <th>Comprobante diario</th>
              <th>Inventario</th>
            </tr>
          </thead>
          <tbody>
            {datosCuadre.map((row, idx) => (
              <tr key={idx}>
                <td>{row.fechaInicio}</td>
                <td>{row.fechaFin}</td>
                <td>{row.responsable}</td>
                <td>{row.totalInicial}</td>
                <td>{row.cerrada}</td>
                <td>
                  <button className="cuadre-caja-ver">Ver</button>
                </td>
                <td>
                  <button className="cuadre-caja-icono">
                    <span role="img" aria-label="comprobante">🧾</span>
                  </button>
                </td>
                <td>
                  <button className="cuadre-caja-icono">
                    <span role="img" aria-label="inventario">📦</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
