import { createServerSupabaseClient } from "@/lib/supabase-server";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

const PRODUCTS_QUERY_TIMEOUT_MS = 8000;

function timeoutAfter(ms: number) {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Products query timed out")), ms);
  });
}

export default async function ProductsPage() {
  const supabase = createServerSupabaseClient();

  const { data: products, error } = await Promise.race([
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false }),
    timeoutAfter(PRODUCTS_QUERY_TIMEOUT_MS),
  ]);

  if (error) {
    return (
      <div className="page-container text-center py-24 bg-rose-500/5 rounded-2xl border border-rose-500/10 max-w-2xl mx-auto mt-20">
        <h2 className="text-rose-500 font-bold mb-4 text-xl">Database Access Error</h2>
        <pre className="text-rose-400/80 text-xs bg-black/40 p-6 rounded-xl overflow-x-auto text-left mb-6">
          {JSON.stringify(error, null, 2)}
        </pre>
        <p className="text-stone-500 text-sm">
          Please check your Supabase RLS policies and .env settings.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-end justify-between mb-12 border-b border-stone-light pb-8">
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-2">
            OUR COLLECTION
          </p>
          <h1 className="section-title">All Products</h1>
        </div>
        <p className="text-stone text-sm">{products?.length ?? 0} items</p>
      </div>

      {/* Grid */}
      {!products || products.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag size={48} className="text-stone-light mx-auto mb-4" />
          <h3 className="font-display text-2xl mb-2">No products yet</h3>
          <p className="text-stone text-sm mb-6">
            Be the first to list something extraordinary.
          </p>
          <Link href="/upload-product" className="btn-primary inline-block">
            List a Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
