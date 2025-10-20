import NavbarSuperior from "../components/NavbarSuperior";
import NavbarInferior from "../components/NavbarInferior";
import { Outlet } from "react-router-dom";

export default function LayoutPrincipal() {
  return (
    <>
      <NavbarSuperior />
      <NavbarInferior />
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}
