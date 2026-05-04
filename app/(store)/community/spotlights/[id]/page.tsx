import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Quote, Sparkles, Instagram, Globe, ShoppingBag } from "lucide-react";
import { ArtisanSpotlight, Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export const revalidate = 3600; // Revalidate every hour

export default async function SpotlightDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: spotlight } = await supabase
    .from("artisan_spotlights")
    .select("*, profiles(*)")
    .eq("id", params.id)
    .single();

  if (!spotlight) notFound();

  // Fetch products by this artisan
  const { data: artisanProducts } = await supabase
    .from("products")
    .select("*, profiles(name, verification_status)")
    .eq("user_id", spotlight.artisan_id)
    .limit(4);

  const typedSpotlight = spotlight as ArtisanSpotlight;

  return (
    <div className="bg-parchment min-h-screen">
      {/* Hero Header */}
      <div className="relative h-[80vh] w-full overflow-hidden">
        <Image
          src={typedSpotlight.cover_image}
          alt={typedSpotlight.title}
          fill
          className="object-cover scale-105 animate-subtle-zoom"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-ink/40 via-ink/20 to-parchment" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-6 text-center">
          <Link
            href="/community"
            className="flex items-center gap-2 text-white/80 hover:text-white mb-12 transition-all uppercase tracking-[0.3em] text-[10px] font-bold bg-white/10 backdrop-blur-md px-6 py-3 rounded-full"
          >
            <ArrowLeft size={14} /> Back to Community
          </Link>
          <div className="flex items-center gap-2 text-gold mb-6">
            <Sparkles size={20} />
            <span className="text-[10px] tracking-[0.5em] font-bold uppercase">Meet the Maker</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 italic max-w-4xl leading-tight">
            {typedSpotlight.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 -mt-12 relative z-10">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-white p-10 rounded-3xl shadow-2xl shadow-ink/5 sticky top-32">
            <div className="relative w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-parchment shadow-xl">
              <Image
                src={typedSpotlight.profiles?.avatar_url || ''}
                alt={typedSpotlight.profiles?.name || ''}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-ink mb-2">{typedSpotlight.profiles?.name}</h2>
              <p className="text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
                {typedSpotlight.profiles?.verification_status} Artisan
              </p>
            </div>

            <div className="space-y-6 pt-10 border-t border-stone-light">
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-[10px] font-bold text-stone uppercase tracking-widest">Specialty</span>
                <span className="text-sm text-ink font-medium">Ceramicist</span>
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <span className="text-[10px] font-bold text-stone uppercase tracking-widest">Origin</span>
                <span className="text-sm text-ink font-medium">Kyoto, Japan</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 mt-12 pt-10 border-t border-stone-light">
              <Instagram className="text-stone hover:text-gold cursor-pointer transition-colors" size={20} />
              <Globe className="text-stone hover:text-gold cursor-pointer transition-colors" size={20} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 pb-32">
          <div className="prose prose-stone prose-lg max-w-none">
            <div className="mb-16">
              <Quote className="text-gold w-12 h-12 mb-8 opacity-40" />
              <p className="text-3xl font-display text-ink italic leading-relaxed">
                {typedSpotlight.content}
              </p>
            </div>

            {/* Render Interview Q&A if exists */}
            {typedSpotlight.interview_json?.questions && (
              <div className="space-y-20 mt-24">
                {typedSpotlight.interview_json.questions.map((q: any, i: number) => (
                  <div key={i} className="group">
                    <h3 className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                      Question {i + 1}
                    </h3>
                    <p className="text-2xl font-bold text-ink mb-6 group-hover:text-gold transition-colors duration-500">
                      {q.question}
                    </p>
                    <p className="text-stone leading-relaxed text-lg">
                      {q.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Collection Showcase */}
      <section className="bg-ink py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-16">
            <div>
              <div className="flex items-center gap-2 text-gold mb-4">
                <ShoppingBag size={16} />
                <span className="text-[10px] tracking-[0.4em] font-bold uppercase">The Collection</span>
              </div>
              <h2 className="text-4xl font-bold text-white italic">Shop {typedSpotlight.profiles?.name}&apos;s Works</h2>
            </div>
            <Link href={`/products?artisan=${typedSpotlight.artisan_id}`} className="text-xs font-bold text-gold uppercase tracking-widest hover:underline">
              View All Pieces
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {artisanProducts && artisanProducts.map((product) => (
              <ProductCard key={product.id} product={product as Product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="py-32 bg-parchment text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-ink mb-8 italic">Never Miss a Story</h2>
          <p className="text-stone mb-12">Sign up for our Collector&apos;s Journal to receive monthly artisan spotlights and early access to collection drops.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-white border border-stone-light px-8 py-4 rounded-full min-w-[300px] outline-none focus:border-gold transition-all"
            />
            <button className="btn-gold px-12 py-4 shadow-2xl">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
}
