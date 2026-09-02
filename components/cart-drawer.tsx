'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { EmptyCartIllustration } from '@/components/illustrations';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
  const { items, isOpen, toggleCart, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => toggleCart(false)} 
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-navy-950 border-l border-white/10 shadow-2xl flex flex-col justify-between text-slate-100">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-navy-900/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <ShoppingBag className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-white">Your Cart</h2>
                <p className="text-xs text-slate-400">{totalItems} {totalItems === 1 ? 'item' : 'items'} selected</p>
              </div>
            </div>

            <button
              onClick={() => toggleCart(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-12 px-4 flex flex-col items-center">
                <EmptyCartIllustration className="w-44 h-44 mb-2" />
                <h3 className="text-base font-bold font-heading text-white">Your cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Discover our pure King Jumbo W180 and gourmet roast cashews fresh from Uppal.
                </p>
                <button
                  onClick={() => toggleCart(false)}
                  className="mt-5 px-5 py-2.5 gold-cta-button text-xs font-bold text-navy-950 rounded-xl shadow-sm"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center space-x-3.5 p-3.5 bg-navy-900/60 rounded-xl border border-white/5 transition-all hover:border-white/15"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-navy-950 shrink-0 border border-white/10">
                    <Image
                      src={item.image || "/images/raw_cashews_hero.webp"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{item.title}</h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-[#D4AF37] border border-[#D4AF37]/20 font-semibold">
                        {item.size}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">₹{item.price}</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center space-x-1 bg-navy-950 border border-white/10 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                        <span className="text-xs font-bold text-white w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-[#D4AF37] font-heading">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-navy-900/80 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-medium">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery (Uppal / Hyderabad)</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-[#D4AF37] font-heading text-base">₹{totalPrice}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => toggleCart(false)}
                className="w-full py-3 px-4 gold-cta-button text-navy-950 font-bold text-xs text-center rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
