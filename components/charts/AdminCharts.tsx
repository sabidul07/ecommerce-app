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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Order {
  id: string;
  total: number;
  created_at: string;
  order_items?: { quantity: number; products?: { title: string; price: number } | null }[];
}

interface Product {
  id: string;
  title: string;
  price: number;
  created_at: string;
}

interface AdminChartsProps {
  orders: Order[];
  products: Product[];
}

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C97A";
const RUST = "#B85C38";
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
            {entry.name === "revenue" || entry.name === "Revenue"
              ? `₹${entry.value.toFixed(2)}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminCharts({ orders, products }: AdminChartsProps) {
  const days = getLast30Days();

  // Revenue & orders per day
  const dailyData = days.map((day) => {
    const dayOrders = orders.filter(
      (o) => o.created_at.split("T")[0] === day
    );
    return {
      date: formatDate(day),
      revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      orders: dayOrders.length,
    };
  });

  // Top 5 products by times ordered
  const productCount: Record<string, { title: string; count: number; revenue: number }> = {};
  orders.forEach((order) => {
    order.order_items?.forEach((item) => {
      const title = item.products?.title ?? "Unknown";
      if (!productCount[title]) productCount[title] = { title, count: 0, revenue: 0 };
      productCount[title].count += item.quantity;
      productCount[title].revenue += (item.products?.price ?? 0) * item.quantity;
    });
  });
  const topProducts = Object.values(productCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Products by price range
  const ranges = [
    { label: "₹0–500", min: 0, max: 500 },
    { label: "₹501–2K", min: 501, max: 2000 },
    { label: "₹2K–5K", min: 2001, max: 5000 },
    { label: "₹5K+", min: 5001, max: Infinity },
  ];
  const priceDistribution = ranges.map((r) => ({
    name: r.label,
    value: products.filter((p) => p.price >= r.min && p.price <= r.max).length,
  }));
  const PIE_COLORS = [GOLD, GOLD_LIGHT, RUST, STONE];

  return (
    <div className="space-y-8 mb-12">
      <div>
        <p className="text-gold tracking-[0.3em] text-xs mb-2">ANALYTICS</p>
        <h2 className="font-display text-2xl">Store Performance</h2>
      </div>

      {/* Revenue Area Chart */}
      <div className="card">
        <h3 className="font-display text-lg mb-1">Revenue — Last 30 Days</h3>
        <p className="text-stone text-xs mb-6">Daily revenue from completed orders</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
            <XAxis
              dataKey="date"
              tick={{ fill: STONE, fontSize: 10 }}
              tickLine={false}
              interval={4}
              axisLine={{ stroke: "#2a2520" }}
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
              dataKey="revenue"
              stroke={GOLD}
              strokeWidth={2}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5, fill: GOLD, stroke: "#1a1510", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Orders Bar Chart + Pie Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders Bar */}
        <div className="card">
          <h3 className="font-display text-lg mb-1">Orders — Last 30 Days</h3>
          <p className="text-stone text-xs mb-6">Number of orders per day</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: STONE, fontSize: 10 }}
                tickLine={false}
                interval={4}
                axisLine={{ stroke: "#2a2520" }}
              />
              <YAxis
                tick={{ fill: STONE, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill={GOLD} radius={[3, 3, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Distribution Pie */}
        <div className="card">
          <h3 className="font-display text-lg mb-1">Products by Price Range</h3>
          <p className="text-stone text-xs mb-4">Distribution of your catalog</p>
          {products.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-stone text-sm">
              No products yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={priceDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priceDistribution.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#8C7B6B", fontSize: 11 }}>{value}</span>
                  )}
                />
                <Tooltip
                  formatter={(value) => [`${value} products`, "Count"]}
                  contentStyle={{
                    background: "#1a1510",
                    border: "1px solid #3a3530",
                    borderRadius: 0,
                    color: "#F5F0E8",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products */}
      {topProducts.length > 0 && (
        <div className="card">
          <h3 className="font-display text-lg mb-1">Top Selling Products</h3>
          <p className="text-stone text-xs mb-6">By units sold</p>
          <ResponsiveContainer width="100%" height={Math.max(topProducts.length * 52, 100)}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: STONE, fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "#2a2520" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="title"
                tick={{ fill: "#D4C9B8", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={130}
                tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "…" : v}
              />
              <Tooltip
                formatter={(value) => [`${value} units`, "Sold"]}
                contentStyle={{
                  background: "#1a1510",
                  border: "1px solid #3a3530",
                  borderRadius: 0,
                  color: "#F5F0E8",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill={GOLD} radius={[0, 3, 3, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
