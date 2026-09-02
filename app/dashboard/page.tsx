'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  Package, LogOut, User as UserIcon, Heart, ShoppingBag, ArrowRight,
  MapPin, Star, Ticket, Printer, Truck, CheckCircle2, Clock, Circle,
  ChevronRight, Bell, Shield, Edit2, Phone, Mail, MessageSquare,
  ChevronDown, AlertCircle, RefreshCw
} from 'lucide-react';

const SUPER_ADMIN_EMAILS = ['pa0174492@gmail.com', 'sahuravindra897@gmail.com'];

type TabId = 'overview' | 'orders' | 'track' | 'coupons' | 'invoices' | 'profile' | 'wishlist';

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING:    { color: 'bg-amber-900/60 text-amber-300 border-amber-500/40',   label: 'Pending' },
  PROCESSING: { color: 'bg-blue-900/60 text-blue-300 border-blue-500/40',      label: 'Processing' },
  SHIPPED:    { color: 'bg-indigo-900/60 text-indigo-300 border-indigo-500/40', label: 'Shipped' },
  DELIVERED:  { color: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40', label: 'Delivered' },
};

const MOCK_ORDERS = [
  {
    _id: 'ord1',
    orderId: 'SVT-8801',
    date: '2026-08-11',
    items: [
      { title: 'W180 King Jumbo Raw Cashew', size: '1kg', quantity: 1, price: 900, image: '/images/raw_cashews_hero.png' },
      { title: 'Peri Peri Masala Cashew', size: '500g', quantity: 2, price: 440, image: '/images/tandoori_cashews_hero.png' },
    ],
    totalAmount: 1780,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DELIVERED',
    trackingNumber: 'SVT-TRK-88012026',
    courierPartner: 'Uppal Express Delivery',
    estimatedDelivery: '2026-08-13',
  },
  {
    _id: 'ord2',
    orderId: 'SVT-8802',
    date: '2026-08-20',
    items: [
      { title: 'Tandoori Masala Cashew', size: '1kg', quantity: 1, price: 880, image: '/images/tandoori_cashews_hero.png' },
    ],
    totalAmount: 880,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    fulfillmentStatus: 'PROCESSING',
    trackingNumber: null,
    courierPartner: null,
    estimatedDelivery: '2026-08-25',
  },
];

const MOCK_COUPONS = [
  { code: 'WELCOME10', discountPercent: 10, minOrderAmount: 500, expiresAt: '2026-12-31', isActive: true, description: 'Welcome Discount — 10% off your order' },
  { code: 'SVTDIWALI', discountPercent: 15, minOrderAmount: 1000, expiresAt: '2026-11-15', isActive: true, description: 'Diwali Special — 15% off on orders above ₹1000' },
];

const ORDER_TIMELINE = [
  { key: 'PENDING',    label: 'Order Placed',    icon: ShoppingBag,   desc: 'Your order has been received.' },
  { key: 'PROCESSING', label: 'Processing',       icon: RefreshCw,     desc: 'Being prepared at our Uppal warehouse.' },
  { key: 'SHIPPED',    label: 'Out for Delivery', icon: Truck,          desc: 'On the way to your location.' },
  { key: 'DELIVERED',  label: 'Delivered',         icon: CheckCircle2,  desc: 'Delivered successfully. Enjoy!' },
];

function getTimelineStep(status: string) {
  const idx = ORDER_TIMELINE.findIndex(t => t.key === status);
  return idx === -1 ? 0 : idx;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'overview');
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const [loading, setLoading] = useState(true);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(MOCK_ORDERS[0]);
  const [invoiceOrder, setInvoiceOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);
  const [reviewModal, setReviewModal] = useState<typeof MOCK_ORDERS[0] | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!auth) { setLoading(false); return; }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);

      const email = currentUser.email?.toLowerCase() || '';
      if (SUPER_ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        router.push('/admin/dashboard');
        return;
      }

      // Load real orders if available
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && data.orders?.length > 0) setOrders(data.orders);
      } catch { /* use mock */ }

      // Load coupons
      try {
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        if (data.success && data.coupons?.length > 0) setCoupons(data.coupons);
      } catch { /* use mock */ }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    router.push('/');
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141E30] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black text-[#D4AF37] tracking-widest uppercase">Loading Your Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'Customer';
  const initials = displayName.slice(0, 2).toUpperCase();
  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const deliveredCount = orders.filter(o => o.fulfillmentStatus === 'DELIVERED').length;
  const pendingCount = orders.filter(o => o.fulfillmentStatus !== 'DELIVERED').length;

  const TABS: { id: TabId; label: string; icon: any; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',      icon: UserIcon },
    { id: 'orders',    label: 'My Orders',     icon: Package,      badge: orders.length },
    { id: 'track',     label: 'Track Order',   icon: Truck },
    { id: 'coupons',   label: 'My Coupons',    icon: Ticket,       badge: coupons.length },
    { id: 'invoices',  label: 'Invoices',      icon: Printer },
    { id: 'profile',   label: 'Profile',       icon: Edit2 },
    { id: 'wishlist',  label: 'Wishlist',      icon: Heart },
  ];

  return (
    <div className="bg-[#141E30] min-h-screen text-slate-100">

      {/* ── PROFILE HERO ── */}
      <div className="bg-gradient-to-br from-[#0A111E] via-[#141E30] to-[#1a2642] border-b border-[#D4AF37]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            {user.photoURL ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl shrink-0">
                <Image src={user.photoURL} alt={displayName} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B48328] text-[#141E30] font-black text-3xl flex items-center justify-center shadow-2xl shrink-0">
                {initials}
              </div>
            )}

            <div className="text-center sm:text-left flex-1 space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-[10px] font-black text-[#D4AF37] uppercase">
                  Customer
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#0A111E] border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-950/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-[#0A111E]/80 border border-[#D4AF37]/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#D4AF37]">{orders.length}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Total Orders</p>
            </div>
            <div className="bg-[#0A111E]/80 border border-emerald-500/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-400">{deliveredCount}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Delivered</p>
            </div>
            <div className="bg-[#0A111E]/80 border border-[#D4AF37]/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-white">₹{totalSpent.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 pb-20">

        {/* ── LEFT SIDEBAR TABS ── */}
        <aside className="lg:w-56 shrink-0">
          <nav className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-2xl overflow-hidden">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-xs font-bold transition-all border-b border-[#D4AF37]/10 last:border-0 ${
                    activeTab === tab.id
                      ? 'bg-[#D4AF37] text-[#141E30] font-black'
                      : 'text-slate-300 hover:text-[#D4AF37] hover:bg-[#141E30]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-[#141E30] text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Shop Button */}
          <Link
            href="/#shop"
            className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-3 gold-pill-button text-xs font-black uppercase tracking-wider"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Cashews</span>
          </Link>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">Dashboard Overview</h2>

              {/* Recent Order Card */}
              {orders.length > 0 && (
                <div className="frosted-glass-navy rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#D4AF37]">Latest Order</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[11px] text-slate-400 hover:text-[#D4AF37] flex items-center space-x-1">
                      <span>View All</span><ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-black text-white text-sm">#{orders[0].orderId}</p>
                      <p className="text-[11px] text-slate-400">{orders[0].date} • {orders[0].items.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#D4AF37] text-sm">₹{orders[0].totalAmount}/-</p>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${STATUS_CONFIG[orders[0].fulfillmentStatus]?.color}`}>
                        {STATUS_CONFIG[orders[0].fulfillmentStatus]?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon Highlight */}
              {coupons.length > 0 && (
                <div className="frosted-glass-navy rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-[#D4AF37]">Available Coupons</h3>
                    <button onClick={() => setActiveTab('coupons')} className="text-[11px] text-slate-400 hover:text-[#D4AF37] flex items-center space-x-1">
                      <span>See All</span><ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-[#0A111E] border border-dashed border-[#D4AF37]/50 rounded-xl px-4 py-3">
                    <div>
                      <p className="font-mono font-black text-[#D4AF37]">{coupons[0].code}</p>
                      <p className="text-[11px] text-slate-400">{coupons[0].discountPercent}% off • Min ₹{coupons[0].minOrderAmount}</p>
                    </div>
                    <button
                      onClick={() => copyCoupon(coupons[0].code)}
                      className="px-3 py-1.5 bg-[#D4AF37] text-[#141E30] text-[10px] font-black rounded-lg"
                    >
                      {copied === coupons[0].code ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { tab: 'orders'   as TabId, label: 'Order History',  icon: Package,   sub: `${orders.length} orders` },
                  { tab: 'track'    as TabId, label: 'Track Order',    icon: Truck,     sub: `${pendingCount} active` },
                  { tab: 'invoices' as TabId, label: 'My Invoices',    icon: Printer,   sub: 'Download PDFs' },
                  { tab: 'wishlist' as TabId, label: 'My Wishlist',    icon: Heart,     sub: 'Saved Items' },
                ].map(({ tab, label, icon: Icon, sub }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="frosted-glass-navy p-4 rounded-2xl text-left hover:border-[#D4AF37]/50 transition-all border border-[#D4AF37]/20 space-y-2 group"
                  >
                    <Icon className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-xs font-black text-white">{label}</p>
                      <p className="text-[10px] text-slate-400">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── MY ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">Order History</h2>

              {orders.length === 0 ? (
                <div className="frosted-glass-navy p-12 rounded-2xl text-center space-y-4">
                  <ShoppingBag className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <p className="text-slate-300">No orders yet.</p>
                  <Link href="/#shop" className="inline-block px-6 py-3 gold-pill-button text-xs uppercase font-black">Shop Now</Link>
                </div>
              ) : orders.map((order) => (
                <div key={order._id} className="frosted-glass-navy p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/20 space-y-4">
                  {/* Order Header */}
                  <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div>
                      <p className="font-mono font-black text-[#D4AF37]">#{order.orderId}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Placed on {order.date}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${STATUS_CONFIG[order.fulfillmentStatus]?.color}`}>
                        {STATUS_CONFIG[order.fulfillmentStatus]?.label}
                      </span>
                      <span className="text-sm font-black text-[#D4AF37]">₹{order.totalAmount}/-</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 border-t border-[#D4AF37]/15 pt-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-[#D4AF37]/30 shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.size} × {item.quantity}</p>
                        </div>
                        <p className="text-xs font-black text-[#D4AF37] shrink-0">₹{item.price * item.quantity}/-</p>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-[#D4AF37]/15 pt-3">
                    <button
                      onClick={() => { setSelectedTrackOrder(order); setActiveTab('track'); }}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0A111E] border border-[#D4AF37]/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0A111E] border border-[#D4AF37]/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                    {order.fulfillmentStatus === 'DELIVERED' && (
                      <button
                        onClick={() => { setReviewModal(order); setReviewRating(5); setReviewText(''); }}
                        className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-xl text-[11px] font-bold text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TRACK ORDER TAB ── */}
          {activeTab === 'track' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">Track Your Order</h2>

              {/* Order Selector */}
              <div className="frosted-glass-navy p-4 rounded-2xl space-y-3">
                <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">Select Order</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {orders.map((o) => (
                    <button
                      key={o._id}
                      onClick={() => setSelectedTrackOrder(o)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all border ${
                        selectedTrackOrder._id === o._id
                          ? 'bg-[#D4AF37] text-[#141E30] border-[#D4AF37]'
                          : 'bg-[#0A111E] text-slate-300 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                      }`}
                    >
                      <p className="font-mono font-black">#{o.orderId}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">{o.date} • ₹{o.totalAmount}/-</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline */}
              {selectedTrackOrder && (
                <div className="frosted-glass-navy p-6 rounded-2xl space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono font-black text-[#D4AF37]">#{selectedTrackOrder.orderId}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Ordered: {selectedTrackOrder.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Est. Delivery</p>
                      <p className="text-xs font-black text-white">{selectedTrackOrder.estimatedDelivery}</p>
                    </div>
                  </div>

                  {/* Courier Info */}
                  {selectedTrackOrder.trackingNumber && (
                    <div className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-xl p-4 flex items-center space-x-4">
                      <Truck className="w-5 h-5 text-[#D4AF37] shrink-0" />
                      <div>
                        <p className="text-xs font-black text-white">{selectedTrackOrder.courierPartner}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Tracking: {selectedTrackOrder.trackingNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Visual Timeline */}
                  <div className="relative pl-6 space-y-0">
                    {ORDER_TIMELINE.map((step, idx) => {
                      const currentStep = getTimelineStep(selectedTrackOrder.fulfillmentStatus);
                      const isDone = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="relative flex items-start space-x-4 pb-7 last:pb-0">
                          {/* Connector Line */}
                          {idx < ORDER_TIMELINE.length - 1 && (
                            <div className={`absolute left-[-13px] top-6 w-0.5 h-full ${isDone ? 'bg-[#D4AF37]' : 'bg-slate-700'}`} />
                          )}

                          {/* Step Dot */}
                          <div className={`absolute left-[-20px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                            isDone ? 'bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'bg-[#0A111E] border-slate-600'
                          }`}>
                            <Icon className={`w-3 h-3 ${isDone ? 'text-[#141E30]' : 'text-slate-500'}`} />
                          </div>

                          <div className={`pt-0.5 ${isCurrent ? 'opacity-100' : isDone ? 'opacity-80' : 'opacity-40'}`}>
                            <p className={`text-xs font-black ${isCurrent ? 'text-[#D4AF37]' : isDone ? 'text-white' : 'text-slate-500'}`}>
                              {step.label}
                              {isCurrent && <span className="ml-2 text-[9px] bg-[#D4AF37] text-[#141E30] px-1.5 py-0.5 rounded-full font-black">CURRENT</span>}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── COUPONS TAB ── */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">My Coupons & Offers</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="frosted-glass-navy rounded-2xl overflow-hidden border border-[#D4AF37]/30"
                  >
                    {/* Coupon Top */}
                    <div className="bg-gradient-to-r from-[#0A111E] to-[#141E30] px-5 py-4 border-b border-dashed border-[#D4AF37]/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-2xl font-black text-[#D4AF37]">{coupon.discountPercent}% OFF</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Min order ₹{coupon.minOrderAmount}</p>
                        </div>
                        <Ticket className="w-8 h-8 text-[#D4AF37]/30" />
                      </div>
                    </div>

                    {/* Coupon Bottom */}
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed">{coupon.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 bg-[#0A111E] border border-dashed border-[#D4AF37]/50 rounded-lg px-3 py-1.5">
                          <span className="font-mono font-black text-sm text-[#D4AF37] tracking-widest">{coupon.code}</span>
                        </div>
                        <button
                          onClick={() => copyCoupon(coupon.code)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${
                            copied === coupon.code
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#D4AF37] text-[#141E30] hover:brightness-110'
                          }`}
                        >
                          {copied === coupon.code ? '✓ Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      {coupon.expiresAt && (
                        <p className="text-[10px] text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Valid till {coupon.expiresAt}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="frosted-glass-navy p-5 rounded-2xl border border-[#D4AF37]/20 text-center space-y-2">
                <p className="text-xs text-slate-400">Apply coupon codes at checkout to save on your order.</p>
                <Link href="/checkout" className="inline-block px-6 py-2.5 gold-pill-button text-xs font-black uppercase">
                  Go to Checkout
                </Link>
              </div>
            </div>
          )}

          {/* ── INVOICES TAB ── */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">My Invoices</h2>

              {orders.length === 0 ? (
                <div className="frosted-glass-navy p-12 rounded-2xl text-center space-y-4">
                  <Printer className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <p className="text-slate-300">No invoices yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="frosted-glass-navy p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <p className="font-mono font-black text-[#D4AF37] text-sm">#{order.orderId}</p>
                        <p className="text-[11px] text-slate-400">{order.date} • ₹{order.totalAmount}/- • {order.paymentMethod}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${STATUS_CONFIG[order.fulfillmentStatus]?.color}`}>
                          {STATUS_CONFIG[order.fulfillmentStatus]?.label}
                        </span>
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          className="flex items-center space-x-1.5 px-4 py-2 gold-pill-button text-[11px] font-black"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Download / Print</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">My Profile</h2>

              <div className="frosted-glass-navy p-6 rounded-2xl space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider block">Full Name</label>
                    <div className="px-4 py-3 bg-[#0A111E] rounded-xl border border-[#D4AF37]/20 text-sm font-semibold text-white flex items-center space-x-2">
                      <UserIcon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{user.displayName || '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider block">Email</label>
                    <div className="px-4 py-3 bg-[#0A111E] rounded-xl border border-[#D4AF37]/20 text-sm font-semibold text-white flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider block">Account Role</label>
                    <div className="px-4 py-3 bg-[#0A111E] rounded-xl border border-[#D4AF37]/20 text-sm font-black text-[#D4AF37] flex items-center space-x-2">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span>Customer</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider block">Account Status</label>
                    <div className="px-4 py-3 bg-[#0A111E] rounded-xl border border-emerald-500/30 text-sm font-black text-emerald-400 flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Active & Verified</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#D4AF37]/20 pt-4 space-y-2">
                  <h4 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-wider">Default Delivery Address</h4>
                  <div className="flex items-start space-x-3 px-4 py-3 bg-[#0A111E] rounded-xl border border-[#D4AF37]/20">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 space-y-0.5">
                      <p className="font-bold text-white">Uppal Delivery Zone</p>
                      <p>Surya Nagar Colony, Uppal, Hyderabad — 500039</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── WISHLIST TAB ── */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black font-display text-[#D4AF37]">My Wishlist</h2>
              <div className="frosted-glass-navy p-14 rounded-2xl text-center space-y-5">
                <Heart className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                <div>
                  <p className="text-slate-200 font-bold">No saved items yet</p>
                  <p className="text-xs text-slate-400 mt-1">Browse products and tap the heart icon to save favourites.</p>
                </div>
                <Link href="/#shop" className="inline-block px-8 py-3 gold-pill-button text-xs uppercase font-black">
                  Explore Products
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── PRINTABLE INVOICE MODAL ── */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white text-slate-900 w-full max-w-xl p-8 rounded-3xl space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black font-display text-[#141E30]">SIDHI VINAYAKA TRADERS</h2>
                <p className="text-[11px] text-slate-500">Surya Nagar Colony, Uppal, Hyderabad - 500039</p>
                <p className="text-[11px] text-slate-500">Ph: +91 9515273464 / +91 8919620379</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-[#D4AF37]">TAX INVOICE</p>
                <p className="text-xs font-mono font-bold text-slate-700">#{invoiceOrder.orderId}</p>
                <p className="text-[11px] text-slate-500">{invoiceOrder.date}</p>
              </div>
            </div>

            <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-xs space-y-0.5">
              <p className="font-black text-slate-900">Billed To:</p>
              <p className="font-bold">{user.displayName || user.email?.split('@')[0]}</p>
              <p>{user.email}</p>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-2 px-3">Item</th>
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Qty</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoiceOrder.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-bold">{it.title}</td>
                    <td className="py-2 px-3">{it.size}</td>
                    <td className="py-2 px-3">{it.quantity}</td>
                    <td className="py-2 px-3 text-right font-bold">₹{it.price * it.quantity}/-</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-black text-sm border-t-2 border-slate-900 pt-3">
              <span>Total ({invoiceOrder.paymentMethod} — {invoiceOrder.paymentStatus})</span>
              <span className="text-[#D4AF37] text-lg">₹{invoiceOrder.totalAmount}/-</span>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setInvoiceOrder(null)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">
                Close
              </button>
              <button onClick={() => window.print()} className="px-5 py-2 bg-[#141E30] text-[#D4AF37] text-xs font-black rounded-xl flex items-center space-x-1.5">
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW MODAL ── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="frosted-glass-navy w-full max-w-md p-6 rounded-3xl space-y-5 border border-[#D4AF37]/40">
            <h3 className="text-lg font-black font-display text-[#D4AF37]">Write a Review</h3>
            <p className="text-xs text-slate-300">Order #{reviewModal.orderId}</p>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#D4AF37] uppercase">Your Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setReviewRating(r)}>
                    <Star className={`w-7 h-7 transition-colors ${r <= reviewRating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#D4AF37] uppercase">Your Review</label>
              <textarea
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with our cashews..."
                className="w-full px-4 py-3 bg-[#0A111E] border border-[#D4AF37]/30 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-2.5 bg-[#0A111E] border border-[#D4AF37]/20 rounded-xl text-xs font-bold text-slate-300">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: user.displayName || user.email?.split('@')[0],
                      email: user.email,
                      type: 'REVIEW',
                      message: reviewText,
                      rating: reviewRating,
                    }),
                  }).catch(() => {});
                  setReviewModal(null);
                }}
                className="flex-1 py-2.5 gold-pill-button text-xs font-black uppercase"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141E30] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
