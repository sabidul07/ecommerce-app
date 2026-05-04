"use client";

import Image from "next/image";
import { ShoppingBag, Eye, Heart, Star, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import VerificationBadge from "./VerificationBadge";
import WishlistToggle from "./WishlistToggle";
import QuickViewModal from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const rating = product.rating || 4.5;
  const stockCount = product.inventory_count ?? 10;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  return (
    <div className="group flex flex-col p-0 relative bg-white transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden h-full">
      <Link href={`/products/${product.id}`} className="block relative aspect-3/4 overflow-hidden bg-parchment">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone">
            <ShoppingBag size={40} className="opacity-30" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <VerificationBadge status={product.profiles?.verification_status} tier="Bronze" />
          {isLowStock && (
            <div className="bg-rust/90 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
              Low Stock
            </div>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-ink/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-500">
            <WishlistToggle product={product} />
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-ink hover:bg-gold hover:text-white transition-all shadow-lg active:scale-95"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>
      </Link>

      {/* Info Container */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-2">
          <Link href={`/products/${product.id}`} className="font-display text-lg font-bold leading-tight text-ink group-hover:text-gold transition-colors duration-300">
            {product.title}
          </Link>
          <p className="font-bold text-lg text-ink">
            ₹{product.price.toLocaleString()}
          </p>
        </div>

        {product.profiles?.name && (
          <p className="text-[9px] tracking-[0.2em] text-stone uppercase mb-4 flex items-center gap-1">
            <Sparkles size={10} className="text-gold" />
            {product.profiles.name}
          </p>
        )}

        {/* Improved Rating Display */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-0.5 text-gold">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(rating) ? "currentColor" : "none"}
                className={i < Math.floor(rating) ? "drop-shadow-sm" : "text-stone-light opacity-30"}
              />
            ))}
          </div>
          <span className="text-[10px] text-stone font-bold uppercase tracking-widest">{rating}</span>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleAddToCart}
            className={`group/btn w-full text-[10px] tracking-[0.4em] font-bold py-4 rounded-xl transition-all duration-700 relative overflow-hidden ${added
              ? "bg-sage text-white shadow-lg shadow-sage/20"
              : "bg-ink text-white hover:bg-gold hover:shadow-lg hover:shadow-gold/20"
              }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.div
                  key="added"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckIcon className="w-4 h-4" /> ADDED
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={14} /> QUICK ADD
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
