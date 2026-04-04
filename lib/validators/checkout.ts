import { z } from "zod";

import { createUuidLikeSchema } from "@/lib/validators/uuid-like";

function normalizeOptionalString(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseQuantity(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue ? Number(trimmedValue) : value;
  }

  return value;
}

export const checkoutOrderStatusSchema = z.enum([
  "pending_checkout",
  "checkout_created",
  "paid",
  "cancelled",
  "payment_failed",
]);

export const checkoutCartItemSchema = z.object({
  productId: createUuidLikeSchema("Uno de los productos del carrito no es valido."),
  quantity: z.preprocess(
    parseQuantity,
    z
      .number()
      .int("La cantidad debe ser un entero.")
      .positive("La cantidad debe ser mayor que cero.")
      .max(25, "No puedes pedir mas de 25 unidades de un mismo producto en V1."),
  ),
});

export const checkoutRequestSchema = z.object({
    customerEmail: z.preprocess(
      normalizeOptionalString,
      z.string().email("Introduce un email valido para continuar con el checkout.").optional(),
    ),
    customerName: z.preprocess(
      normalizeOptionalString,
      z.string().min(1).max(120).optional(),
    ),
    notes: z.preprocess(
      normalizeOptionalString,
      z.string().max(500, "Las notas no pueden superar los 500 caracteres.").optional(),
    ),
    source: z.preprocess(
      normalizeOptionalString,
      z.enum(["storefront"]).default("storefront"),
    ),
    items: z
      .array(checkoutCartItemSchema)
      .min(1, "El carrito esta vacio.")
      .max(50, "No puedes procesar mas de 50 lineas de carrito en V1."),
  })
  .superRefine((payload, ctx) => {
    const seenProductIds = new Set<string>();

    payload.items.forEach((item, index) => {
      if (seenProductIds.has(item.productId)) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "productId"],
          message: "No repitas el mismo producto dentro del payload del checkout.",
        });
      }

      seenProductIds.add(item.productId);
    });
  });

export type CheckoutOrderStatus = z.infer<typeof checkoutOrderStatusSchema>;
export type CheckoutCartItemInput = z.infer<typeof checkoutCartItemSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
