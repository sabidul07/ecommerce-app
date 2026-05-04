"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Image from "next/image";
import { Product } from "@/types";

interface CartToastProps {
  show: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function CartToast({ show, onClose, product }: CartToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 20, x: "-50%" }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-md"
        >
          <div className="bg-ink text-white rounded-2xl shadow-2xl p-4 border border-white/10 backdrop-blur-xl bg-opacity-90">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                <Image 
                  src={product.image || ""} 
                  alt={product.title} 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={14} className="text-sage" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sage">Added to Collection</p>
                </div>
                <p className="text-sm font-medium truncate">{product.title}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/20 hover:bg-white/5 transition-all"
              >
                Continue Shopping
              </button>
              <Link 
                href="/cart"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-gold text-ink hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                View Cart <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
