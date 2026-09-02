'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/mock-data';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, Check, Flame, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.weightOptions[0] || '500g');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const getCalculatedPrice = (size: string) => {
    if (size === '1kg') return Math.round(product.price * 1.9);
    if (size === '5kg Wholesale') return Math.round(product.price * 9.2);
    return product.price;
  };

  const currentPrice = getCalculatedPrice(selectedSize);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product._id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      size: selectedSize,
      quantity: 1,
      price: currentPrice,
      image: product.images[0] || '',
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-navy-900/70 backdrop-blur-sm p-4 flex flex-col justify-between shadow-card hover:shadow-elevated hover:border-[#D4AF37]/30 transition-all duration-300">
      
      {/* Product Image Container */}
      <div className="relative aspect-square rounded-xl bg-navy-950/60 overflow-hidden mb-4 border border-white/5">
        <Link href={`/products/${product.slug || product._id}`}>
          <Image
            src={product.images[0] || "/images/raw_cashews_hero.webp"}
            alt={`${product.title} - Sidhi Vinayaka Traders Uppal`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Category / Grade Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
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
        </div>
      </div>

      {/* Info Body */}
      <div className="space-y-3.5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.slug || product._id}`}>
            <h3 className="font-heading font-semibold text-sm sm:text-base text-white group-hover:text-[#D4AF37] transition-colors leading-snug line-clamp-1">
              {product.title}
            </h3>
          </Link>
          
          <div className="flex items-baseline space-x-2 mt-1.5">
            <span className="text-lg font-extrabold text-white font-heading">₹{currentPrice}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{Math.round(product.originalPrice * (selectedSize === '1kg' ? 1.9 : 1))}
              </span>
            )}
            <span className="text-[10px] text-emerald-400 font-medium">In Stock</span>
          </div>
        </div>

        {/* Weight Pill Selection */}
        <div className="flex items-center space-x-1.5">
          {product.weightOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                selectedSize === size
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
          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-[#D4AF37] text-navy-950 hover:bg-[#E5C158] active:translate-y-0.5'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
              <span>ADDED TO CART</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-navy-950" strokeWidth={2} />
              <span>ADD TO CART</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
