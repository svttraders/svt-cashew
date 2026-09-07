'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/ui/safe-image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/product-card';
import { useCartStore } from '@/lib/cart-store';
import { Product, INITIAL_PRODUCTS } from '@/lib/mock-data';
import { 
  Star, ShoppingBag, Check, Flame, ArrowLeft, 
  ChevronRight, Minus, Plus, ShieldCheck, Truck, Sparkles,
  Heart, Zap, Shield, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProductDetailPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedSize, setSelectedSize] = useState<string>('500g');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        // Try direct single product endpoint
        const res = await fetch(`/api/products/${idOrSlug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedSize(data.product.weightOptions?.[0] || '500g');
        } else {
          // Fallback to searching mock data
          const found = INITIAL_PRODUCTS.find(
            (p) => p.slug === idOrSlug || p._id === idOrSlug
          );
          if (found) {
            setProduct(found);
            setSelectedSize(found.weightOptions?.[0] || '500g');
          }
        }

        // Fetch all products for related recommendations
        const allRes = await fetch('/api/products');
        const allData = await allRes.json();
        if (allData.success && allData.products) {
          setAllProducts(allData.products);
        }
      } catch (err) {
        console.warn('Fallback product detail:', err);
        const found = INITIAL_PRODUCTS.find(
          (p) => p.slug === idOrSlug || p._id === idOrSlug
        );
        if (found) {
          setProduct(found);
          setSelectedSize(found.weightOptions?.[0] || '500g');
        }
      } finally {
        setLoading(false);
      }
    }

    if (idOrSlug) {
      loadProduct();
    }
  }, [idOrSlug]);

  if (loading && !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 bg-navy-950 text-slate-100 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading gourmet cashew details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 bg-navy-950 text-slate-100 min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold font-heading text-white">Product Not Found</h2>
        <p className="text-xs text-slate-400">The cashew selection you requested could not be located.</p>
        <Link href="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-[#D4AF37] hover:underline pt-2">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const getCalculatedPrice = (size: string) => {
    if (size === '250g') return Math.round(product.price * 0.55);
    if (size === '1kg') return Math.round(product.price * 1.9);
    if (size === '2kg') return Math.round(product.price * 3.75);
    if (size === '5kg Wholesale') return Math.round(product.price * 9.2);
    return product.price;
  };

  const unitPrice = getCalculatedPrice(selectedSize);
  const totalPrice = unitPrice * quantity;

  const originalPrice = product.originalPrice || Math.round(product.price * 1.15);
  const calculatedOriginalPrice = Math.round(
    originalPrice * (selectedSize === '1kg' ? 1.9 : selectedSize === '250g' ? 0.55 : 1) * quantity
  );
  const discountPercent =
    product.discountPercent ||
    (originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0);

  const stock = product.stockQuantity ?? 100;
  const isLowStock = stock <= (product.lowStockThreshold ?? 15);

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      size: selectedSize,
      quantity: quantity,
      price: unitPrice,
      image: product.images[0] || '/images/raw_cashews_hero.webp',
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const relatedProducts = allProducts.filter(p => p._id !== product._id).slice(0, 3);

  return (
    <div className="bg-navy-950 min-h-screen text-slate-100 pb-20">
      
      {/* Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <Link href="/#shop" className="hover:text-white transition-colors">Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <span className="text-[#D4AF37] font-semibold">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
            {/* Left: Interactive Multi-Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden glass-panel p-2 border border-white/10 shadow-elevated group bg-navy-900">
                <SafeImage
                  src={product.images[activeImageIndex] || product.images[0] || "/images/raw_cashews_hero.webp"}
                  alt={`${product.title} view ${activeImageIndex + 1}`}
                  fill
                  className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
                  priority
                />

                {/* View Badge */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-[#D4AF37] shadow-md">
                    {activeImageIndex === 0 ? 'Primary Image' : `Gallery View 0${activeImageIndex + 1}`}
                  </span>
                  {product.badgeText && (
                    <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-navy-950 text-[11px] font-black uppercase shadow-md">
                      {product.badgeText}
                    </span>
                  )}
                </div>

                {/* Gallery Dots */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          activeImageIndex === idx ? 'bg-[#D4AF37] w-6' : 'bg-white/40 w-2 hover:bg-white/70'
                        }`}
                        aria-label={`Show image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {product.images.length > 1 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
                    <span>Product Views ({product.images.length} photos)</span>
                    <span className="text-[#D4AF37]">Click angle to switch</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-square rounded-xl overflow-hidden border bg-navy-900 transition-all ${
                          activeImageIndex === idx
                            ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-md scale-102'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/25'
                        }`}
                        aria-label={`Thumbnail ${idx + 1}`}
                      >
                        <SafeImage src={img} alt={`Angle ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          {/* Right: Product Specs & Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {product.category === 'RAW' ? (
                  <Badge variant="gold">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" strokeWidth={2} />
                    <span>Grade {product.grade || 'W180'} Supreme Raw</span>
                  </Badge>
                ) : (
                  <Badge variant="spice">
                    <Flame className="w-3 h-3 text-rose-400" strokeWidth={2} />
                    <span>Roasted {product.flavor || 'Masala'}</span>
                  </Badge>
                )}

                <span className={`text-xs font-semibold ${isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                  • {product.isAvailable ? (isLowStock ? `Low Stock (Only ${stock} kg left)` : 'In Stock (Uppal Direct)') : 'Temporarily Out of Stock'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
                {product.title}
              </h1>

              {/* Ratings */}
              <div className="flex items-center space-x-2 pt-1">
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {product.rating || 5.0} ({product.reviewsCount || 180} verified reviews)
                </span>
              </div>
            </div>

            {/* Price Showcase with Discount Badge */}
            <div className="flex items-baseline space-x-3 p-4 rounded-2xl bg-navy-900/80 border border-white/10 shadow-md">
              <span className="text-3xl sm:text-4xl font-black text-white font-heading">₹{totalPrice}</span>
              {calculatedOriginalPrice > totalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  ₹{calculatedOriginalPrice}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  {discountPercent}% OFF
                </span>
              )}
              <span className="text-xs text-[#D4AF37] font-semibold ml-auto">
                ₹{Math.round(unitPrice / (selectedSize === '1kg' ? 1000 : selectedSize === '250g' ? 250 : 500) * 100)} per 100g
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Health Benefits Highlights */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="p-4 rounded-2xl bg-navy-900/60 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Key Quality & Health Benefits</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {product.benefits.map((b, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SPICE BREAKDOWN MODULE */}
            {product.spiceBreakdown && product.spiceBreakdown.length > 0 && (
              <div className="p-5 rounded-2xl border border-white/10 bg-navy-900/60 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Authentic Spice Profile
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {product.spiceBreakdown.map((spice, idx) => (
                    <div key={idx} className="bg-navy-950/80 p-2.5 rounded-xl border border-white/5 text-center space-y-1">
                      <div className="relative w-9 h-9 mx-auto rounded-full overflow-hidden border border-white/10">
                        <Image src={spice.image || "/images/tandoori_cashews_hero.webp"} alt={spice.name} fill className="object-cover" />
                      </div>
                      <h4 className="text-[11px] font-semibold text-[#D4AF37] truncate">{spice.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{spice.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weight Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Pack Size
              </label>
              <div className="flex flex-wrap gap-2.5">
                {(product.weightOptions || ['250g', '500g', '1kg']).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedSize(opt)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                      selectedSize === opt
                        ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] font-bold shadow-sm'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 bg-navy-900/80 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-navy-950 text-slate-200 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                  <span className="px-3 font-bold text-white text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-navy-950 text-slate-200 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable}
                  className={`flex-1 py-3.5 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg rounded-xl transition-all ${
                    !product.isAvailable
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'gold-cta-button text-navy-950'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-navy-950" strokeWidth={2.5} />
                      <span>ADDED TO CART</span>
                    </>
                  ) : !product.isAvailable ? (
                    <span>OUT OF STOCK</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-navy-950" strokeWidth={2} />
                      <span>ADD TO CART • ₹{totalPrice}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Assurances */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.75} />
                  <span>100% Genuine Uppal Counter Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-[#D4AF37]" strokeWidth={1.75} />
                  <span>Express Dispatch & Razorpay Secured</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        <div className="pt-10 border-t border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-heading text-white">Recommended Cashews</h3>
            <Link href="/#shop" className="text-xs font-semibold text-[#D4AF37] hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
