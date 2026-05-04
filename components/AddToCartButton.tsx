"use client";

import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      className={`relative h-14 bg-ink text-parchment rounded-full overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-3 font-bold tracking-[0.2em] text-xs hover:bg-gold hover:text-ink ${className}`}
    >
      <div className={`flex items-center gap-3 transition-all duration-500 ${isAdded ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <ShoppingBag size={18} />
        ADD TO COLLECTION — ₹{product.price.toLocaleString()}
      </div>
      <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-500 bg-sage text-white ${isAdded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <Check size={18} />
        ADDED TO COLLECTION
      </div>
    </button>
  );
}
