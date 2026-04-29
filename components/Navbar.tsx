"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, LogOut, Package, UploadCloud } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase";
import { useEffect, useState, startTransition } from "react";
import { signOut } from "@/app/actions/auth";

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ email: data.user.email ?? "" });
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(profile?.is_admin ?? false);
      } else {
        setUser(null);
        setIsAdmin(false);
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
    { href: "/dashboard", label: "Dashboard", auth: true },
    { href: "/upload-product", label: "Sell", auth: true, adminOnly: true },
  ];

  return (
    <nav className="bg-parchment border-b border-stone-light sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
                key={link.href}
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
        <div className="flex items-center gap-4">
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
                className="p-2 hover:text-gold transition-colors"
              >
                <User size={20} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-light shadow-lg">
                  <div className="px-4 py-3 border-b border-stone-light">
                    <p className="text-xs text-stone truncate">{user.email}</p>
                    {isAdmin && (
                      <p className="text-xs text-gold font-medium mt-0.5">
                        Admin
                      </p>
                    )}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-parchment transition-colors"
                  >
                    <Package size={14} /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/upload-product"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-parchment transition-colors"
                    >
                      <UploadCloud size={14} /> Add Product
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rust hover:bg-parchment transition-colors disabled:opacity-50"
                  >
                    {signingOut ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-rust/30 border-t-rust rounded-full animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <><LogOut size={14} /> Sign Out</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm tracking-wide text-stone hover:text-ink transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
