"use client";

import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero({ isAdmin }: { isAdmin: boolean }) {
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0,
      },
    },
  };

  // headline: 0ms, subtext: 150ms, buttons: 300ms (driven by stagger)
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" as const } },
  };

  return (
    <section className="relative bg-ink text-parchment overflow-hidden flex items-center">
      {/* Background glow */}

      <div className="max-w-7xl mx-auto px-4 m:px-6 py-8 xl:py-24 pb-28  relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={fadeInUp} className="text-gold tracking-[0.3em] text-xs mb-6 font-semibold">
            CURATED MARKETPLACE
          </motion.p>
          <motion.h1 variants={fadeInUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] mb-6">
            Discover
            <em className="italic text-gold-light"> Exceptional</em>
            <br />
            Goods
          </motion.h1>
          <motion.p variants={fadeInUp} className="text-stone-300 max-w-md text-base leading-relaxed mb-10">
            A premium marketplace connecting artisans and collectors. Every piece tells a story.
          </motion.p>
          <motion.div variants={fadeInUp} className="flex gap-4 flex-wrap">
            <Link
              href="/products"
              className="btn-gold inline-flex items-center justify-center gap-2 px-4 lg:p-6 xl:px-8 py-4 text-sm max-sm:flex-1"
            >
              Browse Collection <ArrowRight size={16} />
            </Link>
            {isAdmin ? (
              <Link
                href="/upload-product"
                className="border border-parchment/30 text-parchment px-4 lg:p-6 xl:px-8 py-4 text-sm font-medium tracking-wide hover:bg-parchment/10 transition-all inline-flex items-center gap-2"
              >
                Add Product
              </Link>
            ) : (
              <Link
                href="/signup"
                className="border border-parchment/30 text-parchment px-4 lg:p-6 xl:px-8 py-4 text-sm font-medium tracking-wide hover:bg-parchment/10 transition-all inline-flex items-center gap-2"
              >
                Start Selling
              </Link>
            )}
          </motion.div>
        </motion.div>

        {/* Right Decorative Image Mosaic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="hidden lg:block relative h-[500px]"
        >
          {/* Card 1 — Ceramics (top-right, slight rotate) */}
          <div className="absolute top-0 right-12 w-64 h-80 rounded-[8px] overflow-hidden border border-gold/20 shadow-2xl z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <Image
              src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=600&auto=format&fit=crop"
              alt="Handmade ceramics"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          {/* Card 2 — Jewelry (bottom-left, slight counter-rotate) */}
          <div className="absolute bottom-4 left-12 w-56 h-72 rounded-[8px] overflow-hidden border border-gold/20 shadow-2xl z-20 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
            <Image
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop"
              alt="Artisan jewellery"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          {/* Card 3 — Handcrafted (background, lower opacity) */}
          <div className="absolute top-20 left-4 w-40 h-48 rounded-[8px] overflow-hidden border border-gold/20 shadow-xl z-0 opacity-70 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
            <Image
              src="https://images.unsplash.com/photo-1771248686392-efddd468e0cf?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Handcrafted ceramics"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-12 -right-4 bg-parchment text-ink p-4 rounded-xl shadow-2xl z-30 flex items-center gap-4 border border-gold/30"
          >
            <div className="flex -space-x-3">
              {[
                "1534528741775-53994a69daeb",
                "1506794778202-cad84cf45f1d",
                "1544005313-94ddf0286df2"
              ].map((id, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-stone-200 border-2 border-parchment overflow-hidden relative">
                  <Image
                    src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=100&q=80`}
                    alt={`User ${i}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="font-display font-bold text-lg leading-tight">25,000+</p>
              <p className="text-xs text-stone font-medium uppercase tracking-wider">Products Sold</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Trust Strip */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-parchment/10 bg-parchment/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex gap-12 overflow-x-auto no-scrollbar">
          {[
            { icon: Leaf, text: "Curated Quality", sub: "Handpicked with care" },
            { icon: ShieldCheck, text: "Secure Payments", sub: "100% protected" },
            { icon: Users, text: "Support Artisans", sub: "Empower creativity" },
          ].map(({ icon: Icon, text, sub }) => (
            <div key={text} className="flex items-center gap-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <Icon size={20} className="text-gold" />
              </div>
              <div>
                <p className="text-parchment text-sm font-semibold tracking-wide">{text}</p>
                <p className="text-stone-300 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
