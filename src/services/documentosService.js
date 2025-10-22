import { supabase } from "../lib/supabaseClient";

export async function obtenerDocumentosVentas({ desde, hasta }) {
  let query = supabase
    .from("documentos_ventas")
    .select("fecha, mesa, vendedor, cliente, documento, telefono, mediopago, pagadocon, valorventa")
    .order("fecha", { ascending: false });
  if (desde) query = query.gte("fecha", desde);
  if (hasta) query = query.lte("fecha", hasta);
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

// Guarda un documento de venta (comprobante/factura) en la base de datos
export async function guardarDocumentoVenta(documento) {
  // documento: { fecha, mesa, vendedor, cliente, documento, telefono, mediopago, pagadocon, valorventa }
  const doc = {
    fecha: documento.fecha,
    mesa: documento.mesa,
    vendedor: documento.vendedor,
    cliente: documento.cliente,
    documento: documento.documento,
    telefono: documento.telefono,
    mediopago: documento.mediopago || documento.medioPago,
    pagadocon: documento.pagadocon || documento.pagadoCon,
    valorventa: documento.valorventa || documento.valorVenta
  };
  const { data, error } = await supabase
    .from("documentos_ventas")
    .insert([doc]);
  if (error) {
    console.error("Error guardando documento de venta:", error.message);
    return { error };
  }
  return { data };
}
