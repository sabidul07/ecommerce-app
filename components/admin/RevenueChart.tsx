"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    isToday?: boolean;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#121212] border border-white/10 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-xl">
        <p className="text-stone-400 text-[10px] tracking-widest uppercase mb-1">{label}</p>
        <p className="text-white text-lg font-bold">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxRev = Math.max(...data.map(d => d.revenue), 1000);
  const tickCount = 4;
  const interval = Math.ceil(maxRev / tickCount);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => i * interval);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white">Revenue Overview</h3>
          <p className="text-stone-400 text-sm">Historical performance analysis</p>
        </div>
        
        <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set("days", days.toString());
                window.location.href = url.toString();
              }}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                data.length === days 
                  ? "bg-gold text-ink" 
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#8c7b6b", fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              ticks={ticks}
              domain={[0, ticks[ticks.length - 1]]}
              tick={{ fill: "#8c7b6b", fontSize: 10 }}
              tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(201, 168, 76, 0.05)' }} 
              animationDuration={200}
            />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isToday ? "#C9A84C" : "rgba(201, 168, 76, 0.2)"} 
                  className="transition-all duration-300 hover:fill-gold/80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
