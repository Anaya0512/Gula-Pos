import { supabase } from "../lib/supabaseClient";

/**
 * Busca o crea automáticamente una orden activa para la mesa.
 */
export async function obtenerOrdenActiva(mesa_id) {
  try {
    const { data: ordenExistente, error, status } = await supabase
        .from("ventas")
      .select("id")
      .eq("mesa_id", mesa_id)
      .eq("estado", "abierta")
      .maybeSingle();

    if (error && status !== 406) {
      console.error("❌ Error al consultar orden activa:", error.message);
      return null;
    }

    if (!ordenExistente) {
      const { data: nuevaOrden, error: errInsert } = await supabase
          .from("ventas")
        .insert([{ mesa_id, estado: "abierta", fecha: new Date().toISOString() }])
        .select()
        .single();

      if (errInsert) {
        console.error("❌ Error creando orden:", errInsert.message);
        return null;
      }

      return nuevaOrden;
    }

    return ordenExistente;
  } catch (err) {
    console.error("❌ Error inesperado en obtenerOrdenActiva:", err.message);
    return null;
  }
}

/**
 * Inserta productos como pedido en una orden activa.
 */
export async function hacerPedidoAMesa({ mesa_id, orden_id, productos, atendido_por, usuario_id }) {
  if (!productos?.length) {
    console.warn("⚠️ Lista de productos vacía");
    return { error: "Lista de productos vacía" };
  }

  const items = productos.map((p) => ({
    orden_id,
    mesa_id,
    producto_id: p.producto_id,
    cantidad: p.cantidad ?? 1,
    precio_unitario: p.precio_unitario,
    es_baja: p.es_baja ?? false,
    es_consumo_interno: p.es_consumo_interno ?? false,
    es_cortesia: p.es_cortesia ?? false,
    atendido_por,
    fecha: new Date().toISOString(),
    usuario_id,
  }));

  try {
    const { error } = await supabase.from("orden_detalle").insert(items);

    if (error) {
      console.error("❌ Error al insertar pedido:", error.message);
    }

    return { error };
  } catch (err) {
    console.error("❌ Error inesperado en hacerPedidoAMesa:", err.message);
    return { error: err.message };
  }
}
