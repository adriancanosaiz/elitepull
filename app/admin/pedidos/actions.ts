"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  cancelAdminOrder,
  markAdminOrderPaymentFailed,
  resendAdminOrderConfirmationEmail,
} from "@/lib/admin/orders";

const adminOrderActionSchema = z.object({
  orderId: z.string().uuid("El id del pedido no es valido."),
});

function buildRedirectUrl(basePath: string, params: Record<string, string | undefined>) {
  const [pathname, rawQuery = ""] = basePath.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  searchParams.delete("success");
  searchParams.delete("error");

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getOrderActionErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "No se pudo procesar la accion del pedido.";
  }

  if (error instanceof Error) {
    return error.message.replace(/^\[[^\]]+\]\s*/, "");
  }

  return "Ha ocurrido un error inesperado.";
}

function getOrderDetailPath(orderId?: string) {
  return orderId ? `/admin/pedidos/${orderId}` : "/admin/pedidos";
}

function revalidateAdminOrderPaths(orderId: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function cancelAdminOrderAction(formData: FormData) {
  const parsedOrderId = adminOrderActionSchema.safeParse({
    orderId: formData.get("orderId"),
  });
  const orderId = parsedOrderId.success ? parsedOrderId.data.orderId : undefined;
  let targetPath = getOrderDetailPath(orderId);

  try {
    const { orderId } = adminOrderActionSchema.parse({
      orderId: formData.get("orderId"),
    });
    const result = await cancelAdminOrder(orderId);

    revalidateAdminOrderPaths(result.id);
    targetPath = buildRedirectUrl(getOrderDetailPath(result.id), {
      success: "cancelled",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getOrderDetailPath(orderId), {
      error: getOrderActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function markAdminOrderPaymentFailedAction(formData: FormData) {
  const parsedOrderId = adminOrderActionSchema.safeParse({
    orderId: formData.get("orderId"),
  });
  const orderId = parsedOrderId.success ? parsedOrderId.data.orderId : undefined;
  let targetPath = getOrderDetailPath(orderId);

  try {
    const { orderId } = adminOrderActionSchema.parse({
      orderId: formData.get("orderId"),
    });
    const result = await markAdminOrderPaymentFailed(orderId);

    revalidateAdminOrderPaths(result.id);
    targetPath = buildRedirectUrl(getOrderDetailPath(result.id), {
      success: "payment-failed",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getOrderDetailPath(orderId), {
      error: getOrderActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function resendAdminOrderConfirmationEmailAction(formData: FormData) {
  const parsedOrderId = adminOrderActionSchema.safeParse({
    orderId: formData.get("orderId"),
  });
  const orderId = parsedOrderId.success ? parsedOrderId.data.orderId : undefined;
  let targetPath = getOrderDetailPath(orderId);

  try {
    const { orderId } = adminOrderActionSchema.parse({
      orderId: formData.get("orderId"),
    });
    const result = await resendAdminOrderConfirmationEmail(orderId);

    revalidateAdminOrderPaths(result.id);
    targetPath = buildRedirectUrl(getOrderDetailPath(result.id), {
      success: "email-resent",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getOrderDetailPath(orderId), {
      error: getOrderActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}
