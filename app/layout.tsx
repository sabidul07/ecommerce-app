import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
  title: "Atelier — Premium Marketplace",
  description: "Discover and sell exceptional handcrafted goods",
  openGraph: {
    title: "Atelier — Premium Marketplace",
    description: "Discover and sell exceptional handcrafted goods. A curated marketplace connecting artisans and collectors.",
    url: "https://atelier.com",
    siteName: "Atelier",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Atelier Premium Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Atelier",
    "url": "https://atelier.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://atelier.com/products?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BackToTop />
        </CartProvider>
      </body>
    </html>
  );
}
