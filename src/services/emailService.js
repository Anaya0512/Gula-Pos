import { Resend } from "resend";

const resend = new Resend("tu-api-key-aquí"); // ⚠️ Pone tu clave real aquí

export async function enviarTicketPorCorreo({ to, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Gula POS <no-reply@tuservidor.com>",
      to,
      subject: "🧾 Ticket de tu pedido en Loncherías Gula",
      html,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
