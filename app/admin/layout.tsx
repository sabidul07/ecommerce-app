"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Ticket, 
  Store, 
  Settings,
  ChevronLeft
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-parchment">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col fixed inset-y-0">
        <div className="p-8">
          <Link href="/admin" className="font-display text-2xl tracking-widest text-white">
            ATELIER<span className="text-gold">.</span>
          </Link>
          <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-gold text-black font-bold shadow-lg shadow-gold/20" 
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white transition-colors text-sm"
          >
            <Settings size={18} />
            Settings
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 text-gold hover:text-white transition-colors text-sm group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
