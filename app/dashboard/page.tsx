import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, LayoutDashboard, ShoppingBag, Package } from "lucide-react";
import KPICard from "@/components/admin/KPICard";
import OperationalAlerts from "@/components/admin/OperationalAlerts";
import RevenueChart from "@/components/admin/RevenueChart";
import { RecentOrdersTable, TopProducts, LowStockAlerts, NewCustomersFeed } from "@/components/admin/DashboardTables";

export const revalidate = 0;

export default async function DashboardPage() {
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

  // --- DATA FETCHING (ADMIN ONLY) ---
  if (isAdmin) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
    const fourteenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14).toISOString();

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
      supabase.from("payments").select("*").gte("created_at", fourteenDaysAgo)
    ]);

    // KPI Calculations
    const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
    const aov = allOrders?.length ? totalRevenue / allOrders.length : 0;
    
    const orderDelta = yesterdayOrders?.length 
      ? Math.round(((todayOrders?.length || 0) - yesterdayOrders.length) / yesterdayOrders.length * 100)
      : 0;
    
    const customerDelta = newCustomersYesterday?.length
      ? Math.round(((newCustomersToday?.length || 0) - newCustomersYesterday.length) / newCustomersYesterday.length * 100)
      : 0;

    // Revenue Chart Logic
    const dailyRevenue: Record<string, number> = {};
    const chartData = [];
    for (let i = 13; i >= 0; i--) {
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
              deltaType={orderDelta >= 0 ? "increase" : "decrease"} 
              progress={45} 
            />
            <KPICard 
              title="New Customers" 
              value={newCustomersToday?.length || 0} 
              delta={customerDelta} 
              deltaType={customerDelta >= 0 ? "increase" : "decrease"} 
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

  // --- USER DASHBOARD (SAME AS BEFORE BUT CLEANED) ---
  const { data: userOrders } = await supabase
    .from("orders")
    .select("*, order_items(*, products(title, price))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="page-container py-12">
      <div className="flex items-end justify-between mb-12 border-b border-stone-light pb-8">
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-2">MY ACCOUNT</p>
          <h1 className="section-title">Welcome, {profile?.name || user.email?.split("@")[0]}</h1>
          <p className="text-stone text-sm mt-1">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-12">
        <div className="card">
          <ShoppingBag size={18} className="text-gold mb-3" />
          <p className="font-display text-2xl">{userOrders?.length || 0}</p>
          <p className="text-stone text-xs mt-1">Orders Placed</p>
        </div>
        <div className="card">
          <Package size={18} className="text-gold mb-3" />
          <p className="font-display text-2xl">
            ₹{userOrders?.reduce((sum, o) => sum + Number(o.total), 0).toFixed(0) || "0"}
          </p>
          <p className="text-stone text-xs mt-1">Total Spent</p>
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl mb-6">My Orders</h2>
        {!userOrders || userOrders.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingBag size={36} className="text-stone-light mx-auto mb-3" />
            <p className="text-stone text-sm">No orders yet.</p>
            <Link href="/products" className="btn-primary inline-block mt-4 text-sm">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-stone tracking-widest uppercase">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-stone">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="font-display text-xl">₹{Number(order.total).toFixed(2)}</p>
                </div>
                <div className="border-t border-stone-light pt-3 space-y-1">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm text-stone">
                      <span>{item.products?.title} × {item.quantity}</span>
                      <span>₹{(item.products?.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

