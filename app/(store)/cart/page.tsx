"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Package } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, clearCart, total, itemCount } = useCart();


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
      <div className="flex  items-end justify-between mb-10 flex-wrap border-b border-stone-light pb-8">
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
              <div className="w-20 h-20 bg-stone-light shrink-0 relative overflow-hidden">
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
                    className="text-stone hover:text-rust transition-colors shrink-0 mt-0.5"
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
                  <span className="shrink-0">
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


            <Link
              href="/checkout"
              className="btn-gold w-full flex items-center justify-center gap-2 text-sm py-4 group"
            >
              Proceed to Checkout <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <p className="text-xs text-stone text-center mt-3">
              By ordering you agree to our terms of service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
