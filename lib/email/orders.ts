import { Resend } from "resend";
import { z } from "zod";

import { formatPrice } from "@/lib/catalog";

const resendEnvSchema = z.object({
  RESEND_API_KEY: z.string().trim().min(1, "Falta RESEND_API_KEY."),
  RESEND_FROM_EMAIL: z.string().trim().email("Falta RESEND_FROM_EMAIL valido."),
});

type OrderConfirmationEmailItem = {
  name: string;
  quantity: number;
  lineTotal: number;
};

export type OrderConfirmationEmailPayload = {
  orderId: string;
  customerEmail: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  items: OrderConfirmationEmailItem[];
};

let resendClient: Resend | null = null;

function getRequiredResendEnv() {
  return resendEnvSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  });
}

function createResendClient() {
  if (resendClient) {
    return resendClient;
  }

  const env = getRequiredResendEnv();
  resendClient = new Resend(env.RESEND_API_KEY);

  return resendClient;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatOrderTotal(amountTotal: number, currency: string) {
  if (currency.toLowerCase() === "eur") {
    return formatPrice(amountTotal);
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountTotal);
}

function buildItemsHtml(items: OrderConfirmationEmailItem[]) {
  return items
    .map(
      (item) =>
        `<li style="margin-bottom:8px;"><strong>${escapeHtml(item.name)}</strong> x ${
          item.quantity
        } <span style="color:#94a3b8;">(${escapeHtml(formatPrice(item.lineTotal))})</span></li>`,
    )
    .join("");
}

function buildItemsText(items: OrderConfirmationEmailItem[]) {
  return items
    .map((item) => `- ${item.name} x ${item.quantity} (${formatPrice(item.lineTotal)})`)
    .join("\n");
}

export async function sendOrderPaidConfirmationEmail(
  payload: OrderConfirmationEmailPayload,
) {
  const resend = createResendClient();
  const env = getRequiredResendEnv();
  const totalLabel = formatOrderTotal(payload.amountTotal, payload.currency);
  const customerLabel = payload.customerName?.trim() || "Hola";
  const subject = `Pedido confirmado ${payload.orderId.slice(0, 8).toUpperCase()} · ElitePull`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a;">
      <p style="font-size:14px;color:#64748b;margin:0 0 12px;">ElitePull</p>
      <h1 style="font-size:28px;line-height:1.2;margin:0 0 16px;">Tu pedido ha quedado confirmado</h1>
      <p style="font-size:16px;line-height:1.7;margin:0 0 20px;">${escapeHtml(
        customerLabel,
      )}, hemos recibido correctamente tu pago.</p>
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 8px;"><strong>Pedido:</strong> ${escapeHtml(payload.orderId)}</p>
        <p style="margin:0 0 8px;"><strong>Total:</strong> ${escapeHtml(totalLabel)}</p>
        <p style="margin:0;"><strong>Email:</strong> ${escapeHtml(payload.customerEmail)}</p>
      </div>
      <h2 style="font-size:18px;margin:0 0 12px;">Resumen</h2>
      <ul style="padding-left:20px;line-height:1.7;margin:0 0 20px;">
        ${buildItemsHtml(payload.items)}
      </ul>
      <p style="font-size:14px;line-height:1.7;color:#475569;margin:0;">
        La confirmacion final del pedido se apoya en Stripe y nuestro webhook. Si necesitas ayuda,
        responde a este email.
      </p>
    </div>
  `;

  const text = [
    "ElitePull",
    "",
    "Tu pedido ha quedado confirmado.",
    `Pedido: ${payload.orderId}`,
    `Total: ${totalLabel}`,
    `Email: ${payload.customerEmail}`,
    "",
    "Resumen:",
    buildItemsText(payload.items),
  ].join("\n");

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: [payload.customerEmail],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`[orders-email] No se pudo enviar el email de confirmacion: ${error.message}`);
  }

  return data;
}
