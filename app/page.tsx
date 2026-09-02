'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { Product, INITIAL_PRODUCTS } from '@/lib/mock-data';
import { 
  ChevronLeft, ChevronRight, Star, Sparkles, ArrowRight, 
  Flame, ShieldCheck, CheckCircle2, Truck, Award
} from 'lucide-react';
import { 
  DirectFarmIllustration, 
  ZeroOilRoastingIllustration, 
  QualityAssuredIllustration 
} from '@/components/illustrations';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroButtonText: string;
  heroButtonLink: string;
  secondaryTitle: string;
  secondarySubtitle: string;
  secondaryImageUrl: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'RAW' | 'FLAVORED'>('ALL');
  const [heroIndex, setHeroIndex] = useState(0);
  const [settings, setSettings] = useState<HomepageSettings>({
    heroTitle: 'Supreme Quality Handpicked Cashews',
    heroSubtitle: 'Directly sourced from trusted orchards and freshly processed at our facility in Uppal, Hyderabad. Experience unmatched crunch and natural flavor.',
    heroImageUrl: '/images/raw_cashews_hero.webp',
    heroButtonText: 'Shop All Products',
    heroButtonLink: '#shop',
    secondaryTitle: 'Artisanal Flavoured Blends',
    secondarySubtitle: 'Slow-roasted with authentic Indian spices without added oils or artificial preservatives.',
    secondaryImageUrl: '/images/tandoori_cashews_hero.webp',
    secondaryButtonText: 'Explore Flavours',
    secondaryButtonLink: '#shop',
  });

  const heroGallery = [
    settings.heroImageUrl ? settings.heroImageUrl.replace(/\.(png|jpg)$/, '.webp') : '/images/raw_cashews_hero.webp',
    '/images/raw-cashews-nuts-bowl-marble-background.webp',
    '/images/cashew-nuts-ai-generated.webp',
    '/images/8556b61c-c714-4ff1-b8b4-de13c096e87d.webp',
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        if (prodData.success && prodData.products && prodData.products.length > 0) {
          setProducts(prodData.products);
        }
      } catch (err) {
        console.warn('Using fallback products:', err);
      }

      try {
        const settingRes = await fetch('/api/admin/homepage');
        const settingData = await settingRes.json();
        if (settingData.success && settingData.settings) {
          setSettings(settingData.settings);
        }
      } catch (err) {
        console.warn('Using fallback homepage settings:', err);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="bg-navy-950 min-h-screen text-slate-100 pb-20 space-y-16">
      
      {/* 01 - HERO SHOWCASE SECTION */}
      <section className="relative pt-6 sm:pt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto glass-panel p-6 sm:p-12 rounded-3xl relative overflow-hidden text-center space-y-8">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={2} />
              <span>Uppal Processing Hub • Wholesale & Retail Direct</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              {settings.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {settings.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={settings.heroButtonLink || '#shop'}
                className="inline-flex items-center space-x-2 px-8 py-3.5 gold-cta-button text-xs font-bold uppercase tracking-wider shadow-lg"
              >
                <span>{settings.heroButtonText || 'Explore Products'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>

              <a
                href="https://wa.me/919515273464"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>Bulk / Wholesale Inquiries</span>
              </a>
            </div>
          </div>

          {/* Hero Showcase Carousel */}
          <div className="relative max-w-4xl mx-auto pt-2">
            <button
              onClick={() => setHeroIndex((prev) => (prev === 0 ? heroGallery.length - 1 : prev - 1))}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-navy-950/80 border border-white/10 text-slate-200 hover:text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-elevated border border-white/10 bg-navy-900">
              <Image
                src={heroGallery[heroIndex] || '/images/raw_cashews_hero.webp'}
                alt="Sidhi Vinayaka Traders Gourmet Cashew Showcase"
                fill
                className="object-cover transition-all duration-500"
                priority
              />
            </div>

            <button
              onClick={() => setHeroIndex((prev) => (prev === heroGallery.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-navy-950/80 border border-white/10 text-slate-200 hover:text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>

            <div className="flex justify-center items-center space-x-2 pt-4">
              {heroGallery.map((_, dot) => (
                <button
                  key={dot}
                  onClick={() => setHeroIndex(dot)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    heroIndex === dot ? 'w-6 bg-[#D4AF37]' : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Slide ${dot + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 02 - CATEGORY SELECTION CARDS (RAW vs FLAVOURED) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RAW CARD */}
          <Link 
            href="/category/raw"
            className="group p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center justify-between bg-navy-900/60 border-white/10 hover:border-[#D4AF37]/50 hover:bg-navy-900/90 shadow-card hover:shadow-elevated"
          >
            <div className="space-y-2">
              <Badge variant="gold">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" strokeWidth={2} />
                <span>King Jumbo Series</span>
              </Badge>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white group-hover:text-[#D4AF37] transition-colors">Raw Cashews</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] pt-2">
                <span>Explore Raw Grades & Guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </span>
            </div>

            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-navy-950 shadow-md">
              <Image
                src="/images/raw_cashews_hero.webp"
                alt="Raw King Jumbo Cashews"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* FLAVOURED CARD */}
          <Link 
            href="/category/flavored"
            className="group p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center justify-between bg-navy-900/60 border-white/10 hover:border-rose-500/50 hover:bg-navy-900/90 shadow-card hover:shadow-elevated"
          >
            <div className="space-y-2">
              <Badge variant="spice">
                <Flame className="w-3 h-3 text-rose-400" strokeWidth={2} />
                <span>Slow-Roast Gourmet</span>
              </Badge>
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-white group-hover:text-rose-400 transition-colors">Flavoured</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Peri Peri, Tandoori Masala & Pudina Herb infused with pure spices.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 pt-2">
                <span>Explore Flavours & Spice Meter</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </span>
            </div>

            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border border-white/10 bg-navy-950 shadow-md">
              <Image
                src="/images/tandoori_cashews_hero.webp"
                alt="Flavoured Masala Cashews"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* 03 - PRODUCT CATALOG GRID */}
      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white">
              Signature Cashews
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your pack size (500g, 1kg) or explore bulk 5kg wholesale orders.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as any)}>
            <TabsList>
              <TabsTrigger value="ALL">All Cashews</TabsTrigger>
              <TabsTrigger value="RAW">Raw Jumbo</TabsTrigger>
              <TabsTrigger value="FLAVORED">Flavoured Gourmet</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 04 - BRAND ADVANTAGE & ROASTING PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-heading text-2xl sm:text-3xl font-black text-white">
              The SVT Direct Advantage
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Why restaurants, caterers, and families across Hyderabad choose Sidhi Vinayaka Traders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/5 space-y-3">
              <DirectFarmIllustration className="w-12 h-12" />
              <h4 className="font-heading text-base font-bold text-white">Direct Sourcing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We eliminate middlemen and procure premium harvest nuts directly, passing genuine wholesale pricing to our customers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/5 space-y-3">
              <ZeroOilRoastingIllustration className="w-12 h-12" />
              <h4 className="font-heading text-base font-bold text-white">Zero Oil Roasting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our flavoured cashews are slow dry-roasted with genuine Indian spices — no vegetable oils, artificial colors, or MSG.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900/60 border border-white/5 space-y-3">
              <QualityAssuredIllustration className="w-12 h-12" />
              <h4 className="font-heading text-base font-bold text-white">Guaranteed Freshness</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vacuum-packed and nitrogen flushed at our Surya Nagar Colony counter in Uppal for long-lasting crispness and aroma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 05 - VERIFIED CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                Customer Testimonials
              </h3>
              <p className="text-xs text-slate-400">Feedback from dry fruit buyers across Uppal & Hyderabad</p>
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" strokeWidth={1.5} />
              ))}
              <span className="text-xs font-bold text-slate-200 ml-2">4.9 / 5.0 (420+ Orders)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-navy-900/60 rounded-2xl border border-white/5 space-y-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                "The W180 King Jumbo cashews are huge and crunchy! Peri Peri flavour is spicy and delicious. Ordered for our family function and everyone praised the quality."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Ravindra Sahu</span>
                <span className="text-slate-500">Uppal, Hyderabad</span>
              </div>
            </div>

            <div className="p-6 bg-navy-900/60 rounded-2xl border border-white/5 space-y-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" strokeWidth={1.5} />
                ))}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                "Direct processing counter in Uppal. Excellent quality for wedding & festival gifting! The vacuum packaging keeps them fresh for months."
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Ketan Kumar</span>
                <span className="text-slate-500">Secunderabad</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
