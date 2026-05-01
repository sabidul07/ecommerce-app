import crypto from "crypto";
import { NextResponse } from "next/server";
import { CheckoutError, CheckoutItem, createMarketplaceOrder, getVerifiedCheckout } from "@/lib/checkout";

export const runtime = "nodejs";

type VerifyPaymentRequest = {
  items?: CheckoutItem[];
  deliveryMethod?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

function verifySignature(orderId: string, paymentId: string, signature: string) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new CheckoutError("Razorpay secret is missing. Add it to .env.local.", 500);
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
}

async function getRazorpayOrder(orderId: string) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new CheckoutError("Razorpay keys are missing. Add them to .env.local.", 500);
  }

  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new CheckoutError(
      data?.error?.description ?? "Failed to verify Razorpay order.",
      response.status,
    );
  }

  return data as { amount: number; currency: string; status: string };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyPaymentRequest;
    const razorpayOrderId = body.razorpay_order_id;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpaySignature = body.razorpay_signature;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new CheckoutError("Payment details are missing. Please try again.");
    }

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      throw new CheckoutError("Payment verification failed. Please contact support.", 400);
    }

    const [{ total }, razorpayOrder] = await Promise.all([
      getVerifiedCheckout(body.items ?? [], body.deliveryMethod),
      getRazorpayOrder(razorpayOrderId),
    ]);

    if (razorpayOrder.amount !== Math.round(total * 100)) {
      throw new CheckoutError("Payment amount does not match your bag total.", 400);
    }

    const order = await createMarketplaceOrder(body.items ?? [], body.deliveryMethod);

    return NextResponse.json({
      orderId: order.orderId,
      razorpayPaymentId,
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { error: "Something went wrong while verifying payment. Please try again." },
      { status: 500 },
    );
  }
}
