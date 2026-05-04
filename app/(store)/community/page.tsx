import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Camera, Heart, MessageSquare, Sparkles, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function CommunityPage() {
  const supabase = createServerSupabaseClient();

  const [
    { data: spotlights },
    { data: posts }
  ] = await Promise.all([
    supabase.from("artisan_spotlights").select("*, profiles(name, avatar_url)").order('created_at', { ascending: false }).limit(2),
    supabase.from("community_posts").select("*, profiles(name, avatar_url), products(title)").order('created_at', { ascending: false }).limit(8)
  ]);

  return (
    <div className="bg-parchment min-h-screen pt-32 pb-24">
      {/* Community Hero */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex items-center gap-2 text-gold mb-4 justify-center">
          <Camera size={16} />
          <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Our Community</span>
        </div>
        <h1 className="text-6xl font-bold text-ink text-center mb-6 italic">Collectors & Creators</h1>
        <p className="text-stone text-center max-w-2xl mx-auto text-lg leading-relaxed">
          Atelier is more than a marketplace. It's a space where the world's most talented artisans meet the most conscious collectors.
        </p>
      </div>

      {/* Meet the Maker Series */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-ink mb-2">Meet the Maker</h2>
            <p className="text-stone">In-depth interviews with the hands behind the craft.</p>
          </div>
          <Link href="/community/spotlights" className="text-xs font-bold text-gold uppercase tracking-widest hover:underline">Explore All Stories</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {spotlights && spotlights.length > 0 ? spotlights.map(story => (
            <div key={story.id} className="group cursor-pointer">
              <div className="aspect-video relative rounded-3xl overflow-hidden mb-8 shadow-2xl">
                <Image src={story.cover_image} alt={story.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                      <img src={story.profiles?.avatar_url} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">{story.profiles?.name}</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2 leading-tight">{story.title}</h3>
                </div>
              </div>
              <p className="text-stone leading-relaxed mb-6 line-clamp-3">{story.content}</p>
              <Link href={`/community/spotlights/${story.id}`} className="inline-flex items-center gap-2 text-[10px] font-bold text-ink uppercase tracking-widest border-b border-ink pb-1 group-hover:text-gold group-hover:border-gold transition-all">
                Read the Interview <ArrowRight size={14} />
              </Link>
            </div>
          )) : (
            // Mock data for demo
            [1,2].map(i => (
              <div key={i} className="group cursor-pointer opacity-50">
                <div className="aspect-video bg-stone-light rounded-3xl mb-8" />
                <div className="h-4 bg-stone-light w-3/4 mb-4" />
                <div className="h-4 bg-stone-light w-1/2" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Generated Content Gallery */}
      <div className="bg-ink text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="flex items-center gap-2 text-gold mb-4">
              <Heart size={16} fill="currentColor" />
              <span className="text-[10px] tracking-[0.4em] font-bold uppercase">Atelier In Your Space</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 italic">Shared by You</h2>
            <p className="text-stone-400 max-w-lg">Tag @atelier_handcrafted on Instagram to be featured in our community gallery.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {posts && posts.length > 0 ? posts.map(post => (
              <div key={post.id} className="aspect-square relative rounded-xl overflow-hidden group">
                <Image src={post.image_url} alt={post.caption} fill className="object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mb-1">{post.profiles?.name}</p>
                  <p className="text-xs text-white line-clamp-2 italic">"{post.caption}"</p>
                </div>
              </div>
            )) : (
              // Mock items for demo
              [1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Join the Community Call to Action */}
      <div className="max-w-4xl mx-auto px-6 pt-32 text-center">
        <Sparkles className="text-gold w-12 h-12 mx-auto mb-8" />
        <h2 className="text-4xl font-bold text-ink mb-6 italic">Join the Inner Circle</h2>
        <p className="text-stone mb-12 text-lg">Subscribe to our monthly journal for early access to collection drops and stories from our global network of artisans.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <input type="email" placeholder="Enter your email" className="bg-white border border-stone-light px-8 py-4 rounded-full min-w-[300px] outline-none focus:border-gold transition-colors" />
          <button className="btn-gold px-12 py-4 shadow-xl">Join Now</button>
        </div>
      </div>
    </div>
  );
}
