"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, LogOut, Package, UploadCloud, Search, Truck, MapPin, Heart, LayoutDashboard } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import { useEffect, useState, startTransition } from "react";
import { signOut } from "@/app/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullName, setFullName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ email: data.user.email ?? "" });
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin, full_name")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(profile?.is_admin ?? false);
        setFullName(profile?.full_name ?? "");
      } else {
        setUser(null);
        setIsAdmin(false);
        setFullName("");
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        startTransition(() => {
          if (session?.user) {
            setUser({ email: session.user.email ?? "" });
          } else {
            setUser(null);
            setIsAdmin(false);
          }
        });
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setMenuOpen(false);
    await signOut();
    window.location.replace("/login");
  };

  const navLinks = [
    { href: "/products", label: "Shop" },
    { href: "/products", label: "Categories" },
    { href: "/profile", label: "My Account", auth: true },
    { href: "/upload-product", label: "Sell", auth: true, adminOnly: true },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-parchment/80 backdrop-blur-md border-b border-stone-light shadow-xs"
          : "bg-parchment border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl font-light tracking-widest text-ink hover:text-gold transition-colors"
        >
          ATELIER
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            if (link.auth && !user) return null;
            if (link.adminOnly && !isAdmin) return null;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className={`text-sm tracking-wide transition-colors ${
                  pathname === link.href
                    ? "text-ink font-medium"
                    : "text-stone hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
            }}
            className="hidden lg:flex items-center relative mr-2"
          >
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              className="pl-9 pr-4 py-1.5 text-sm bg-transparent border border-stone-300 rounded-full focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all w-48 xl:w-64 placeholder:text-stone-400"
            />
            <Search size={14} className="absolute left-3 text-stone-400" />
          </form>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:text-gold transition-colors"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rust text-parchment text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-10 h-10 hover:text-gold transition-colors text-stone hover:text-ink"
                aria-label="Account menu"
              >
                <User size={20} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-stone-light shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-stone-light bg-parchment/30">
                    <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-1">Signed in as</p>
                    <p className="text-xs font-semibold text-ink truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-2">
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-stone hover:text-ink hover:bg-parchment transition-colors">
                      <User size={16} /> My profile
                    </Link>
                    <Link href="/account/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-stone hover:text-ink hover:bg-parchment transition-colors">
                      <Truck size={16} /> My orders
                    </Link>
                    <Link href="/profile#addresses" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-stone hover:text-ink hover:bg-parchment transition-colors">
                      <MapPin size={16} /> Saved addresses
                    </Link>
                    <Link href="/products" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-stone hover:text-ink hover:bg-parchment transition-colors">
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-stone hover:text-ink hover:bg-parchment transition-colors border-t border-stone-light mt-2 pt-4">
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  </div>

                  <div className="border-t border-stone-light mt-2">
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-rust hover:bg-parchment transition-colors disabled:opacity-50"
                    >
                      {signingOut ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-rust/30 border-t-rust rounded-full animate-spin" />
                          Signing out...
                        </>
                      ) : (
                        <><LogOut size={16} /> Sign out</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-10 h-10 hover:text-gold transition-colors text-stone hover:text-ink"
              aria-label="Sign in"
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
