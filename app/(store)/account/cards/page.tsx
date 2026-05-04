"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft, 
  Star,
  Lock,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedCard {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  isDefault: boolean;
  holder: string;
}

export default function SavedCardsPage() {
  const [cards, setCards] = useState<SavedCard[]>([
    { id: "1", type: "visa", last4: "4242", expiry: "12/26", isDefault: true, holder: "ADITYA VERMA" },
    { id: "2", type: "mastercard", last4: "8890", expiry: "08/25", isDefault: false, holder: "ADITYA VERMA" }
  ]);

  const removeCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const setDefault = (id: string) => {
    setCards(cards.map(c => ({ ...c, isDefault: c.id === id })));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-24">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <Link href="/account" className="w-10 h-10 rounded-full border border-stone-light flex items-center justify-center hover:bg-parchment transition-all">
            <ArrowLeft size={16} className="text-stone" />
          </Link>
          <div>
            <p className="text-gold tracking-[0.3em] text-[10px] font-bold uppercase mb-1">Financial Vault</p>
            <h1 className="font-display text-4xl text-ink">Saved Cards</h1>
          </div>
        </div>
        <button className="bg-ink text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gold transition-all shadow-lg">
          <Plus size={14} /> Add New Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative group h-56 rounded-[32px] p-8 overflow-hidden transition-all duration-500 ${
                card.isDefault 
                ? "bg-ink text-white shadow-2xl scale-[1.02]" 
                : "bg-white border border-stone-light text-ink hover:border-gold hover:shadow-xl"
              }`}
            >
              {/* Background Decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 transition-all ${
                card.isDefault ? "bg-gold/20" : "bg-gold/5 opacity-0 group-hover:opacity-100"
              }`} />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/20">
                    <CreditCard size={24} className={card.isDefault ? "text-gold" : "text-stone"} />
                  </div>
                  <div className="flex items-center gap-2">
                    {card.isDefault && (
                      <span className="bg-gold text-ink text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Default</span>
                    )}
                    <button 
                      onClick={() => removeCard(card.id)}
                      className={`p-2 rounded-lg transition-all ${
                        card.isDefault ? "hover:bg-rust/20 text-white/40 hover:text-rust" : "text-stone/40 hover:bg-rust/10 hover:text-rust"
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.4em] font-bold opacity-50 uppercase mb-4">Masterpiece Acquisition Card</p>
                  <div className="flex items-center gap-4 text-2xl font-mono tracking-widest">
                    <span>••••</span>
                    <span>••••</span>
                    <span>••••</span>
                    <span className="text-gold">{card.last4}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mb-1">Card Holder</p>
                    <p className="text-xs font-bold tracking-widest">{card.holder}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest mb-1">Expires</p>
                    <p className="text-xs font-bold tracking-widest">{card.expiry}</p>
                  </div>
                </div>
              </div>

              {!card.isDefault && (
                <button 
                  onClick={() => setDefault(card.id)}
                  className="absolute inset-0 bg-ink/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                >
                  <span className="bg-white text-ink px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">Set as Default</span>
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State / Add Mockup */}
        <button className="h-56 rounded-[32px] border-2 border-dashed border-stone-light flex flex-col items-center justify-center gap-4 hover:border-gold hover:bg-parchment transition-all group">
          <div className="w-12 h-12 rounded-full bg-stone-light flex items-center justify-center group-hover:bg-gold group-hover:text-white transition-all">
            <Plus size={24} />
          </div>
          <p className="text-[10px] font-bold text-stone uppercase tracking-widest group-hover:text-gold">Secure Another Card</p>
        </button>
      </div>

      {/* Security Footer */}
      <div className="mt-24 p-10 bg-parchment rounded-[40px] border border-stone-light/50 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-inner flex items-center justify-center">
            <Lock className="text-gold" size={28} />
          </div>
          <div>
            <h3 className="font-display text-2xl text-ink mb-1">Encrypted Security</h3>
            <p className="text-xs text-stone">Your card data is stored using industry-standard AES-256 encryption.</p>
          </div>
        </div>
        <div className="flex gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
          <ShieldCheck size={32} />
          <Star size={32} />
          <CheckCircle2 size={32} />
        </div>
      </div>
    </div>
  );
}
