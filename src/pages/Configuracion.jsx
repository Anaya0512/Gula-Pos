
import { Link } from "react-router-dom";

export default function Configuracion() {
  return (
    <div style={{padding:32}}>
      <h2>Configuración</h2>
      <Link to="/configuracion/roles">
        <button style={{padding:"8px 18px", fontSize:16}}>Gestionar roles y usuarios</button>
      </Link>
      <br />
      <Link to="/configuracion/clientes">
        <button style={{padding:"8px 18px", fontSize:16, marginTop:12}}>Gestionar clientes</button>
      </Link>
    </div>
  );
}
