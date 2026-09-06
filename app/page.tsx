'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { Product, INITIAL_PRODUCTS } from '@/lib/mock-data';
import { 
  ChevronLeft, ChevronRight, Star, Sparkles, ArrowRight, 
  Flame, ShieldCheck, CheckCircle2, Truck, Award, Gift, Package, Tag, Layers
} from 'lucide-react';
import { 
  DirectFarmIllustration, 
  ZeroOilRoastingIllustration, 
  QualityAssuredIllustration 
} from '@/components/illustrations';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFestivalTheme } from '@/components/theme-provider';
import { ICategoryFeatureCard, DEFAULT_CATEGORY_CARDS } from '@/lib/category-cards';

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
  categoryCards?: ICategoryFeatureCard[];
}

export default function HomePage() {
  const { activeTheme } = useFestivalTheme();
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
    categoryCards: DEFAULT_CATEGORY_CARDS,
  });

  const heroGallery = [
    activeTheme?.festivalBannerUrl || (settings.heroImageUrl ? settings.heroImageUrl.replace(/\.(png|jpg)$/, '.webp') : '/images/raw_cashews_hero.webp'),
    '/images/royal_cashew_roastery.webp',
    settings.heroImageUrl ? settings.heroImageUrl.replace(/\.(png|jpg)$/, '.webp') : '/images/raw_cashews_hero.webp',
    '/images/raw-cashews-nuts-bowl-marble-background.webp',
    '/images/tandoori_cashews_hero.webp',
    '/images/cashew-nuts-ai-generated.webp',
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

  const displayHeroTitle = activeTheme?.heroHeadline || settings.heroTitle;
  const displayHeroSubtitle = activeTheme?.heroSubtitle || settings.heroSubtitle;
  const displayBadgeText = activeTheme?.heroBadge || 'Uppal Processing Hub • Wholesale & Retail Direct';

  // Dynamic Category Showcase Cards (from MongoDB or Fallback)
  const activeCategoryCards = (settings.categoryCards && settings.categoryCards.length > 0)
    ? settings.categoryCards.filter(c => c.isActive !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    : DEFAULT_CATEGORY_CARDS;

  const renderBadgeIcon = (iconName?: string) => {
    switch (iconName) {
      case 'flame': return <Flame className="w-3 h-3 text-rose-400" />;
      case 'gift': return <Gift className="w-3 h-3 text-amber-400" />;
      case 'package': return <Package className="w-3 h-3 text-emerald-400" />;
      case 'award': return <Award className="w-3 h-3 text-cyan-400" />;
      case 'tag': return <Tag className="w-3 h-3 text-amber-400" />;
      case 'star': return <Star className="w-3 h-3 text-amber-400" />;
      default: return <Sparkles className="w-3 h-3" style={{ color: 'var(--theme-primary, #D4AF37)' }} />;
    }
  };

  return (
    <div className="min-h-screen pb-20 space-y-12 sm:space-y-16 overflow-x-hidden w-full max-w-[100vw]">
      
      {/* 01 - HERO SHOWCASE SECTION */}
      <section className="relative pt-4 sm:pt-10 px-3 sm:px-6 lg:px-8 max-w-full">
        <div className="max-w-6xl mx-auto glass-panel p-5 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl relative overflow-hidden text-center space-y-6 sm:space-y-8">
          
          <div className="space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            {/* Trust / Festival Pill */}
            <div 
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full border text-[11px] sm:text-xs font-semibold max-w-full truncate shadow-sm"
              style={{
                backgroundColor: 'var(--theme-card-bg, rgba(255, 255, 255, 0.05))',
                borderColor: 'var(--theme-border, rgba(212, 175, 55, 0.3))',
                color: 'var(--theme-primary, #D4AF37)',
              }}
            >
              <span className="text-xs">{activeTheme?.icon || '✨'}</span>
              <span className="truncate">{displayBadgeText}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight sm:leading-tight tracking-tight break-words">
              {displayHeroTitle}
            </h1>

            <p className="text-xs sm:text-sm md:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
              {displayHeroSubtitle}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
              <Link
                href={settings.heroButtonLink || '#shop'}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 gold-cta-button text-xs font-black uppercase tracking-wider shadow-lg"
              >
                <span>{settings.heroButtonText || 'Explore Products'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>

              <a
                href="https://wa.me/919515273464"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-full border border-white/10 text-xs font-semibold opacity-90 hover:opacity-100 hover:bg-white/10 transition-all"
                style={{
                  backgroundColor: 'var(--theme-card-bg, rgba(255, 255, 255, 0.05))',
                  borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.1))',
                }}
              >
                <span>Bulk / Wholesale Desk</span>
              </a>
            </div>
          </div>

          {/* Hero Showcase Carousel */}
          <div className="relative max-w-4xl mx-auto pt-2">
            <button
              onClick={() => setHeroIndex((prev) => (prev === 0 ? heroGallery.length - 1 : prev - 1))}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-card-bg, rgba(11, 19, 35, 0.8))',
              }}
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            <div className="relative aspect-[16/10] sm:aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden shadow-elevated border border-white/10">
              <Image
                src={heroGallery[heroIndex] || '/images/raw_cashews_hero.webp'}
                alt="Sidhi Vinayaka Traders Gourmet Cashew Showcase"
                fill
                unoptimized
                className="object-cover transition-all duration-500"
                priority
              />
            </div>

            <button
              onClick={() => setHeroIndex((prev) => (prev === heroGallery.length - 1 ? 0 : prev + 1))}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-card-bg, rgba(11, 19, 35, 0.8))',
              }}
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            <div className="flex justify-center items-center space-x-2 pt-3 sm:pt-4">
              {heroGallery.map((_, dot) => (
                <button
                  key={dot}
                  onClick={() => setHeroIndex(dot)}
                  className="h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: heroIndex === dot ? 'var(--theme-primary, #D4AF37)' : 'rgba(150, 150, 150, 0.4)',
                    width: heroIndex === dot ? '24px' : '8px',
                  }}
                  aria-label={`Slide ${dot + 1}`}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 02 - DYNAMIC CATEGORY FEATURE SHOWCASE CARDS */}
      <section className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${activeCategoryCards.length === 1 ? 'md:grid-cols-1' : activeCategoryCards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'} gap-4 sm:gap-6`}>
          {activeCategoryCards.map((card) => {
            const isExternal = card.linkUrl?.startsWith('http');
            const CardWrapper = isExternal ? 'a' : Link;
            const linkProps = isExternal ? { href: card.linkUrl, target: '_blank', rel: 'noopener noreferrer' } : { href: card.linkUrl || '#shop' };

            return (
              <CardWrapper
                key={card.id}
                {...(linkProps as any)}
                className="group p-5 sm:p-8 rounded-2xl sm:rounded-3xl glass-card transition-all duration-300 cursor-pointer flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card hover:shadow-elevated"
                style={{
                  borderColor: card.accentColor ? `${card.accentColor}30` : undefined,
                }}
              >
                <div className="space-y-2 flex-1">
                  <div 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: card.accentColor ? `${card.accentColor}18` : 'rgba(212, 175, 55, 0.15)',
                      color: card.accentColor || 'var(--theme-primary, #D4AF37)',
                      border: `1px solid ${card.accentColor ? `${card.accentColor}35` : 'rgba(212, 175, 55, 0.3)'}`,
                    }}
                  >
                    {renderBadgeIcon(card.badgeIcon)}
                    <span>{card.badgeText}</span>
                  </div>

                  <h3 
                    className="font-heading font-black text-xl sm:text-2xl transition-colors group-hover:opacity-90"
                    style={{ color: 'var(--theme-text, #FFFFFF)' }}
                  >
                    {card.title}
                  </h3>

                  <p className="text-xs opacity-75 max-w-xs leading-relaxed">
                    {card.subtitle}
                  </p>

                  <span 
                    className="inline-flex items-center gap-1 text-xs font-bold pt-1 sm:pt-2" 
                    style={{ color: card.accentColor || 'var(--theme-primary, #D4AF37)' }}
                  >
                    <span>{card.linkText || 'Explore Selection'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                  </span>
                </div>

                <div className="relative w-full sm:w-36 h-36 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-md bg-black/20">
                  <Image
                    src={card.imageUrl || '/images/raw_cashews_hero.webp'}
                    alt={card.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* 03 - PRODUCT CATALOG GRID */}
      <section id="shop" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-3xl font-black font-heading">
              Signature Cashews Catalog
            </h2>
            <p className="text-xs opacity-75 mt-1">
              Select your pack size (250g, 500g, 1kg) or explore bulk wholesale orders.
            </p>
          </div>

          {/* Segmented Filter Control */}
          <div className="overflow-x-auto custom-scrollbar pb-1">
            <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as any)}>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="ALL">All Cashews</TabsTrigger>
                <TabsTrigger value="RAW">Raw Jumbo</TabsTrigger>
                <TabsTrigger value="FLAVORED">Flavoured</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Dynamic Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 04 - THE ROASTERY HERITAGE & VALUE PILLARS */}
      <section id="story" className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="glass-panel p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-3xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="gold">Sidhi Vinayaka Promise</Badge>
            <h2 className="text-2xl sm:text-4xl font-heading font-black">
              Pure Uppal Processing Excellence
            </h2>
            <p className="text-xs sm:text-sm opacity-80">
              Direct factory processing in Uppal, Hyderabad. Clean whole kernel grading without chemical bleaching or adulteration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl text-center space-y-3">
              <div className="w-16 h-16 mx-auto">
                <DirectFarmIllustration />
              </div>
              <h3 className="font-heading font-bold text-base">Direct Orchard Sourcing</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Partnered directly with trusted cashew growers for single-origin large white whole kernels.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl text-center space-y-3">
              <div className="w-16 h-16 mx-auto">
                <ZeroOilRoastingIllustration />
              </div>
              <h3 className="font-heading font-bold text-base">Zero-Oil Drum Roasting</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Even heat convection roasting preserves the natural crunchy sweetness without greasiness.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl text-center space-y-3">
              <div className="w-16 h-16 mx-auto">
                <QualityAssuredIllustration />
              </div>
              <h3 className="font-heading font-bold text-base">100% Quality Assured</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                Nitrogen-flushed vacuum pouch packing guarantees crisp crunch and freshness for months.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
