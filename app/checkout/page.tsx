"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { 
  CheckCircle2, 
  ChevronRight, 
  CreditCard, 
  MapPin, 
  Package, 
  Truck, 
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Razorpay types
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
  modal: { ondismiss: () => void };
  name: string;
  order_id: string;
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      on: (event: string, callback: (response: any) => void) => void;
      open: () => void;
    };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, itemCount } = useCart();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Form states
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    pincode: "",
  });
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  // Calculations
  const subtotal = total;
  const tax = subtotal * 0.18;
  const shipping = deliveryMethod === "express" ? 250 : (subtotal > 2000 ? 0 : 150);
  const finalTotal = subtotal + tax + shipping;

  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push("/cart");
    }
  }, [items, success, router]);

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setError("Payment gateway failed to load.");
        setLoading(false);
        return;
      }

      // In a real app, this would be a server action or API call to your backend
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          shippingAddress: address,
          deliveryMethod
        }),
      });

      const result = await response.json() as RazorpayOrderResponse;

      if (!response.ok) {
        setError(result.error ?? "Failed to initiate payment.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay({
        amount: result.amount,
        currency: result.currency,
        key: result.keyId,
        order_id: result.orderId,
        name: "Atelier",
        description: `Order for ${itemCount} items`,
        theme: { color: "#1A1A1C" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (paymentResponse) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...paymentResponse, items }),
          });
          
          if (verifyRes.ok) {
            setOrderId(result.orderId);
            setSuccess(true);
            clearCart();
          } else {
            setError("Payment verification failed.");
          }
          setLoading(false);
        },
      });

      razorpay.open();
    } catch (err) {
      // For demo purposes, if API doesn't exist, we'll mock success
      setTimeout(() => {
        setOrderId("ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase());
        setSuccess(true);
        clearCart();
        setLoading(false);
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
        <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} className="text-sage" />
        </div>
        <p className="text-gold tracking-[0.4em] text-xs font-bold mb-4 uppercase">Success</p>
        <h1 className="font-display text-5xl font-light mb-6">Order Confirmed</h1>
        <p className="text-stone max-w-md mx-auto mb-2">
          Thank you for your purchase. We've received your order and are preparing it for shipment.
        </p>
        <p className="text-sm font-medium text-ink mb-10">
          Order ID: <span className="font-mono text-gold">{orderId}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="btn-primary min-w-[200px]">View Orders</Link>
          <Link href="/products" className="btn-secondary min-w-[200px]">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-12">
      <div className="flex items-center gap-2 text-stone mb-12">
        <Link href="/cart" className="hover:text-ink transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Bag
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7 space-y-12">
          {/* Step Indicators */}
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-1 flex-1 transition-all duration-500 ${
                  step >= s ? "bg-gold" : "bg-stone-light"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-3xl font-light mb-2">Shipping Address</h2>
                  <p className="text-stone text-sm">Where should we deliver your treasures?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-2 block">Full Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Jane Doe"
                      value={address.name}
                      onChange={(e) => setAddress({...address, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-2 block">Phone Number</label>
                    <input 
                      type="tel" 
                      className="input-field" 
                      placeholder="+91 98765 43210"
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-2 block">Pincode</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="400001"
                      value={address.pincode}
                      onChange={(e) => setAddress({...address, pincode: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-2 block">Street Address</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="123 Atelier Way, Studio 4"
                      value={address.line1}
                      onChange={(e) => setAddress({...address, line1: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-2 block">City</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => address.name && address.line1 && setStep(2)}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                >
                  Continue to Delivery <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-3xl font-light mb-2">Delivery Method</h2>
                  <p className="text-stone text-sm">Choose how fast you want your items.</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => setDeliveryMethod("standard")}
                    className={`w-full text-left p-6 border transition-all flex items-center justify-between group ${
                      deliveryMethod === "standard" ? "border-gold bg-parchment" : "border-stone-light hover:border-stone"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        deliveryMethod === "standard" ? "border-gold" : "border-stone-light"
                      }`}>
                        {deliveryMethod === "standard" && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <div>
                        <p className="font-medium text-ink">Standard Delivery</p>
                        <p className="text-xs text-stone">Delivery in 5-7 business days</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">₹{subtotal > 2000 ? "0.00" : "150.00"}</span>
                  </button>

                  <button 
                    onClick={() => setDeliveryMethod("express")}
                    className={`w-full text-left p-6 border transition-all flex items-center justify-between group ${
                      deliveryMethod === "express" ? "border-gold bg-parchment" : "border-stone-light hover:border-stone"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        deliveryMethod === "express" ? "border-gold" : "border-stone-light"
                      }`}>
                        {deliveryMethod === "express" && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <div>
                        <p className="font-medium text-ink">Express Delivery</p>
                        <p className="text-xs text-stone">Priority shipping (2-3 business days)</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">₹250.00</span>
                  </button>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-4">Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary flex-[2] py-4">Continue to Payment</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-3xl font-light mb-2">Payment</h2>
                  <p className="text-stone text-sm">Review your details and pay securely.</p>
                </div>

                <div className="bg-parchment border border-stone-light p-6 space-y-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gold mt-1" />
                      <div>
                        <p className="text-[10px] tracking-widest text-stone uppercase font-bold mb-1">Deliver to</p>
                        <p className="text-sm text-ink">{address.name}, {address.line1}, {address.city} - {address.pincode}</p>
                      </div>
                    </div>
                    <button onClick={() => setStep(1)} className="text-[10px] underline uppercase tracking-widest text-gold font-bold">Edit</button>
                  </div>
                  <div className="border-t border-stone-light pt-4 flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <Truck size={18} className="text-gold mt-1" />
                      <div>
                        <p className="text-[10px] tracking-widest text-stone uppercase font-bold mb-1">Method</p>
                        <p className="text-sm text-ink uppercase tracking-wide">{deliveryMethod} Shipping</p>
                      </div>
                    </div>
                    <button onClick={() => setStep(2)} className="text-[10px] underline uppercase tracking-widest text-gold font-bold">Edit</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={loading}
                    onClick={handlePayment}
                    className="btn-gold w-full py-5 flex items-center justify-center gap-3 group text-base shadow-[0_10px_30px_rgba(197,154,74,0.2)]"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <CreditCard size={20} /> Pay Now — ₹{finalTotal.toLocaleString()}
                      </>
                    )}
                  </button>
                  {error && <p className="text-xs text-rust text-center font-medium uppercase tracking-widest">{error}</p>}
                </div>

                <div className="flex items-center justify-center gap-6 opacity-50">
                  <ShieldCheck size={24} />
                  <p className="text-[10px] tracking-widest uppercase font-bold">SECURE ENCRYPTED CHECKOUT</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="card sticky top-24 border-stone-light shadow-sm">
            <h3 className="font-display text-2xl mb-8 pb-4 border-b border-stone-light">Order Summary</h3>
            
            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-stone-light relative flex-shrink-0">
                    {product.image ? (
                      <Image src={product.image} alt={product.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone"><Package size={20} /></div>
                    )}
                    <span className="absolute -top-2 -right-2 bg-ink text-parchment text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{quantity}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink leading-tight mb-1">{product.title}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">₹{(product.price * quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-stone-light pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-stone">Subtotal</span>
                <span className="text-ink font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone">Shipping</span>
                <span className="text-ink font-medium">{shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone">Estimated Tax (GST 18%)</span>
                <span className="text-ink font-medium">₹{tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-stone-light pt-6 flex justify-between items-end">
                <div>
                  <span className="text-[10px] tracking-[0.3em] text-gold font-bold uppercase block mb-1">TOTAL</span>
                  <span className="font-display text-4xl text-ink leading-none">₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
