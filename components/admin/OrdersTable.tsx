"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  Download, 
  ChevronRight, 
  Eye, 
  MoreVertical,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Package,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const statuses = ["All", "Pending", "Paid", "Shipped", "Delivered", "Cancelled"];

const statusConfig: Record<string, { color: string; icon: any }> = {
  Pending: { color: "text-amber-400 bg-amber-400/20 border-amber-400/30", icon: Clock },
  Paid: { color: "text-emerald-400 bg-emerald-400/20 border-emerald-400/30", icon: CheckCircle2 },
  Shipped: { color: "text-blue-400 bg-blue-400/20 border-blue-400/30", icon: Truck },
  Delivered: { color: "text-indigo-400 bg-indigo-400/20 border-indigo-400/30", icon: Package },
  Cancelled: { color: "text-rose-400 bg-rose-400/20 border-rose-400/30", icon: XCircle },
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [dateRange, setDateRange] = useState("all"); // today, week, month, all
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, [activeTab, dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select(`
        *,
        profiles (name, email),
        order_items (id, quantity)
      `)
      .order("created_at", { ascending: false });

    if (activeTab !== "All") {
      query = query.eq("status", activeTab);
    }

    // Date filtering
    const now = new Date();
    if (dateRange === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte("created_at", today);
    } else if (dateRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", weekAgo);
    } else if (dateRange === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
      query = query.gte("created_at", monthAgo);
    }

    const { data, error } = await query;
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Order ID,Customer,Email,Items,Total,Status,Date\n"];
    const rows = filteredOrders.map(o => 
      `${o.id},${o.profiles?.name || "Guest"},${o.profiles?.email || "N/A"},${o.order_items.length},${o.total},${o.status},${new Date(o.created_at).toLocaleDateString()}`
    );
    const csvContent = headers.concat(rows.map(r => r + "\n")).join("");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex flex-1 items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-gold transition-colors">
          <Search size={18} className="text-stone-500" />
          <input 
            type="text" 
            placeholder="Search by ID, name or email..." 
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-stone-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-stone-300 outline-none hover:border-gold transition-colors"
          >
            <option value="all" className="bg-[#1A1A1A]">All Time</option>
            <option value="today" className="bg-[#1A1A1A]">Today</option>
            <option value="week" className="bg-[#1A1A1A]">This Week</option>
            <option value="month" className="bg-[#1A1A1A]">This Month</option>
          </select>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-gold text-black px-4 py-2 rounded-xl text-sm font-bold hover:bg-gold-light transition-all shadow-lg shadow-gold/10"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === status 
                ? "bg-white text-black border-white shadow-xl shadow-white/5" 
                : "text-stone-500 border-white/5 hover:border-white/20 hover:text-stone-300"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-stone-500 text-[10px] uppercase tracking-[0.2em] bg-white/[0.02]">
                <th className="px-6 py-5 font-bold">Order Details</th>
                <th className="px-6 py-5 font-bold">Customer</th>
                <th className="px-6 py-5 font-bold text-right">Items</th>
                <th className="px-6 py-5 font-bold text-right">Total</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8 h-16 bg-white/[0.01]"></td>
                    </tr>
                  ))
                ) : filteredOrders.map((order) => {
                  const Config = statusConfig[order.status] || statusConfig.Pending;
                  const StatusIcon = Config.icon;
                  return (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={order.id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-gold mb-1">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <div className="flex items-center gap-2 text-stone-500 text-[10px]">
                            <Calendar size={10} />
                            {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm text-stone-200 font-medium">{order.profiles?.name || "Guest User"}</span>
                          <span className="text-[10px] text-stone-500">{order.profiles?.email || "No email"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-stone-400 text-sm">{order.order_items.length}</span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <span className="text-sm font-display font-bold text-white">₹{Number(order.total).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="relative inline-block group/status">
                          <select 
                            value={order.status}
                            onChange={(e) => updateStatus(order.id, e.target.value)}
                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-bold border outline-none transition-all cursor-pointer hover:brightness-110 shadow-sm ${Config.color}`}
                          >
                            {statuses.slice(1).map(s => (
                              <option key={s} value={s} className="bg-[#1A1A1A] text-white font-sans">{s}</option>
                            ))}
                          </select>
                          <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 ${Config.color.split(' ')[0]}`}>
                             <StatusIcon size={12} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 text-stone-400 hover:bg-gold hover:text-black transition-all"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {!loading && filteredOrders.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={24} className="text-stone-600" />
            </div>
            <h4 className="text-stone-400 text-sm">No orders found matching your criteria</h4>
          </div>
        )}
      </div>
    </div>
  );
}
