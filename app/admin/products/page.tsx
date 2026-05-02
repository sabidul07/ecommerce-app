"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Star,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white font-display">Inventory</h1>
          <p className="text-stone-500 text-sm mt-1">Manage your boutique collection and stock levels.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-xl text-sm font-bold hover:bg-gold-light transition-all shadow-lg shadow-gold/10 w-fit"
        >
          <Plus size={18} /> Add New Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 mb-8">
        <div className="flex flex-1 items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-gold transition-colors">
          <Search size={18} className="text-stone-500" />
          <input 
            type="text" 
            placeholder="Search products by title..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-white placeholder:text-stone-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 bg-white/5 text-stone-400 px-4 py-2 rounded-xl text-sm border border-white/10 hover:text-white transition-all">
             <Filter size={16} /> Filters
           </button>
           <p className="text-xs text-stone-600 font-medium px-2 uppercase tracking-widest">{filteredProducts.length} Products Total</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
            ))
          ) : filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={product.id}
              className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-all shadow-xl"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-black">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-700">
                    <Package size={48} />
                  </div>
                )}
                
                {/* Overlay Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                   <Link 
                     href={`/admin/products/${product.id}/edit`}
                     className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gold transition-colors shadow-xl"
                   >
                     <Edit size={18} />
                   </Link>
                   <button 
                     onClick={() => deleteProduct(product.id)}
                     className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors shadow-xl"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>

                {product.is_featured && (
                  <div className="absolute top-4 left-4 bg-gold text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Featured
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors line-clamp-1">{product.title}</h3>
                  <p className="text-xl font-display font-bold text-white">₹{Number(product.price).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                         <span className="text-[10px] text-stone-500 uppercase tracking-widest">Status</span>
                         <span className="text-xs text-emerald-500 font-bold">In Stock</span>
                      </div>
                      <div className="flex flex-col border-l border-white/10 pl-4">
                         <span className="text-[10px] text-stone-500 uppercase tracking-widest">Inventory</span>
                         <span className="text-xs text-white font-bold">24 Units</span>
                      </div>
                   </div>
                   <Link 
                     href={`/products/${product.id}`} 
                     target="_blank"
                     className="text-stone-500 hover:text-white transition-colors"
                   >
                     <ExternalLink size={16} />
                   </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredProducts.length === 0 && (
        <div className="py-32 text-center">
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-stone-600" />
           </div>
           <h3 className="text-white text-xl font-bold mb-2">No products found</h3>
           <p className="text-stone-500 max-w-sm mx-auto">Try adjusting your search term or add a new product to your inventory.</p>
        </div>
      )}
    </div>
  );
}
