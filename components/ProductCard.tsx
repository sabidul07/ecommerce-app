"use client";

import Image from "next/image";
import { ShoppingBag, User, Eye, Heart, Star } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group card-hover flex flex-col p-4 relative">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-stone-light mb-4 rounded-sm">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone">
            <ShoppingBag size={40} className="opacity-30" />
          </div>
        )}

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button className="w-10 h-10 rounded-full bg-parchment text-ink flex items-center justify-center shadow-xl hover:bg-gold hover:text-ink transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
            <Eye size={18} />
          </button>
          <button className="w-10 h-10 rounded-full bg-parchment text-ink flex items-center justify-center shadow-xl hover:bg-rust hover:text-parchment transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-[50ms]">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-display text-xl font-light leading-tight mb-1 group-hover:text-gold transition-colors">
          {product.title}
        </h3>
        
        {product.profiles?.name && (
          <p className="text-[10px] tracking-widest text-stone uppercase mb-3 flex items-center gap-1 opacity-70">
            {product.profiles.name}
          </p>
        )}

        <div className="flex items-center gap-1 mb-4">
          <div className="flex items-center gap-0.5 text-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={i < 4 ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[10px] text-stone font-bold mt-0.5">4.8</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-2xl font-light">
              ₹{product.price.toFixed(0)}
            </span>
          </div>
          
          <p className="text-[9px] font-bold text-rust uppercase tracking-tighter mb-4 animate-pulse">
            Only 3 left in stock
          </p>

          <button
            onClick={handleAddToCart}
            className={`w-full text-[10px] tracking-[0.2em] font-bold py-3 transition-all duration-500 border ${added
              ? "bg-sage border-sage text-parchment"
              : "bg-ink border-ink text-parchment hover:bg-transparent hover:text-ink"
              }`}
          >
            {added ? "ADDED TO CART ✓" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}
