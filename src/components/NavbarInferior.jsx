import { createPortal } from "react-dom";
import "../styles/NavbarInferior.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function NavbarInferior() {
  // Cerrar submenús al hacer click fuera de los botones de Productos, Inventario o Configuración
  useEffect(() => {
    function handleClickOutside(e) {
      // Verifica si el clic fue en algún botón de menú principal
      let clickEnBoton = false;
      Object.keys(referenciasBotones).forEach(key => {
        const ref = referenciasBotones[key];
        if (ref && ref.current && typeof ref.current.contains === 'function' && ref.current.contains(e.target)) {
          clickEnBoton = true;
        }
      });
      if (clickEnBoton) return;
      // Verifica si el clic fue dentro de un menú desplegable o submenú
      const submenu = document.querySelector('.ventana-submenu');
      const subsubmenu = document.querySelector('.ventana-subsubmenu');
      if (
        (submenu && submenu.contains(e.target)) ||
        (subsubmenu && subsubmenu.contains(e.target))
      ) {
        return;
      }
      setSubmenuVisible(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const navigate = useNavigate();
  const [submenuVisible, setSubmenuVisible] = useState(null);
  // Submenús simplificados, sin subsubmenuVisible
  // Eliminados posicionSubmenu y posicionSubsubmenu para limpiar warnings
  const opciones = [
    { nombre: "Dashboard", ruta: "/" },
    { nombre: "Vender", ruta: "/ventas" },
    { nombre: "Ventas", desplegable: true, submenu: [
      { nombre: "Cuadre de Caja", ruta: "/cuadre-caja" },
      { nombre: "Documentos", ruta: "/ventas/documentos" },
      { nombre: "Comandas", ruta: "/ventas/comandas" }
    ] },
    { nombre: "Productos", desplegable: true },
    { nombre: "Inventario", desplegable: true },
    { nombre: "Contabilidad", desplegable: true, submenu: [
      { nombre: "Gastos", ruta: "/contabilidad/gastos" },
      { nombre: "Tipo de Gastos", ruta: "/contabilidad/tipo-gastos" },
      { nombre: "Créditos Clientes", ruta: "/contabilidad/creditos-clientes" },
      { nombre: "Informes", ruta: "/contabilidad/informes" }
    ] },
    { nombre: "Estadísticas", ruta: "/estadisticas" },
    { nombre: "Proveedores", ruta: "/proveedores-admin" },
    { nombre: "Nómina", ruta: "/nomina" },
    { nombre: "Configuración", desplegable: true },
  ];

    // Referencias para todos los botones principales del navbar
  const refDashboard = useRef(null);
  const refVender = useRef(null);
  const refVentas = useRef(null);
  const refProductos = useRef(null);
  const refInventario = useRef(null);
  const refContabilidad = useRef(null);
  const refEstadísticas = useRef(null);
  const refProveedores = useRef(null);
  const refNómina = useRef(null);
  const refConfiguración = useRef(null);

    const referenciasBotones = {
      Dashboard: refDashboard,
      Vender: refVender,
      Ventas: refVentas,
      Productos: refProductos,
      Inventario: refInventario,
      Contabilidad: refContabilidad,
      Estadísticas: refEstadísticas,
      Proveedores: refProveedores,
      Nómina: refNómina,
      Configuración: refConfiguración,
    };

  const mostrarSubmenu = (grupo) => {
    if (submenuVisible === grupo) {
      setSubmenuVisible(null);
      return;
    }
    setSubmenuVisible(grupo);
  };

  // Eliminada función mostrarSubsubmenu para limpiar warnings

  const submenus = {
    Ventas: [
      { nombre: "Cuadre de Caja", ruta: "/cuadre-caja" },
      { nombre: "Documentos", ruta: "/ventas/documentos" },
      { nombre: "Comandas", ruta: "/ventas/comandas" }
    ],
    Productos: [
      { nombre: "Productos", ruta: "/productos" },
      { nombre: "Categorías", ruta: "/productos/categorias" },
    ],
    Inventario: [
      { nombre: "Historial de movimientos", ruta: "/inventario/movimientos" },
      { nombre: "Registrar movimiento", ruta: "/inventario/registro" },
      { nombre: "Registrar pedido a proveedor", ruta: "/inventario/pedido-proveedor" },
      { nombre: "Ver inventario", ruta: "/inventario/ver" },
    ],
    Configuración: [
      { nombre: "Roles", ruta: "/configuracion/roles" },
      { nombre: "Mesas", ruta: "/mesas/admin" },
      { nombre: "Info del negocio", ruta: "/configuracion/info-negocio" },
      { nombre: "Medios de pago", ruta: "/configuracion/medios-pago" },
      { nombre: "Usuarios", ruta: "/configuracion/usuarios" },
      { nombre: "Clientes", ruta: "/configuracion/clientes" },
    ],
    Contabilidad: [
      { nombre: "Gastos", ruta: "/contabilidad/gastos" },
      { nombre: "Tipo de Gastos", ruta: "/contabilidad/tipo-gastos" },
      { nombre: "Créditos Clientes", ruta: "/contabilidad/creditos-clientes" },
      { nombre: "Informes", ruta: "/contabilidad/informes" },
    ],
  };

  return (
    <>
      <nav className="navbar-inferior" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <ul className="opciones-nav" style={{ display: 'flex', gap: '12px', listStyle: 'none', padding: 0, margin: 0 }}>
          {opciones.map((opcion, index) => {
            if (opcion.desplegable && submenus[opcion.nombre]) {
              return (
                <li key={index} className="opcion-con-submenu" style={{ position: 'relative', display: 'inline-block' }}>
                  <button
                    ref={referenciasBotones[opcion.nombre]}
                    className={`btn-nav-grupo grupo-${opcion.nombre.toLowerCase()}`}
                    onClick={() => mostrarSubmenu(opcion.nombre)}
                  >
                    {opcion.nombre}
                    <span className="flecha">
                      {submenuVisible === opcion.nombre ? "▴" : "▾"}
                    </span>
                  </button>
                  {submenuVisible === opcion.nombre && (() => {
                    // Calcular posición del menú principal
                    const btn = referenciasBotones[opcion.nombre]?.current;
                    let left = 0, top = 60, transform = "translateX(-50%)";
                    const menuWidth = 160; // px
                    if (btn) {
                      const rect = btn.getBoundingClientRect();
                      left = rect.left + rect.width / 2;
                      top = rect.bottom + 8;
                      if (rect.left < menuWidth / 2) {
                        left = rect.left;
                        transform = "none";
                      } else if (left + menuWidth / 2 > window.innerWidth) {
                        left = window.innerWidth - menuWidth - 8;
                        transform = "none";
                      } else {
                        transform = "translateX(-50%)";
                      }
                    }
                    return createPortal(
                      <div
                        className={`ventana-submenu grupo-${submenuVisible.toLowerCase()}`}
                        style={{
                          position: "fixed",
                          top: top + "px",
                          left: left + "px",
                          transform: transform,
                          minWidth: "160px",
                          background: "#23232b",
                          color: "#fff",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                          padding: "12px 0 0 0",
                          zIndex: 100000,
                          textAlign: "center",
                          borderTop: "6px solid #e53935",
                          borderBottom: "6px solid #1976d2"
                        }}
                      >
                        {submenus[opcion.nombre].map((item, idx) => {
                          if (item.ruta) {
                            return (
                              <button
                                key={idx}
                                className="item-submenu"
                                onClick={() => {
                                  navigate(item.ruta);
                                  setSubmenuVisible(null);
                                }}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  background: "transparent",
                                  color: "#fff",
                                  fontWeight: 500,
                                  textAlign: "center",
                                  border: "none",
                                  borderRadius: "6px",
                                  padding: "10px 16px",
                                  margin: "2px 0",
                                  cursor: "pointer"
                                }}
                              >
                                {item.nombre}
                              </button>
                            );
                          }
                          return null;
                        })}
                      </div>, document.body
                    );
                  })()}
                </li>
              );
            } else {
              return (
                <li key={index}>
                  <button
                    className="btn-nav-grupo grupo-generico"
                    onClick={() => navigate(opcion.ruta)}
                  >
                    {opcion.nombre}
                  </button>
                </li>
              );
            }
          })}
        </ul>
      </nav>
    </>
  );
}
