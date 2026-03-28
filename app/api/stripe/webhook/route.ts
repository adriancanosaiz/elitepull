import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { mapCheckoutSessionDeliveryDetails } from "@/lib/checkout/delivery";
import {
  markOrderCancelledFromStripeCheckoutSessionId,
  markOrderConfirmationEmailSent,
  markOrderPaidFromStripeCheckoutSessionId,
} from "@/lib/checkout/orders";
import { sendOrderPaidConfirmationEmail } from "@/lib/email/orders";
import { createStripeServerClient, getOptionalStripeWebhookSecret } from "@/lib/stripe/server";

export const runtime = "nodejs";

function getStripeWebhookSignature(request: NextRequest) {
  return request.headers.get("stripe-signature");
}

function getCheckoutSessionPaymentIntentId(session: Stripe.Checkout.Session) {
  const paymentIntent = session.payment_intent;

  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }

  if (paymentIntent && typeof paymentIntent === "object" && "id" in paymentIntent) {
    return paymentIntent.id;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const webhookSecret = getOptionalStripeWebhookSecret();

  if (!webhookSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Falta STRIPE_WEBHOOK_SECRET para validar el webhook.",
      },
      { status: 500 },
    );
  }

  const signature = getStripeWebhookSignature(request);

  if (!signature) {
    return NextResponse.json(
      {
        ok: false,
        error: "Falta la firma del webhook de Stripe.",
      },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  const stripe = createStripeServerClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Firma de Stripe invalida.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 },
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await markOrderPaidFromStripeCheckoutSessionId({
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: getCheckoutSessionPaymentIntentId(session),
        deliveryDetails: mapCheckoutSessionDeliveryDetails(session),
      });

      if (!result) {
        return NextResponse.json({
          ok: true,
          received: true,
          ignored: true,
          reason: "order-not-found",
        });
      }

      if (result.shouldSendConfirmationEmail) {
        await sendOrderPaidConfirmationEmail(result.order);
        await markOrderConfirmationEmailSent(result.order.orderId);
      }

      return NextResponse.json({
        ok: true,
        received: true,
        orderId: result.order.orderId,
        status: result.order.status,
        didTransitionToPaid: result.didTransitionToPaid,
        emailSent: result.shouldSendConfirmationEmail,
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const result = await markOrderCancelledFromStripeCheckoutSessionId(session.id);

      return NextResponse.json({
        ok: true,
        received: true,
        expired: true,
        orderId: result?.orderId ?? null,
        status: result?.status ?? null,
        didTransition: result?.didTransition ?? false,
      });
    }

    return NextResponse.json({
      ok: true,
      received: true,
      ignored: true,
      eventType: event.type,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.replace(/^\[[^\]]+\]\s*/, "") : "Error procesando el webhook.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
