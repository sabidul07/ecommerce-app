import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ChevronRight, Package, Truck, CheckCircle2, Clock } from "lucide-react";

export const revalidate = 0;

const statusIcons: Record<string, any> = {
  Paid: CheckCircle2,
  Shipped: Truck,
  Pending: Clock,
  Cancelled: Package,
};

const statusColors: Record<string, string> = {
  Paid: "text-emerald-600 bg-emerald-50 border-emerald-100",
  Shipped: "text-blue-600 bg-blue-50 border-blue-100",
  Pending: "text-amber-600 bg-amber-50 border-amber-100",
  Cancelled: "text-rose-600 bg-rose-50 border-rose-100",
};

export default async function OrdersPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        products (
          title,
          price,
          image
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-4xl font-light text-ink mb-2">My Orders</h1>
        <p className="text-stone text-sm">Track your purchases and view order history.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white border border-stone-light rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-parchment rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-stone-light" />
          </div>
          <h3 className="text-xl font-display mb-2">No orders yet</h3>
          <p className="text-stone text-sm mb-8">When you buy something, it will appear here.</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            Start Shopping <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            return (
              <Link 
                key={order.id} 
                href={`/account/orders/${order.id}`}
                className="block bg-white border border-stone-light rounded-2xl p-6 hover:border-gold transition-all group shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusColors[order.status] || statusColors.Pending}`}>
                        <StatusIcon size={12} />
                        {order.status || "Pending"}
                      </div>
                      <p className="text-xs text-stone-light font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    
                    <div className="flex -space-x-3 overflow-hidden">
                      {order.order_items.slice(0, 4).map((item: any, i: number) => (
                        <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-parchment">
                          {item.products?.image ? (
                            <img src={item.products.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-light"><Package size={14} /></div>
                          )}
                        </div>
                      ))}
                      {order.order_items.length > 4 && (
                        <div className="w-12 h-12 rounded-full border-2 border-white bg-stone-light flex items-center justify-center text-[10px] font-bold text-white">
                          +{order.order_items.length - 4}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <div className="text-right">
                      <p className="text-[10px] text-stone uppercase tracking-widest font-bold mb-1">Placed on</p>
                      <p className="text-sm text-ink">{new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-stone uppercase tracking-widest font-bold mb-1">Total Amount</p>
                      <p className="text-xl font-display text-gold font-medium">₹{Number(order.total).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
