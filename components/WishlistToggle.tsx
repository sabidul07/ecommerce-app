"use client";

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/types';
import { motion } from 'framer-motion';

interface WishlistToggleProps {
  product: Product;
  className?: string;
}

export default function WishlistToggle({ product, className }: WishlistToggleProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const active = isInWishlist(product.id);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (active) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-lg border border-stone-light hover:scale-110 active:scale-95 group ${className}`}
    >
      <motion.div
        animate={{ scale: active ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart 
          size={18} 
          className={`transition-colors ${active ? 'fill-rust text-rust' : 'text-stone-400 group-hover:text-rust'}`} 
        />
      </motion.div>
    </button>
  );
}
