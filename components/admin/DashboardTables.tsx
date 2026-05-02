"use client";

import { motion } from "framer-motion";
import { User, Package, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { restockProduct } from "@/app/actions/inventory";

// --- Restock Button Component ---
function RestockButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleRestock = async () => {
    setLoading(true);
    try {
      await restockProduct(productId, 20); // Add 20 units
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleRestock}
      disabled={loading}
      className="text-[10px] text-gold opacity-0 group-hover:opacity-100 disabled:opacity-50 transition-opacity flex items-center gap-1 hover:underline"
    >
      {loading ? <Loader2 size={10} className="animate-spin" /> : <>Restock <ExternalLink size={10} /></>}
    </button>
  );
}

// --- Recent Orders Table ---
export function RecentOrdersTable({ orders }: { orders: any[] }) {
  const statusColors: Record<string, string> = {
    Paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-bold text-white">Recent Orders</h3>
        <Link href="/admin/orders" className="text-gold text-xs hover:underline">View All</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-stone-500 text-[10px] uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length > 0 ? (
              orders.map((order, i) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <User size={14} className="text-stone-400" />
                      </div>
                      <span className="text-sm text-stone-200 font-medium">{order.profiles?.name || "Guest"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">₹{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusColors[order.status] || statusColors.Pending}`}>
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] text-stone-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-xs text-stone-500 italic">
                  No orders found in this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Top Products ---
export function TopProducts({ products }: { products: any[] }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h3 className="font-bold text-white mb-6">Top Products</h3>
      <div className="space-y-4">
        {products.map((product, i) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-stone-600 font-mono text-xs italic">0{i+1}</span>
              <div>
                <p className="text-sm text-stone-200 font-medium line-clamp-1">{product.title}</p>
                <p className="text-[10px] text-stone-500">{product.units_sold} units sold</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gold">₹{product.revenue.toLocaleString()}</p>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-xs text-stone-500 text-center py-4 italic">No sales data yet</p>
        )}
      </div>
    </div>
  );
}

// --- Low Stock Alerts ---
export function LowStockAlerts({ items }: { items: any[] }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h3 className="font-bold text-white mb-6 flex items-center gap-2">
        Low Stock Alerts
        {items.length > 0 && (
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${item.inventory_count < 5 ? 'bg-red-500' : 'bg-amber-500'}`} />
              <div>
                <p className="text-sm text-stone-200 font-medium">{item.title}</p>
                <p className="text-[10px] text-stone-500">{item.inventory_count} remaining</p>
              </div>
            </div>
            <RestockButton productId={item.id} />
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-stone-500 text-center py-4 italic">Inventory is healthy</p>
        )}
      </div>
    </div>
  );
}

// --- Hydration-safe Time Component ---
function ClientTime({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <span className="opacity-0">...</span>;
  
  return <span>{new Date(date).toLocaleTimeString()}</span>;
}

// --- New Customers Feed ---
export function NewCustomersFeed({ customers }: { customers: any[] }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h3 className="font-bold text-white mb-6">New Customers</h3>
      <div className="space-y-6">
        {customers.map((customer) => (
          <div key={customer.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-gold" />
            </div>
            <div>
              <p className="text-sm text-stone-200 font-medium">{customer.name || "Unnamed User"}</p>
              <p className="text-[10px] text-stone-500">{customer.email}</p>
              <p className="text-[9px] text-stone-600 mt-1">Joined <ClientTime date={customer.created_at} /></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
