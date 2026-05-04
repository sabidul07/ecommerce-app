"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { Sparkles, MapPin, Search, Filter, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Profile } from '@/types';

const CATEGORIES = ["All", "Ceramicists", "Weavers", "Woodworkers", "Glassblowers", "Jewelers"];

export default function ArtisanCollectivePage() {
  const [artisans, setArtisans] = useState<Profile[]>([]);
  const [filteredArtisans, setFilteredArtisans] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const supabase = createClient();

  useEffect(() => {
    async function loadArtisans() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_artisan', true)
        .order('name');
      
      if (data) {
        setArtisans(data as Profile[]);
        setFilteredArtisans(data as Profile[]);
      }
      setLoading(false);
    }
    loadArtisans();
  }, []);

  useEffect(() => {
    let result = artisans;
    if (activeCategory !== "All") {
      // For demo, we just filter by name if no category field exists, 
      // but in reality we'd have a specialty_tags check.
      result = result.filter(a => a.specialty_tags?.includes(activeCategory.slice(0, -1)));
    }
    if (searchQuery) {
      result = result.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredArtisans(result);
  }, [activeCategory, searchQuery, artisans]);

  return (
    <div className="bg-parchment min-h-screen pt-32 pb-24">
      {/* ── HERO SECTION ── */}
      <section className="max-w-7xl mx-auto px-6 mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 text-gold mb-6">
            <Award size={20} />
            <span className="text-[10px] tracking-[0.5em] font-bold uppercase">The Artisan Collective</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-ink italic mb-8">The Hands of Atelier</h1>
          <p className="text-stone text-lg max-w-2xl mx-auto leading-relaxed">
            A curated community of global creators who transform raw materials into objects of soul. 
            Discover the masters of modern craftsmanship.
          </p>
        </motion.div>
      </section>

      {/* ── SEARCH & FILTER ── */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className="bg-white/50 backdrop-blur-xl border border-white p-2 rounded-full flex flex-col md:flex-row items-center gap-4 shadow-2xl shadow-ink/5">
          <div className="relative flex-1 group w-full md:w-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-gold transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or specialty..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent pl-16 pr-8 py-5 rounded-full text-sm outline-none transition-all"
            />
          </div>
          
          <div className="hidden md:flex items-center gap-2 pr-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat 
                    ? 'bg-ink text-white shadow-xl' 
                    : 'text-stone hover:bg-parchment'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTISAN GRID ── */}
      <section className="max-w-7xl mx-auto px-6">
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          >
            {filteredArtisans.map((artisan, index) => (
              <motion.div
                key={artisan.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/artisans/${artisan.id}`}>
                  <div className="aspect-[3/4] relative rounded-[40px] overflow-hidden mb-8 shadow-2xl shadow-ink/10 transition-all duration-500 group-hover:shadow-gold/20 group-hover:-translate-y-2">
                    <Image 
                      src={artisan.avatar_url || 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop'} 
                      alt={artisan.name}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-10 left-10 right-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Philosophy</p>
                      <p className="text-white italic text-sm line-clamp-3">
                        "{artisan.artisan_bio || "The soul of the piece lives in the imperfection of the hand."}"
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="px-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-ink">{artisan.name}</h3>
                    {artisan.verification_status === 'Verified' && (
                      <div className="bg-gold/10 text-gold p-2 rounded-full" title="Verified Artisan">
                        <Award size={14} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-stone text-xs mb-6">
                    <MapPin size={14} className="text-gold" />
                    <span>Kyoto, Japan</span>
                    <span className="w-1 h-1 rounded-full bg-stone-light mx-2" />
                    <span className="uppercase tracking-widest text-[9px] font-bold">
                      {artisan.specialty_tags?.[0] || "Ceramicist"}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/artisans/${artisan.id}`}
                    className="inline-flex items-center gap-2 text-[10px] font-bold text-ink uppercase tracking-widest border-b border-ink/10 pb-1 group-hover:border-gold group-hover:text-gold transition-all"
                  >
                    View Studio <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredArtisans.length === 0 && !loading && (
          <div className="text-center py-32 border-2 border-dashed border-stone-light rounded-[40px]">
            <Sparkles className="w-12 h-12 text-stone-light mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-ink mb-2">Artisans Incoming</h3>
            <p className="text-stone">We're currently verifying new creators for this category.</p>
          </div>
        )}
      </section>

      {/* ── PHILOSOPHY INSET ── */}
      <section className="py-48 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <h2 className="text-[20vw] font-bold italic absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">Craftsmanship</h2>
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <QuoteIcon className="w-16 h-16 text-gold mx-auto mb-12 opacity-40" />
          <h2 className="text-4xl md:text-5xl font-display text-ink italic leading-tight mb-12">
            "Luxury is not defined by price, but by the soul of the hand that shaped it."
          </h2>
          <div className="h-px w-24 bg-gold mx-auto mb-8" />
          <p className="text-[10px] font-bold text-stone uppercase tracking-[0.4em]">The Atelier Manifesto</p>
        </div>
      </section>
    </div>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V15M3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C8.56928 16 9.017 15.5523 9.017 15V9C9.017 8.44772 8.56928 8 8.017 8H4.017C3.46472 8 3.017 8.44772 3.017 9V15" />
    </svg>
  );
}
