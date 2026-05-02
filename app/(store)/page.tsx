import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Leaf,
  Package,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import TrendingStrip from "@/components/TrendingStrip";
import Newsletter from "@/components/Newsletter";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";

export default async function HomePage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, profiles(name)")
    .eq("is_featured", true)
    .limit(8);

  const categories = [
    {
      name: "Home & Living",
      count: "120+",
      image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Accessories",
      count: "85+",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Ceramics",
      count: "60+",
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Art & Prints",
      count: "95+",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
    },
    {
      name: "Personal Care",
      count: "70+",
      image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <Hero isAdmin={isAdmin} />

      {/* ── STATS BAR ── */}
      <StatsBar />

      {/* ── TRENDING STRIP ── */}
      <TrendingStrip />

      {/* ── FEATURED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 xl:py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-5">
          <div>
            <p className="text-gold tracking-[0.3em] text-xs mb-2 font-semibold">OUR SELECTION</p>
            <h2 className="font-display text-[28px] sm:text-3xl md:text-4xl font-light text-ink">Featured Products</h2>
          </div>
          <Link
            href="/products"
            className="text-stone text-sm font-medium hover:text-ink hover:underline inline-flex items-center gap-2 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-parchment border border-stone-light border-dashed rounded-xl flex flex-col items-center justify-center space-y-2 px-4">
            <div className="w-16 h-16 bg-white border border-stone-light rounded-full flex items-center justify-center mb-4 shadow-xs">
              <Package size={24} className="text-stone-400" />
            </div>
            <h3 className="font-display text-2xl font-light text-ink">No featured products</h3>
            <p className="text-stone text-sm max-w-md">
              Our curators are currently selecting the finest pieces to showcase here. Check back soon!
            </p>
            {isAdmin && (
              <Link href="/upload-product" className="mt-6 btn-gold inline-flex items-center gap-2 text-sm py-2 px-4 shadow-xs hover:shadow-md">
                Add some in the admin panel <ArrowRight size={14} />
              </Link>
            )}
          </div>
        )}
      </section>

      {/* ── WHY ATELIER ── */}
      <section className="bg-parchment border-y border-stone-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 xl:py-24">
          <div className="mb-16">
            <p className="text-gold tracking-[0.3em] text-xs mb-4 font-semibold">
              WHY ATELIER?
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light leading-tight text-ink">
              More than a marketplace.
              <br />
              <em className="italic text-stone-500">A community.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "Curated Quality",
                desc: "Every product is reviewed to ensure it meets our standards of craftsmanship and authenticity.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Transactions",
                desc: "Your payments and personal data are protected with industry-leading security.",
              },
              {
                icon: Users,
                title: "Seller Community",
                desc: "Join thousands of artisans and independent creators building their businesses here.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white p-4 lg:p-8 border border-stone-light hover:border-gold transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mb-6 border border-stone-light group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
                  <Icon size={24} className="text-gold" />
                </div>
                <h3 className="font-display text-2xl mb-3 text-ink text-left">{title}</h3>
                <p className="text-stone text-sm leading-relaxed text-left">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 xl:py-24">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-5">
          <h2 className="font-display text-[28px] sm:text-3xl md:text-4xl font-light text-ink">Shop by Category</h2>
          <Link
            href="/products"
            className="text-stone text-sm font-medium hover:text-ink hover:underline inline-flex items-center gap-2 transition-colors"
          >
            View all categories <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/products"
              className="group cursor-pointer block relative rounded-xs overflow-hidden aspect-4/5 transition-transform duration-300 hover:scale-[1.03]"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/20 to-transparent transition-opacity group-hover:opacity-100 opacity-80" />
              <div className="absolute bottom-0 left-0 w-full p-4">
                <p className="font-display text-xl text-white mb-1">{cat.name}</p>
                <p className="text-white/70 text-xs tracking-wider uppercase font-semibold">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SELLER CTA ── */}
      <section className="relative bg-ink text-parchment py-14 xl:py-24 overflow-hidden">
        {/* Subtle noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <p className="text-gold tracking-[0.3em] text-xs mb-4 font-semibold">
                JOIN OUR COMMUNITY
              </p>
              <h2 className="font-display text-5xl md:text-6xl font-light mb-6">
                {isAdmin ? "Manage Your Store" : "Ready to sell?"}
              </h2>
              <p className="text-stone-300 text-lg max-w-lg mb-8">
                {isAdmin
                  ? "Add products and manage your listings from the dashboard."
                  : "Create your account and list your first product in minutes. Join thousands of independent creators."}
              </p>
              {!isAdmin && (
                <div className="flex gap-8 border-t border-parchment/10 pt-8">
                  {["Free to join", "No monthly fees", "Easy setup"].map(
                    (item) => (
                      <p
                        key={item}
                        className="text-parchment text-sm flex items-center gap-2 font-medium"
                      >
                        <span className="text-gold shrink-0"><ShieldCheck size={16} /></span> {item}
                      </p>
                    ),
                  )}
                </div>
              )}
            </div>
            <div className="shrink-0 max-sm:w-full">
              {isAdmin ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/upload-product"
                    className="btn-gold inline-flex items-center justify-center gap-2 xl:px-8 py-4 text-base"
                  >
                    Add Product <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="border border-parchment/30 text-parchment px-8 py-4 text-base font-medium hover:bg-parchment/10 transition-all inline-flex items-center justify-center"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className="btn-gold inline-flex items-center gap-2 max-sm:justify-between sm:text-lg px-5 xl:px-10 py-3 lg:py-4 xl:py-5 w-full"
                >
                  Get Started Free <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <Newsletter />
    </div>
  );
}
