"use client";

import { Leaf, ShieldCheck, Star, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function Counter({ end, duration = 2000, decimals = 0 }: { end: number, duration?: number, decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            setCount(end * easeProgress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };
          
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [end, duration]);

  const formattedCount = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return <span ref={ref}>{formattedCount}</span>;
}

export default function StatsBar() {
  const stats = [
    { icon: Users, value: 10000, suffix: "+", label: "Happy Customers" },
    { icon: Star, value: 2500, suffix: "+", label: "Active Sellers" },
    { icon: Leaf, value: 25000, suffix: "+", label: "Products Sold" },
    { icon: ShieldCheck, value: 4.8, suffix: "/5", label: "Average Rating", decimals: 1 },
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
              <p className="font-display text-4xl font-light text-ink mb-1">
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
