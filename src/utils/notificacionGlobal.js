export function mostrarNotificacionGlobal(mensaje, tipo = "informacion") {
  const colores = {
    exito: "#4caf50",
    error: "#f44336",
    advertencia: "#ff9800",
    informacion: "#2196f3",
  };

  const fondo = colores[tipo] || colores.informacion;

  const noti = document.createElement("div");
  noti.textContent = mensaje;
  noti.style.position = "fixed";
  noti.style.top = "20px";
  noti.style.right = "20px";
  noti.style.background = fondo;
  noti.style.color = "#fff";
  noti.style.padding = "0.75rem 1rem";
  noti.style.borderRadius = "6px";
  noti.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  noti.style.zIndex = "9999";
  noti.style.fontFamily = "Segoe UI, sans-serif";
  noti.style.transition = "opacity 0.3s ease";

  document.body.appendChild(noti);

  setTimeout(() => {
    noti.style.opacity = "0";
    setTimeout(() => noti.remove(), 300);
  }, 3000);
}
