"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Package, Truck, ShieldCheck, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();
  const [coupon, setCoupon] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");

  const shippingCosts = {
    standard: 0,
    express: 500,
    priority: 1200
  };

  const finalTotal = total + (shippingCosts[shippingMethod as keyof typeof shippingCosts] || 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="w-24 h-24 bg-parchment rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShoppingBag size={40} className="text-gold" />
          </div>
          <h2 className="font-display text-4xl font-light text-ink mb-4">Your collection is empty</h2>
          <p className="text-stone text-sm mb-10 max-w-xs mx-auto">Discover unique masterpieces handcrafted by our global community of artisans.</p>
          <Link href="/products" className="btn-gold px-10 py-4 inline-flex items-center gap-3">
            Explore Catalog <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-stone-light pb-10">
        <div>
          <div className="flex items-center gap-3 text-gold mb-3">
            <div className="w-8 h-[1px] bg-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Checkout Process</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink">Your Collection</h1>
        </div>
        <div className="flex items-center gap-4 text-stone text-xs font-bold uppercase tracking-widest">
          <span>{itemCount} Masterpieces</span>
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <button onClick={clearCart} className="hover:text-rust transition-colors underline decoration-gold/30">Clear All</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-16">
        {/* Items List */}
        <div className="lg:col-span-8">
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {items.map(({ product, quantity }) => (
                <motion.div 
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex flex-col sm:flex-row gap-8 pb-8 border-b border-stone-light last:border-0"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-parchment shadow-md">
                    <Image
                      src={product.image || "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop"}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 160px"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col py-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{product.category}</p>
                        <h3 className="font-display text-2xl text-ink hover:text-gold transition-colors">
                          <Link href={`/products/${product.id}`}>{product.title}</Link>
                        </h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 text-stone hover:text-rust transition-all hover:bg-parchment rounded-full"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-6">
                      <div className="flex items-center gap-6 bg-parchment rounded-full px-6 py-3 w-fit border border-stone-light">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="text-stone hover:text-ink transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="text-stone hover:text-ink transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-stone uppercase tracking-widest mb-1">Price</p>
                        <p className="text-2xl font-light text-ink">₹{(product.price * quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Additional Features Section */}
          <div className="mt-16 grid md:grid-cols-2 gap-10">
            <div className="p-8 bg-parchment rounded-3xl border border-stone-light/50">
              <div className="flex items-center gap-3 mb-6">
                <Ticket size={20} className="text-gold" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink">Apply Coupon</h3>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-white border border-stone-light rounded-xl px-4 py-3 text-sm focus:border-gold outline-hidden transition-all"
                />
                <button className="bg-ink text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold transition-colors">Apply</button>
              </div>
            </div>

            <div className="p-8 bg-parchment rounded-3xl border border-stone-light/50">
              <div className="flex items-center gap-3 mb-6">
                <Truck size={20} className="text-gold" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink">Shipping Mode</h3>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'standard', label: 'Standard Delivery', time: '5-7 Days', price: 'Free' },
                  { id: 'express', label: 'Express Shipping', time: '2-3 Days', price: '₹500' }
                ].map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => setShippingMethod(m.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${shippingMethod === m.id ? 'bg-white border-gold shadow-md' : 'bg-transparent border-stone-light hover:border-stone'}`}
                  >
                    <div>
                      <p className="text-xs font-bold text-ink">{m.label}</p>
                      <p className="text-[10px] text-stone tracking-wider">{m.time}</p>
                    </div>
                    <span className="text-xs font-bold text-gold">{m.price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            <div className="bg-ink text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-display text-3xl mb-10 border-b border-white/10 pb-6">Summary</h2>
                
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center text-white/60 text-xs tracking-widest font-bold uppercase">
                    <span>Subtotal</span>
                    <span className="text-white">₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60 text-xs tracking-widest font-bold uppercase">
                    <span>Estimated Shipping</span>
                    <span className="text-white">{shippingCosts[shippingMethod as keyof typeof shippingCosts] === 0 ? 'FREE' : `₹${shippingCosts[shippingMethod as keyof typeof shippingCosts]}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/60 text-xs tracking-widest font-bold uppercase">
                    <span>GST (Included)</span>
                    <span className="text-white">18%</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8 mb-10">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">Grand Total</span>
                    <span className="font-display text-5xl leading-none">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-gold text-ink flex items-center justify-center gap-3 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-white transition-all group"
                >
                  Proceed to Payment <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </Link>
              </div>

              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 blur-[60px] rounded-full -mr-16 -mt-16" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 p-6 bg-parchment rounded-2xl border border-stone-light/50">
                <ShieldCheck className="text-gold" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Atelier Promise</p>
                  <p className="text-[10px] text-stone">Secure encrypted payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
