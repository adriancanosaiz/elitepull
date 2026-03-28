import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createCheckoutOrderSession } from "@/lib/checkout/orders";

export const runtime = "nodejs";

function getRequestOrigin(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}

function getCheckoutApiErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "El payload del checkout no es valido.";
  }

  if (error instanceof Error) {
    return error.message.replace(/^\[[^\]]+\]\s*/, "");
  }

  return "No se pudo crear la sesion de checkout.";
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const origin = getRequestOrigin(request);
    const result = await createCheckoutOrderSession({
      ...payload,
      successUrl: `${origin}/checkout/success`,
      cancelUrl: `${origin}/checkout/cancel`,
    });

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      checkoutSessionId: result.stripeCheckoutSessionId,
      checkoutUrl: result.stripeCheckoutUrl,
    });
  } catch (error) {
    const message = getCheckoutApiErrorMessage(error);
    const status =
      error instanceof z.ZodError || (error instanceof Error && error.message.startsWith("[checkout]"))
        ? 400
        : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status,
      },
    );
  }
}
