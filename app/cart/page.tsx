"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Package } from "lucide-react";

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOrderResponse = {
  amount: number;
  currency: string;
  error?: string;
  keyId: string;
  orderId: string;
};

type RazorpayOptions = {
  amount: number;
  currency: string;
  description: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  key: string;
  modal: {
    ondismiss: () => void;
  };
  name: string;
  order_id: string;
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
      open: () => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    try {
      const checkoutItems = items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      }));

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        setError("Razorpay checkout could not be loaded. Please check your connection.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: checkoutItems }),
      });

      const result = (await response.json()) as RazorpayOrderResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(result.error ?? "Failed to start payment. Please try again.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        amount: result.amount,
        currency: result.currency,
        description: `${itemCount} item${itemCount !== 1 ? "s" : ""}`,
        key: result.keyId,
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        name: "Atelier",
        order_id: result.orderId,
        theme: {
          color: "#C59A4A",
        },
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...paymentResponse,
                items: checkoutItems,
              }),
            });
            const verifyResult = (await verifyResponse.json()) as { error?: string };

            if (!verifyResponse.ok) {
              setError(verifyResult.error ?? "Payment verification failed. Please contact support.");
              setLoading(false);
              return;
            }

            clearCart();
            setSuccess(true);
          } catch {
            setError("Payment was completed, but verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
      });

      razorpay.on("payment.failed", (failure) => {
        setError(failure.error?.description ?? "Payment failed. Please try again.");
        setLoading(false);
      });

      razorpay.open();
    } catch {
      setError("Something went wrong while starting payment. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gold tracking-[0.3em] text-xs mb-3">ORDER CONFIRMED</p>
          <h2 className="font-display text-4xl font-light mb-3">Thank You!</h2>
          <p className="text-stone text-sm mb-8">
            Your order has been placed successfully. View your order history in the dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
              View Orders <ArrowRight size={16} />
            </Link>
            <Link href="/products" className="btn-secondary inline-block">
              Keep Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShoppingBag size={56} className="text-stone-light mx-auto mb-4" />
          <h2 className="font-display text-3xl font-light mb-2">Your bag is empty</h2>
          <p className="text-stone text-sm mb-6">Add some extraordinary items to get started.</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Browse Collection <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 border-b border-stone-light pb-8">
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-2">YOUR SELECTION</p>
          <h1 className="section-title">Shopping Bag</h1>
        </div>
        <p className="text-stone text-sm">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="card flex gap-4">
              {/* Image */}
              <div className="w-20 h-20 bg-stone-light flex-shrink-0 relative overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-stone" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg leading-tight">{product.title}</h3>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-stone hover:text-rust transition-colors flex-shrink-0 mt-0.5"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="font-display text-xl mt-1">₹{product.price.toFixed(2)}</p>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="w-7 h-7 border border-stone-light flex items-center justify-center hover:border-stone transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-6 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="w-7 h-7 border border-stone-light flex items-center justify-center hover:border-stone transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <span className="text-xs text-stone ml-2">
                    Subtotal: ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs text-stone hover:text-rust transition-colors underline underline-offset-2 mt-2"
          >
            Clear bag
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="font-display text-2xl mb-6 pb-4 border-b border-stone-light">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-stone truncate mr-2">
                    {product.title} x {quantity}
                  </span>
                  <span className="flex-shrink-0">
                    ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-light pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-widest text-stone">TOTAL</span>
                <span className="font-display text-3xl">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-rust/10 border border-rust/20 text-rust text-sm px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  Pay with Razorpay <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-xs text-stone text-center mt-3">
              By ordering you agree to our terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
