import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingBag, Plus, TrendingUp, BarChart2 } from "lucide-react";
import { Product, Order } from "@/types";
import DeleteProductButton from "@/components/DeleteProductButton";
import AdminCharts from "@/components/charts/AdminCharts";
import UserCharts from "@/components/charts/UserCharts";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("*, order_items(*, products(title, price))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const isAdmin = profile?.is_admin ?? false;

  // Admin: fetch all orders for charts
  const { data: allOrders } = isAdmin
    ? await supabase
        .from("orders")
        .select("*, order_items(*, products(title, price))")
        .order("created_at", { ascending: false })
    : { data: null };

  const { data: products } = isAdmin
    ? await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
    : { data: null };

  const totalRevenue =
    (products as Product[])?.reduce((sum, p) => sum + p.price, 0) ?? 0;

  const totalOrderRevenue =
    (allOrders as Order[])?.reduce((sum, o) => sum + o.total, 0) ?? 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-end justify-between mb-12 border-b border-stone-light pb-8">
        <div>
          <p className="text-gold tracking-[0.3em] text-xs mb-2">MY ACCOUNT</p>
          <h1 className="section-title">
            Welcome, {profile?.name ?? user.email?.split("@")[0]}
          </h1>
          <p className="text-stone text-sm mt-1">{user.email}</p>
          {isAdmin && (
            <span className="inline-block mt-2 text-xs tracking-widest text-gold border border-gold px-2 py-0.5">
              ADMIN
            </span>
          )}
        </div>
        {isAdmin && (
          <Link href="/upload-product" className="btn-gold inline-flex items-center gap-2">
            <Plus size={16} />
            Add Product
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className={`grid gap-4 mb-12 ${isAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}>
        {isAdmin && (
          <>
            <div className="card">
              <Package size={18} className="text-gold mb-3" />
              <p className="font-display text-2xl">{products?.length ?? 0}</p>
              <p className="text-stone text-xs mt-1">Products Listed</p>
            </div>
            <div className="card">
              <TrendingUp size={18} className="text-gold mb-3" />
              <p className="font-display text-2xl">₹{totalOrderRevenue.toFixed(0)}</p>
              <p className="text-stone text-xs mt-1">Total Revenue</p>
            </div>
            <div className="card">
              <BarChart2 size={18} className="text-gold mb-3" />
              <p className="font-display text-2xl">{allOrders?.length ?? 0}</p>
              <p className="text-stone text-xs mt-1">Total Orders</p>
            </div>
            <div className="card">
              <TrendingUp size={18} className="text-gold mb-3" />
              <p className="font-display text-2xl">₹{totalRevenue.toFixed(0)}</p>
              <p className="text-stone text-xs mt-1">Catalog Value</p>
            </div>
          </>
        )}
        {!isAdmin && (
          <>
            <div className="card">
              <ShoppingBag size={18} className="text-gold mb-3" />
              <p className="font-display text-2xl">{orders?.length ?? 0}</p>
              <p className="text-stone text-xs mt-1">Orders Placed</p>
            </div>
            <div className="card">
              <TrendingUp size={18} className="text-gold mb-3" />
              <p className="font-display text-2xl">
                ₹{(orders as Order[])?.reduce((sum, o) => sum + o.total, 0).toFixed(0) ?? "0"}
              </p>
              <p className="text-stone text-xs mt-1">Total Spent</p>
            </div>
          </>
        )}
      </div>

      {/* Admin Charts */}
      {isAdmin && (
        <AdminCharts
          orders={(allOrders as any[]) ?? []}
          products={(products as any[]) ?? []}
        />
      )}

      {/* User Charts */}
      {!isAdmin && (
        <UserCharts orders={(orders as any[]) ?? []} />
      )}

      {/* Admin: Products Section */}
      {isAdmin && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">All Products</h2>
            <Link
              href="/upload-product"
              className="text-xs text-stone hover:text-ink underline underline-offset-2 transition-colors"
            >
              + Add New
            </Link>
          </div>

          {!products || products.length === 0 ? (
            <div className="card text-center py-12">
              <Package size={36} className="text-stone-light mx-auto mb-3" />
              <p className="text-stone text-sm">No products yet.</p>
              <Link href="/upload-product" className="btn-primary inline-block mt-4 text-sm">
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(products as Product[]).map((product) => (
                <div key={product.id} className="card flex gap-4">
                  <div className="w-16 h-16 bg-stone-light flex-shrink-0 overflow-hidden relative">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-stone" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="font-display text-lg">₹{product.price.toFixed(2)}</p>
                    <p className="text-xs text-stone">
                      {new Date(product.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <DeleteProductButton productId={product.id} imageUrl={product.image} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Orders */}
      <section>
        <h2 className="font-display text-2xl mb-6">My Orders</h2>

        {!orders || orders.length === 0 ? (
          <div className="card text-center py-12">
            <ShoppingBag size={36} className="text-stone-light mx-auto mb-3" />
            <p className="text-stone text-sm">No orders yet.</p>
            <Link href="/products" className="btn-primary inline-block mt-4 text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {(orders as Order[]).map((order) => (
              <div key={order.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-stone tracking-widest">ORDER</p>
                    <p className="font-mono text-sm text-ink">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl">₹{order.total.toFixed(2)}</p>
                    <p className="text-xs text-stone">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {order.order_items && order.order_items.length > 0 && (
                  <div className="border-t border-stone-light pt-3 space-y-1">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-stone">
                          {item.products?.title ?? "Unknown"} × {item.quantity}
                        </span>
                        <span>
                          ₹{((item.products?.price ?? 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
