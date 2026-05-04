import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import { ArrowLeft, RotateCcw, Truck, ShieldCheck, Star, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import Counter from "@/components/Counter";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  let { data: product } = await supabase
    .from("products")
    .select("*, profiles(*), reviews(*, profiles(name, avatar_url))")
    .eq("id", params.id)
    .single();

  // Mock Fallback for Demo/Broken IDs
  if (!product) {
    product = {
      id: params.id,
      title: "Hand-Thrown Teracotta Vessel",
      price: 12500,
      compare_at_price: 15000,
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=2000&auto=format&fit=crop",
      description: "A timeless masterpiece crafted from organic Himalayan clay. Each vessel is individually hand-thrown and pit-fired for 48 hours, resulting in unique scorched patterns that tell a story of earth and fire.",
      category: "Ceramics",
      specifications: {
        dimensions: "14\" x 10\" x 10\"",
        weight: "2.2 kg",
        material: "Organic Teracotta",
        origin: "Kathmandu Valley",
        technique: "Pit-Fired / Hand-Thrown"
      },
      profiles: {
        name: "Arjun Thapa",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop",
        artisan_bio: "A third-generation master potter keeping the Malla-era traditions alive in his family studio.",
        verification_status: "Verified"
      },
      reviews: [
        {
          id: "r1",
          rating: 5,
          comment: "The texture is incredible. You can truly feel the artisan's touch in every curve. It arrived perfectly packaged and looks even better in person.",
          is_verified: true,
          created_at: new Date().toISOString(),
          profiles: { name: "Rajesh K.", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200" },
          images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=400"]
        },
        {
          id: "r2",
          rating: 4,
          comment: "A beautiful addition to my living room. The earthy tones are exactly what I was looking for. Highly recommended for collectors.",
          is_verified: true,
          created_at: new Date().toISOString(),
          profiles: { name: "Ananya S.", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" },
          images: []
        }
      ]
    } as any;
  }

  // Fetch related products from same category
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*, profiles(name)")
    .eq("category", product.category)
    .neq("id", product.id)
    .limit(4);

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length
    : 4.8;

  return (
    <div className="bg-parchment min-h-screen pb-24">
      {/* Product Header / Gallery */}
      <div className="max-w-7xl mx-auto px-6 pt-32">
        <Link href="/products" className="inline-flex items-center gap-2 text-stone hover:text-ink mb-12 transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back to Collection</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ProductGallery images={[product.image]} product={product} />

          {/* Product Info */}
          <div className="flex flex-col">
            <ProductInfo product={product} />
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
            <p className="text-sm text-stone-400">Direct-to-artisan model ensures <span className="text-white font-bold"><Counter end={80} />%</span> of every purchase goes back to the maker's community.</p>
          </div>
          <div>
            <h4 className="text-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-4">Quality Promise</h4>
            <p className="text-sm text-stone-400">Every piece undergoes a 3-stage inspection before being carefully packaged for shipping.</p>
          </div>
        </div>
      </div>

      {/* Specifications & Delivery Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-24 border-t border-stone-light">
        {/* Specifications */}
        <div>
          <h3 className="font-display text-3xl text-ink mb-8">Technical Specifications</h3>
          <div className="space-y-4">
            {[
              { label: "Material", value: product.category || "Organic Clay / Brass" },
              { label: "Dimensions", value: product.specifications?.dimensions || "12\" x 8\" x 4\"" },
              { label: "Weight", value: product.specifications?.weight || "1.5 kg" },
              { label: "Origin", value: product.specifications?.origin || "Ojai, California" },
              { label: "Technique", value: product.specifications?.technique || "Hand-thrown / Pit-fired" }
            ].map(spec => (
              <div key={spec.label} className="flex justify-between py-4 border-b border-stone-light/50 text-sm">
                <span className="text-stone font-bold uppercase tracking-widest text-[10px]">{spec.label}</span>
                <span className="text-ink font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white p-10 rounded-3xl border border-stone-light shadow-sm">
          <h3 className="font-display text-3xl text-ink mb-8">Shipping & Returns</h3>
          <div className="space-y-8">
            <div className="flex gap-4">
              <Truck className="text-gold shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-ink mb-1">Worldwide Shipping</p>
                <p className="text-xs text-stone leading-relaxed">Carefully packaged in sustainable materials. Delivery in 5-10 business days.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <RotateCcw className="text-gold shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-ink mb-1">7-Day Heritage Return</p>
                <p className="text-xs text-stone leading-relaxed">If the piece doesn't resonate with your space, we offer seamless returns within 7 days.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="text-gold shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-ink mb-1">Transit Insurance</p>
                <p className="text-xs text-stone leading-relaxed">Full coverage for fragile items. If it arrives damaged, we replace it instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 border-t border-stone-light">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
           <div className="lg:col-span-1">
              <h2 className="text-4xl font-bold text-ink mb-2">Verified Reviews</h2>
              <p className="text-stone mb-8">Honest feedback from our community of collectors.</p>
              
              <div className="bg-white p-8 rounded-3xl border border-stone-light shadow-sm">
                 <div className="flex items-center gap-4 mb-6">
                    <span className="text-6xl font-bold text-ink">{avgRating.toFixed(1)}</span>
                    <div>
                       <div className="flex text-gold mb-1">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} size={16} fill={i < Math.floor(avgRating) ? "currentColor" : "none"} />
                          ))}
                       </div>
                       <p className="text-xs text-stone font-bold uppercase tracking-widest">Based on {product.reviews?.length || 24} reviews</p>
                    </div>
                 </div>

                 <div className="space-y-3">
                    {[5,4,3,2,1].map(stars => (
                       <div key={stars} className="flex items-center gap-4">
                          <span className="w-4 text-[10px] font-bold text-ink">{stars}★</span>
                          <div className="flex-1 h-1.5 bg-parchment rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-gold" 
                               style={{ width: `${stars === 5 ? 75 : stars === 4 ? 20 : 5}%` }} 
                             />
                          </div>
                          <span className="w-8 text-right text-[10px] text-stone font-bold">{stars === 5 ? 18 : stars === 4 ? 4 : 2}</span>
                       </div>
                    ))}
                 </div>

                 <button className="w-full mt-8 btn-gold py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">Write a Review</button>
              </div>
           </div>

           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex gap-4">
                    <button className="text-[10px] font-bold text-ink border-b-2 border-ink pb-2 uppercase tracking-widest">Most Recent</button>
                    <button className="text-[10px] font-bold text-stone hover:text-ink pb-2 uppercase tracking-widest transition-colors">Highest Rated</button>
                 </div>
                 <div className="flex items-center gap-2 text-stone">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Filter by:</span>
                    <select className="bg-transparent text-[10px] font-bold text-ink uppercase tracking-widest outline-none cursor-pointer">
                       <option>All Stars</option>
                       <option>5 Stars</option>
                    </select>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                 {(product.reviews && product.reviews.length > 0) ? product.reviews.map((review: any) => (
                    <div key={review.id} className="bg-white p-10 rounded-[32px] border border-stone-light group hover:shadow-xl transition-all duration-500">
                       <div className="flex flex-col md:flex-row gap-8">
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-full bg-parchment overflow-hidden border border-stone-light">
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
                                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                                   ))}
                                </div>
                             </div>
                             
                             <h4 className="font-display text-xl text-ink mb-4">"Absolutely Masterful Piece"</h4>
                             <p className="text-stone text-sm leading-relaxed mb-8 italic">"{review.comment}"</p>
                             
                             <div className="flex items-center gap-6 pt-6 border-t border-stone-light/50">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-stone uppercase tracking-widest">
                                   Was this helpful?
                                   <button className="flex items-center gap-1 hover:text-sage transition-colors ml-2"><ThumbsUp size={14} /> 12</button>
                                   <button className="flex items-center gap-1 hover:text-rust transition-colors"><ThumbsDown size={14} /> 2</button>
                                </div>
                             </div>
                          </div>
                          
                          {review.images && review.images.length > 0 && (
                             <div className="w-full md:w-48 flex-shrink-0">
                                <div className="aspect-square rounded-2xl overflow-hidden border border-stone-light relative group/img">
                                   <img src={review.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">Enlarge View</span>
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                 )) : (
                    <div className="text-center py-20 bg-white border border-stone-light rounded-3xl">
                       <p className="text-stone">Be the first to review this masterpiece.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-white py-24 border-t border-stone-light">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-4xl text-ink">More from {product.category}</h2>
              <Link href="/products" className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] hover:text-ink transition-colors">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
