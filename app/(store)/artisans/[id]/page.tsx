import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Award, MapPin, Sparkles, MessageSquare, ShoppingBag, Instagram, Globe, Heart } from "lucide-react";
import { Product, Profile } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function ArtisanStudioPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const [
    { data: artisan },
    { data: products }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", params.id).single(),
    supabase.from("products").select("*, profiles(name)").eq("user_id", params.id).order('created_at', { ascending: false })
  ]);

  if (!artisan) notFound();

  const typedArtisan = artisan as Profile;

  return (
    <div className="bg-parchment min-h-screen">
      {/* ── STUDIO HEADER ── */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-ink">
        <Image 
          src={typedArtisan.avatar_url || 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=1600&auto=format&fit=crop'} 
          alt={typedArtisan.name}
          fill
          className="object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-parchment" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-6">
          <Link 
            href="/artisans" 
            className="absolute top-32 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-all uppercase tracking-[0.3em] text-[10px] font-bold"
          >
            <ArrowLeft size={14} /> Back to Collective
          </Link>
          
          <div className="flex items-center gap-2 text-gold mb-4">
            <Award size={18} />
            <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Master Craftsman</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 italic">{typedArtisan.name}</h1>
          <div className="flex items-center gap-4 text-white/60 text-xs tracking-widest uppercase">
            <span className="flex items-center gap-1"><MapPin size={12} /> Kyoto, Japan</span>
            <span className="w-1 h-1 rounded-full bg-gold" />
            <span>{typedArtisan.specialty_tags?.[0] || "Ceramics"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-20">
          {/* ── LEFT COLUMN: STORY ── */}
          <div className="lg:col-span-7">
            <div className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-gold" size={20} />
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-ink">The Studio Philosophy</h2>
              </div>
              <p className="text-3xl font-display text-ink italic leading-relaxed mb-12">
                "{typedArtisan.artisan_bio || "Craftsmanship is the silent dialogue between the hand and the material."}"
              </p>
              <div className="prose prose-stone prose-lg">
                <p className="text-stone leading-relaxed whitespace-pre-wrap">
                  {typedArtisan.artisan_story || "Our artisan has not yet shared their full story, but their work speaks volumes of their dedication to traditional techniques and modern aesthetics."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-20">
              <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
                <Image src="https://images.unsplash.com/photo-1594913366159-1832ffefc511?q=80&w=800" alt="Process" fill className="object-cover" />
              </div>
              <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl mt-12">
                <Image src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800" alt="Studio" fill className="object-cover" />
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: SIDEBAR ── */}
          <div className="lg:col-span-5">
            <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-ink/5 sticky top-32">
              <h3 className="text-xl font-bold text-ink mb-8">Studio Details</h3>
              
              <div className="space-y-8 mb-12">
                <div className="flex justify-between items-center pb-6 border-b border-stone-light">
                  <span className="text-[10px] font-bold text-stone uppercase tracking-widest">Verification</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-ink uppercase">
                    <Award size={14} className="text-gold" /> {typedArtisan.verification_status}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-stone-light">
                  <span className="text-[10px] font-bold text-stone uppercase tracking-widest">Active Listings</span>
                  <span className="text-sm font-medium text-ink">{products?.length || 0} pieces</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-stone-light">
                  <span className="text-[10px] font-bold text-stone uppercase tracking-widest">Joined</span>
                  <span className="text-sm font-medium text-ink">October 2023</span>
                </div>
              </div>

              <div className="flex gap-4 mb-12">
                <button className="flex-1 btn-gold py-4 rounded-2xl flex items-center justify-center gap-2">
                  <Heart size={18} /> Follow Studio
                </button>
                <button className="p-4 border border-stone-light rounded-2xl text-stone hover:text-ink transition-colors">
                  <MessageSquare size={18} />
                </button>
              </div>

              <div className="flex justify-center gap-6 pt-8 border-t border-stone-light">
                <Instagram size={20} className="text-stone hover:text-gold cursor-pointer transition-colors" />
                <Globe size={20} className="text-stone hover:text-gold cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* ── COLLECTION ── */}
        <section className="mt-32 pt-32 border-t border-stone-light">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-2 text-gold mb-4">
                <ShoppingBag size={18} />
                <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Active Collection</span>
              </div>
              <h2 className="text-4xl font-bold text-ink italic">The Works of {typedArtisan.name}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products && products.length > 0 ? products.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            )) : (
              <div className="col-span-full py-20 text-center bg-white/50 rounded-[40px] border-2 border-dashed border-stone-light">
                <p className="text-stone italic">No active listings in the collection at this time.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
