import Link from "next/link";
import { ArrowRight, Package, ShieldCheck, Truck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-ink text-parchment overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #C9A84C 0%, transparent 60%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-32 md:py-48 relative z-10">
          <p className="text-gold tracking-[0.3em] text-xs mb-6 animate-fade-up">
            CURATED MARKETPLACE
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-[0.95] mb-8 animate-fade-up animate-delay-100">
            Discover
            <br />
            <em className="italic text-gold-light">Exceptional</em>
            <br />
            Goods
          </h1>
          <p className="text-stone-light max-w-md text-sm leading-relaxed mb-10 animate-fade-up animate-delay-200">
            A premium marketplace connecting artisans and collectors. Every
            piece tells a story.
          </p>
          <div className="flex gap-4 flex-wrap animate-fade-up animate-delay-300">
            <Link href="/products" className="btn-gold inline-flex items-center gap-2">
              Browse Collection <ArrowRight size={16} />
            </Link>
            <Link href="/signup" className="border border-parchment/30 text-parchment px-6 py-3 font-medium tracking-wide hover:bg-parchment/10 transition-all inline-flex items-center gap-2">
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="section-title text-center mb-16">Why Atelier?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Package,
              title: "Curated Quality",
              desc: "Every product is reviewed to ensure it meets our standards of craftsmanship and authenticity.",
            },
            {
              icon: ShieldCheck,
              title: "Secure Transactions",
              desc: "Your payments and personal data are protected with industry-leading security.",
            },
            {
              icon: Truck,
              title: "Seller Community",
              desc: "Join thousands of artisans and independent creators building their businesses here.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="w-12 h-12 bg-parchment rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon size={20} className="text-gold" />
              </div>
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-stone text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-dark text-parchment py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl font-light mb-4">
            Ready to sell?
          </h2>
          <p className="text-stone-light mb-8 text-sm">
            Create your account and list your first product in minutes.
          </p>
          <Link href="/signup" className="btn-gold inline-block">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}
