"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Info, 
  Plus, 
  Minus, 
  ChevronDown,
  Sparkles,
  Heart,
  MessageCircle,
  Truck,
  Lock,
  CreditCard,
  RotateCcw
} from "lucide-react";
import VerificationBadge from "./VerificationBadge";
import AddToCartButton from "./AddToCartButton";
import { Product } from "@/types";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedFinish, setSelectedFinish] = useState("Glazed");

  const avgRating = product.avg_rating || 4.8;
  const stockCount = product.inventory_count ?? 12;
  const isLowStock = stockCount > 0 && stockCount <= 5;
  const isOutOfStock = stockCount === 0;

  const sizes = ["Small", "Medium", "Large"];
  const finishes = ["Matte", "Glazed", "Rough"];

  return (
    <div className="flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
             <VerificationBadge status={product.profiles?.verification_status} tier="Gold" />
             <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Masterpiece Collection</span>
          </div>
          
          {/* Stock Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
            isOutOfStock ? "bg-rust/10 text-rust" : 
            isLowStock ? "bg-amber-100 text-amber-700 animate-pulse" : 
            "bg-sage/10 text-sage"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-rust" : isLowStock ? "bg-amber-600" : "bg-sage"}`} />
            {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${stockCount} Left` : "Available Now"}
          </div>
        </div>

        <h1 className="text-5xl font-bold text-ink mb-4">{product.title}</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill={i < Math.floor(avgRating) ? "currentColor" : "none"} />
            ))}
            <span className="ml-2 text-sm font-bold text-ink">{avgRating.toFixed(1)}</span>
          </div>
          <span className="text-stone text-xs">({product.reviews?.length || 24} Verified Reviews)</span>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-baseline gap-4 mb-2">
          <span className="text-4xl font-light text-ink">₹{product.price.toLocaleString()}</span>
          {product.compare_at_price && (
            <span className="text-xl text-stone line-through font-light">₹{product.compare_at_price.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-stone font-medium uppercase tracking-widest mb-6">
           <Info size={12} className="text-gold" />
           <span>Price inclusive of all taxes (GST 18%)</span>
        </div>
        <p className="text-stone text-sm leading-relaxed max-w-md">
          {product.description || "Each piece is uniquely handcrafted by our master artisans using traditional techniques passed down through generations."}
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-8 mb-10">
        {/* Size Selector */}
        <div>
           <div className="flex justify-between items-end mb-4">
              <label className="text-[10px] font-bold text-ink uppercase tracking-widest">Select Dimension</label>
              <button className="text-[10px] text-stone underline uppercase tracking-widest">Size Guide</button>
           </div>
           <div className="flex gap-3">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    selectedSize === size ? "bg-ink text-white border-ink shadow-lg" : "bg-white text-stone border-stone-light hover:border-stone"
                  }`}
                >
                  {size}
                </button>
              ))}
           </div>
        </div>

        {/* Finish Selector */}
        <div>
           <label className="text-[10px] font-bold text-ink uppercase tracking-widest mb-4 block">Artisan Finish</label>
           <div className="flex gap-4">
              {finishes.map(finish => (
                <button 
                  key={finish}
                  onClick={() => setSelectedFinish(finish)}
                  className="flex flex-col items-center gap-2 group"
                >
                   <div className={`w-12 h-12 rounded-full border-2 p-1 transition-all ${selectedFinish === finish ? "border-gold" : "border-transparent group-hover:border-stone-light"}`}>
                      <div className={`w-full h-full rounded-full ${
                        finish === "Matte" ? "bg-[#D2B48C]" : 
                        finish === "Glazed" ? "bg-[#A0522D]" : "bg-[#8B4513]"
                      }`} />
                   </div>
                   <span className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-colors ${selectedFinish === finish ? "text-gold" : "text-stone"}`}>{finish}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Quantity Selector */}
        <div>
           <label className="text-[10px] font-bold text-ink uppercase tracking-widest mb-4 block">Select Quantity</label>
           <div className="flex items-center gap-6">
              <div className="flex items-center bg-white border border-stone-light rounded-xl overflow-hidden h-14">
                 <button 
                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                   className="w-14 h-full flex items-center justify-center hover:bg-parchment transition-colors text-stone"
                 >
                    <Minus size={16} />
                 </button>
                 <span className="w-12 text-center font-bold text-ink">{quantity}</span>
                 <button 
                   onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                   className="w-14 h-full flex items-center justify-center hover:bg-parchment transition-colors text-stone"
                 >
                    <Plus size={16} />
                 </button>
              </div>
              {isLowStock && <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Hurry, Limited Stock!</p>}
           </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-12">
        <div className="flex gap-4">
          <AddToCartButton 
            product={product} 
            quantity={quantity}
            className={`flex-[3] ${isOutOfStock ? "opacity-50 cursor-not-allowed grayscale" : ""}`} 
          />
          <button className="flex-1 bg-white border border-stone-light rounded-full flex items-center justify-center hover:bg-parchment hover:border-rust transition-all group">
             <Heart size={20} className="text-stone group-hover:text-rust transition-colors" />
          </button>
        </div>
        
        <button className="w-full h-14 bg-white border border-stone-light rounded-full flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-stone hover:text-ink hover:border-ink transition-all">
           <MessageCircle size={18} className="text-gold" />
           Ask Seller a Question
        </button>

        {/* Dynamic Shipping Threshold */}
        <div className="mt-4 p-4 bg-sage/5 border border-sage/20 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Truck size={18} className="text-sage" />
              <div>
                 <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Free Heritage Shipping</p>
                 <p className="text-[9px] text-stone">On orders above ₹50,000</p>
              </div>
           </div>
           <span className="text-[10px] font-bold text-sage underline cursor-help">Details</span>
        </div>

        {/* Secure Payments */}
        <div className="mt-8 text-center">
           <p className="text-[8px] font-bold text-stone uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
              <Lock size={10} className="text-gold" /> 256-Bit SSL Secure Checkout
           </p>
           <div className="flex items-center justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
              <CreditCard size={20} />
              <ShieldCheck size={20} />
              <div className="text-[10px] font-bold border-l border-stone-light pl-6">UP TO 12 MO. EMI AVAILABLE</div>
           </div>
        </div>

        {isOutOfStock && <p className="text-center text-[10px] font-bold text-rust uppercase tracking-widest mt-2">Currently Unavailable</p>}
      </div>

      {/* Heritage Assurances */}
      <div className="space-y-6 bg-parchment/30 p-6 rounded-3xl border border-stone-light/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-stone-light shadow-sm">
            <ShieldCheck className="text-gold" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink uppercase tracking-widest">100% Money-Back Guarantee</p>
            <p className="text-xs text-stone">7-day no-questions-asked refund policy.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-stone-light shadow-sm">
            <RotateCcw className="text-gold" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Global Returns Center</p>
            <p className="text-xs text-stone leading-relaxed">Easy returns via our <Link href="/help" className="underline hover:text-gold transition-colors">Help Center</Link>.</p>
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-stone-light flex justify-between">
           <Link href="/policies/returns" className="text-[8px] font-bold text-stone uppercase tracking-widest hover:text-ink transition-colors">Return Policy</Link>
           <Link href="/help" className="text-[8px] font-bold text-stone uppercase tracking-widest hover:text-ink transition-colors">Need Help?</Link>
        </div>
      </div>

      {/* Artisan Story Mini-Card */}
      <div className="mt-16 p-8 bg-white border border-stone-light rounded-2xl flex items-start gap-6">
        <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
          <img src={product.profiles?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop"} alt={product.profiles?.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">Meet the Maker</p>
          <h3 className="text-xl font-bold text-ink mb-2">{product.profiles?.name || "Anonymous Artisan"}</h3>
          <p className="text-xs text-stone leading-relaxed mb-4">
            {product.profiles?.artisan_bio || "Based in Ojai, California, specializing in high-fire stoneware inspired by organic textures found in nature."}
          </p>
          <Link href={`/artisans/${product.profiles?.id}`} className="text-[10px] font-bold text-ink uppercase tracking-widest border-b border-ink pb-1 hover:text-gold hover:border-gold transition-all">View Artisan Profile</Link>
        </div>
      </div>
    </div>
  );
}
