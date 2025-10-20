import { supabase } from "../lib/supabaseClient";

export async function obtenerInfoUsuario() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { nombre: "Desconocido", rol: "Sin rol", id: null };
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  const nombre =
    perfil?.nombre ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "Sin nombre";

  const rol = perfil?.rol || user.user_metadata?.rol || "Sin rol";

  return { nombre, rol, id: user.id };
}
