import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard,
  ExternalLink
} from "lucide-react";

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

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        quantity,
        products (
          id,
          title,
          price,
          image,
          slug
        )
      )
    `)
    .eq("id", params.id)
    .eq("user_id", user.id) // Ensure security
    .single();

  if (!order) notFound();

  const StatusIcon = statusIcons[order.status] || Clock;
  const subtotal = order.order_items.reduce((sum: number, item: any) => sum + (item.products?.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = order.total - subtotal - tax;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href="/account/orders" className="text-stone hover:text-gold flex items-center gap-2 text-sm mb-4 transition-colors">
            <ChevronLeft size={16} /> Back to Orders
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-display text-4xl font-light text-ink">Order Details</h1>
            <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${statusColors[order.status] || statusColors.Pending}`}>
              <StatusIcon size={12} />
              {order.status || "Pending"}
            </div>
          </div>
          <p className="text-stone text-sm">Order ID: <span className="font-mono text-ink">#{order.id.toUpperCase()}</span></p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] text-stone uppercase tracking-widest font-bold mb-1">Placed on</p>
          <p className="text-lg text-ink font-medium">{new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content: Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-stone-light rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-stone-light bg-parchment/10">
              <h2 className="font-display text-xl text-ink">Order Items</h2>
            </div>
            <div className="divide-y divide-stone-light">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-6 group">
                  <div className="w-20 h-24 bg-parchment rounded-xl overflow-hidden flex-shrink-0 border border-stone-light">
                    {item.products?.image ? (
                      <img src={item.products.image} alt={item.products.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-light"><Package size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Link href={`/products/${item.products?.slug}`} className="text-lg font-medium text-ink hover:text-gold transition-colors line-clamp-1">
                      {item.products?.title}
                    </Link>
                    <p className="text-sm text-stone">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium text-gold">₹{item.products?.price.toLocaleString()} per unit</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl text-ink">₹{(item.products?.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline / Status */}
          <div className="bg-white border border-stone-light rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-xl text-ink mb-8">Order Timeline</h2>
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-stone-light">
              <div className="flex gap-6 relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-white shadow-sm">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">Order Placed</p>
                  <p className="text-xs text-stone">{new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                  <p className="text-[10px] text-stone-light mt-1 uppercase tracking-widest">Successful</p>
                </div>
              </div>
              
              <div className="flex gap-6 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${order.status !== 'Pending' ? 'bg-emerald-500' : 'bg-stone-light'}`}>
                  {order.status !== 'Pending' ? <CheckCircle2 size={10} className="text-white" /> : <div className="w-1 h-1 bg-white rounded-full" />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${order.status !== 'Pending' ? 'text-ink' : 'text-stone-light'}`}>Payment Verified</p>
                  <p className="text-[10px] text-stone-light mt-1 uppercase tracking-widest">Automatic</p>
                </div>
              </div>

              <div className="flex gap-6 relative z-10 opacity-50">
                <div className="w-6 h-6 rounded-full bg-stone-light flex items-center justify-center border-4 border-white shadow-sm">
                  <Truck size={10} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-light uppercase tracking-widest">Out for Delivery</p>
                  <p className="text-[10px] text-stone-light mt-1">Pending Shipment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Totals & Info */}
        <div className="space-y-8">
          <div className="bg-white border border-stone-light rounded-2xl p-8 shadow-sm">
            <h2 className="font-display text-xl text-ink mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone">Subtotal</span>
                <span className="text-ink font-medium">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone">Shipping</span>
                <span className="text-ink font-medium">{shipping <= 0 ? "FREE" : `₹${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone">GST (18%)</span>
                <span className="text-ink font-medium">₹{tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-stone-light pt-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">Total Paid</p>
                  <p className="font-display text-4xl text-ink leading-none">₹{Number(order.total).toLocaleString()}</p>
                </div>
                <div className="text-stone-light">
                  <CreditCard size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-light rounded-2xl p-8 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-gold" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-widest">Shipping Address</h3>
              </div>
              <p className="text-sm text-stone leading-relaxed">
                Will be delivered to your primary address.<br />
                Check your <Link href="/profile#addresses" className="text-gold underline">Saved Addresses</Link>.
              </p>
            </div>

            <div className="pt-8 border-t border-stone-light">
              <h3 className="text-sm font-bold text-ink uppercase tracking-widest mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link href="/contact" className="flex items-center justify-between text-sm text-stone hover:text-gold transition-colors group">
                  Contact Support <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <Link href="/faq" className="flex items-center justify-between text-sm text-stone hover:text-gold transition-colors group">
                  Return Policy <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
