import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavbarInferior from "../components/NavbarInferior";
import NavbarSuperior from "../components/NavbarSuperior";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import ProductosAdmin from "../pages/ProductosAdmin";
import InventarioAdmin from "../pages/InventarioAdmin";
import InventarioMovimientos from "../pages/InventarioMovimientos";
import InventarioRegistroMovimiento from "../pages/InventarioRegistroMovimiento";
import InventarioPedidoProveedor from "../pages/InventarioPedidoProveedor";
import InventarioVer from "../pages/InventarioVer";
import CategoriasAdmin from "../pages/CategoriasAdmin";
import ProveedoresAdmin from "../pages/ProveedoresAdmin";
import Nomina from "../pages/Nomina";
import Estadisticas from "../pages/Estadisticas";
import Contabilidad from "../pages/Contabilidad";
import ProductosPOS from "../pages/ProductosPOS";
import POSCompleto from "../pages/POSCompleto";
import InformacionNegocio from "../pages/configuracion/InformacionNegocio";
import MediosPago from "../pages/configuracion/MediosPago";
import Roles from "../pages/configuracion/Roles";
import Clientes from "../pages/configuracion/Clientes";
import Usuarios from "../pages/configuracion/Usuarios";
import ConfiguracionMenu from "../pages/configuracion/ConfiguracionMenu";
import MesasSelector from "../pages/Mesas/MesasSelector";
import MesaPedido from "../pages/Mesas/MesaPedido";
import MesasAdmin from "../pages/Mesas/MesasAdmin";

function NotFound() {
	return <h2>Página no encontrada</h2>;
}

export default function AppRouter() {
	const usuarioLocal = localStorage.getItem("usuario_actual");
	const isAuthenticated = !!usuarioLocal;

	const currentPath = window.location.pathname;
	if (!isAuthenticated && currentPath !== "/login") {
		window.location.href = "/login";
		return null;
	}

		return (
			<Router>
				{currentPath !== "/login" && <NavbarSuperior />}
				{currentPath !== "/login" && <NavbarInferior />}
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/" element={<Dashboard />} />
					<Route path="/mesas" element={<MesasSelector />} />
					<Route path="/mesas/admin" element={<MesasAdmin />} />
					<Route path="/mesa/:id" element={<MesaPedido />} />
					<Route path="/productos" element={<ProductosAdmin />} />
					  <Route path="/productos/inventario" element={<InventarioAdmin />} />
					  <Route path="/inventario/ver" element={<InventarioVer />} />
					  <Route path="/inventario/movimientos" element={<InventarioMovimientos />} />
					  <Route path="/inventario/registro" element={<InventarioRegistroMovimiento />} />
					  <Route path="/inventario/pedido-proveedor" element={<InventarioPedidoProveedor />} />
					<Route path="/productos/categorias" element={<CategoriasAdmin />} />
					<Route path="/proveedores-admin" element={<ProveedoresAdmin />} />
					<Route path="/nomina" element={<Nomina />} />
					<Route path="/estadisticas" element={<Estadisticas />} />
					<Route path="/contabilidad" element={<Contabilidad />} />
					<Route path="/productos-pos" element={<ProductosPOS />} />
					<Route path="/ventas" element={<MesasSelector />} />
					<Route path="/configuracion" element={<ConfiguracionMenu />} />
					  <Route path="/configuracion/info-negocio" element={<InformacionNegocio />} />
					  <Route path="/configuracion/medios-pago" element={<MediosPago />} />
					<Route path="/configuracion/roles" element={<Roles />} />
					<Route path="/configuracion/usuarios" element={<Usuarios />} />
					<Route path="/configuracion/clientes" element={<Clientes />} />
					<Route path="/pos" element={<POSCompleto />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</Router>
		);
}