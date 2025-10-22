import { supabase } from "../lib/supabaseClient";

export async function obtenerUsuariosActivos() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre, correo, rol")
    .eq("active", "true");
  if (error) return [];
  return data || [];
}
