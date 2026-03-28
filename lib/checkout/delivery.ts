import type Stripe from "stripe";

export type CheckoutOrderAddress = {
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
};

export type CheckoutOrderDeliveryDetails = {
  customerEmail: string | null;
  customerName: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddressJson: CheckoutOrderAddress | Record<string, never>;
  billingAddressJson: CheckoutOrderAddress | Record<string, never>;
  shippingRateLabel: string | null;
  shippingRateAmount: number | null;
  amountTotal: number | null;
  invoiceRequested: boolean | null;
  taxId: string | null;
  orderNote: string | null;
};

function normalizeNullableString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function convertStripeCentsToAmount(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(((value / 100) + Number.EPSILON) * 100) / 100;
}

export function mapStripeAddress(
  address: Stripe.Address | null | undefined,
): CheckoutOrderAddress | null {
  if (!address) {
    return null;
  }

  const mappedAddress = {
    line1: normalizeNullableString(address.line1),
    line2: normalizeNullableString(address.line2),
    postal_code: normalizeNullableString(address.postal_code),
    city: normalizeNullableString(address.city),
    state: normalizeNullableString(address.state),
    country: normalizeNullableString(address.country),
  } satisfies CheckoutOrderAddress;

  return Object.values(mappedAddress).some(Boolean) ? mappedAddress : null;
}

function getFallbackShippingRateLabel(shippingRateAmount: number | null) {
  if (shippingRateAmount === null) {
    return null;
  }

  return shippingRateAmount <= 0 ? "Envio gratis" : "Envio estandar";
}

function getCheckoutSessionShippingRateLabel(session: Stripe.Checkout.Session) {
  const shippingRate = session.shipping_cost?.shipping_rate;

  if (shippingRate && typeof shippingRate === "object") {
    return normalizeNullableString(shippingRate.display_name);
  }

  const configuredShippingRate = session.shipping_options[0]?.shipping_rate;

  if (configuredShippingRate && typeof configuredShippingRate === "object") {
    return normalizeNullableString(configuredShippingRate.display_name);
  }

  return getFallbackShippingRateLabel(
    convertStripeCentsToAmount(session.shipping_cost?.amount_total),
  );
}

function getCheckoutSessionCustomFieldValue(
  session: Stripe.Checkout.Session,
  key: string,
) {
  const field = session.custom_fields.find((entry) => entry.key === key);

  if (!field) {
    return null;
  }

  if (field.type === "dropdown") {
    return normalizeNullableString(field.dropdown?.value);
  }

  if (field.type === "numeric") {
    return normalizeNullableString(field.numeric?.value);
  }

  return normalizeNullableString(field.text?.value);
}

export function mapCheckoutSessionDeliveryDetails(
  session: Stripe.Checkout.Session,
): CheckoutOrderDeliveryDetails {
  const shippingDetails = session.collected_information?.shipping_details;
  const shippingAddress = mapStripeAddress(shippingDetails?.address);
  const billingAddress = mapStripeAddress(session.customer_details?.address);
  const invoiceRequested = getCheckoutSessionCustomFieldValue(
    session,
    "invoiceRequested",
  );

  return {
    customerEmail: normalizeNullableString(
      session.customer_details?.email ?? session.customer_email,
    ),
    customerName: normalizeNullableString(
      session.customer_details?.name ?? session.customer_details?.individual_name,
    ),
    shippingName: normalizeNullableString(
      shippingDetails?.name ?? session.customer_details?.name,
    ),
    shippingPhone: normalizeNullableString(session.customer_details?.phone),
    shippingAddressJson: shippingAddress ?? {},
    billingAddressJson: billingAddress ?? {},
    shippingRateLabel: getCheckoutSessionShippingRateLabel(session),
    shippingRateAmount: convertStripeCentsToAmount(session.shipping_cost?.amount_total),
    amountTotal: convertStripeCentsToAmount(session.amount_total),
    invoiceRequested:
      invoiceRequested === null ? null : invoiceRequested === "yes",
    taxId: getCheckoutSessionCustomFieldValue(session, "taxId"),
    orderNote: getCheckoutSessionCustomFieldValue(session, "orderNote"),
  } satisfies CheckoutOrderDeliveryDetails;
}

export function parseStoredCheckoutOrderAddress(
  value: unknown,
): CheckoutOrderAddress | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const address = value as Record<string, unknown>;

  return mapStripeAddress({
    line1: typeof address.line1 === "string" ? address.line1 : null,
    line2: typeof address.line2 === "string" ? address.line2 : null,
    postal_code: typeof address.postal_code === "string" ? address.postal_code : null,
    city: typeof address.city === "string" ? address.city : null,
    state: typeof address.state === "string" ? address.state : null,
    country: typeof address.country === "string" ? address.country : null,
  });
}

export function formatCheckoutOrderAddress(address: CheckoutOrderAddress | null | undefined) {
  if (!address) {
    return [];
  }

  const cityLine = [address.postal_code, address.city].filter(Boolean).join(" ").trim();
  const regionLine = [address.state, address.country].filter(Boolean).join(", ").trim();

  return [address.line1, address.line2, cityLine || null, regionLine || null].filter(
    (entry): entry is string => typeof entry === "string" && entry.trim().length > 0,
  );
}
