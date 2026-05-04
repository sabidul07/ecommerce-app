"use client";

import Image from "next/image";
import { ShoppingBag, User, Eye, Heart, Star } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";

import VerificationBadge from "./VerificationBadge";
import WishlistToggle from "./WishlistToggle";

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
    <Link href={`/products/${product.id}`} className="group card-hover flex flex-col p-4 relative bg-white">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-light mb-4 rounded-sm">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone">
            <ShoppingBag size={40} className="opacity-30" />
          </div>
        )}

        {/* Top Actions */}
        <div className="absolute top-4 left-4">
          <VerificationBadge status={product.profiles?.verification_status} tier="Bronze" />
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-10px] group-hover:translate-y-0 duration-300">
          <WishlistToggle product={product} />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-display text-xl font-light leading-tight group-hover:text-gold transition-colors">
            {product.title}
          </h3>
          <p className="font-display text-lg font-light">
            ₹{product.price.toFixed(0)}
          </p>
        </div>
        
        {product.profiles?.name && (
          <p className="text-[9px] tracking-[0.2em] text-stone uppercase mb-3 flex items-center gap-1 opacity-70">
            {product.profiles.name}
          </p>
        )}

        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-0.5 text-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={i < 4 ? "currentColor" : "none"} />
            ))}
          </div>
          <span className="text-[9px] text-stone font-bold uppercase tracking-widest">4.8 (12 Reviews)</span>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            className={`w-full text-[10px] tracking-[0.3em] font-bold py-3.5 transition-all duration-500 border ${added
              ? "bg-sage border-sage text-parchment"
              : "bg-ink border-ink text-parchment hover:bg-transparent hover:text-ink"
              }`}
          >
            {added ? "✓ ADDED" : "QUICK ADD"}
          </button>
        </div>
      </div>
    </Link>
  );
}

