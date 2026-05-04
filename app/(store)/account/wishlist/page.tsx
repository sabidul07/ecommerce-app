import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function WishlistPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: wishlist } = await supabase
    .from("wishlists")
    .select("*, products(*, profiles(name))")
    .eq("user_id", user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-light pb-12">
        <div>
          <div className="flex items-center gap-2 text-rust mb-4">
            <Heart size={18} fill="currentColor" />
            <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Curated Collection</span>
          </div>
          <h1 className="text-5xl font-bold italic text-ink">Your Wishlist</h1>
          <p className="text-stone mt-4">A personal gallery of the pieces that resonated with you.</p>
        </div>
        
        {wishlist && wishlist.length > 0 && (
          <div className="flex items-center gap-4">
            <p className="text-xs font-medium text-stone">{wishlist.length} items saved</p>
            <button className="btn-gold px-8 py-3 text-sm">Add All to Cart</button>
          </div>
        )}
      </div>

      {/* ── GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {wishlist && wishlist.length > 0 ? wishlist.map((item) => (
          <div key={item.id} className="relative group">
            <ProductCard product={item.products as Product} />
            <button 
              className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full text-rust opacity-0 group-hover:opacity-100 transition-all hover:bg-rust hover:text-white shadow-xl z-10"
              title="Remove from wishlist"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-stone-light rounded-[40px]">
            <Heart size={48} className="text-stone-light mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-ink mb-2">Your Gallery is Empty</h3>
            <p className="text-stone mb-8 max-w-sm mx-auto">Discover unique pieces handcrafted by the world's most talented artisans.</p>
            <Link href="/products" className="btn-gold px-12 py-4 shadow-2xl">
              Start Exploring
            </Link>
          </div>
        )}
      </div>

      {/* ── RECOMMENDATIONS ── */}
      {wishlist && wishlist.length > 0 && (
        <div className="bg-parchment p-12 rounded-[40px] border border-stone-light">
          <div className="flex items-center gap-2 text-gold mb-6">
            <Sparkles size={18} />
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Complementary Pieces</h2>
          </div>
          <p className="text-stone mb-8 max-w-lg">Based on your saved items, you might also appreciate these works by similar artisans.</p>
          <Link href="/products" className="text-xs font-bold text-ink uppercase tracking-widest flex items-center gap-2 hover:text-gold transition-colors">
            View personalized recommendations <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
