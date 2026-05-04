import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, ShieldCheck, Heart, ShoppingBag, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import VerificationBadge from "@/components/VerificationBadge";
import AddToCartButton from "@/components/AddToCartButton";
import WishlistToggle from "@/components/WishlistToggle";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, profiles(*), reviews(*, profiles(name, avatar_url))")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length 
    : 4.8; // Fallback for demo

  return (
    <div className="bg-parchment min-h-screen pb-24">
      {/* Product Header / Gallery */}
      <div className="max-w-7xl mx-auto px-6 pt-32">
        <Link href="/products" className="inline-flex items-center gap-2 text-stone hover:text-ink mb-12 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Collection</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="aspect-[4/5] relative bg-white overflow-hidden rounded-sm group">
              <Image 
                src={product.image} 
                alt={product.title} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
              <div className="absolute top-6 right-6">
                <WishlistToggle product={product} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-square bg-white border border-stone-light rounded-sm overflow-hidden opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                  <Image src={product.image} alt={product.title} width={200} height={200} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <VerificationBadge status={product.profiles?.verification_status} tier="Gold" />
                <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Masterpiece Collection</span>
              </div>
              <h1 className="text-5xl font-bold text-ink mb-4">{product.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(avgRating) ? "currentColor" : "none"} />
                  ))}
                  <span className="ml-2 text-sm font-bold text-ink">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-stone text-xs">({product.reviews?.length || 18} Verified Reviews)</span>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-light text-ink">₹{product.price.toLocaleString()}</span>
                {product.compare_at_price && (
                  <span className="text-xl text-stone line-through font-light">₹{product.compare_at_price.toLocaleString()}</span>
                )}
              </div>
              <p className="text-stone text-sm leading-relaxed max-w-md">
                {product.description || "Each piece is uniquely handcrafted by our master artisans using traditional techniques passed down through generations."}
              </p>
            </div>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-stone-light">
                  <ShieldCheck className="text-gold" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink uppercase tracking-widest">Certificate of Authenticity</p>
                  <p className="text-xs text-stone">Signed and dated by the artisan.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-stone-light">
                  <CheckCircle2 className="text-gold" size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink uppercase tracking-widest">100% Artisan Handcrafted</p>
                  <p className="text-xs text-stone">Ethically sourced materials.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <AddToCartButton product={product} className="flex-1" />
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
                <Link href={`/artisan/${product.profiles?.id}`} className="text-[10px] font-bold text-ink uppercase tracking-widest border-b border-ink pb-1 hover:text-gold hover:border-gold transition-all">View Artisan Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Transparency Section */}
      <div className="bg-ink text-white py-24 mt-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h4 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Material Traceability</h4>
            <p className="text-sm text-stone-400">Locally sourced clay from the foothills of the Himalayas, processed using traditional methods.</p>
          </div>
          <div>
            <h4 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Fair Trade Impact</h4>
            <p className="text-sm text-stone-400">Direct-to-artisan model ensures 80% of every purchase goes back to the maker's community.</p>
          </div>
          <div>
            <h4 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Quality Promise</h4>
            <p className="text-sm text-stone-400">Every piece undergoes a 3-stage inspection before being carefully packaged for shipping.</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl font-bold text-ink mb-2">Verified Reviews</h2>
            <p className="text-stone">Honest feedback from our community of collectors.</p>
          </div>
          <button className="btn-gold px-8 py-3">Write a Review</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {(product.reviews && product.reviews.length > 0) ? product.reviews.map((review: any) => (
            <div key={review.id} className="bg-white p-8 rounded-2xl border border-stone-light">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-parchment overflow-hidden border border-stone-light">
                    {review.profiles?.avatar_url && <img src={review.profiles.avatar_url} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">{review.profiles?.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-sage font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified Purchase
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
              </div>
              <p className="text-stone text-sm italic leading-relaxed mb-6">"{review.comment}"</p>
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2">
                  {review.images.map((img: string, i: number) => (
                    <div key={i} className="w-20 h-20 rounded-lg overflow-hidden">
                      <img src={img} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-2 text-center py-20 bg-white border border-stone-light rounded-3xl">
              <p className="text-stone">Be the first to review this masterpiece.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
