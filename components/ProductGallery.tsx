"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Rotate3d, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import WishlistToggle from "./WishlistToggle";

interface ProductGalleryProps {
  images: string[];
  product: any;
}

export default function ProductGallery({ images, product }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [is360, setIs360] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock 360 images if only one provided
  const galleryImages = images.length > 0 ? images : [product.image];
  const mock360Images = Array(12).fill(galleryImages[0]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="space-y-8 group/gallery">
      {/* Main Stage */}
      <div 
        ref={containerRef}
        className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden border border-stone-light shadow-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <AnimatePresence mode="wait">
          {!is360 ? (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              <Image 
                src={galleryImages[activeIdx]} 
                alt={product.title} 
                fill 
                className={`object-cover transition-transform duration-200 ${zoom ? 'scale-150' : 'scale-100'}`}
                style={zoom ? { 
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%` 
                } : {}}
                priority
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-parchment/30">
               <motion.div 
                 animate={{ rotateY: 360 }}
                 transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                 className="relative w-full h-full"
               >
                 <Image src={galleryImages[0]} alt="360 View" fill className="object-contain p-12" />
               </motion.div>
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-ink/80 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                  <Rotate3d size={14} className="animate-spin-slow" /> 360° Perspective Active
               </div>
            </div>
          )}
        </AnimatePresence>

        {/* Overlay Controls */}
        <div className="absolute top-6 right-6 flex flex-col gap-3">
          <WishlistToggle product={product} />
          <button 
            onClick={() => setIs360(!is360)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${is360 ? 'bg-gold text-white' : 'bg-white text-ink hover:bg-parchment'}`}
          >
            <Rotate3d size={20} />
          </button>
        </div>

        <div className="absolute bottom-6 left-6">
           <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-bold text-ink uppercase tracking-widest">
              <ZoomIn size={14} className="text-gold" /> Hover to Inspect Craft
           </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-4">
        {galleryImages.map((img: string, i: number) => (
          <button
            key={i}
            onMouseEnter={() => { setActiveIdx(i); setIs360(false); }}
            className={`aspect-[3/4] relative rounded-xl overflow-hidden border-2 transition-all ${
              activeIdx === i && !is360 ? "border-gold shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
          </button>
        ))}
        
        {/* 360 Entry */}
        <button
          onClick={() => setIs360(true)}
          className={`aspect-[3/4] relative rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center gap-2 transition-all bg-parchment/50 ${
            is360 ? "border-gold bg-parchment shadow-md scale-105" : "border-transparent opacity-60 hover:opacity-100"
          }`}
        >
          <Rotate3d size={24} className="text-stone" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-stone">360° View</span>
        </button>
      </div>
    </div>
  );
}
