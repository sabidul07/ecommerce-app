import { NextResponse } from "next/server";
import { CheckoutError, CheckoutRequest, getVerifiedCheckout } from "@/lib/checkout";

export const runtime = "nodejs";

function razorpayAuthHeader() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new CheckoutError("Razorpay keys are missing. Add them to .env.local.", 500);
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutRequest;
    const { total, user } = await getVerifiedCheckout(body.items ?? []);
    const currency = process.env.RAZORPAY_CURRENCY ?? "INR";
    const amount = Math.round(total * 100);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: razorpayAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `atelier_${Date.now()}`,
        notes: {
          user_id: user.id,
        },
      }),
    });

    const razorpayOrder = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            razorpayOrder?.error?.description ??
            "Failed to create Razorpay order. Please try again.",
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      orderId: razorpayOrder.id,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while starting payment. Please try again." },
      { status: 500 },
    );
  }
}
