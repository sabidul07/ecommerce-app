import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { ShoppingBag, Heart, Star, Sparkles, ChevronRight, Package, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/MotionWrapper";
import VerificationBadge from "@/components/VerificationBadge";

export default async function AccountDashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: orders },
    { data: wishlist },
    { data: loyalty },
    { data: styleQuiz }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("orders").select("*").eq("user_id", user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from("wishlists").select("*, products(*)").eq("user_id", user.id).limit(4),
    supabase.from("loyalty_points").select("*").eq("user_id", user.id).single(),
    supabase.from("style_quiz_results").select("*").eq("user_id", user.id).single()
  ]);

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12"
    >
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-ink">Welcome, {profile?.name || 'Artisan'}</h1>
            <VerificationBadge status={profile?.verification_status} tier={loyalty?.tier} />
          </div>
          <p className="text-stone">Manage your orders, collections, and preferences.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-light flex items-center gap-6 shadow-sm">
          <div className="text-center">
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Loyalty Points</p>
            <p className="text-2xl font-bold text-gold">{loyalty?.points || 0}</p>
          </div>
          <div className="h-10 w-[1px] bg-stone-light" />
          <div className="text-center">
            <p className="text-[10px] font-bold text-stone uppercase tracking-widest mb-1">Current Tier</p>
            <p className="text-2xl font-bold text-ink">{loyalty?.tier || 'Bronze'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Package size={20} className="text-gold" />
              Recent Orders
            </h2>
            <Link href="/account/orders" className="text-xs font-bold text-gold uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {orders && orders.length > 0 ? orders.map(order => (
              <div key={order.id} className="bg-white border border-stone-light p-6 rounded-xl hover:border-gold transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Order ID</p>
                    <p className="text-sm font-mono text-ink">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-stone uppercase tracking-widest">Date</p>
                    <p className="text-sm text-ink">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-stone-light rounded-full text-[10px] font-bold uppercase tracking-widest text-stone">Processing</span>
                  <p className="text-lg font-bold text-ink">₹{order.total.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="bg-parchment border-2 border-dashed border-stone-light rounded-xl p-12 text-center">
                <p className="text-stone mb-4">You haven't placed any orders yet.</p>
                <Link href="/products" className="btn-gold px-8 py-3">Start Shopping</Link>
              </div>
            )}
          </div>
        </div>

        {/* Wishlist Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink flex items-center gap-2">
              <Heart size={20} className="text-rust" />
              Wishlist
            </h2>
            <Link href="/account/wishlist" className="text-xs font-bold text-gold uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {wishlist && wishlist.length > 0 ? wishlist.map(item => (
              <Link key={item.id} href={`/products/${item.products?.id}`} className="group">
                <div className="aspect-square rounded-xl overflow-hidden mb-2 relative">
                  <img src={item.products?.image || ''} alt={item.products?.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[10px] font-bold text-ink truncate uppercase tracking-widest">{item.products?.title}</p>
              </Link>
            )) : (
              <div className="col-span-2 text-center py-12 border border-stone-light rounded-xl">
                <p className="text-stone text-xs">Your wishlist is empty.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div className="bg-ink text-white p-12 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Sparkles size={16} />
            <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Personalized Curation</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {styleQuiz ? `Curation for your ${styleQuiz.style_type} aesthetic` : 'Discover Your Next Masterpiece'}
          </h2>
          <p className="text-stone-400 mb-8 max-w-lg">
            {styleQuiz 
              ? `Based on your preference for ${styleQuiz.style_type}, we've selected pieces that harmonize with your unique vision.` 
              : "Based on your recent interest in artisan ceramics and earthy tones, we've curated a collection you'll love."}
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gold transition-colors">
            Explore Collection <ChevronRight size={18} />
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-30">
          <img src="https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" />
        </div>
      </div>
    </MotionDiv>
  );
}
