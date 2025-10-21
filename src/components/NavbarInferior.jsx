import "../styles/NavbarInferior.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function NavbarInferior() {
  // Cerrar submenús al hacer click fuera de los botones de Productos, Inventario o Configuración
  useEffect(() => {
    function handleClickOutside(e) {
      const productosBtn = referenciasBotones.Productos.current;
      const configBtn = referenciasBotones.Configuración.current;
      const inventarioBtn = referenciasBotones.Inventario.current;
      // Verifica si el clic fue en algún botón de menú principal
      if (
        (productosBtn && productosBtn.contains(e.target)) ||
        (configBtn && configBtn.contains(e.target)) ||
        (inventarioBtn && inventarioBtn.contains(e.target))
      ) {
        return;
      }
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
      setSubsubmenuVisible(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const navigate = useNavigate();
  const [submenuVisible, setSubmenuVisible] = useState(null);
  const [subsubmenuVisible, setSubsubmenuVisible] = useState(null);
  const [posicionSubmenu, setPosicionSubmenu] = useState({ x: 0, y: 0 });
  const [posicionSubsubmenu, setPosicionSubsubmenu] = useState({ x: 0, y: 0 });
  const opciones = [
    { nombre: "🏠 Dashboard", ruta: "/" },
    { nombre: "🛍️ Vender", ruta: "/ventas" },
    { nombre: "📦 Ventas", ruta: "/ventas/resumen/a5f30650-028c-4233-b278-3c42e3912b2f" },
    { nombre: "Productos", desplegable: true },
    { nombre: "📊 Contabilidad", desplegable: true, submenu: [
      { nombre: "Gastos", ruta: "/contabilidad/gastos" },
      { nombre: "Tipo de Gastos", ruta: "/contabilidad/tipo-gastos" },
      { nombre: "Créditos Clientes", ruta: "/contabilidad/creditos-clientes" },
      { nombre: "Informes", ruta: "/contabilidad/informes" }
    ] },
    { nombre: "📈 Estadísticas", ruta: "/estadisticas" },
    { nombre: "🏢 Proveedores", ruta: "/proveedores-admin" },
    { nombre: "🧑‍💼 Nómina", ruta: "/nomina" },
    { nombre: "Configuración", desplegable: true },
  ];

  const referenciasBotones = {
    Productos: useRef(null),
    Configuración: useRef(null),
    Inventario: useRef(null),
    "📊 Contabilidad": useRef(null),
  };

  const mostrarSubmenu = (grupo) => {
    if (submenuVisible === grupo) {
      setSubmenuVisible(null);
      setSubsubmenuVisible(null);
      return;
    }
    const ref = referenciasBotones[grupo]?.current;
    if (ref) {
      const rect = ref.getBoundingClientRect();
      setPosicionSubmenu({ x: rect.left, y: rect.bottom });
    } else {
      // fallback para submenús sin referencia
      setPosicionSubmenu({ x: 0, y: 48 });
    }
    setSubmenuVisible(grupo);
    setSubsubmenuVisible(null);
  };

  const mostrarSubsubmenu = (nombre, event) => {
    if (subsubmenuVisible === nombre) {
      setSubsubmenuVisible(null);
      return;
    }
    const rect = event.target.getBoundingClientRect();
    setPosicionSubsubmenu({ x: rect.right + 4, y: rect.top });
    setSubsubmenuVisible(nombre);
  };

  const submenus = {
    Productos: [
      { nombre: "📋 Productos", ruta: "/productos" },
      {
        nombre: "📦 Inventario",
        esInventario: true,
        subsubmenu: [
          { nombre: "📑 Historial de movimientos", ruta: "/inventario/movimientos" },
          { nombre: "➕ Registrar movimiento", ruta: "/inventario/registro" },
          { nombre: "� Registrar pedido a proveedor", ruta: "/inventario/pedido-proveedor" },
          { nombre: "🗂️ Ver inventario", ruta: "/inventario/ver" },
        ]
      },
      { nombre: "🗂️ Categorías", ruta: "/productos/categorias" },
    ],
    Configuración: [
      { nombre: "🧑‍💼 Roles", ruta: "/configuracion/roles" },
      { nombre: "🪑 Mesas", ruta: "/mesas/admin" },
      { nombre: "🏢 Info del negocio", ruta: "/configuracion/info-negocio" },
      { nombre: "💳 Medios de pago", ruta: "/configuracion/medios-pago" },
      { nombre: "� Usuarios", ruta: "/configuracion/usuarios" },
      { nombre: "�👤 Clientes", ruta: "/configuracion/clientes" },
    ],
    "📊 Contabilidad": [
      { nombre: "Gastos", ruta: "/contabilidad/gastos" },
      { nombre: "Tipo de Gastos", ruta: "/contabilidad/tipo-gastos" },
      { nombre: "Créditos Clientes", ruta: "/contabilidad/creditos-clientes" },
      { nombre: "Informes", ruta: "/contabilidad/informes" },
    ],
  };

  return (
    <>
      <nav className="navbar-inferior">
        <ul className="opciones-nav">
          {opciones.map((opcion, index) => {
            if (opcion.desplegable && submenus[opcion.nombre]) {
              return (
                <li key={index} className="opcion-con-submenu">
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
                  {submenuVisible === opcion.nombre && (
                    <div
                      className={`ventana-submenu grupo-${submenuVisible.toLowerCase()}${submenuVisible === "Inventario" ? " grupo-productos" : ""}`}
                      style={{
                        position: "fixed",
                        top: posicionSubmenu.y + 4,
                        left: posicionSubmenu.x,
                      }}
                    >
                      {submenus[opcion.nombre].map((item, idx) => {
                        if (item.esInventario) {
                          return (
                            <button
                              key={idx}
                              className="item-submenu"
                              ref={referenciasBotones.Inventario}
                              onClick={e => mostrarSubsubmenu(item.nombre, e)}
                              style={{fontWeight:'bold',background:'transparent'}}
                            >
                              {item.nombre}
                            </button>
                          );
                        } else if (item.subsubmenu) {
                          // fallback for any other subsubmenu
                          return null;
                        } else {
                          return (
                            <button
                              key={idx}
                              className="item-submenu"
                              onClick={() => {
                                navigate(item.ruta);
                                setSubmenuVisible(null);
                              }}
                            >
                              {item.nombre}
                            </button>
                          );
                        }
                      })}
                      {subsubmenuVisible === "📦 Inventario" && (
                        <div
                          className="ventana-subsubmenu"
                          style={{
                            position: "fixed",
                            top: posicionSubsubmenu.y,
                            left: posicionSubsubmenu.x,
                            zIndex: 9999,
                            background: '#fff',
                            borderRadius: 8,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                            padding: 8
                          }}
                        >
                          {submenus.Productos.find(i => i.nombre === "📦 Inventario").subsubmenu.map((subitem, subidx) => (
                            <button
                              key={subidx}
                              className="item-submenu"
                              onClick={() => {
                                navigate(subitem.ruta);
                                setSubmenuVisible(null);
                                setSubsubmenuVisible(null);
                              }}
                              style={{
                                display: 'block',
                                width: '100%',
                                marginBottom: 2,
                                background: 'transparent',
                                color: '#222',
                                fontWeight: 400,
                                textAlign: 'left',
                                border: 'none',
                                borderRadius: 0,
                                padding: '8px 16px',
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                              }}
                              onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                              {subitem.nombre}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
