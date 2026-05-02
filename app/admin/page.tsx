import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutDashboard, ShoppingBag, Package } from "lucide-react";
import KPICard from "@/components/admin/KPICard";
import OperationalAlerts from "@/components/admin/OperationalAlerts";
import RevenueChart from "@/components/admin/RevenueChart";
import { RecentOrdersTable, TopProducts, LowStockAlerts, NewCustomersFeed } from "@/components/admin/DashboardTables";

export const revalidate = 0;

export default async function DashboardPage({ searchParams }: { searchParams: { days?: string } }) {
  const daysRange = parseInt(searchParams.days || "14");
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.is_admin ?? false;

  // --- NON-ADMIN REDIRECT ---
  if (!isAdmin) {
    redirect("/account/orders");
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const historyThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysRange).toISOString();
  const comparisonThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (daysRange * 2)).toISOString();

  const [
    { data: allOrders },
    { data: todayOrders },
    { data: yesterdayOrders },
    { data: newCustomersToday },
    { data: newCustomersYesterday },
    { data: lowStockItems },
    { data: recentOrders },
    { data: topProductsRaw },
    { data: latestCustomers },
    { data: paymentsData }
  ] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("orders").select("*").gte("created_at", today),
    supabase.from("orders").select("*").gte("created_at", yesterday).lt("created_at", today),
    supabase.from("profiles").select("*").gte("created_at", today),
    supabase.from("profiles").select("*").gte("created_at", yesterday).lt("created_at", today),
    supabase.from("products").select("*").lt("inventory_count", 10).order("inventory_count", { ascending: true }),
    supabase.from("orders").select("*, profiles(name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("order_items").select("*, products(title, price)"),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("*").gte("created_at", historyThreshold)
  ]);

  // KPI Calculations
  const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const aov = allOrders?.length ? totalRevenue / allOrders.length : 0;
  
  const orderDelta = !yesterdayOrders?.length 
    ? null 
    : Math.round(((todayOrders?.length || 0) - yesterdayOrders.length) / yesterdayOrders.length * 100);
  
  const customerDelta = !newCustomersYesterday?.length
    ? null
    : Math.round(((newCustomersToday?.length || 0) - newCustomersYesterday.length) / newCustomersYesterday.length * 100);

  // Revenue Chart Logic
  const chartData = [];
  for (let i = daysRange - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const displayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    const dayRev = allOrders
      ?.filter(o => o.created_at.startsWith(dateStr))
      .reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
    
    chartData.push({
      date: displayStr,
      revenue: dayRev,
      isToday: i === 0
    });
  }

  // Top Products Aggregation
  const prodMap: Record<string, any> = {};
  topProductsRaw?.forEach(item => {
    const id = item.product_id;
    if (!prodMap[id]) {
      prodMap[id] = { id, title: item.products?.title, units_sold: 0, revenue: 0 };
    }
    prodMap[id].units_sold += item.quantity;
    prodMap[id].revenue += (item.products?.price || 0) * item.quantity;
  });
  const topProducts = Object.values(prodMap).sort((a, b) => b.units_sold - a.units_sold).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-parchment pb-20">
      {/* Admin Header */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-gold mb-2">
              <LayoutDashboard size={16} />
              <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Admin Console</span>
            </div>
            <h1 className="text-4xl font-bold text-white">Dashboard Overview</h1>
            <p className="text-stone-500 mt-2">Welcome back, {profile?.name || "Admin"}. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/upload-product" className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gold transition-colors">
              <Plus size={16} />
              New Product
            </Link>
          </div>
        </div>

        {/* Row 1 — Core KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Total Revenue" 
            value={totalRevenue.toLocaleString()} 
            prefix="₹"
            delta={12} 
            deltaType="increase" 
            progress={75} 
          />
          <KPICard 
            title="Orders Today" 
            value={todayOrders?.length || 0} 
            delta={orderDelta} 
            deltaType={orderDelta !== null && orderDelta >= 0 ? "increase" : "decrease"} 
            progress={45} 
          />
          <KPICard 
            title="New Customers" 
            value={newCustomersToday?.length || 0} 
            delta={customerDelta} 
            deltaType={customerDelta !== null && customerDelta >= 0 ? "increase" : "decrease"} 
            progress={30} 
          />
          <KPICard 
            title="Avg. Order Value" 
            value={Math.round(aov).toLocaleString()} 
            prefix="₹"
            delta={5} 
            deltaType="increase" 
            progress={60} 
          />
        </div>

        {/* Row 2 — Operational Alerts */}
        <div className="mb-12">
          <OperationalAlerts 
            pendingOrders={allOrders?.filter(o => o.status === 'Pending').length || 0}
            conversionRate={3.2}
            refundsThisMonth={0}
            lowStockItems={lowStockItems?.length || 0}
          />
        </div>

        {/* Row 3 — Main Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
          <div className="space-y-8">
            <TopProducts products={topProducts} />
            <LowStockAlerts items={lowStockItems?.slice(0, 3) || []} />
          </div>
        </div>

        {/* Row 4 — Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentOrdersTable orders={recentOrders || []} />
          </div>
          <div>
            <NewCustomersFeed customers={latestCustomers || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

