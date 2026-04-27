"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Order {
  id: string;
  total: number;
  created_at: string;
}

interface UserChartsProps {
  orders: Order[];
}

const GOLD = "#C9A84C";
const STONE = "#8C7B6B";

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink border border-stone/30 px-4 py-3 shadow-xl">
        <p className="text-stone text-xs tracking-widest mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-parchment text-sm font-medium">
            {entry.name === "spent" ? `₹${entry.value.toFixed(2)}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function UserCharts({ orders }: UserChartsProps) {
  if (orders.length === 0) return null;

  const days = getLast30Days();

  const dailyData = days.map((day) => {
    const dayOrders = orders.filter(
      (o) => o.created_at.split("T")[0] === day
    );
    return {
      date: formatDate(day),
      spent: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // Monthly summary (last 6 months)
  const monthlyData: Record<string, number> = {};
  orders.forEach((order) => {
    const key = new Date(order.created_at).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
    monthlyData[key] = (monthlyData[key] ?? 0) + order.total;
  });
  const monthly = Object.entries(monthlyData)
    .slice(-6)
    .map(([month, spent]) => ({ month, spent }));

  return (
    <div className="space-y-6 mb-12">
      <div>
        <p className="text-gold tracking-[0.3em] text-xs mb-2">YOUR ACTIVITY</p>
        <h2 className="font-display text-2xl">Purchase History</h2>
      </div>

      {/* Spending Area Chart */}
      <div className="card">
        <h3 className="font-display text-lg mb-1">Spending — Last 30 Days</h3>
        <p className="text-stone text-xs mb-6">Your daily spend on orders</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.25} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" />
            <XAxis
              dataKey="date"
              tick={{ fill: STONE, fontSize: 10 }}
              tickLine={false}
              interval={4}
              axisLine={{ stroke: "#e8e0d4" }}
            />
            <YAxis
              tick={{ fill: STONE, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}`}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="spent"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#spendGrad)"
              dot={false}
              activeDot={{ r: 5, fill: GOLD, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Bar Chart */}
      {monthly.length > 1 && (
        <div className="card">
          <h3 className="font-display text-lg mb-1">Monthly Spending</h3>
          <p className="text-stone text-xs mb-6">Your spend per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d4" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: STONE, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e8e0d4" }}
              />
              <YAxis
                tick={{ fill: STONE, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v}`}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spent" fill={GOLD} radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
