import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  MapPin, 
  CreditCard, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  User, 
  Mail, 
  Phone,
  RotateCcw,
  ExternalLink,
  ArrowRight
} from "lucide-react";

export const revalidate = 0;

const statusColors: Record<string, string> = {
  Pending: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  Paid: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  Shipped: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Delivered: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
  Cancelled: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (name, email, phone),
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
    .single();

  if (!order) notFound();

  const subtotal = order.order_items.reduce((sum: number, item: any) => sum + (item.products?.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const shipping = order.total - subtotal - tax;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-4">
          <Link href="/admin/orders" className="text-stone-500 hover:text-gold flex items-center gap-2 text-sm transition-colors group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Orders
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-white font-display">Order <span className="text-gold font-mono">#{order.id.slice(0, 8).toUpperCase()}</span></h1>
            <div className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status]}`}>
              {order.status}
            </div>
          </div>
          <p className="text-stone-500 text-sm">Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { dateStyle: "full", timeStyle: "short" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 px-6 py-3 rounded-xl text-sm font-bold hover:bg-rose-500 hover:text-white transition-all group">
            <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> Initiate Refund
          </button>
          <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-gold transition-all">
             Print Invoice
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Left Column: Items & Timeline */}
        <div className="lg:col-span-2 space-y-10">
          {/* Order Items */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Package size={20} className="text-gold" />
                Order Items ({order.order_items.length})
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-6 group hover:bg-white/[0.01] transition-colors">
                  <div className="w-20 h-24 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    {item.products?.image ? (
                      <img src={item.products.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600"><Package size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium group-hover:text-gold transition-colors">{item.products?.title}</h3>
                      <p className="font-bold text-white">₹{(item.products?.price * item.quantity).toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-stone-500">Price: ₹{item.products?.price.toLocaleString()}</p>
                    <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                    <p className="text-[10px] font-mono text-stone-600 mt-2">SKU: PROD-{item.products?.id.slice(0, 5).toUpperCase()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/[0.02] border-t border-white/10">
               <div className="flex flex-col gap-3 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm text-stone-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-400">
                    <span>Shipping</span>
                    <span>{shipping > 0 ? `₹${shipping.toLocaleString()}` : 'FREE'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-400">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10">
                    <span className="font-bold text-white">Total Amount</span>
                    <span className="text-2xl font-display font-bold text-gold">₹{Number(order.total).toLocaleString()}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
             <h2 className="text-lg font-bold text-white mb-10 flex items-center gap-2">
                <Clock size={20} className="text-gold" />
                Order Timeline
             </h2>
             <div className="space-y-12 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                <div className="flex gap-6 relative z-10">
                   <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-[#0A0A0A] shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 size={12} className="text-white" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-white">Order Placed & Paid</p>
                      <p className="text-xs text-stone-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-2 px-2 py-1 bg-emerald-500/10 rounded inline-block border border-emerald-500/20">Success</p>
                   </div>
                </div>

                <div className="flex gap-6 relative z-10">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0A0A0A] shadow-lg ${order.status !== 'Pending' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-stone-700'}`}>
                      {order.status !== 'Pending' ? <CheckCircle2 size={12} className="text-white" /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />}
                   </div>
                   <div className={order.status === 'Pending' ? 'opacity-40' : ''}>
                      <p className="text-sm font-bold text-white">Payment Verified by Razorpay</p>
                      <p className="text-xs text-stone-500 mt-1">Automatic verification complete</p>
                   </div>
                </div>

                <div className="flex gap-6 relative z-10">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center border-4 border-[#0A0A0A] shadow-lg ${['Shipped', 'Delivered'].includes(order.status) ? 'bg-blue-500 shadow-blue-500/20' : 'bg-stone-700'}`}>
                      {['Shipped', 'Delivered'].includes(order.status) ? <Truck size={12} className="text-white" /> : <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />}
                   </div>
                   <div className={!['Shipped', 'Delivered'].includes(order.status) ? 'opacity-40' : ''}>
                      <p className="text-sm font-bold text-white">Shipped via Express</p>
                      <p className="text-xs text-stone-500 mt-1">Carrier: BlueDart</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment */}
        <div className="space-y-10">
          {/* Customer Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl space-y-8">
            <div>
              <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-6">Customer Details</h3>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <User size={20} className="text-stone-400" />
                 </div>
                 <div>
                    <p className="text-white font-bold">{order.profiles?.name || "Guest User"}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Customer ID: {order.user_id.slice(0, 8)}</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors cursor-pointer">
                    <Mail size={14} className="text-gold" />
                    {order.profiles?.email || "No email provided"}
                 </div>
                 <div className="flex items-center gap-3 text-sm text-stone-400 hover:text-white transition-colors cursor-pointer">
                    <Phone size={14} className="text-gold" />
                    {order.profiles?.phone || "+91 9XXXXXXXXX"}
                 </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-6">Shipping Address</h3>
              <div className="flex gap-3">
                 <MapPin size={18} className="text-gold flex-shrink-0" />
                 <p className="text-sm text-stone-400 leading-relaxed">
                   Plot No. 42, Silicon Valley, <br />
                   Hitech City, Hyderabad, <br />
                   Telangana - 500081, India
                 </p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
             <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-6">Payment Information</h3>
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                      <CreditCard size={18} className="text-stone-400" />
                   </div>
                   <div>
                      <p className="text-white text-sm font-bold">Online Payment</p>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest">Razorpay</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-emerald-500 text-xs font-bold">PAID</p>
                </div>
             </div>
             <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                <p className="text-[10px] text-stone-600 uppercase tracking-widest mb-1">Transaction ID</p>
                <p className="text-xs text-stone-400 font-mono flex items-center justify-between">
                   pay_OZL8P{order.id.slice(0, 10)}
                   <ExternalLink size={12} className="text-stone-600" />
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
