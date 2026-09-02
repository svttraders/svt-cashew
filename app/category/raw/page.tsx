'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/product-card';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { ChevronRight, Sparkles, ShieldCheck, ArrowLeft, Award, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function RawCashewsCategoryPage() {
  const rawProducts = INITIAL_PRODUCTS.filter((p) => p.category === 'RAW');

  return (
    <div className="bg-navy-950 min-h-screen text-slate-100 pb-20 space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <span className="text-[#D4AF37] font-semibold">Raw Cashews Collection</span>
        </nav>
      </div>

      {/* Hero Showcase Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-14 border border-white/10 shadow-elevated">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-semibold">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                <span>100% Pure Grade Whole Nuts</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight leading-tight">
                Supreme Raw Cashews
              </h1>

              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Directly processed at our Surya Nagar Colony facility in Uppal, Hyderabad. Ranging from the ultra-rare W180 King Jumbo to wholesome W210 and W240 grades, our raw cashews offer natural sweetness, premium buttery texture, and maximum nutrition.
              </p>

              <div className="flex flex-wrap gap-4 pt-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                  <span>Zero Chemicals & Unbleached</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                  <span>Vacuum Fresh Packaging</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                  <span>Wholesale 5kg / 10kg Available</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-navy-900 shadow-xl">
              <Image
                src="/images/raw-cashews-nuts-bowl-marble-background.webp"
                alt="Supreme Raw Cashews King Jumbo W180 Uppal"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cashew Grade Visual Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold font-heading text-white">Cashew Grade Size Guide</h2>
              <p className="text-xs text-slate-400">Understanding "W" counts: lower count per pound means larger individual cashew nuts.</p>
            </div>
            <Badge variant="gold" className="self-start sm:self-auto">Grading Standard ISO 6477</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-navy-900/60 border border-[#D4AF37]/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">King Jumbo</span>
                <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">180 nuts/lb</span>
              </div>
              <h3 className="font-heading text-xl font-black text-white">Grade W180</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The absolute largest and rarest cashew in the world. Ideal for royal wedding gifting, luxury hampers, and gourmet snacking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-900/60 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Supreme Large</span>
                <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">210 nuts/lb</span>
              </div>
              <h3 className="font-heading text-xl font-black text-white">Grade W210</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Large premium whole kernels with outstanding crunch. Most popular grade for festive gifting and daily fitness snacking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-navy-900/60 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Standard Whole</span>
                <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">240 nuts/lb</span>
              </div>
              <h3 className="font-heading text-xl font-black text-white">Grade W240 / W320</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Medium whole kernels offering exceptional taste and value. Ideal for sweet making, gravies, and household culinary use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Raw Products Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
              Raw Products ({rawProducts.length} Selections)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Available in 500g and 1kg vacuum sealed packs.</p>
          </div>
          <Link href="/" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#D4AF37] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            <span>All Catalog</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rawProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
