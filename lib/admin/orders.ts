import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireAdminAccess } from "@/lib/auth/admin";
import {
  parseStoredCheckoutOrderAddress,
  type CheckoutOrderAddress,
} from "@/lib/checkout/delivery";
import { markOrderConfirmationEmailSent } from "@/lib/checkout/orders";
import { sendOrderPaidConfirmationEmail } from "@/lib/email/orders";
import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  checkoutOrderStatusSchema,
  type CheckoutOrderStatus,
} from "@/lib/validators/checkout";

const adminOrderIdSchema = z.string().uuid();
const adminOrderActionResultSchema = z.object({
  id: z.string().uuid(),
  status: checkoutOrderStatusSchema,
});

const adminOrdersServiceEnvSchema = z.object({
  supabaseUrl: z.string().trim().url("Falta una SUPABASE URL valida."),
  serviceRoleKey: z.string().trim().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY."),
});

type AdminOrderRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: CheckoutOrderStatus;
  customer_email: string;
  customer_name: string | null;
  amount_total: number | string | null;
  currency: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address_json: unknown;
  billing_address_json: unknown;
  shipping_rate_label: string | null;
  shipping_rate_amount: number | string | null;
  notes: string | null;
  items_count: number | null;
  source: string | null;
  metadata: unknown;
};

type AdminOrderItemRow = {
  id: string;
  created_at: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  product_slug_snapshot: string;
  unit_price: number | string | null;
  quantity: number;
  line_total: number | string | null;
  product_type_snapshot: string;
  brand_slug_snapshot: string;
  metadata: unknown;
};

export type AdminOrderListItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: CheckoutOrderStatus;
  customerEmail: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  itemsCount: number;
  source?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
};

export type AdminOrderItemSnapshot = {
  id: string;
  createdAt: string;
  orderId: string;
  productId?: string;
  productNameSnapshot: string;
  productSlugSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  productTypeSnapshot: string;
  brandSlugSnapshot: string;
  metadata: Record<string, unknown>;
};

export type AdminOrderDetail = AdminOrderListItem & {
  notes?: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: CheckoutOrderAddress | null;
  billingAddress?: CheckoutOrderAddress | null;
  shippingRateLabel?: string;
  shippingRateAmount?: number;
  metadata: Record<string, unknown>;
  items: AdminOrderItemSnapshot[];
};

export type AdminOrderStatusActionResult = {
  id: string;
  status: CheckoutOrderStatus;
};

export type AdminOrderEmailActionResult = {
  id: string;
  customerEmail: string;
};

const MANUAL_CANCEL_ALLOWED_FROM = new Set<CheckoutOrderStatus>([
  "pending_checkout",
  "checkout_created",
  "payment_failed",
]);

const MANUAL_PAYMENT_FAILED_ALLOWED_FROM = new Set<CheckoutOrderStatus>([
  "checkout_created",
]);

function getAdminOrdersServiceEnv() {
  return adminOrdersServiceEnvSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function createAdminOrdersServiceClient() {
  const env = getAdminOrdersServiceEnv();

  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as SupabaseClient<Database>;
}

function parseMoney(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

function parseMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function mapAdminOrderListItem(row: AdminOrderRow): AdminOrderListItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: checkoutOrderStatusSchema.parse(row.status),
    customerEmail: row.customer_email,
    customerName: row.customer_name ?? undefined,
    amountTotal: parseMoney(row.amount_total),
    currency: row.currency?.trim() || "eur",
    itemsCount: Math.max(row.items_count ?? 0, 0),
    source: row.source?.trim() || undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id ?? undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
  };
}

function mapOptionalAddress(value: unknown) {
  return parseStoredCheckoutOrderAddress(value);
}

function mapAdminOrderItem(row: AdminOrderItemRow): AdminOrderItemSnapshot {
  return {
    id: row.id,
    createdAt: row.created_at,
    orderId: row.order_id,
    productId: row.product_id ?? undefined,
    productNameSnapshot: row.product_name_snapshot,
    productSlugSnapshot: row.product_slug_snapshot,
    unitPrice: parseMoney(row.unit_price),
    quantity: row.quantity,
    lineTotal: parseMoney(row.line_total),
    productTypeSnapshot: row.product_type_snapshot,
    brandSlugSnapshot: row.brand_slug_snapshot,
    metadata: parseMetadata(row.metadata),
  };
}

async function getAdminOrderRowForMutation(
  client: SupabaseClient<Database>,
  id: string,
) {
  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-orders] No se pudo validar el pedido: ${error.message}`);
  }

  if (!data) {
    throw new Error("El pedido no existe o ya no esta disponible.");
  }

  return adminOrderActionResultSchema.parse(data) as AdminOrderStatusActionResult;
}

async function updateAdminOrderStatus(
  id: string,
  nextStatus: CheckoutOrderStatus,
  allowedStatuses: Set<CheckoutOrderStatus>,
  invalidTransitionMessage: string,
) {
  await requireAdminAccess();

  const parsedId = adminOrderIdSchema.parse(id);
  const client = createAdminOrdersServiceClient();
  const currentOrder = await getAdminOrderRowForMutation(client, parsedId);

  if (currentOrder.status === nextStatus) {
    throw new Error(`El pedido ya esta marcado como ${nextStatus}.`);
  }

  if (!allowedStatuses.has(currentOrder.status)) {
    throw new Error(invalidTransitionMessage);
  }

  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .update({
      status: nextStatus,
    })
    .eq("id", parsedId)
    .eq("status", currentOrder.status)
    .select("id, status")
    .single();

  if (error) {
    throw new Error(`[admin-orders] No se pudo actualizar el estado del pedido: ${error.message}`);
  }

  return adminOrderActionResultSchema.parse(data) as AdminOrderStatusActionResult;
}

export async function getAdminOrdersList(status?: CheckoutOrderStatus) {
  await requireAdminAccess();

  const supabase = await createSupabaseServerClient();
  const ordersTable = supabase.from("orders") as any;
  let query = ordersTable
    .select(
      "id, created_at, updated_at, status, customer_email, customer_name, amount_total, currency, stripe_checkout_session_id, stripe_payment_intent_id, shipping_name, shipping_phone, shipping_address_json, billing_address_json, shipping_rate_label, shipping_rate_amount, notes, items_count, source, metadata",
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`[admin-orders] No se pudo cargar el listado de pedidos: ${error.message}`);
  }

  return ((data ?? []) as AdminOrderRow[]).map(mapAdminOrderListItem);
}

export async function getAdminOrderById(id: string) {
  await requireAdminAccess();

  const parsedId = adminOrderIdSchema.safeParse(id);

  if (!parsedId.success) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const ordersTable = supabase.from("orders") as any;
  const orderItemsTable = supabase.from("order_items") as any;

  const { data: orderData, error: orderError } = await ordersTable
    .select(
      "id, created_at, updated_at, status, customer_email, customer_name, amount_total, currency, stripe_checkout_session_id, stripe_payment_intent_id, shipping_name, shipping_phone, shipping_address_json, billing_address_json, shipping_rate_label, shipping_rate_amount, notes, items_count, source, metadata",
    )
    .eq("id", parsedId.data)
    .maybeSingle();

  if (orderError) {
    throw new Error(`[admin-orders] No se pudo cargar el pedido: ${orderError.message}`);
  }

  if (!orderData) {
    return null;
  }

  const { data: itemRows, error: itemsError } = await orderItemsTable
    .select(
      "id, created_at, order_id, product_id, product_name_snapshot, product_slug_snapshot, unit_price, quantity, line_total, product_type_snapshot, brand_slug_snapshot, metadata",
    )
    .eq("order_id", parsedId.data)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error(`[admin-orders] No se pudieron cargar los items del pedido: ${itemsError.message}`);
  }

  const baseOrder = mapAdminOrderListItem(orderData as AdminOrderRow);

  return {
    ...baseOrder,
    notes: (orderData as AdminOrderRow).notes ?? undefined,
    shippingName: (orderData as AdminOrderRow).shipping_name ?? undefined,
    shippingPhone: (orderData as AdminOrderRow).shipping_phone ?? undefined,
    shippingAddress: mapOptionalAddress((orderData as AdminOrderRow).shipping_address_json),
    billingAddress: mapOptionalAddress((orderData as AdminOrderRow).billing_address_json),
    shippingRateLabel: (orderData as AdminOrderRow).shipping_rate_label ?? undefined,
    shippingRateAmount:
      (orderData as AdminOrderRow).shipping_rate_amount !== null
        ? parseMoney((orderData as AdminOrderRow).shipping_rate_amount)
        : undefined,
    metadata: parseMetadata((orderData as AdminOrderRow).metadata),
    items: ((itemRows ?? []) as AdminOrderItemRow[]).map(mapAdminOrderItem),
  } satisfies AdminOrderDetail;
}

export async function cancelAdminOrder(id: string) {
  return updateAdminOrderStatus(
    id,
    "cancelled",
    MANUAL_CANCEL_ALLOWED_FROM,
    "Solo puedes marcar como cancelado un pedido pendiente, en checkout o ya fallido.",
  );
}

export async function markAdminOrderPaymentFailed(id: string) {
  return updateAdminOrderStatus(
    id,
    "payment_failed",
    MANUAL_PAYMENT_FAILED_ALLOWED_FROM,
    "Solo puedes marcar como pago fallido un pedido con checkout ya creado.",
  );
}

export async function resendAdminOrderConfirmationEmail(id: string) {
  await requireAdminAccess();

  const parsedId = adminOrderIdSchema.parse(id);
  const order = await getAdminOrderById(parsedId);

  if (!order) {
    throw new Error("El pedido no existe o ya no esta disponible.");
  }

  if (order.status !== "paid") {
    throw new Error("Solo puedes reenviar el email de confirmacion en pedidos pagados.");
  }

  const parsedEmail = z
    .string()
    .trim()
    .email("El pedido no tiene un email valido para reenviar la confirmacion.")
    .safeParse(order.customerEmail);

  if (!parsedEmail.success) {
    throw new Error(parsedEmail.error.issues[0]?.message ?? "Email invalido.");
  }

  if (order.items.length === 0) {
    throw new Error("El pedido no tiene items snapshot suficientes para reenviar el email.");
  }

  await sendOrderPaidConfirmationEmail({
    orderId: order.id,
    customerEmail: parsedEmail.data,
    customerName: order.customerName,
    amountTotal: order.amountTotal,
    currency: order.currency,
    items: order.items.map((item) => ({
      name: item.productNameSnapshot,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  });

  await markOrderConfirmationEmailSent(order.id);

  return {
    id: order.id,
    customerEmail: parsedEmail.data,
  } satisfies AdminOrderEmailActionResult;
}
