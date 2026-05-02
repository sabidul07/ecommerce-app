"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  X, 
  Save, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Layout,
  Star,
  Loader2,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    price: initialData?.price || "",
    image: initialData?.image || "",
    is_featured: initialData?.is_featured || false,
    description: initialData?.description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const parsedPrice = parseFloat(formData.price as string);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("Price must be greater than 0 ₹. We only sell premium items.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      price: parsedPrice,
      user_id: user.id,
    };

    let error;
    if (isEditing) {
      const { error: editError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", initialData.id);
      error = editError;
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert([payload]);
      error = insertError;
    }

    setLoading(false);
    if (!error) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-stone-500 hover:text-white mb-8 transition-colors group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Inventory
      </Link>

      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-white font-display">
          {isEditing ? "Edit Product" : "New Collection Item"}
        </h1>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => router.back()}
             className="px-6 py-3 rounded-xl text-stone-400 hover:text-white transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={loading}
             className="flex items-center gap-2 bg-gold text-black px-8 py-3 rounded-xl font-bold hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gold/10"
           >
             {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
             {isEditing ? "Update Product" : "Publish Product"}
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-3 block">Product Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Vintage Ceramic Vase"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-stone-700 focus:border-gold outline-none transition-all text-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-3 block">Description</label>
                <textarea 
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the craftsmanship, materials, and story..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-stone-700 focus:border-gold outline-none transition-all resize-none leading-relaxed"
                />
              </div>
           </div>

           <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-6 block">Product Media</label>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-gold transition-all">
                    <ImageIcon size={18} className="text-stone-500" />
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Paste image URL (Unsplash or Supabase)"
                      className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-stone-700"
                    />
                 </div>
                 {formData.image && (
                   <div className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover opacity-60" />
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-8">
              <div>
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 block text-gold">Pricing</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-gold transition-all">
                    <span className="text-stone-500 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="bg-transparent border-none outline-none text-lg w-full text-white font-display font-bold"
                      required
                    />
                </div>
              </div>

              <div className="pt-8 border-t border-white/10">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-4 block text-gold">Visibility</label>
                <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/[0.08] transition-all group">
                   <div className="flex items-center gap-3">
                      <Star size={18} className={formData.is_featured ? "text-gold fill-gold" : "text-stone-500"} />
                      <span className="text-sm font-medium text-white">Featured Product</span>
                   </div>
                   <input 
                     type="checkbox" 
                     checked={formData.is_featured}
                     onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                     className="w-5 h-5 rounded border-white/10 bg-white/5 text-gold focus:ring-gold transition-all cursor-pointer"
                   />
                </label>
                <p className="text-[10px] text-stone-600 mt-3 px-1 leading-relaxed">
                  Featured products appear on the homepage and at the top of category listings.
                </p>
              </div>
           </div>

           <div className="bg-gold/5 border border-gold/10 rounded-2xl p-8">
              <h4 className="text-gold text-xs font-bold uppercase tracking-widest mb-3">Expert Tip</h4>
              <p className="text-stone-400 text-xs leading-relaxed italic">
                "High-quality vertical imagery and a story-driven description increase conversion by up to 40% for luxury goods."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
