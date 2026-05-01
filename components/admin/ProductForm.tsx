"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  X,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { upsertProduct, deleteProduct } from "@/app/actions/products";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
}

export default function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Form State
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    compare_at_price: initialData?.compare_at_price || "",
    sku: initialData?.sku || "",
    inventory_count: initialData?.inventory_count || 0,
    status: initialData?.status || "Draft",
    is_featured: initialData?.is_featured || false,
    category_id: initialData?.category_id || "",
    specifications: initialData?.specifications || {},
    seo_title: initialData?.seo_title || "",
    seo_description: initialData?.seo_description || "",
  });

  // Slug generation
  useEffect(() => {
    if (!initialData && formData.title) {
      setFormData(prev => ({
        ...prev,
        slug: formData.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      }));
    }
  }, [formData.title, initialData]);

  // Images State
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  // Spec rows for the JSONB specifications
  const [specRows, setSpecRows] = useState<{ key: string, value: string }[]>(
    Object.entries(formData.specifications || {}).map(([key, value]) => ({ key, value: String(value) }))
  );

  const addSpecRow = () => setSpecRows([...specRows, { key: "", value: "" }]);
  const removeSpecRow = (index: number) => setSpecRows(specRows.filter((_, i) => i !== index));
  const updateSpecRow = (index: number, field: 'key' | 'value', value: string) => {
    const newRows = [...specRows];
    newRows[index][field] = value;
    setSpecRows(newRows);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert spec rows back to object
    const specifications = specRows.reduce((acc, row) => {
      if (row.key) acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, any>);

    try {
      await upsertProduct({ ...formData, specifications, images }, initialData?.id);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    try {
      await deleteProduct(initialData.id);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="min-h-screen bg-[#0A0A0A] text-parchment pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? `Edit ${initialData.title}` : "New Product"}
              </h2>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                {formData.status} • {initialData ? "Updating existing entry" : "Creating new entry"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-5 py-2.5 rounded-full text-sm font-medium text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gold transition-all shadow-lg hover:shadow-gold/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {formData.status === 'Draft' ? 'Save Draft' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          {/* General Info */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Product Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Product Name</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-gold transition-colors"
                    placeholder="e.g. Handcrafted Ceramic Vase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white/50 focus:outline-none focus:border-gold transition-colors"
                    placeholder="product-slug"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Tell the story of this product..."
                />
              </div>
            </div>
          </section>

          {/* Media */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              Media
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-gold/50 cursor-pointer transition-colors bg-white/[0.02]">
                <ImageIcon size={24} className="text-stone-500" />
                <span className="text-[10px] uppercase font-bold text-stone-500">Add Image</span>
              </div>
              {images.map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white/5 relative group overflow-hidden border border-white/10">
                  <img src={img} className="w-full h-full object-cover" />
                  <button className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-stone-500 uppercase mb-2">Price (₹)</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-500 uppercase mb-2">Compare at (₹)</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-stone-500 uppercase mb-2">SKU</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-stone-500 uppercase mb-2">Stock</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-3" />
                </div>
              </div>
            </div>
          </section>

          {/* Specifications */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                Specifications
              </h3>
              <button
                type="button"
                onClick={addSpecRow}
                className="text-xs text-gold hover:underline flex items-center gap-1"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>
            <div className="space-y-3">
              {specRows.map((row, i) => (
                <div key={i} className="flex gap-4">
                  <input
                    placeholder="Key (e.g. Material)"
                    value={row.key}
                    onChange={(e) => updateSpecRow(i, 'key', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                  />
                  <input
                    placeholder="Value (e.g. Marble)"
                    value={row.value}
                    onChange={(e) => updateSpecRow(i, 'value', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                  />
                  <button onClick={() => removeSpecRow(i)} className="p-3 text-stone-600 hover:text-rose-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SEO */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white">SEO Preview</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">
                  {formData.seo_title || formData.title || "Product Title Preview"}
                </p>
                <p className="text-emerald-500 text-xs mt-1">https://atelier.com/products/{formData.slug || "product-slug"}</p>
                <p className="text-stone-500 text-sm mt-2 line-clamp-2">
                  {formData.seo_description || formData.description || "Enter a description to see how this product will appear in search results."}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <input
                  placeholder="Meta Title"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                />
                <textarea
                  placeholder="Meta Description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm resize-none"
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status & Featured */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <div>
              <label className="block text-[10px] font-medium text-stone-500 uppercase mb-3">Publishing Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-gold"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Star size={16} className={formData.is_featured ? "text-gold fill-gold" : "text-stone-500"} />
                <span className="text-sm font-medium">Featured Product</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                className={`w-10 h-5 rounded-full transition-colors relative ${formData.is_featured ? 'bg-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.is_featured ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Categorization */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
            <div>
              <label className="block text-[10px] font-medium text-stone-500 uppercase mb-3">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-gold"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-stone-500 uppercase mb-3">Tags</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded flex items-center gap-1">
                  HANDMADE <X size={10} />
                </span>
                <span className="px-2 py-1 bg-white/5 text-stone-400 text-[10px] font-bold rounded flex items-center gap-1">
                  VINTAGE <X size={10} />
                </span>
              </div>
              <input
                placeholder="Add tag..."
                className="w-full bg-transparent border-b border-white/10 py-2 text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          {/* Quick Actions */}
          {initialData && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 transition-colors text-sm font-medium"
            >
              <Trash2 size={18} />
              Delete Product
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
