import { createServerSupabaseClient } from "@/lib/supabase-server";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Filter, Search } from "lucide-react";
import { ArtisanSpotlight } from "@/types";

export const revalidate = 3600;

export default async function SpotlightsArchivePage() {
  const supabase = createServerSupabaseClient();

  const { data: spotlights } = await supabase
    .from("artisan_spotlights")
    .select("*, profiles(name, avatar_url, verification_status)")
    .order('created_at', { ascending: false });

  return (
    <div className="bg-parchment min-h-screen pt-32 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-stone-light pb-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-gold mb-4">
              <Sparkles size={16} />
              <span className="text-[10px] tracking-[0.4em] font-bold uppercase">The Spotlight Series</span>
            </div>
            <h1 className="text-6xl font-bold text-ink italic mb-6">Meet the Maker</h1>
            <p className="text-stone text-lg leading-relaxed">
              Explore our archive of in-depth interviews with the world&apos;s most talented artisans. 
              Discover their stories, their process, and the soul behind their craft.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/40 group-focus-within:text-gold transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search artisans..." 
                className="bg-white border border-stone-light pl-12 pr-6 py-4 rounded-full text-sm outline-none focus:border-gold min-w-[300px] transition-all"
              />
            </div>
            <button className="p-4 bg-white border border-stone-light rounded-full text-stone hover:text-gold hover:border-gold transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {spotlights && spotlights.map((story) => (
            <Link key={story.id} href={`/community/spotlights/${story.id}`} className="group block">
              <div className="aspect-[4/5] relative rounded-3xl overflow-hidden mb-8 shadow-xl shadow-ink/5">
                <Image 
                  src={story.cover_image} 
                  alt={story.title} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                      <img src={story.profiles?.avatar_url} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">{story.profiles?.name}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight italic">
                    {story.title}
                  </h3>
                </div>
              </div>
              <p className="text-stone text-sm leading-relaxed mb-6 line-clamp-3">
                {story.content}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-ink uppercase tracking-[0.2em] group-hover:text-gold transition-colors">
                Read Story <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {(!spotlights || spotlights.length === 0) && (
          <div className="text-center py-32 bg-white/50 rounded-3xl border-2 border-dashed border-stone-light">
            <Sparkles className="w-12 h-12 text-stone-light mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-ink mb-2">The Collection is Growing</h3>
            <p className="text-stone">Check back soon for new artisan stories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
