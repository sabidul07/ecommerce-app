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
      className={`group w-10 h-10 flex items-center justify-center rounded-full transition-all bg-white shadow-sm border border-stone-light hover:border-rust hover:shadow-md active:scale-95 ${className}`}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <motion.div
        animate={{ scale: active ? [1, 1.4, 1] : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Heart 
          size={18} 
          className={`transition-colors ${active ? 'fill-rust text-rust' : 'text-ink group-hover:text-rust'}`} 
        />
      </motion.div>
    </button>
  );
}
