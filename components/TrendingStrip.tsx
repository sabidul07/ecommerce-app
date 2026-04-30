"use client";

import Link from "next/link";

const trends = [
  "Hand-thrown ceramics",
  "Brass jewellery",
  "Block print fabric",
  "Minimalist art",
  "Organic skincare",
  "Linen homeware",
  "Woven baskets",
  "Artisan coffee",
];

export default function TrendingStrip() {
  return (
    <div className="bg-ink border-t border-stone-800 text-parchment py-3 overflow-hidden whitespace-nowrap flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center gap-4">
        <span className="text-gold text-xs tracking-widest font-semibold uppercase shrink-0">
          Trending
        </span>
        <div className="flex-1 overflow-x-auto no-scrollbar mask-edges-right">
          <div className="flex items-center gap-3 w-max px-2">
            {trends.map((trend) => (
              <Link
                key={trend}
                href={`/products?q=${encodeURIComponent(trend.toLowerCase())}`}
                className="bg-stone-800 hover:bg-stone-700 transition-colors px-4 py-1.5 rounded-full text-xs font-medium text-stone-300"
              >
                {trend}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
