"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

const menuItems = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/profile", label: "Profile Settings", icon: User },
  { href: "/profile#addresses", label: "Saved Addresses", icon: MapPin },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/security", label: "Security", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    window.location.replace("/login");
  };

  return (
    <div className="w-full lg:w-64 shrink-0">
      <div className="bg-white border border-stone-light rounded-2xl overflow-hidden sticky top-[100px]">
        <div className="p-6 border-b border-stone-light bg-parchment/30">
          <p className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-1 text-center">Account Menu</p>
        </div>

        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                    ? "bg-gold text-white shadow-lg shadow-gold/20"
                    : "text-stone hover:text-ink hover:bg-parchment"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-gold group-hover:scale-110 transition-transform"} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </div>
                {!isActive && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rust hover:bg-rust/5 transition-all mt-4 border-t border-stone-light pt-6"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium tracking-wide">Sign Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
