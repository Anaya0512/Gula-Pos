// ✅ Nuevo archivo obtenerOrdenActiva.js
import { supabase } from "../lib/supabaseClient";

export async function obtenerOrdenActiva(mesaId) {
  const { data, error } = await supabase
      .from("ventas")
    .select("*")
    .eq("mesa_id", mesaId)
    .eq("estado", "abierta")
    .single();

  if (error || !data) {
    const { data: nuevaOrden, error: errInsert } = await supabase
        .from("ventas")
      .insert([{ mesa_id: mesaId, estado: "abierta", fecha: new Date().toISOString() }])
      .select()
      .single();

    if (errInsert) return null;
    return nuevaOrden;
  }

  return data;
}
