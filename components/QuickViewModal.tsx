"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Star, ShieldCheck, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import WishlistToggle from "./WishlistToggle";
import AddToCartButton from "./AddToCartButton";
import Link from "next/link";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-[100] cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-5xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl z-[101] flex flex-col md:flex-row"
          >
            {/* Image Section */}
            <div className="relative w-full md:w-1/2 h-80 md:h-auto bg-parchment overflow-hidden group">
              <Image
                src={product.image || "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop"}
                alt={product.title}
                fill
                className={`object-cover transition-transform duration-500 ${zoom ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                onClick={() => setZoom(!zoom)}
              />
              
              <div className="absolute top-6 left-6">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gold uppercase tracking-widest shadow-sm">
                  Quick View
                </div>
              </div>

              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-ink hover:text-white transition-all shadow-sm md:hidden"
              >
                <X size={20} />
              </button>

              {!zoom && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg">
                   <button className="p-1 hover:text-gold transition-colors"><ChevronLeft size={16} /></button>
                   <span className="text-[10px] font-bold tracking-widest px-2">1 / 4</span>
                   <button className="p-1 hover:text-gold transition-colors"><ChevronRight size={16} /></button>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
              <div className="hidden md:flex justify-end mb-6">
                <button onClick={onClose} className="text-stone hover:text-ink transition-colors p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-8 h-[1px] bg-gold" />
                   <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Masterpiece</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display text-ink mb-2">{product.title}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-0.5 text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-stone text-[10px] font-bold uppercase tracking-widest">4.8 (12 Reviews)</span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-2xl font-light text-ink mb-6">₹{product.price.toLocaleString()}</p>
                <p className="text-stone text-sm leading-relaxed mb-8">
                  {product.description || "Each piece is uniquely handcrafted by our master artisans using traditional techniques passed down through generations."}
                </p>
                
                {/* Variants Selection */}
                <div className="space-y-6 mb-10">
                  <div>
                    <p className="text-[10px] font-bold text-ink uppercase tracking-[0.2em] mb-4">Select Variation</p>
                    <div className="flex gap-3">
                      {["Original", "Limited", "Antique"].map(v => (
                        <button key={v} className="px-4 py-2 border border-stone-light rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-gold hover:text-gold transition-all">
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-parchment rounded-2xl mb-10 border border-stone-light/50">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-gold" size={20} />
                    <div>
                      <p className="text-[8px] font-bold text-ink uppercase tracking-widest">Certified</p>
                      <p className="text-[10px] text-stone">Authentic Origin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Maximize2 className="text-gold" size={20} />
                    <div>
                      <p className="text-[8px] font-bold text-ink uppercase tracking-widest">Material</p>
                      <p className="text-[10px] text-stone">{product.category}</p>
                    </div>
                  </div>
                </div>

                {/* Artisan Preview */}
                <div className="p-6 border border-stone-light rounded-2xl mb-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-parchment">
                    <img 
                      src={product.profiles?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-gold uppercase tracking-widest mb-0.5">The Maker</p>
                    <h4 className="text-sm font-bold text-ink">{product.profiles?.name || "Atelier Master Artisan"}</h4>
                  </div>
                  <Link href={`/artisans/${product.profiles?.id}`} className="ml-auto text-[8px] font-bold uppercase tracking-widest border-b border-ink pb-0.5 hover:text-gold hover:border-gold transition-all">
                    Profile
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <AddToCartButton product={product} className="w-full sm:flex-1" />
                <WishlistToggle product={product} className="w-full sm:w-auto px-8" />
              </div>

              <div className="mt-10 pt-10 border-t border-stone-light flex items-center justify-between">
                <Link 
                  href={`/products/${product.id}`} 
                  onClick={onClose}
                  className="text-[10px] font-bold text-ink uppercase tracking-[0.3em] hover:text-gold transition-colors flex items-center gap-2"
                >
                  View Full Details <ChevronRight size={14} />
                </Link>
                <div className="flex items-center gap-2 text-stone text-[10px] font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-sage" /> In Stock
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
