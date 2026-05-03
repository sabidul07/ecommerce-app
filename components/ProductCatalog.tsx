"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Star, ChevronDown, ShoppingBag, Loader2 } from "lucide-react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase";

interface ProductCatalogProps {
  initialProducts: Product[];
}

export default function ProductCatalog({ initialProducts }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter States
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const supabase = createClient();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(initialProducts.map(p => p.category || "Uncategorized")));
    return cats.sort();
  }, [initialProducts]);

  // Handle Live Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      
      const { data } = await supabase
        .from("products")
        .select("id, title, price, category")
        .ilike("title", `%${searchQuery}%`)
        .limit(5);
        
      setSuggestions((data as any) || []);
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Filtering
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category || "Uncategorized");
      const matchesRating = (p.rating || 0) >= minRating;
      const matchesStock = !onlyInStock || (p.inventory_count || 0) > 0;
      
      return matchesSearch && matchesPrice && matchesCategory && matchesRating && matchesStock;
    });
  }, [products, searchQuery, priceRange, selectedCategories, minRating, onlyInStock]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setMinRating(0);
    setOnlyInStock(false);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Sidebar Filters - Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-10">
        <div>
          <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-6">Price Range</h3>
          <div className="space-y-4">
            <input 
              type="range" 
              min="0" 
              max="50000" 
              step="500"
              value={priceRange[1]} 
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full accent-gold bg-stone-light h-1 rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-medium text-stone">
              <span>₹0</span>
              <span>Up to ₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-6">Categories</h3>
          <div className="space-y-3">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded border-stone-light text-ink focus:ring-gold"
                />
                <span className="text-sm text-stone group-hover:text-ink transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-6">Minimum Rating</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setMinRating(star)}
                className={`p-1 transition-colors ${minRating >= star ? "text-gold" : "text-stone-light hover:text-stone"}`}
              >
                <Star size={16} fill={minRating >= star ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-6">Availability</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative inline-flex items-center">
              <input 
                type="checkbox" 
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold"></div>
            </div>
            <span className="text-sm text-stone">In Stock Only</span>
          </label>
        </div>

        <button 
          onClick={clearFilters}
          className="text-[10px] font-bold text-rust uppercase tracking-widest hover:underline pt-4"
        >
          Clear All Filters
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Search & Mobile Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-gold transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search our collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-stone-light rounded-sm focus:border-gold outline-hidden transition-all text-sm shadow-xs"
            />
            
            {/* Live Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 bg-white border border-stone-light shadow-2xl z-50 mt-2 rounded-sm overflow-hidden"
                >
                  {suggestions.map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSearchQuery(s.title);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-parchment flex items-center justify-between transition-colors border-b border-stone-light last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{s.title}</p>
                        <p className="text-[10px] text-stone uppercase tracking-widest">{s.category}</p>
                      </div>
                      <p className="text-xs font-bold text-gold">₹{s.price}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-6 py-4 border border-stone-light rounded-sm text-sm font-medium hover:bg-parchment transition-all w-full sm:w-auto"
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-stone text-[10px] font-bold uppercase tracking-widest border-b border-stone-light pb-4">
          <span>{filteredProducts.length} Results Found</span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select className="bg-transparent border-none outline-hidden cursor-pointer hover:text-ink">
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Best Rating</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-stone-light rounded-xl">
            <ShoppingBag size={48} className="text-stone-200 mx-auto mb-4" />
            <h3 className="font-display text-2xl mb-2">No items match your criteria</h3>
            <p className="text-stone text-sm mb-6">Try adjusting your filters or search query.</p>
            <button onClick={clearFilters} className="btn-primary">Reset Filters</button>
          </div>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-sm bg-parchment z-50 p-8 overflow-y-auto lg:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="font-display text-2xl">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}><X size={24} /></button>
              </div>
              
              {/* Reuse sidebar logic in mobile drawer */}
              <div className="space-y-12">
                {/* Same filter blocks as desktop sidebar */}
                {/* Price */}
                <div>
                  <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-6">Price Range</h3>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-gold"
                  />
                  <div className="flex justify-between text-xs mt-2">
                    <span>₹0</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-6">Categories</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`text-left px-4 py-3 border rounded-sm transition-all ${
                          selectedCategories.includes(cat) ? "border-gold bg-gold/5 text-ink" : "border-stone-light text-stone"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="btn-gold w-full py-4 mt-8"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
