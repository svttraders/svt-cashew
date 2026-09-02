'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product-card';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { ChevronRight, Flame, ShieldCheck, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function FlavoredCashewsCategoryPage() {
  const flavoredProducts = INITIAL_PRODUCTS.filter((p) => p.category === 'FLAVORED');

  return (
    <div className="bg-navy-950 min-h-screen text-slate-100 pb-20 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <span className="text-[#D4AF37] font-semibold">Gourmet Flavoured Cashews</span>
        </nav>
      </div>

      {/* Hero Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-14 border border-white/10 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-xs text-rose-400 font-semibold">
                <Flame className="w-3.5 h-3.5 text-rose-400" strokeWidth={2} />
                <span>Zero-Oil Slow Dry Roasting</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight leading-tight">
                Gourmet Flavoured Cashews
              </h1>

              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Slowly roasted in small batches without adding unnecessary vegetable oils or artificial colorings. Each jumbo cashew is coated with authentic stone-ground Indian spices, Kashmiri chili, smoked paprika, and handpicked Himalayan herbs.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                  <span>0% Palm Oil / Pure Dry Roast</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                  <span>Authentic Hyderabadi Spices</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                  <span>Resealable Zip-Fresh Pouch</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-navy-900 shadow-xl">
              <Image
                src="/images/tandoori_cashews_hero.webp"
                alt="Gourmet Spiced Flavoured Cashews Sidhi Vinayaka Traders"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Flavor Profile & Heat Meter Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold font-heading text-white">Flavor Heat & Intensity Guide</h2>
              <p className="text-xs text-slate-400">Choose your preferred heat level and spice balance.</p>
            </div>
            <Badge variant="spice" className="self-start sm:self-auto">Signature Roastery Recipes</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-navy-900/60 border border-rose-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase">Peri Peri</span>
                <span className="text-xs font-bold text-rose-400">🔥🔥🔥 Hot</span>
              </div>
              <h3 className="font-heading text-base font-bold text-white">Fiery African Red</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zesty African bird's eye chili, garlic, tangy lemon, and smoked paprika for bold heat lovers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] uppercase">Tandoori</span>
                <span className="text-xs font-bold text-amber-400">🔥🔥 Medium</span>
              </div>
              <h3 className="font-heading text-base font-bold text-white">Clay-Oven Masala</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Warm Hyderabadi clay oven aroma, roasted cumin, black salt, and mild Kashmiri chili.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase">Pudina Herb</span>
                <span className="text-xs font-bold text-emerald-400">🌿 Refreshing</span>
              </div>
              <h3 className="font-heading text-base font-bold text-white">Garden Mint</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sun-dried garden mint, toasted coriander, black pepper, and Himalayan pink crystal salt.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-navy-900/60 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase">Magic Masala</span>
                <span className="text-xs font-bold text-purple-400">🔥 Chatpata</span>
              </div>
              <h3 className="font-heading text-base font-bold text-white">12-Spice Secret</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our proprietary sweet, spicy, and tangy blend with dry mango powder (amchur) and roasted spices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flavoured Products Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
              Flavoured Selections ({flavoredProducts.length} Items)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Available in 500g and 1kg vacuum sealed packs.</p>
          </div>
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D4AF37] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span>All Catalog</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flavoredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
