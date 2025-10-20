import React, { useRef, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "../../styles/Factura.css";

export default function FacturaVenta({ ordenId, onClose }) {
  const facturaRef = useRef();
  const [venta, setVenta] = useState(null);
  const [productos, setProductos] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comprobante, setComprobante] = useState("");

  useEffect(() => {
    const fetchFactura = async () => {
      setLoading(true);
      // 1. Obtener venta principal (sin joins)
  const { data: ventaData } = await supabase.from("ventas").select("*").eq("id", ordenId).single();
      let ventaFull = { ...ventaData };
      // 2. Obtener datos relacionados si existen
      if (ventaData?.cliente_id) {
        const { data: clienteData } = await supabase.from("clientes").select("*").eq("id", ventaData.cliente_id).single();
        ventaFull.cliente = clienteData || null;
      }
      if (ventaData?.mesa_id) {
        const { data: mesaData } = await supabase.from("mesas").select("*").eq("id", ventaData.mesa_id).single();
        ventaFull.mesa = mesaData || null;
      }
      if (ventaData?.usuario_id) {
        const { data: usuarioData } = await supabase.from("usuarios").select("*").eq("id", ventaData.usuario_id).single();
        ventaFull.usuario = usuarioData || null;
      }
      setVenta(ventaFull);
      // 3. Obtener productos de la venta
      let productosData = [];
      if (ordenId) {
        const { data: detalles } = await supabase.from("detalle_venta").select("*, producto:producto_id(*)").eq("venta_id", ordenId);
        productosData = detalles?.map(d => ({
          nombre: d.producto?.nombre || "",
          cantidad: d.cantidad,
          precio: d.precio_unitario,
          subtotal: d.subtotal
        })) || [];
      }
      setProductos(productosData);
      // 4. Obtener empresa
      const { data: empresaData } = await supabase.from("negocio").select("*").single();
      setEmpresa(empresaData);
      // 5. Generar comprobante tipo LOG0001 secuencial
      const { data: ventas } = await supabase.from("ventas").select("comprobante_numero, id").order("comprobante_numero", { ascending: true });
      let numero = 1;
      if (ventas && ventas.length > 0) {
        // Buscar el mayor comprobante_numero
        const usados = ventas.map(v => v.comprobante_numero).filter(n => typeof n === 'number');
        if (usados.length > 0) {
          numero = Math.max(...usados) + 1;
        }
      }
      setComprobante(`LOG${numero.toString().padStart(4, "0")}`);
      // Guardar el número en la venta si no existe
      if (ventaData && !ventaData.comprobante_numero) {
        await supabase.from("ventas").update({ comprobante_numero: numero }).eq("id", ordenId);
      }
      setLoading(false);
    };
    if (ordenId) fetchFactura();
  }, [ordenId]);

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=650');
    if (!printWindow) return;
    // Usar el outerHTML del panel de factura para incluir todo el contenido
    const facturaHtml = facturaRef.current.outerHTML;
    printWindow.document.write(`
      <html>
        <head>
          <title>Factura</title>
          <link rel="stylesheet" href="${window.location.origin}/index.css" />
          <link rel="stylesheet" href="${window.location.origin}/global.css" />
          <style>
            @media print {
              body { background: #fff !important; margin: 0 !important; }
              .panel-factura { box-shadow: none !important; margin: 0 auto !important; page-break-inside: avoid; }
              .panel-factura * { color-adjust: exact; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              html, body { width: 100%; height: 100%; }
              .no-print { display: none !important; }
            }
            body { background: #f5f5f5; }
            .panel-factura { box-shadow: none !important; margin: 0 auto !important; }
          </style>
        </head>
        <body style="background:#fff;">
          <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;">
            ${facturaHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownloadPDF = async () => {
    if (!facturaRef.current) return;
    if (!window.html2pdf) {
      await new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = resolve;
        document.body.appendChild(script);
      });
    }
    // Convertir el logo a base64 antes de exportar
    if (empresa?.logo_url && empresa.logo_url.trim() !== '' && facturaRef.current) {
      const imgs = facturaRef.current.querySelectorAll('img');
      for (const img of imgs) {
        if (img.src && !img.src.startsWith('data:')) {
          let url = img.src;
          if (!url.startsWith('http')) url = window.location.origin + img.src;
          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const reader = new window.FileReader();
            await new Promise(resolve => {
              reader.onloadend = function() {
                img.src = reader.result;
                img.onload = resolve;
              };
              reader.readAsDataURL(blob);
            });
          } catch (e) { /* ignorar error de logo */ }
        }
      }
    }
    window.html2pdf().set({
      margin: 10,
      filename: `comprobante-${comprobante}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(facturaRef.current).save();
  };


  if (loading) return <div className="panel-factura">Cargando factura...</div>;

  // Validar datos mínimos
  const datosIncompletos = !venta || !empresa || !Array.isArray(productos) || productos.length === 0;

  return (
    <div className="panel-factura" ref={facturaRef} style={{maxWidth: 520, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '32px 24px 24px 24px', fontFamily: 'Segoe UI, sans-serif'}}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18, borderBottom: '2px solid #eee', paddingBottom: 18 }}>
          {empresa?.logo_url && empresa.logo_url.trim() !== '' ? (
            <img
              src={empresa.logo_url}
              alt="Logo"
              style={{ height: 80, objectFit: "contain", borderRadius: 12, background: '#f8f8f8', padding: 8 }}
              onError={e => {
                e.target.onerror = null;
                e.target.src = '/logo512.png';
                console.warn('No se pudo cargar el logo de negocio, se muestra placeholder. URL:', empresa.logo_url);
              }}
            />
          ) : (
            <img src="/logo512.png" alt="Logo" style={{ height: 80, objectFit: "contain", borderRadius: 12, background: '#f8f8f8', padding: 8 }} />
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{margin:0, fontWeight:700, fontSize:28}}>{empresa?.nombre || "Negocio"}</h2>
            <div style={{fontSize:16, color:'#555'}}>NIT: {empresa?.nit || "—"}</div>
            <div style={{fontSize:15, color:'#888'}}>Dirección: {empresa?.direccion || "—"}</div>
            <div style={{fontSize:15, color:'#888'}}>Teléfono: {empresa?.telefono || "—"}</div>
            <div style={{fontSize:15, color:'#888'}}>Correo: {empresa?.correo ?? empresa?.email ?? "—"}</div>
          </div>
        </div>
  <div style={{fontSize:17, fontWeight:600, marginBottom:8}}>Comprobante de Pago {comprobante}</div>
        <div style={{fontSize:15, color:'#666', marginBottom:8}}>Fecha: {venta?.creado_en ? new Date(venta.creado_en).toLocaleString() : "Sin fecha"}</div>
        <div style={{fontSize:15, color:'#666', marginBottom:8}}>Cliente: {venta?.cliente?.nombre || 'Cliente final'}</div>
        <div style={{fontSize:15, color:'#888', marginBottom:4}}>Cédula/NIT: {venta?.cliente?.cedula_nit ?? '—'}</div>
        <div style={{fontSize:15, color:'#888', marginBottom:4}}>Teléfono: {venta?.cliente?.telefono || '—'}</div>
        <div style={{fontSize:15, color:'#888', marginBottom:4}}>Dirección: {venta?.cliente?.direccion || '—'}</div>
        <div style={{fontSize:15, color:'#666', marginBottom:8}}>Mesa: {venta?.mesa?.nombre || venta?.mesa_id || "Sin mesa"}</div>
        <div style={{fontSize:15, color:'#666', marginBottom:8}}>Vendedor: {venta?.usuario?.nombre || 'Sin vendedor'}</div>
  <div style={{fontSize:15, color:'#666', marginBottom:8}}>Forma de pago: {venta?.metodo_pago || '—'}</div>
      </div>
      <div style={{margin:'18px 0'}}>
        {productos.length > 0 ? (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f8f8f8'}}>
                <th style={{padding:'8px 0', fontWeight:600}}>Producto</th>
                <th style={{padding:'8px 0', fontWeight:600}}>Cantidad</th>
                <th style={{padding:'8px 0', fontWeight:600}}>Precio</th>
                <th style={{padding:'8px 0', fontWeight:600}}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, idx) => (
                <tr key={idx}>
                  <td style={{padding:'6px 0'}}>{p.nombre || 'Producto'}</td>
                  <td style={{padding:'6px 0', textAlign:'center'}}>{p.cantidad ?? 0}</td>
                  <td style={{padding:'6px 0', textAlign:'right'}}>${(p.precio ?? 0).toLocaleString('es-CO')}</td>
                  <td style={{padding:'6px 0', textAlign:'right'}}>${(p.subtotal ?? 0).toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{color:'#c00', fontWeight:600, padding:'24px 0', textAlign:'center'}}>No hay productos en la factura o faltan datos. Verifica la venta.</div>
        )}
      </div>
      <div style={{fontSize:18, fontWeight:700, textAlign:'right', marginTop:18}}>Total: ${venta?.total?.toLocaleString('es-CO') || ""}</div>
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <div className="factura-acciones">
          <button className="btn-primary" style={{fontSize:18, padding:'10px 32px', borderRadius:8, marginRight:12}} onClick={onClose}>Cerrar</button>
          {!datosIncompletos && (
            <>
              <button className="btn-secondary" style={{fontSize:16, padding:'8px 24px', borderRadius:8}} onClick={handlePrint}>Imprimir</button>
              <button className="btn-primary" onClick={handleDownloadPDF}>Descargar PDF</button>
            </>
          )}
        </div>
        <style>{`
          @media print {
            .factura-acciones { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}