import { supabase } from "../lib/supabaseClient";

export async function obtenerInfoUsuario() {
  // Primero intenta obtener usuario de Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user && !error) {
    // Buscar en la tabla usuarios por correo
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("id, nombre, rol, correo")
      .eq("correo", user.email)
      .single();
    if (perfil) {
      return { nombre: perfil.nombre, rol: perfil.rol, id: perfil.id, correo: perfil.correo };
    }
    // Si no está en la tabla, retorna datos básicos
    return { nombre: user.email, rol: "Sin rol", id: user.id, correo: user.email };
  }
  // Si no hay sesión Supabase, intenta obtener usuario de localStorage (login manual)
  try {
    const usuarioLS = JSON.parse(localStorage.getItem("usuario_actual"));
    if (usuarioLS && usuarioLS.correo) {
      return {
        nombre: usuarioLS.nombre,
        rol: usuarioLS.rol || "Sin rol",
        id: usuarioLS.id,
        correo: usuarioLS.correo
      };
    }
  } catch (e) {}
  return { nombre: "Desconocido", rol: "Sin rol", id: null, correo: null };
}
