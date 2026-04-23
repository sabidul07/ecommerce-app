"use client";

import Image from "next/image";
import { ShoppingBag, User } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group card-hover flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-light mb-4">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone">
            <ShoppingBag size={40} className="opacity-30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="font-display text-xl font-light leading-tight">
          {product.title}
        </h3>
        {product.profiles?.name && (
          <p className="text-xs text-stone flex items-center gap-1">
            <User size={10} />
            {product.profiles.name}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="font-display text-2xl font-light">
            ₹{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            className={`text-xs tracking-widest px-4 py-2 transition-all duration-300 ${
              added
                ? "bg-sage text-parchment"
                : "bg-ink text-parchment hover:bg-stone-dark"
            }`}
          >
            {added ? "ADDED ✓" : "ADD TO BAG"}
          </button>
        </div>
      </div>
    </div>
  );
}
