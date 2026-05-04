"use client";

import { ArtisanIcon, SustainableIcon, TrustIcon, CraftIcon } from "./Icons";
import Counter from "./Counter";

export default function StatsBar() {
  const stats = [
    { icon: ArtisanIcon, value: 10000, suffix: "+", label: "Happy Customers" },
    { icon: CraftIcon, value: 2500, suffix: "+", label: "Active Sellers" },
    { icon: SustainableIcon, value: 25000, suffix: "+", label: "Products Sold" },
    { icon: TrustIcon, value: 4.8, suffix: "/5", label: "Average Rating", decimals: 1 },
  ];

  return (
    <section className="bg-parchment py-16 border-b border-stone-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, suffix, label, decimals }) => (
            <div key={label} className="text-center group">
              <div className="w-12 h-12 rounded-full bg-parchment border border-stone-light flex items-center justify-center mx-auto mb-4 group-hover:border-gold group-hover:bg-gold/5 transition-all">
                <Icon size={20} className="text-gold" />
              </div>
              <p className="font-display text-[28px] sm:text-3xl md:text-4xl font-light text-ink mb-1">
                <Counter end={value} decimals={decimals} />
                {suffix}
              </p>
              <p className="text-stone text-xs font-semibold tracking-wider uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
