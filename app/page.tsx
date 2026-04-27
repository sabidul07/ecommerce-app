import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Leaf,
  Truck,
  RotateCcw,
  Headphones,
  Lock,
  Star,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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

  const categories = [
    {
      name: "Home & Living",
      count: "120+",
      color: "from-stone-200 to-stone-300",
    },
    { name: "Accessories", count: "85+", color: "from-amber-100 to-amber-200" },
    { name: "Ceramics", count: "60+", color: "from-slate-200 to-slate-300" },
    {
      name: "Art & Prints",
      count: "95+",
      color: "from-neutral-200 to-neutral-300",
    },
    {
      name: "Personal Care",
      count: "70+",
      color: "from-stone-300 to-stone-400",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative bg-ink text-parchment overflow-hidden min-h-[580px] flex items-center">
        {/* Background glow */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 75% 50%, #C9A84C22 0%, transparent 60%)",
          }}
        />
        {/* Right decorative circle */}
        <div className="absolute right-0 top-0 w-[520px] h-[520px] rounded-full border border-gold/10 translate-x-1/3 -translate-y-1/4" />
        <div className="absolute right-16 top-8 w-[380px] h-[380px] rounded-full border border-gold/10" />

        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-gold tracking-[0.3em] text-xs mb-6">
              CURATED MARKETPLACE
            </p>
            <h1 className="font-display text-6xl md:text-7xl font-light leading-[0.95] mb-6">
              Discover
              <br />
              <em className="italic text-gold-light">Exceptional</em>
              <br />
              Goods
            </h1>
            <p className="text-stone-light max-w-md text-sm leading-relaxed mb-10">
              A premium marketplace connecting artisans and collectors.
              <br />
              <strong className="text-parchment/80">
                Every piece tells a story.
              </strong>
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/products"
                className="btn-gold inline-flex items-center gap-2"
              >
                Browse Collection <ArrowRight size={16} />
              </Link>
              {isAdmin ? (
                <Link
                  href="/upload-product"
                  className="border border-parchment/30 text-parchment px-6 py-3 font-medium tracking-wide hover:bg-parchment/10 transition-all inline-flex items-center gap-2"
                >
                  Add Product
                </Link>
              ) : (
                <Link
                  href="/products"
                  className="border border-parchment/30 text-parchment px-6 py-3 font-medium tracking-wide hover:bg-parchment/10 transition-all inline-flex items-center gap-2"
                >
                  Start Selling
                </Link>
              )}
            </div>
          </div>

          {/* Right — decorative image area */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="w-80 h-80 rounded-full bg-gradient-to-br from-stone-800 to-stone-900 border border-gold/20 flex items-center justify-center shadow-2xl">
              <div className="w-60 h-60 rounded-full bg-gradient-to-br from-amber-900/40 to-stone-800 border border-gold/10 flex items-center justify-center">
                <p className="font-display text-gold text-5xl font-light italic">
                  A
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature badges */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-parchment/10 bg-parchment/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex gap-8 overflow-x-auto">
            {[
              {
                icon: Leaf,
                text: "Curated Quality",
                sub: "Handpicked with care",
              },
              {
                icon: ShieldCheck,
                text: "Secure Payments",
                sub: "100% protected",
              },
              {
                icon: Users,
                text: "Support Artisans",
                sub: "Empower creativity",
              },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex items-center gap-3 flex-shrink-0">
                <Icon size={18} className="text-gold" />
                <div>
                  <p className="text-parchment text-sm font-medium">{text}</p>
                  <p className="text-stone-light text-xs">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ATELIER ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-gold tracking-[0.3em] text-xs mb-4">
            WHY ATELIER?
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">
            More than a marketplace.
            <br />
            <em className="italic text-stone">A community.</em>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
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
              className="card text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-parchment rounded-full flex items-center justify-center mx-auto mb-5 border border-stone-light">
                <Icon size={22} className="text-gold" />
              </div>
              <h3 className="font-display text-xl mb-3">{title}</h3>
              <p className="text-stone text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-3xl font-light">Shop by Category</h2>
          <Link
            href="/products"
            className="text-gold text-sm hover:underline inline-flex items-center gap-1"
          >
            View all categories <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href="/products"
              className="group cursor-pointer"
            >
              <div
                className={`aspect-square bg-gradient-to-br ${cat.color} mb-3 overflow-hidden relative flex items-center justify-center group-hover:opacity-90 transition-opacity`}
              >
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors" />
                <p className="font-display text-2xl text-stone-600 opacity-20 select-none">
                  {cat.name[0]}
                </p>
              </div>
              <p className="font-medium text-sm">{cat.name}</p>
              <p className="text-stone text-xs">{cat.count} products</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ink text-parchment py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <p className="text-gold tracking-[0.3em] text-xs mb-3">
                JOIN OUR COMMUNITY
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-light mb-3">
                {isAdmin ? "Manage Your Store" : "Ready to sell?"}
              </h2>
              <p className="text-stone-light text-sm">
                {isAdmin
                  ? "Add products and manage your listings from the dashboard."
                  : "Create your account and list your first product in minutes."}
              </p>
              {!isAdmin && (
                <div className="flex gap-6 mt-4">
                  {["Free to join", "No monthly fees", "Easy setup"].map(
                    (item) => (
                      <p
                        key={item}
                        className="text-stone-light text-xs flex items-center gap-1"
                      >
                        <span className="text-gold">✓</span> {item}
                      </p>
                    ),
                  )}
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              {isAdmin ? (
                <div className="flex gap-4">
                  <Link
                    href="/upload-product"
                    className="btn-gold inline-flex items-center gap-2"
                  >
                    Add Product <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="border border-parchment/30 text-parchment px-6 py-3 font-medium hover:bg-parchment/10 transition-all inline-block"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className="btn-gold inline-flex items-center gap-2 text-base px-8 py-4"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-center mb-12 font-light">
          Trusted by thousands
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: "10,000+", label: "Happy Customers" },
            { icon: Star, value: "2,500+", label: "Active Sellers" },
            { icon: Leaf, value: "25,000+", label: "Products Sold" },
            { icon: ShieldCheck, value: "4.8/5", label: "Average Rating" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon size={24} className="text-gold mx-auto mb-3" />
              <p className="font-display text-3xl font-light mb-1">{value}</p>
              <p className="text-stone text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER FEATURES ── */}
      <section className="border-t border-stone-light bg-parchment">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: Truck,
              title: "Worldwide Shipping",
              sub: "Fast & reliable delivery",
            },
            {
              icon: RotateCcw,
              title: "30-Day Returns",
              sub: "Hassle-free returns",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              sub: "We're here to help",
            },
            { icon: Lock, title: "Secure Payments", sub: "Safe & encrypted" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <Icon size={20} className="text-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-stone text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
