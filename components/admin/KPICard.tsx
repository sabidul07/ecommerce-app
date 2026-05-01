"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number;
  deltaType?: "increase" | "decrease";
  progress: number; // 0 to 100
  prefix?: string;
}

export default function KPICard({ title, value, delta, deltaType, progress, prefix }: KPICardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl transition-all hover:bg-white/10"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-stone-400 text-sm font-medium tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-white">
            {prefix}{value}
          </h3>
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            deltaType === "increase" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          }`}>
            {deltaType === "increase" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}%
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs text-stone-500 mb-2">
          <span>Monthly Goal</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              progress > 80 ? "bg-gold" : "bg-emerald-500"
            }`}
          />
        </div>
      </div>
      
      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
        <TrendingUp size={80} />
      </div>
    </motion.div>
  );
}
