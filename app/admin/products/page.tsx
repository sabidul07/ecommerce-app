import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  Trash2, 
  ChevronDown,
  Star
} from "lucide-react";
import Image from "next/image";

export const revalidate = 0;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; status?: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Admin Check
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  // Fetch Products with filters
  let query = supabase
    .from("products")
    .select("*, categories(name)")
    .order("created_at", { ascending: false });

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`);
  }
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: products } = await query;
  const { data: categories } = await supabase.from("categories").select("*");

  const statusColors: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Archived: "bg-stone-500/10 text-stone-400 border-stone-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-parchment pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white">Products</h1>
            <p className="text-stone-500 mt-2">Manage your inventory, pricing, and visibility.</p>
          </div>
          <Link 
            href="/admin/products/new" 
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-gold transition-all shadow-lg hover:shadow-gold/20"
          >
            <Plus size={18} />
            New Product
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-colors"
              defaultValue={searchParams.q}
            />
          </div>
          <div className="flex gap-4">
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold appearance-none min-w-[140px]">
              <option value="">All Categories</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold appearance-none min-w-[140px]">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-stone-500 text-[11px] uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="px-6 py-5 font-medium"><input type="checkbox" className="rounded bg-white/10 border-white/20" /></th>
                  <th className="px-6 py-5 font-medium">Product</th>
                  <th className="px-6 py-5 font-medium">Category</th>
                  <th className="px-6 py-5 font-medium">Price</th>
                  <th className="px-6 py-5 font-medium">Inventory</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                  <th className="px-6 py-5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products?.map((product) => (
                  <tr key={product.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden relative border border-white/10">
                          {product.image && (
                            <Image src={product.image} alt={product.title} fill className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium group-hover:text-gold transition-colors">{product.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {product.is_featured && <Star size={10} className="text-gold fill-gold" />}
                            <span className="text-[10px] text-stone-500 font-mono uppercase">{product.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-stone-400">{product.categories?.name || "Uncategorized"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      ₹{Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${product.inventory_count < 10 ? 'text-rose-400' : 'text-stone-400'}`}>
                          {product.inventory_count} in stock
                        </span>
                        {product.inventory_count < 10 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusColors[product.status] || statusColors.Draft}`}>
                        {product.status || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-stone-500 hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-stone-500">
            <p>Showing {products?.length || 0} products</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50" disabled>Previous</button>
              <button className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
