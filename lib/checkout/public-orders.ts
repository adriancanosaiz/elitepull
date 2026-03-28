import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import {
  checkoutOrderStatusSchema,
  type CheckoutOrderStatus,
} from "@/lib/validators/checkout";

const publicOrdersEnvSchema = z.object({
  supabaseUrl: z.string().trim().url("Falta una SUPABASE URL valida."),
  serviceRoleKey: z.string().trim().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY."),
});

const stripeCheckoutSessionIdSchema = z.string().trim().min(1);

type PublicOrderLookupRow = {
  id: string;
  status: CheckoutOrderStatus;
  customer_email: string;
  amount_total: number | string | null;
  currency: string | null;
};

export type PublicCheckoutOrder = {
  orderId: string;
  status: CheckoutOrderStatus;
  customerEmail: string;
  amountTotal: number;
  currency: string;
};

function getPublicOrdersEnv() {
  return publicOrdersEnvSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function createPublicOrdersServiceClient() {
  const env = getPublicOrdersEnv();

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

export async function getPublicCheckoutOrderBySessionId(
  stripeCheckoutSessionId: string,
) {
  const parsedSessionId = stripeCheckoutSessionIdSchema.safeParse(stripeCheckoutSessionId);

  if (!parsedSessionId.success) {
    return null;
  }

  const client = createPublicOrdersServiceClient();
  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .select("id, status, customer_email, amount_total, currency")
    .eq("stripe_checkout_session_id", parsedSessionId.data)
    .maybeSingle();

  if (error) {
    throw new Error(
      `[public-checkout-orders] No se pudo cargar el pedido por session id: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const row = data as PublicOrderLookupRow;

  return {
    orderId: row.id,
    status: checkoutOrderStatusSchema.parse(row.status),
    customerEmail: row.customer_email,
    amountTotal: parseMoney(row.amount_total),
    currency: row.currency?.trim() || "eur",
  } satisfies PublicCheckoutOrder;
}
