import Stripe from "stripe";
import { z } from "zod";

export const STRIPE_CHECKOUT_CURRENCY = "eur";

const stripeServerEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().trim().min(1, "Falta STRIPE_SECRET_KEY."),
  STRIPE_WEBHOOK_SECRET: z.string().trim().min(1).optional(),
});

let stripeServerClient: Stripe | null = null;

export function getRequiredStripeServerEnv() {
  return stripeServerEnvSchema.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  });
}

export function getOptionalStripeWebhookSecret() {
  return getRequiredStripeServerEnv().STRIPE_WEBHOOK_SECRET;
}

export function createStripeServerClient() {
  if (stripeServerClient) {
    return stripeServerClient;
  }

  const env = getRequiredStripeServerEnv();
  stripeServerClient = new Stripe(env.STRIPE_SECRET_KEY);

  return stripeServerClient;
}

export function convertAmountToStripeCents(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100);
}
