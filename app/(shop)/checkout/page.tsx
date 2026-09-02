'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { 
  ChevronRight, CheckCircle, Ticket, Tag, ArrowLeft, 
  ShieldCheck, Truck, CreditCard, Banknote, Smartphone 
} from 'lucide-react';
import { EmptyCartIllustration } from '@/components/illustrations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = 0;
  const orderTotal = Math.max(0, subtotal - discountAmount);

  const [formData, setFormData] = useState({
    name: 'A Kumar',
    phone: '+91 9515273464',
    address: '1-53/6 Surya Nagar Colony, Uppal',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500039',
    paymentMethod: 'UPI' as 'UPI' | 'COD' | 'CARD',
  });

  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.toUpperCase().trim();
    if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (code === 'SVTDIWALI') {
      setDiscountPercent(15);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 or SVTDIWALI');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          colony: 'Surya Nagar Colony',
          city: formData.city,
          pincode: formData.pincode,
        },
        items: items.map((item) => ({
          productId: item.productId,
          title: item.title,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: orderTotal,
        paymentMethod: formData.paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setConfirmedOrder(data.order);
        clearCart();
      }
    } catch (err) {
      console.error('Order checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-navy-950 text-slate-100 flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyCartIllustration className="w-48 h-48 mb-2" />
        <h2 className="text-2xl font-bold font-heading text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Add gourmet raw or roasted cashews to your cart to proceed with checkout.</p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3 gold-cta-button text-xs font-bold text-navy-950 uppercase tracking-wider shadow-lg mt-2"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  if (confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 bg-navy-950 text-slate-100">
        <div className="w-16 h-16 bg-[#D4AF37] text-navy-950 rounded-2xl flex items-center justify-center mx-auto shadow-elevated">
          <CheckCircle className="w-8 h-8" strokeWidth={2} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">Order Confirmed!</h1>
          <p className="text-xs text-slate-400">
            Thank you for ordering with Sidhi Vinayaka Traders.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-navy-900/80 border border-white/10 max-w-sm mx-auto text-xs space-y-1">
          <p className="text-slate-400">Order ID</p>
          <p className="text-sm font-mono font-bold text-[#D4AF37]">{confirmedOrder.orderId || confirmedOrder._id}</p>
        </div>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Our dispatch team at Surya Nagar Colony, Uppal will pack and process your order shortly.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 gold-cta-button text-xs font-bold text-navy-950 uppercase tracking-wider"
        >
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-navy-950 min-h-screen text-slate-100 pb-20">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <span className="text-[#D4AF37] font-semibold">Secure Checkout</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white mt-2">Delivery & Order Review</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping & Details */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-elevated">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold font-heading text-white">
                Delivery Address
              </h2>
              <span className="text-[11px] text-[#D4AF37] font-semibold">Uppal & Hyderabad Delivery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Street Address / House No.</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pincode</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', label: 'UPI QR / App', icon: Smartphone },
                  { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                  { id: 'CARD', label: 'Cards / NetBanking', icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, paymentMethod: pm.id as any })}
                      className={`p-3 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center justify-center gap-1.5 ${
                        formData.paymentMethod === pm.id
                          ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] font-bold shadow-sm'
                          : 'bg-navy-950 text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.75} />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon Code */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-3xl space-y-5 shadow-elevated">
              <h3 className="font-bold font-heading text-base text-white border-b border-white/10 pb-3">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items Breakdown */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-navy-950/80 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-navy-900">
                        <Image src={item.image || "/images/raw_cashews_hero.webp"} alt={item.title} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate max-w-[140px]">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.size} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#D4AF37] font-heading">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Application Box */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.75} />
                  <span>Promo Coupon Code</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-navy-950 text-xs text-white uppercase focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold rounded-xl transition-colors border border-white/10"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] font-semibold text-emerald-400">Coupon applied! {discountPercent}% discount active.</p>
                )}
                {couponError && (
                  <p className="text-[11px] font-semibold text-rose-400">{couponError}</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery (Uppal / Hyderabad)</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-[#D4AF37] font-heading">₹{orderTotal}</span>
                </div>
              </div>

              {/* Big Gold Place Order CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 gold-cta-button font-bold text-xs uppercase tracking-wider shadow-xl mt-2 text-navy-950 transition-all"
              >
                {loading ? 'Processing Order...' : `PLACE ORDER • ₹${orderTotal}`}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
