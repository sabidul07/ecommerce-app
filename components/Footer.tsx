import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-parchment border-t border-stone-light">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-12 xl:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <p className="font-display text-2xl tracking-widest text-ink mb-1">ATELIER</p>
            <p className="text-gold text-xs tracking-widest mb-4">CURATED MARKETPLACE</p>
            <p className="text-stone text-sm leading-relaxed mb-6">
              A premium marketplace connecting artisans and collectors. Every piece tells a story.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
              ].map(({ icon: Icon, href }) => (
                <a key={href + Icon.name} href={href}
                  className="w-8 h-8 border border-stone-light flex items-center justify-center text-stone hover:text-gold hover:border-gold transition-colors">
                  <Icon size={14} />
                </a>
              ))}
              {/* Pinterest */}
              <a href="#"
                className="w-8 h-8 border border-stone-light flex items-center justify-center text-stone hover:text-gold hover:border-gold transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.34-4.23-2.96 0-4.69 2.22-4.69 4.51 0 .89.34 1.85.77 2.37.08.1.09.19.07.3-.08.32-.25 1.04-.28 1.18-.04.19-.14.23-.32.14-1.25-.58-2.03-2.42-2.03-3.89 0-3.15 2.29-6.05 6.61-6.05 3.47 0 6.16 2.47 6.16 5.77 0 3.44-2.17 6.21-5.18 6.21-1.01 0-1.97-.53-2.3-1.15l-.62 2.33c-.23.87-.84 1.96-1.25 2.62.94.29 1.94.45 2.97.45 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs tracking-widest font-semibold text-ink mb-5">SHOP</p>
            <ul className="space-y-3">
              {["All Products", "Categories", "Featured", "New Arrivals", "Gift Cards"].map((item) => (
                <li key={item}>
                  <Link href="/products" className="text-stone text-sm hover:text-ink transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs tracking-widest font-semibold text-ink mb-5">COMPANY</p>
            <ul className="space-y-3">
              {["About Us", "How It Works", "Careers", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-stone text-sm hover:text-ink transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs tracking-widest font-semibold text-ink mb-5">SUPPORT</p>
            <ul className="space-y-3">
              {["Help Center", "Shipping & Delivery", "Returns & Refunds", "Terms of Service", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-stone text-sm hover:text-ink transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <p className="text-xs tracking-widest font-semibold text-ink mb-5">TRUST & SAFETY</p>
            <ul className="space-y-3">
              {["Authenticity Guarantee", "Secure Payments", "Buyer Protection", "Report an Issue"].map((item) => (
                <li key={item}>
                  <Link href="/" className="text-stone text-sm hover:text-ink transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone text-xs">© 2024 Atelier. All rights reserved.</p>

          {/* Payment icons */}
          <div className="flex items-center gap-3">
            {["VISA", "MC", "UPI", "PayPal"].map((pay) => (
              <span key={pay}
                className="border border-stone-light px-2 py-1 text-xs text-stone font-medium tracking-wide">
                {pay}
              </span>
            ))}
            <span className="text-stone text-xs flex items-center gap-1">
              🔒 Secure Payments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
