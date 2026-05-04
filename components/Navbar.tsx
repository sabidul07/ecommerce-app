"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, User, LogOut, Package, UploadCloud, Search, Truck, MapPin, Heart, LayoutDashboard, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
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
  const [navSuggestions, setNavSuggestions] = useState<any[]>([]);
  const [showNavSuggestions, setShowNavSuggestions] = useState(false);

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
    { href: "/artisans", label: "Artisans" },
    { href: "/community", label: "Community" },
    { href: "/profile", label: "My Account", auth: true },
    { href: "/upload-product", label: "Sell", auth: true, adminOnly: true },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
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
                className={`text-sm tracking-wide transition-colors ${pathname === link.href
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
          <div className="hidden lg:flex items-center relative mr-2 group">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
                if (q) router.push(`/products?q=${encodeURIComponent(q)}`);
              }}
              className="flex items-center relative"
            >
              <input
                type="search"
                name="q"
                autoComplete="off"
                placeholder="Search products..."
                onChange={(e) => {
                  const query = e.target.value;
                  if (query.length > 1) {
                    const supabase = createClient();
                    supabase.from("products")
                      .select("id, title, price")
                      .ilike("title", `%${query}%`)
                      .limit(5)
                      .then(({ data }) => setNavSuggestions((data as any) || []));
                  } else {
                    setNavSuggestions([]);
                  }
                }}
                onFocus={() => setShowNavSuggestions(true)}
                onBlur={() => setTimeout(() => setShowNavSuggestions(false), 200)}
                className="pl-9 pr-4 py-1.5 text-sm bg-transparent border border-stone-light rounded-full focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold transition-all w-48 xl:w-64 placeholder:text-stone-400"
              />
              <Search size={14} className="absolute left-3 text-stone-400" />
            </form>

            {/* Live Nav Suggestions */}
            <AnimatePresence>
              {showNavSuggestions && navSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white border border-stone-light shadow-2xl rounded-lg overflow-hidden z-50"
                >
                  {navSuggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => router.push(`/products?q=${encodeURIComponent(s.title)}`)}
                      className="w-full text-left px-4 py-3 hover:bg-parchment flex items-center justify-between transition-colors border-b border-stone-light last:border-0"
                    >
                      <span className="text-xs font-medium text-ink truncate mr-4">{s.title}</span>
                      <span className="text-[10px] font-bold text-gold shrink-0">₹{s.price}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                className="flex items-center justify-center w-10 h-10 hover:text-gold transition-colors text-stone"
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
                    <Link href="/account/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-2.5 text-sm text-stone hover:text-ink hover:bg-parchment transition-colors">
                      <Heart size={16} /> Wishlist
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
              className="flex items-center justify-center w-10 h-10 hover:text-gold transition-colors text-stone "
              aria-label="Sign in"
            >
              <User size={20} />
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-ink hover:text-gold transition-colors ml-2"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-light overflow-hidden"
          >
            <div className="px-4 py-8 space-y-6">
               {/* Mobile Search */}
               <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem("q-mobile") as HTMLInputElement).value;
                  if (q) {
                    router.push(`/products?q=${encodeURIComponent(q)}`);
                    setMenuOpen(false);
                  }
                }}
                className="relative mb-8"
              >
                <input
                  type="search"
                  name="q-mobile"
                  placeholder="Search collections..."
                  className="w-full pl-12 pr-4 py-4 bg-parchment border border-stone-light rounded-2xl focus:border-gold outline-hidden text-sm"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              </form>

              <div className="flex flex-col gap-6">
                {navLinks.map((link) => {
                  if (link.auth && !user) return null;
                  if (link.adminOnly && !isAdmin) return null;
                  return (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`text-2xl font-display transition-colors ${pathname === link.href ? "text-gold" : "text-ink"}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-8 border-t border-stone-light">
                {user ? (
                  <div className="space-y-4">
                    <p className="text-xs text-stone uppercase tracking-widest">Account</p>
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="block text-lg text-ink">My Profile</Link>
                    <button onClick={handleSignOut} className="text-lg text-rust font-bold">Sign Out</button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-gold w-full text-center py-4">Sign In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
