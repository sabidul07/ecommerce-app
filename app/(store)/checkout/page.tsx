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
  Star,
  Smartphone,
  Wallet,
  HandCoins,
  Ticket,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [useBillingAsShipping, setUseBillingAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    name: "",
    line1: "",
    city: "",
    pincode: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");

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

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");

    // Simulate order placement
    setTimeout(() => {
      setOrderId("ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase());
      setSuccess(true);
      clearCart();
      setLoading(false);
    }, 2500);
  };

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center min-h-[80vh] text-center animate-fade-in">
        <div className="w-24 h-24 bg-sage/10 rounded-full flex items-center justify-center mb-8 relative">
          <CheckCircle2 size={48} className="text-sage" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-gold text-white p-2 rounded-full shadow-lg"
          >
            <Star size={12} fill="currentColor" />
          </motion.div>
        </div>
        <p className="text-gold tracking-[0.4em] text-[10px] font-bold mb-4 uppercase">Heritage Confirmed</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink mb-6">Masterpiece Reserved</h1>
        <p className="text-stone max-w-md mx-auto mb-12 leading-relaxed">
          Your acquisition is now being prepared by our master artisans. We will notify you once the collection begins its journey to your doorstep.
        </p>
        <div className="bg-parchment p-8 rounded-3xl border border-stone-light mb-12 w-full max-w-sm">
          <p className="text-[10px] text-stone uppercase tracking-widest mb-2 font-bold">Transaction Reference</p>
          <p className="font-mono text-xl text-ink font-bold">{orderId}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/account/orders" className="btn-gold min-w-[220px] py-4">Track Journey</Link>
          <Link href="/products" className="text-ink text-sm font-bold uppercase tracking-widest py-4 px-8 border border-stone-light rounded-xl hover:bg-parchment transition-all">Explore More</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-24">
      {/* Checkout Progress Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
        <div className="flex items-center gap-6">
          <Link href="/cart" className="w-10 h-10 rounded-full border border-stone-light flex items-center justify-center hover:bg-parchment transition-all">
            <ArrowLeft size={16} className="text-stone" />
          </Link>
          <h1 className="font-display text-3xl text-ink">Checkout Acquisition</h1>
        </div>

        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step === s ? "bg-ink text-white shadow-xl scale-110" :
                  step > s ? "bg-sage text-white" : "bg-parchment text-stone-400 border border-stone-light"
                }`}>
                {step > s ? <CheckCircle2 size={14} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-[1px] mx-2 ${step > s ? "bg-sage" : "bg-stone-light"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Left Column: Flow */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                <div className="bg-white p-10 rounded-[32px] border border-stone-light shadow-sm">
                  <h2 className="font-display text-3xl text-ink mb-8">Shipping Sanctuary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                      <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-3 block">Full Name</label>
                      <input
                        type="text"
                        className="w-full bg-parchment/30 border-b border-stone-light py-3 outline-hidden focus:border-gold transition-all text-sm font-medium"
                        placeholder="Master Artisan Name"
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-3 block">Studio / Street Address</label>
                      <input
                        type="text"
                        className="w-full bg-parchment/30 border-b border-stone-light py-3 outline-hidden focus:border-gold transition-all text-sm font-medium"
                        placeholder="House No, Building, Street"
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-3 block">City / Town</label>
                      <input
                        type="text"
                        className="w-full bg-parchment/30 border-b border-stone-light py-3 outline-hidden focus:border-gold transition-all text-sm font-medium"
                        placeholder="Ojai, CA"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-widest text-stone uppercase font-bold mb-3 block">Postal Code</label>
                      <input
                        type="text"
                        className="w-full bg-parchment/30 border-b border-stone-light py-3 outline-hidden focus:border-gold transition-all text-sm font-medium"
                        placeholder="93023"
                        value={address.pincode}
                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-stone-light">
                    <button
                      onClick={() => setUseBillingAsShipping(!useBillingAsShipping)}
                      className="flex items-center gap-3 group"
                    >
                      <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${useBillingAsShipping ? "bg-ink border-ink" : "border-stone-light"}`}>
                        {useBillingAsShipping && <div className="w-2 h-2 bg-gold rounded-xs" />}
                      </div>
                      <span className="text-xs text-stone font-bold uppercase tracking-widest group-hover:text-ink">Use as Billing Address</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="btn-gold w-full py-5 flex items-center justify-center gap-3 group"
                  disabled={!address.name || !address.line1}
                >
                  Continue to Delivery <ChevronRight size={18} className="transition-transform group-hover:translate-x-2" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                <div className="bg-white p-10 rounded-[32px] border border-stone-light shadow-sm">
                  <h2 className="font-display text-3xl text-ink mb-8">Delivery Mode</h2>
                  <div className="space-y-4">
                    {[
                      { id: 'standard', title: 'Standard Heritage', desc: 'Secure eco-packaging in 5-7 days', price: shipping === 0 ? 'Free' : `₹${shipping}` },
                      { id: 'express', title: 'Priority Collection', desc: 'Express artisan handoff in 2-3 days', price: '₹250' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setDeliveryMethod(m.id)}
                        className={`w-full p-6 rounded-2xl border transition-all flex items-center justify-between text-left ${deliveryMethod === m.id ? 'bg-parchment border-gold shadow-md' : 'bg-transparent border-stone-light hover:border-stone'}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${deliveryMethod === m.id ? 'border-gold' : 'border-stone-light'}`}>
                            {deliveryMethod === m.id && <div className="w-3 h-3 bg-gold rounded-full shadow-sm" />}
                          </div>
                          <div>
                            <p className="font-bold text-ink uppercase tracking-widest text-xs">{m.title}</p>
                            <p className="text-[10px] text-stone mt-1">{m.desc}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-ink">{m.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-5 border border-stone-light rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-parchment transition-all">Back</button>
                  <button onClick={() => setStep(3)} className="btn-gold flex-[2] py-5">Review & Payment</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                {/* Review Card */}
                <div className="bg-parchment/50 p-8 rounded-[32px] border border-stone-light border-dashed space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-gold mt-1" size={20} />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Delivering To</p>
                      <p className="text-sm text-ink font-medium leading-relaxed">{address.name}, {address.line1}, {address.city} - {address.pincode}</p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-[10px] font-bold text-gold uppercase underline">Edit</button>
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="bg-white p-10 rounded-[32px] border border-stone-light shadow-sm">
                  <h2 className="font-display text-3xl text-ink mb-8">Payment Instrument</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'card', title: 'Credit / Debit Card', icon: CreditCard },
                      { id: 'upi', title: 'UPI (Paytm/GPay)', icon: Smartphone },
                      { id: 'wallet', title: 'Digital Wallets', icon: Wallet },
                      { id: 'cod', title: 'Cash on Delivery', icon: HandCoins }
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id)}
                        className={`p-6 rounded-2xl border transition-all flex items-center gap-4 text-left ${paymentMethod === p.id ? 'bg-ink text-white border-ink shadow-xl scale-[1.02]' : 'bg-transparent border-stone-light hover:border-stone text-stone'}`}
                      >
                        <p.icon size={20} className={paymentMethod === p.id ? "text-gold" : "text-stone-400"} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="btn-gold w-full py-6 flex items-center justify-center gap-4 text-sm tracking-[0.2em] shadow-2xl"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        Confirm Acquisition — ₹{finalTotal.toLocaleString()} <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-6 text-stone opacity-40">
                    <ShieldCheck size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Atelier Secure Protocol</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Order Sidebar */}
        <div className="lg:col-span-5">
          <div className="sticky top-32 space-y-8">
            <div className="bg-ink text-white p-10 rounded-[40px] shadow-2xl">
              <h3 className="font-display text-2xl mb-10 border-b border-white/10 pb-6">Your Selection</h3>

              <div className="space-y-6 mb-10 max-h-[250px] overflow-y-auto no-scrollbar">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4 items-center">
                    <div className="relative w-12 h-16 bg-white/10 rounded-lg overflow-hidden shrink-0">
                      <Image src={product.image || ""} alt={product.title} fill className="object-cover" />
                      <div className="absolute top-0 right-0 bg-gold text-ink text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg">x{quantity}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate opacity-80">{product.title}</p>
                      <p className="text-xs font-bold text-gold mt-1">₹{(product.price * quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="relative mb-10 group">
                <input
                  type="text"
                  placeholder="ACQUISITION CODE"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-4 text-[10px] font-bold uppercase tracking-widest focus:border-gold outline-hidden transition-all"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gold text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Apply</button>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-10 mb-10 text-xs tracking-widest font-bold uppercase">
                <div className="flex justify-between items-center text-white/60">
                  <span>Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span>Heritage Delivery</span>
                  <span className="text-white">{shipping === 0 ? "Complimentary" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between items-center text-white/60">
                  <span>GST (Tax Included)</span>
                  <span className="text-white">18%</span>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-end border-t border-white/10">
                <div>
                  <p className="text-[10px] text-gold uppercase tracking-[0.4em] font-bold mb-2">Acquisition Total</p>
                  <p className="font-display text-4xl text-white">₹{finalTotal.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-parchment border border-stone-light rounded-3xl flex items-center gap-4">
              <ShieldCheck className="text-gold" size={24} />
              <div>
                <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Heritage Warranty</p>
                <p className="text-[10px] text-stone">Authentic handcrafted guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
