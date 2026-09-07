'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/ui/safe-image';
import { Product } from '@/lib/mock-data';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, Check, Flame, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const availableWeights =
    Array.isArray(product?.weightOptions) && product.weightOptions.length > 0
      ? product.weightOptions
      : ['250g', '500g', '1kg'];

  const [selectedSize, setSelectedSize] = useState<string>(availableWeights[0] || '500g');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const getCalculatedPrice = (size: string) => {
    const basePrice = Number(product?.price) || 880;
    if (size === '250g') return Math.round(basePrice * 0.55);
    if (size === '1kg') return Math.round(basePrice * 1.9);
    if (size === '2kg') return Math.round(basePrice * 3.75);
    if (size === '5kg Wholesale') return Math.round(basePrice * 9.2);
    return basePrice;
  };

  const currentPrice = getCalculatedPrice(selectedSize);
  const originalPrice = product?.originalPrice || Math.round((Number(product?.price) || 880) * 1.15);
  const calculatedOriginalPrice = Math.round(
    originalPrice * (selectedSize === '1kg' ? 1.9 : selectedSize === '250g' ? 0.55 : 1)
  );

  const discountPercent =
    product?.discountPercent ||
    (calculatedOriginalPrice > currentPrice
      ? Math.round(((calculatedOriginalPrice - currentPrice) / calculatedOriginalPrice) * 100)
      : 0);

  const primaryImage =
    (product?.images && product.images.length > 0 && product.images[0]) ||
    '/images/raw_cashews_hero.webp';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;

    addItem({
      productId: product._id || product.id || `prod_${Date.now()}`,
      title: product.title || 'Gourmet Cashews',
      slug: product.slug || product._id || 'cashews',
      category: product.category || 'RAW',
      size: selectedSize,
      quantity: 1,
      price: currentPrice,
      image: primaryImage,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-navy-900/70 backdrop-blur-sm p-4 flex flex-col justify-between shadow-card hover:shadow-elevated hover:border-[#D4AF37]/40 transition-all duration-300">

      {/* Product Image Container */}
      <div className="relative aspect-square rounded-xl bg-navy-950/60 overflow-hidden mb-4 border border-white/5">
        <Link href={`/products/${product.slug || product._id}`}>
          <SafeImage
            src={primaryImage}
            alt={`${product.title} - Sidhi Vinayaka Traders Uppal`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            priority={priority}
          />
        </Link>

        {/* Category / Grade Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1">
          {product.category === 'RAW' ? (
            <Badge variant="gold" className="shadow-sm">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" strokeWidth={2} />
              <span>Grade {product.grade || 'W180'}</span>
            </Badge>
          ) : (
            <Badge variant="spice" className="shadow-sm">
              <Flame className="w-3 h-3 text-rose-400" strokeWidth={2} />
              <span>{product.flavor || 'Masala'}</span>
            </Badge>
          )}

          {product.badgeText && (
            <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-navy-950 text-[9px] font-black uppercase shadow-md">
              {product.badgeText}
            </span>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.slug || product._id}`}>
            <h3 className="font-heading font-semibold text-sm sm:text-base text-white group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-1">
              {product.title}
            </h3>
          </Link>

          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-lg font-extrabold text-[#D4AF37] font-heading">₹{currentPrice}</span>
            {calculatedOriginalPrice > currentPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{calculatedOriginalPrice}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {discountPercent}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Weight Pill Selection */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {availableWeights.map((size) => (
            <button
              key={size}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedSize(size);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${selectedSize === size
                  ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-sm font-bold'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Add to Cart Action */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md ${added
              ? 'bg-emerald-600 text-white'
              : 'gold-cta-button text-navy-950 active:scale-98'
            }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span>ADDED TO CART ✓</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-navy-950" strokeWidth={2} />
              <span>ADD TO CART • ₹{currentPrice}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
