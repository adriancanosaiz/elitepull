import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { z } from "zod";

import { CART_SHIPPING_COST, CART_SHIPPING_THRESHOLD } from "@/lib/adapters/cart-adapter";
import type { CheckoutOrderDeliveryDetails } from "@/lib/checkout/delivery";
import {
  convertAmountToStripeCents,
  createStripeServerClient,
  STRIPE_CHECKOUT_CURRENCY,
} from "@/lib/stripe/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  checkoutOrderStatusSchema,
  checkoutRequestSchema,
  type CheckoutOrderStatus,
  type CheckoutRequestInput,
} from "@/lib/validators/checkout";
import type { BrandSlug, ProductType } from "@/types/store";

const checkoutOrdersEnvSchema = z.object({
  supabaseUrl: z.string().trim().url("Falta una SUPABASE URL valida."),
  serviceRoleKey: z.string().trim().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY."),
});

const checkoutSessionInputSchema = checkoutRequestSchema.extend({
  successUrl: z.string().trim().url("La URL de exito del checkout no es valida."),
  cancelUrl: z.string().trim().url("La URL de cancelacion del checkout no es valida."),
});

type CheckoutInventoryRow = {
  available_quantity: number | null;
};

type CheckoutProductRecord = {
  id: string;
  slug: string;
  name: string;
  product_type: ProductType;
  brand_slug: BrandSlug;
  price: number | string | null;
  active: boolean;
  is_preorder: boolean;
  inventory: CheckoutInventoryRow | CheckoutInventoryRow[] | null;
};

type CreatedOrderRecord = {
  id: string;
  status: CheckoutOrderStatus;
};

type PersistedOrderRecord = CreatedOrderRecord & {
  stripe_checkout_session_id: string | null;
};

type OrderStatusRecord = {
  id: string;
  status: CheckoutOrderStatus;
  customer_email: string;
  customer_name: string | null;
  amount_total: number | string | null;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address_json: unknown;
  billing_address_json: unknown;
  shipping_rate_label: string | null;
  shipping_rate_amount: number | string | null;
  notes: string | null;
  metadata: unknown;
};

type OrderItemSnapshotRecord = {
  product_name_snapshot: string;
  quantity: number;
  line_total: number | string | null;
};

const createdOrderSchema = z.object({
  id: z.string().uuid(),
  status: checkoutOrderStatusSchema,
});

const persistedOrderSchema = createdOrderSchema.extend({
  stripe_checkout_session_id: z.string().min(1).nullable(),
});

const orderStatusRecordSchema = z.object({
  id: z.string().uuid(),
  status: checkoutOrderStatusSchema,
  customer_email: z.string().trim().min(1),
  customer_name: z.string().trim().nullable(),
  amount_total: z.union([z.number(), z.string(), z.null()]),
  currency: z.string().trim().min(1),
  stripe_checkout_session_id: z.string().trim().nullable(),
  stripe_payment_intent_id: z.string().trim().nullable(),
  shipping_name: z.string().trim().nullable(),
  shipping_phone: z.string().trim().nullable(),
  shipping_address_json: z.unknown().optional(),
  billing_address_json: z.unknown().optional(),
  shipping_rate_label: z.string().trim().nullable(),
  shipping_rate_amount: z.union([z.number(), z.string(), z.null()]),
  notes: z.string().trim().nullable(),
  metadata: z.unknown().optional(),
});

const orderItemSnapshotRecordSchema = z.object({
  product_name_snapshot: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  line_total: z.union([z.number(), z.string(), z.null()]),
});

export type ResolvedCheckoutItem = {
  productId: string;
  productNameSnapshot: string;
  productSlugSnapshot: string;
  productTypeSnapshot: ProductType;
  brandSlugSnapshot: BrandSlug;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  isPreorder: boolean;
};

export type ResolvedCheckoutCart = {
  customerEmail: string;
  customerName?: string;
  notes?: string;
  source: CheckoutRequestInput["source"];
  items: ResolvedCheckoutItem[];
  itemsCount: number;
  subtotal: number;
  shipping: number;
  amountTotal: number;
  currency: typeof STRIPE_CHECKOUT_CURRENCY;
};

export type CreateCheckoutOrderSessionInput = z.infer<typeof checkoutSessionInputSchema>;

export type CheckoutOrderSessionResult = ResolvedCheckoutCart & {
  orderId: string;
  orderStatus: CheckoutOrderStatus;
  stripeCheckoutSessionId: string;
  stripeCheckoutUrl: string;
};

export type OrderConfirmationEmailItem = {
  name: string;
  quantity: number;
  lineTotal: number;
};

type OrderCheckoutCompletionPatch = {
  customer_email?: string;
  customer_name?: string;
  stripe_payment_intent_id?: string;
  amount_total?: number;
  notes?: string;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address_json?: CheckoutOrderDeliveryDetails["shippingAddressJson"];
  billing_address_json?: CheckoutOrderDeliveryDetails["billingAddressJson"];
  shipping_rate_label?: string | null;
  shipping_rate_amount?: number | null;
  metadata?: Record<string, unknown>;
};

export type OrderConfirmationEmailPayload = {
  orderId: string;
  status: CheckoutOrderStatus;
  customerEmail: string;
  customerName?: string;
  amountTotal: number;
  currency: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  items: OrderConfirmationEmailItem[];
  metadata: Record<string, unknown>;
};

export type MarkOrderPaidResult = {
  order: OrderConfirmationEmailPayload;
  didTransitionToPaid: boolean;
  shouldSendConfirmationEmail: boolean;
};

export const ORDER_STATUS_TRANSITIONS: Record<
  CheckoutOrderStatus,
  CheckoutOrderStatus[]
> = {
  pending_checkout: ["checkout_created"],
  checkout_created: ["paid", "cancelled", "payment_failed"],
  paid: [],
  cancelled: [],
  payment_failed: [],
};

const CHECKOUT_PRODUCT_SELECT = `
  id,
  slug,
  name,
  product_type,
  brand_slug,
  price,
  active,
  is_preorder,
  inventory:inventory (
    available_quantity
  )
`;

const CHECKOUT_ALLOWED_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
  ["ES", "PT"];

function getStripeCheckoutPaymentMethodTypes() {
  const basePaymentMethodTypes = [
    "card",
    "link",
  ] satisfies Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

  if (process.env.STRIPE_ENABLE_BIZUM === "true") {
    // Stripe documenta `bizum` para Checkout, pero en muchas cuentas sigue
    // apareciendo como private preview y la API rechaza el enum si no esta habilitado.
    return [...basePaymentMethodTypes, "bizum"] as unknown as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  }

  return basePaymentMethodTypes;
}

function getCheckoutOrdersEnv() {
  return checkoutOrdersEnvSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function createCheckoutSupabaseAdminClient() {
  const env = getCheckoutOrdersEnv();

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

function roundCurrencyAmount(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function getAvailableStock(inventory: CheckoutProductRecord["inventory"]) {
  if (Array.isArray(inventory)) {
    return Math.max(inventory[0]?.available_quantity ?? 0, 0);
  }

  return Math.max(inventory?.available_quantity ?? 0, 0);
}

function getCheckoutShipping(subtotal: number) {
  return subtotal > 0 && subtotal < CART_SHIPPING_THRESHOLD ? CART_SHIPPING_COST : 0;
}

function buildShippingDeliveryEstimate(
  minimumValue: number,
  maximumValue: number,
): Stripe.Checkout.SessionCreateParams.ShippingOption.ShippingRateData.DeliveryEstimate {
  return {
    minimum: {
      unit: "business_day",
      value: minimumValue,
    },
    maximum: {
      unit: "business_day",
      value: maximumValue,
    },
  };
}

function buildStripeCheckoutShippingOptions(
  resolvedCart: ResolvedCheckoutCart,
): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  if (resolvedCart.subtotal >= CART_SHIPPING_THRESHOLD) {
    return [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: "Envio gratis",
          fixed_amount: {
            amount: 0,
            currency: resolvedCart.currency,
          },
          delivery_estimate: buildShippingDeliveryEstimate(3, 5),
          metadata: {
            kind: "free_shipping",
          },
        },
      },
    ];
  }

  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        display_name: "Envio estandar",
        fixed_amount: {
          amount: convertAmountToStripeCents(CART_SHIPPING_COST),
          currency: resolvedCart.currency,
        },
        delivery_estimate: buildShippingDeliveryEstimate(2, 4),
        metadata: {
          kind: "standard_shipping",
        },
      },
    },
  ];
}

function buildStripeCheckoutCustomFields(): Stripe.Checkout.SessionCreateParams.CustomField[] {
  return [
    {
      key: "invoiceRequested",
      type: "dropdown",
      optional: false,
      label: {
        type: "custom",
        custom: "Necesitas factura",
      },
      dropdown: {
        default_value: "no",
        options: [
          {
            label: "No",
            value: "no",
          },
          {
            label: "Si",
            value: "yes",
          },
        ],
      },
    },
    {
      key: "taxId",
      type: "text",
      optional: true,
      label: {
        type: "custom",
        custom: "NIF o CIF para factura",
      },
      text: {
        minimum_length: 3,
        maximum_length: 32,
      },
    },
    {
      key: "orderNote",
      type: "text",
      optional: true,
      label: {
        type: "custom",
        custom: "Nota de entrega",
      },
      text: {
        maximum_length: 180,
      },
    },
  ];
}

function buildOrderCheckoutCompletionPatch(input: {
  stripePaymentIntentId?: string | null;
  deliveryDetails?: CheckoutOrderDeliveryDetails;
  currentMetadata: Record<string, unknown>;
}) {
  if (!input.deliveryDetails && !input.stripePaymentIntentId) {
    return undefined;
  }

  const patch: OrderCheckoutCompletionPatch = {};

  if (input.deliveryDetails) {
    patch.shipping_name = input.deliveryDetails.shippingName ?? null;
    patch.shipping_phone = input.deliveryDetails.shippingPhone ?? null;
    patch.shipping_address_json = input.deliveryDetails.shippingAddressJson ?? {};
    patch.billing_address_json = input.deliveryDetails.billingAddressJson ?? {};
    patch.shipping_rate_label = input.deliveryDetails.shippingRateLabel ?? null;
    patch.shipping_rate_amount = input.deliveryDetails.shippingRateAmount ?? null;
  }

  if (input.deliveryDetails?.customerEmail) {
    patch.customer_email = input.deliveryDetails.customerEmail;
  }

  if (input.deliveryDetails?.customerName) {
    patch.customer_name = input.deliveryDetails.customerName;
  }

  if (input.deliveryDetails?.amountTotal !== null && input.deliveryDetails?.amountTotal !== undefined) {
    patch.amount_total = input.deliveryDetails.amountTotal;
  }

  if (input.deliveryDetails?.orderNote) {
    patch.notes = input.deliveryDetails.orderNote;
  }

  if (input.stripePaymentIntentId) {
    patch.stripe_payment_intent_id = input.stripePaymentIntentId;
  }

  const nextMetadata = {
    ...input.currentMetadata,
    ...(input.deliveryDetails?.invoiceRequested !== null && input.deliveryDetails?.invoiceRequested !== undefined
      ? { invoiceRequested: input.deliveryDetails.invoiceRequested }
      : {}),
    ...(input.deliveryDetails?.taxId ? { invoiceTaxId: input.deliveryDetails.taxId } : {}),
    ...(input.deliveryDetails?.orderNote ? { checkoutOrderNote: input.deliveryDetails.orderNote } : {}),
  };

  if (JSON.stringify(nextMetadata) !== JSON.stringify(input.currentMetadata)) {
    patch.metadata = nextMetadata;
  }

  return patch;
}

function createCheckoutError(message: string) {
  return new Error(`[checkout] ${message}`);
}

function buildProductsMap(products: CheckoutProductRecord[]) {
  return new Map(products.map((product) => [product.id, product]));
}

function buildSuccessUrlWithSessionId(successUrl: string) {
  const url = new URL(successUrl);

  if (!url.searchParams.has("session_id")) {
    url.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  }

  return url.toString();
}

function buildOrderMetadata(resolvedCart: ResolvedCheckoutCart) {
  return {
    checkoutVersion: "v1",
    subtotal: resolvedCart.subtotal,
    shipping: resolvedCart.shipping,
    itemCount: resolvedCart.itemsCount,
    currency: resolvedCart.currency,
  };
}

function canTransitionOrderStatus(
  currentStatus: CheckoutOrderStatus,
  nextStatus: CheckoutOrderStatus,
) {
  return ORDER_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

function parseOrderMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }

  return value as Record<string, unknown>;
}

function hasConfirmationEmailBeenSent(metadata: Record<string, unknown>) {
  return typeof metadata.confirmationEmailSentAt === "string" && metadata.confirmationEmailSentAt.length > 0;
}

async function fetchCheckoutProducts(
  client: SupabaseClient<Database>,
  productIds: string[],
) {
  const productsTable = client.from("products") as any;
  const { data, error } = await productsTable
    .select(CHECKOUT_PRODUCT_SELECT)
    .in("id", productIds);

  if (error) {
    throw createCheckoutError(`No se pudieron validar los productos: ${error.message}`);
  }

  return (data ?? []) as CheckoutProductRecord[];
}

async function createPendingOrder(
  client: SupabaseClient<Database>,
  resolvedCart: ResolvedCheckoutCart,
) {
  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .insert({
      status: "pending_checkout",
      customer_email: resolvedCart.customerEmail,
      customer_name: resolvedCart.customerName ?? null,
      amount_total: resolvedCart.amountTotal,
      currency: resolvedCart.currency,
      notes: resolvedCart.notes ?? null,
      items_count: resolvedCart.itemsCount,
      source: resolvedCart.source,
      metadata: buildOrderMetadata(resolvedCart),
    })
    .select("id, status")
    .single();

  if (error) {
    throw createCheckoutError(`No se pudo crear el pedido inicial: ${error.message}`);
  }

  return createdOrderSchema.parse(data) as CreatedOrderRecord;
}

async function insertOrderItems(
  client: SupabaseClient<Database>,
  orderId: string,
  resolvedCart: ResolvedCheckoutCart,
) {
  const orderItemsTable = client.from("order_items") as any;
  const rows = resolvedCart.items.map((item) => ({
    order_id: orderId,
    product_id: item.productId,
    product_name_snapshot: item.productNameSnapshot,
    product_slug_snapshot: item.productSlugSnapshot,
    unit_price: item.unitPrice,
    quantity: item.quantity,
    line_total: item.lineTotal,
    product_type_snapshot: item.productTypeSnapshot,
    brand_slug_snapshot: item.brandSlugSnapshot,
    metadata: {
      availableStock: item.availableStock,
      isPreorder: item.isPreorder,
    },
  }));

  const { error } = await orderItemsTable.insert(rows);

  if (error) {
    throw createCheckoutError(`No se pudieron guardar los items del pedido: ${error.message}`);
  }
}

async function deleteOrder(
  client: SupabaseClient<Database>,
  orderId: string,
) {
  const ordersTable = client.from("orders") as any;
  const { error } = await ordersTable.delete().eq("id", orderId);

  if (error) {
    console.error(`[checkout] No se pudo limpiar el pedido fallido ${orderId}: ${error.message}`);
  }
}

async function updateOrderToCheckoutCreated(
  client: SupabaseClient<Database>,
  orderId: string,
  stripeCheckoutSessionId: string,
) {
  const ordersTable = client.from("orders") as any;
  const currentStatus = "pending_checkout" satisfies CheckoutOrderStatus;
  const nextStatus = "checkout_created" satisfies CheckoutOrderStatus;

  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw createCheckoutError(
      `La transicion ${currentStatus} -> ${nextStatus} no esta permitida.`,
    );
  }

  const { data, error } = await ordersTable
    .update({
      status: nextStatus,
      stripe_checkout_session_id: stripeCheckoutSessionId,
    })
    .eq("id", orderId)
    .eq("status", currentStatus)
    .select("id, status, stripe_checkout_session_id")
    .single();

  if (error) {
    throw createCheckoutError(
      `No se pudo guardar la sesion de Stripe en el pedido: ${error.message}`,
    );
  }

  return persistedOrderSchema.parse(data) as PersistedOrderRecord;
}

async function fetchOrderStatusRecordByStripeSessionId(
  client: SupabaseClient<Database>,
  stripeCheckoutSessionId: string,
) {
  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .select(
      "id, status, customer_email, customer_name, amount_total, currency, stripe_checkout_session_id, stripe_payment_intent_id, shipping_name, shipping_phone, shipping_address_json, billing_address_json, shipping_rate_label, shipping_rate_amount, notes, metadata",
    )
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
    .maybeSingle();

  if (error) {
    throw createCheckoutError(`No se pudo localizar el pedido por session id: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return orderStatusRecordSchema.parse(data) as OrderStatusRecord;
}

async function fetchOrderStatusRecordById(
  client: SupabaseClient<Database>,
  orderId: string,
) {
  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .select(
      "id, status, customer_email, customer_name, amount_total, currency, stripe_checkout_session_id, stripe_payment_intent_id, shipping_name, shipping_phone, shipping_address_json, billing_address_json, shipping_rate_label, shipping_rate_amount, notes, metadata",
    )
    .eq("id", orderId)
    .single();

  if (error) {
    throw createCheckoutError(`No se pudo leer el pedido ${orderId}: ${error.message}`);
  }

  return orderStatusRecordSchema.parse(data) as OrderStatusRecord;
}

async function fetchOrderItemsForEmail(
  client: SupabaseClient<Database>,
  orderId: string,
) {
  const orderItemsTable = client.from("order_items") as any;
  const { data, error } = await orderItemsTable
    .select("product_name_snapshot, quantity, line_total")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    throw createCheckoutError(`No se pudieron leer los items del pedido ${orderId}: ${error.message}`);
  }

  return ((data ?? []) as unknown[]).map((entry) =>
    orderItemSnapshotRecordSchema.parse(entry) as OrderItemSnapshotRecord,
  );
}

async function buildOrderConfirmationEmailPayload(
  client: SupabaseClient<Database>,
  orderRecord: OrderStatusRecord,
) {
  const metadata = parseOrderMetadata(orderRecord.metadata);
  const items = await fetchOrderItemsForEmail(client, orderRecord.id);

  return {
    orderId: orderRecord.id,
    status: orderRecord.status,
    customerEmail: orderRecord.customer_email,
    customerName: orderRecord.customer_name ?? undefined,
    amountTotal: roundCurrencyAmount(parseMoney(orderRecord.amount_total)),
    currency: orderRecord.currency,
    stripeCheckoutSessionId: orderRecord.stripe_checkout_session_id ?? undefined,
    stripePaymentIntentId: orderRecord.stripe_payment_intent_id ?? undefined,
    items: items.map((item) => ({
      name: item.product_name_snapshot,
      quantity: item.quantity,
      lineTotal: roundCurrencyAmount(parseMoney(item.line_total)),
    })),
    metadata,
  } satisfies OrderConfirmationEmailPayload;
}

async function persistOrderCheckoutCompletionDetails(
  client: SupabaseClient<Database>,
  orderId: string,
  patch: OrderCheckoutCompletionPatch,
) {
  const ordersTable = client.from("orders") as any;
  const { error } = await ordersTable
    .update(patch)
    .eq("id", orderId);

  if (error) {
    throw createCheckoutError(
      `No se pudieron guardar los datos de entrega del pedido: ${error.message}`,
    );
  }
}

async function updateOrderStatus(
  client: SupabaseClient<Database>,
  orderId: string,
  currentStatus: CheckoutOrderStatus,
  nextStatus: CheckoutOrderStatus,
  extraPatch?: Record<string, unknown>,
) {
  if (!canTransitionOrderStatus(currentStatus, nextStatus)) {
    throw createCheckoutError(
      `La transicion ${currentStatus} -> ${nextStatus} no esta permitida.`,
    );
  }

  const ordersTable = client.from("orders") as any;
  const { data, error } = await ordersTable
    .update({
      status: nextStatus,
      ...(extraPatch ?? {}),
    })
    .eq("id", orderId)
    .eq("status", currentStatus)
    .select(
      "id, status, customer_email, customer_name, amount_total, currency, stripe_checkout_session_id, stripe_payment_intent_id, shipping_name, shipping_phone, shipping_address_json, billing_address_json, shipping_rate_label, shipping_rate_amount, notes, metadata",
    )
    .single();

  if (error) {
    throw createCheckoutError(`No se pudo actualizar el estado del pedido: ${error.message}`);
  }

  return orderStatusRecordSchema.parse(data) as OrderStatusRecord;
}

function buildStripeCheckoutLineItems(
  resolvedCart: ResolvedCheckoutCart,
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return resolvedCart.items.map((item) => ({
    quantity: item.quantity,
    price_data: {
      currency: resolvedCart.currency,
      unit_amount: convertAmountToStripeCents(item.unitPrice),
      product_data: {
        name: item.productNameSnapshot,
        metadata: {
          productId: item.productId,
          slug: item.productSlugSnapshot,
          brandSlug: item.brandSlugSnapshot,
          productType: item.productTypeSnapshot,
        },
      },
    },
  }));
}

async function createStripeCheckoutSession(
  orderId: string,
  resolvedCart: ResolvedCheckoutCart,
  urls: Pick<CreateCheckoutOrderSessionInput, "successUrl" | "cancelUrl">,
) {
  const stripe = createStripeServerClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "es",
    client_reference_id: orderId,
    customer_email: resolvedCart.customerEmail,
    // Solo aceptamos tarjeta, Link y Bizum.
    // Apple Pay y Google Pay no se pasan como tipos separados en Checkout:
    // Stripe los muestra dentro de `card` cuando el dispositivo, navegador,
    // dominio y configuracion de la cuenta los hacen elegibles.
    // Si en el futuro quieres volver a metodos dinamicos o anadir otros como PayPal,
    // elimina o amplía `payment_method_types`.
    payment_method_types: getStripeCheckoutPaymentMethodTypes(),
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    shipping_address_collection: {
      allowed_countries: CHECKOUT_ALLOWED_SHIPPING_COUNTRIES,
    },
    shipping_options: buildStripeCheckoutShippingOptions(resolvedCart),
    custom_fields: buildStripeCheckoutCustomFields(),
    line_items: buildStripeCheckoutLineItems(resolvedCart),
    success_url: buildSuccessUrlWithSessionId(urls.successUrl),
    cancel_url: urls.cancelUrl,
    metadata: {
      orderId,
      source: resolvedCart.source,
      itemsCount: String(resolvedCart.itemsCount),
    },
  });

  if (!session.url) {
    throw createCheckoutError("Stripe no devolvio una URL valida para Checkout.");
  }

  return session;
}

export async function validateCheckoutCart(input: unknown): Promise<ResolvedCheckoutCart> {
  const parsedInput = checkoutRequestSchema.parse(input);
  const client = createCheckoutSupabaseAdminClient();
  const uniqueProductIds = [...new Set(parsedInput.items.map((item) => item.productId))];
  const products = await fetchCheckoutProducts(client, uniqueProductIds);
  const productsMap = buildProductsMap(products);

  const resolvedItems = parsedInput.items.map((item) => {
    const product = productsMap.get(item.productId);

    if (!product) {
      throw createCheckoutError("Uno de los productos del carrito ya no existe.");
    }

    if (!product.active) {
      throw createCheckoutError(
        `El producto "${product.name}" ya no esta disponible para comprar.`,
      );
    }

    const availableStock = getAvailableStock(product.inventory);

    if (!product.is_preorder && availableStock < item.quantity) {
      throw createCheckoutError(
        `No hay stock suficiente para "${product.name}". Disponible: ${availableStock}.`,
      );
    }

    const unitPrice = roundCurrencyAmount(parseMoney(product.price));
    const lineTotal = roundCurrencyAmount(unitPrice * item.quantity);

    return {
      productId: product.id,
      productNameSnapshot: product.name,
      productSlugSnapshot: product.slug,
      productTypeSnapshot: product.product_type,
      brandSlugSnapshot: product.brand_slug,
      unitPrice,
      quantity: item.quantity,
      lineTotal,
      availableStock,
      isPreorder: product.is_preorder,
    } satisfies ResolvedCheckoutItem;
  });

  const subtotal = roundCurrencyAmount(
    resolvedItems.reduce((total, item) => total + item.lineTotal, 0),
  );
  const shipping = roundCurrencyAmount(getCheckoutShipping(subtotal));
  const itemsCount = resolvedItems.reduce((total, item) => total + item.quantity, 0);

  return {
    customerEmail: parsedInput.customerEmail,
    customerName: parsedInput.customerName,
    notes: parsedInput.notes,
    source: parsedInput.source,
    items: resolvedItems,
    itemsCount,
    subtotal,
    shipping,
    amountTotal: roundCurrencyAmount(subtotal + shipping),
    currency: STRIPE_CHECKOUT_CURRENCY,
  };
}

export async function createCheckoutOrderSession(
  input: unknown,
): Promise<CheckoutOrderSessionResult> {
  const parsedInput = checkoutSessionInputSchema.parse(input);
  const client = createCheckoutSupabaseAdminClient();
  const resolvedCart = await validateCheckoutCart({
    customerEmail: parsedInput.customerEmail,
    customerName: parsedInput.customerName,
    notes: parsedInput.notes,
    source: parsedInput.source,
    items: parsedInput.items,
  });

  const createdOrder = await createPendingOrder(client, resolvedCart);
  let stripeSession: Stripe.Checkout.Session | null = null;

  try {
    await insertOrderItems(client, createdOrder.id, resolvedCart);
    stripeSession = await createStripeCheckoutSession(createdOrder.id, resolvedCart, parsedInput);
    const updatedOrder = await updateOrderToCheckoutCreated(
      client,
      createdOrder.id,
      stripeSession.id,
    );
    const stripeCheckoutUrl = stripeSession.url;

    if (!stripeCheckoutUrl) {
      throw createCheckoutError("Stripe no devolvio una URL valida para Checkout.");
    }

    return {
      ...resolvedCart,
      orderId: updatedOrder.id,
      orderStatus: updatedOrder.status,
      stripeCheckoutSessionId: updatedOrder.stripe_checkout_session_id ?? stripeSession.id,
      stripeCheckoutUrl,
    };
  } catch (error) {
    if (!stripeSession) {
      await deleteOrder(client, createdOrder.id);
    }

    if (error instanceof z.ZodError) {
      throw createCheckoutError(error.issues[0]?.message ?? "Error validando el checkout.");
    }

    if (error instanceof Error) {
      throw createCheckoutError(error.message.replace(/^\[checkout\]\s*/, ""));
    }

    throw createCheckoutError("No se pudo crear la sesion de checkout.");
  }
}

export async function markOrderPaidFromStripeCheckoutSessionId(input: {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  deliveryDetails?: CheckoutOrderDeliveryDetails;
}): Promise<MarkOrderPaidResult | null> {
  const client = createCheckoutSupabaseAdminClient();
  const orderRecord = await fetchOrderStatusRecordByStripeSessionId(
    client,
    input.stripeCheckoutSessionId,
  );

  if (!orderRecord) {
    return null;
  }

  const completionPatch = buildOrderCheckoutCompletionPatch({
    stripePaymentIntentId: input.stripePaymentIntentId,
    deliveryDetails: input.deliveryDetails,
    currentMetadata: parseOrderMetadata(orderRecord.metadata),
  });

  if (orderRecord.status === "paid") {
    if (completionPatch) {
      await persistOrderCheckoutCompletionDetails(client, orderRecord.id, completionPatch);
    }

    const refreshedOrder = completionPatch
      ? await fetchOrderStatusRecordById(client, orderRecord.id)
      : orderRecord;
    const emailPayload = await buildOrderConfirmationEmailPayload(client, refreshedOrder);

    return {
      order: emailPayload,
      didTransitionToPaid: false,
      shouldSendConfirmationEmail: !hasConfirmationEmailBeenSent(emailPayload.metadata),
    };
  }

  if (orderRecord.status !== "checkout_created") {
    if (completionPatch) {
      await persistOrderCheckoutCompletionDetails(client, orderRecord.id, completionPatch);
    }

    const refreshedOrder = completionPatch
      ? await fetchOrderStatusRecordById(client, orderRecord.id)
      : orderRecord;
    const emailPayload = await buildOrderConfirmationEmailPayload(client, refreshedOrder);

    return {
      order: emailPayload,
      didTransitionToPaid: false,
      shouldSendConfirmationEmail: false,
    };
  }

  const updatedOrder = await updateOrderStatus(
    client,
    orderRecord.id,
    "checkout_created",
    "paid",
    completionPatch,
  );
  const emailPayload = await buildOrderConfirmationEmailPayload(client, updatedOrder);

  return {
    order: emailPayload,
    didTransitionToPaid: true,
    shouldSendConfirmationEmail: !hasConfirmationEmailBeenSent(emailPayload.metadata),
  };
}

export async function markOrderCancelledFromStripeCheckoutSessionId(
  stripeCheckoutSessionId: string,
) {
  const client = createCheckoutSupabaseAdminClient();
  const orderRecord = await fetchOrderStatusRecordByStripeSessionId(
    client,
    stripeCheckoutSessionId,
  );

  if (!orderRecord) {
    return null;
  }

  if (orderRecord.status !== "checkout_created") {
    return {
      orderId: orderRecord.id,
      status: orderRecord.status,
      didTransition: false,
    };
  }

  const updatedOrder = await updateOrderStatus(
    client,
    orderRecord.id,
    "checkout_created",
    "cancelled",
  );

  return {
    orderId: updatedOrder.id,
    status: updatedOrder.status,
    didTransition: true,
  };
}

export async function markOrderConfirmationEmailSent(orderId: string) {
  const client = createCheckoutSupabaseAdminClient();
  const orderRecord = await fetchOrderStatusRecordById(client, orderId);
  const metadata = parseOrderMetadata(orderRecord.metadata);

  if (hasConfirmationEmailBeenSent(metadata)) {
    return false;
  }

  const ordersTable = client.from("orders") as any;
  const { error } = await ordersTable
    .update({
      metadata: {
        ...metadata,
        confirmationEmailSentAt: new Date().toISOString(),
      },
    })
    .eq("id", orderId);

  if (error) {
    throw createCheckoutError(`No se pudo marcar el email como enviado: ${error.message}`);
  }

  return true;
}
