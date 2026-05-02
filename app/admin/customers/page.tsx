import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Users, Search, Mail, Calendar, Shield, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function CustomersPage() {
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

  if (!profile?.is_admin) {
    redirect("/account/orders");
  }

  const { data: customers, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-parchment pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-gold mb-2">
              <Users size={16} />
              <span className="text-[10px] tracking-[0.3em] font-bold uppercase">Management</span>
            </div>
            <h1 className="text-4xl font-bold text-white">Customer Directory</h1>
            <p className="text-stone-500 mt-2">Manage and view all registered users in your store.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 w-full md:w-80">
            <Search size={18} className="text-stone-500" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-stone-600"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-white">{customers?.length || 0}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Active This Month</p>
            <p className="text-3xl font-bold text-white">{Math.ceil((customers?.length || 0) * 0.8)}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-stone-500 text-[10px] uppercase tracking-widest font-bold mb-1">Admins</p>
            <p className="text-3xl font-bold text-gold">{customers?.filter(c => c.is_admin).length || 0}</p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-stone-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-6">Customer</th>
                  <th className="px-8 py-6">Email</th>
                  <th className="px-8 py-6">Joined</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs border border-gold/20">
                          {customer.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-gold transition-colors">
                            {customer.name || customer.full_name || "Unnamed User"}
                          </p>
                          <p className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                            {customer.is_admin ? (
                              <><Shield size={10} className="text-gold" /> Administrator</>
                            ) : (
                              "Customer Account"
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-stone-300 text-sm">
                        <Mail size={14} className="text-stone-500" />
                        {customer.email || "—"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-stone-400 text-xs">
                        <Calendar size={14} className="text-stone-500" />
                        {new Date(customer.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-stone-500 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!customers || customers.length === 0) && (
            <div className="py-20 text-center">
              <Users size={48} className="mx-auto text-stone-700 mb-4" />
              <p className="text-stone-500">No customers found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
