'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useCartStore } from '@/lib/cart-store';
import {
  Package, LogOut, User as UserIcon, Heart, ShoppingBag, ArrowRight,
  MapPin, Star, Ticket, Printer, Truck, CheckCircle2, Clock, Circle,
  ChevronRight, Bell, Shield, Edit2, Phone, Mail, MessageSquare,
  ChevronDown, AlertCircle, RefreshCw, Crown, ShieldCheck, Sparkles,
  Copy, Check, ExternalLink, Award, Gift, ArrowUpRight, CheckCircle
} from 'lucide-react';

const SUPER_ADMIN_EMAILS = ['pa0174492@gmail.com', 'sahuravindra897@gmail.com'];

type TabId = 'overview' | 'orders' | 'track' | 'coupons' | 'invoices' | 'profile' | 'wishlist';

const STATUS_CONFIG: Record<string, { color: string; label: string; badgeBg: string }> = {
  PENDING:    { color: 'text-amber-400 border-amber-500/40',   badgeBg: 'bg-amber-950/80', label: 'Pending Confirmation' },
  PROCESSING: { color: 'text-blue-400 border-blue-500/40',     badgeBg: 'bg-blue-950/80',  label: 'Roastery Processing' },
  SHIPPED:    { color: 'text-indigo-400 border-indigo-500/40', badgeBg: 'bg-indigo-950/80', label: 'Out for Delivery' },
  DELIVERED:  { color: 'text-emerald-400 border-emerald-500/40', badgeBg: 'bg-emerald-950/80', label: 'Delivered' },
};

const MOCK_ORDERS = [
  {
    _id: 'ord1',
    orderId: 'SVT-8801',
    date: '2026-08-11',
    items: [
      { productId: 'p1', title: 'W180 King Jumbo Raw Cashew', size: '1kg', quantity: 1, price: 900, image: '/images/raw_cashews_hero.webp' },
      { productId: 'p2', title: 'Peri Peri Gourmet Cashew', size: '500g', quantity: 2, price: 440, image: '/images/tandoori_cashews_hero.webp' },
    ],
    totalAmount: 1780,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DELIVERED',
    trackingNumber: 'SVT-TRK-88012026',
    courierPartner: 'Uppal Express Roastery Dispatch',
    estimatedDelivery: '2026-08-13',
  },
  {
    _id: 'ord2',
    orderId: 'SVT-8802',
    date: '2026-08-20',
    items: [
      { productId: 'p3', title: 'Tandoori Masala Artisanal Cashew', size: '1kg', quantity: 1, price: 880, image: '/images/tandoori_cashews_hero.webp' },
    ],
    totalAmount: 880,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    fulfillmentStatus: 'PROCESSING',
    trackingNumber: 'SVT-TRK-88029901',
    courierPartner: 'Hyderabad Local Direct',
    estimatedDelivery: '2026-08-25',
  },
];

const MOCK_COUPONS = [
  { code: 'WELCOME10', discountPercent: 10, minOrderAmount: 500, expiresAt: '2026-12-31', isActive: true, description: 'Welcome VIP Offer — 10% discount on entire cart.' },
  { code: 'SVTDIWALI', discountPercent: 15, minOrderAmount: 1000, expiresAt: '2026-11-15', isActive: true, description: 'Festive Season Special — 15% discount on orders above ₹1,000.' },
  { code: 'JUMBO20', discountPercent: 20, minOrderAmount: 2500, expiresAt: '2026-10-30', isActive: true, description: 'Wholesale & Bulk Bonus — 20% discount on orders above ₹2,500.' },
];

const ORDER_TIMELINE = [
  { key: 'PENDING',    label: 'Order Placed',        icon: ShoppingBag,   desc: 'Order received and logged in system.' },
  { key: 'PROCESSING', label: 'Roastery Processing',  icon: RefreshCw,     desc: 'Freshly sorted & packed at Uppal Facility.' },
  { key: 'SHIPPED',    label: 'Dispatched / In Transit', icon: Truck,     desc: 'Handed over to courier with live tracking.' },
  { key: 'DELIVERED',  label: 'Delivered',           icon: CheckCircle2,  desc: 'Package delivered safely to destination.' },
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
  const [userRole, setUserRole] = useState<'super-admin' | 'admin' | 'user'>('user');
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
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PROCESSING' | 'DELIVERED'>('ALL');

  // Profile Address State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '+91 9515273464',
    address: '1-53/6 Surya Nagar Colony',
    colony: 'Uppal',
    city: 'Hyderabad',
    pincode: '500039'
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const { addItem, toggleCart } = useCartStore();

  useEffect(() => {
    if (!auth) { setLoading(false); return; }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Customer',
      }));

      const email = currentUser.email?.toLowerCase().trim() || '';
      if (SUPER_ADMIN_EMAILS.includes(email)) {
        setUserRole('super-admin');
      } else {
        try {
          const res = await fetch('/api/admin/users');
          const data = await res.json();
          if (data.success && data.users) {
            const dbU = data.users.find((u: any) => u.email?.toLowerCase() === email);
            if (dbU?.role === 'admin' || dbU?.role === 'super-admin') {
              setUserRole(dbU.role);
            }
          }
        } catch { /* ignore */ }
      }

      // Load orders
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (data.success && data.orders?.length > 0) {
          setOrders(data.orders);
          setSelectedTrackOrder(data.orders[0]);
        }
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
    setTimeout(() => setCopied(''), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg('Delivery preferences and contact information updated successfully!');
    setTimeout(() => setProfileSavedMsg(''), 4000);
  };

  const handleReorder = (order: typeof MOCK_ORDERS[0]) => {
    order.items.forEach(item => {
      addItem({
        productId: item.productId || 'p1',
        title: item.title,
        slug: 'w180-king-jumbo',
        price: item.price,
        size: item.size,
        quantity: item.quantity || 1,
        image: item.image || '/images/raw_cashews_hero.webp',
        category: 'raw',
      });
    });
    toggleCart(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black text-[#D4AF37] tracking-widest uppercase">Loading VIP Member Suite...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.displayName || user.email?.split('@')[0] || 'VIP Member';
  const initials = displayName.slice(0, 2).toUpperCase();
  const totalSpent = orders.reduce((s, o) => s + o.totalAmount, 0);
  const deliveredCount = orders.filter(o => o.fulfillmentStatus === 'DELIVERED').length;
  const pendingCount = orders.filter(o => o.fulfillmentStatus !== 'DELIVERED').length;

  // VIP Loyalty Level
  const vipTier = totalSpent >= 5000 ? 'Gold VIP Elite' : totalSpent >= 2000 ? 'Silver VIP Member' : 'Bronze Shopper';
  const nextTierTarget = totalSpent >= 5000 ? 10000 : totalSpent >= 2000 ? 5000 : 2000;
  const progressPercent = Math.min(100, Math.round((totalSpent / nextTierTarget) * 100));

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'DELIVERED') return o.fulfillmentStatus === 'DELIVERED';
    if (orderFilter === 'PROCESSING') return o.fulfillmentStatus !== 'DELIVERED';
    return true;
  });

  const TABS: { id: TabId; label: string; icon: any; badge?: number }[] = [
    { id: 'overview',  label: 'Overview',        icon: UserIcon },
    { id: 'orders',    label: 'My Orders',       icon: Package,      badge: orders.length },
    { id: 'track',     label: 'Live Tracking',   icon: Truck,        badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'coupons',   label: 'VIP Coupons',     icon: Ticket,       badge: coupons.length },
    { id: 'invoices',  label: 'Tax Invoices',    icon: Printer },
    { id: 'profile',   label: 'Profile & Address', icon: Edit2 },
    { id: 'wishlist',  label: 'My Wishlist',     icon: Heart },
  ];

  return (
    <div className="bg-[#070D18] min-h-screen text-slate-100 selection:bg-[#D4AF37] selection:text-[#070D18]">

      {/* ── ADMIN ACCESS NOTICE BANNER (If logged in as admin/super-admin) ── */}
      {(userRole === 'super-admin' || userRole === 'admin') && (
        <div className="bg-gradient-to-r from-[#D4AF37] via-[#C99E2E] to-[#B48328] text-[#070D18] px-4 py-2.5 font-bold text-xs shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-[#070D18]" />
              <span>
                Authenticated as <strong className="font-black uppercase">{userRole === 'super-admin' ? 'Super Administrator' : 'Store Administrator'}</strong> ({user.email}).
              </span>
            </div>
            <Link
              href="/admin/dashboard"
              className="px-4 py-1 rounded-lg bg-[#070D18] text-[#D4AF37] font-black text-[11px] uppercase tracking-wider flex items-center space-x-1 hover:brightness-125 transition-all shadow-sm"
            >
              <span>Switch to Admin Master Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── VIP MEMBER HERO ── */}
      <div className="bg-gradient-to-b from-[#0A111E] via-[#0D1527] to-[#070D18] border-b border-[#D4AF37]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Profile Info */}
            <div className="flex items-center space-x-4 sm:space-x-5">
              {user.photoURL ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl shrink-0">
                  <Image src={user.photoURL} alt={displayName} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] text-[#070D18] font-black text-3xl flex items-center justify-center shadow-2xl shrink-0 border border-[#D4AF37]/50">
                  {initials}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
                    {displayName}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{vipTier}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{user.email}</span>
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified SVT Roastery Customer</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
              <Link
                href="/#shop"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-transform hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Fresh Cashews</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2.5 bg-white/5 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loyalty Level Progress Card */}
          <div className="mt-8 bg-[#0A111E]/80 backdrop-blur-md rounded-3xl border border-[#D4AF37]/20 p-5 grid grid-cols-1 md:grid-cols-4 gap-4 shadow-xl">
            <div className="md:col-span-2 space-y-2 border-b md:border-b-0 md:border-r border-[#D4AF37]/15 pb-4 md:pb-0 md:pr-4">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#D4AF37] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>Loyalty Tier Status: {vipTier}</span>
                </span>
                <span className="font-mono text-slate-400">₹{totalSpent} / ₹{nextTierTarget}</span>
              </div>
              <div className="w-full bg-[#070D18] h-2.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Spend ₹{Math.max(0, nextTierTarget - totalSpent)} more to unlock Gold VIP exclusive discounts and priority harvest alerts.
              </p>
            </div>

            <div className="flex items-center justify-between md:justify-center md:flex-col text-left md:text-center border-b md:border-b-0 md:border-r border-[#D4AF37]/15 pb-4 md:pb-0 md:px-2">
              <p className="text-2xl font-black text-white">{orders.length}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lifetime Orders</p>
            </div>

            <div className="flex items-center justify-between md:justify-center md:flex-col text-left md:text-center md:px-2">
              <p className="text-2xl font-black text-emerald-400">₹{totalSpent.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Value Sourced</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── MAIN DASHBOARD BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 pb-24">

        {/* ── LEFT SIDEBAR TABS ── */}
        <aside className="lg:w-64 shrink-0 space-y-4">
          <nav className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl overflow-hidden p-2 space-y-1 shadow-xl">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                      : 'text-slate-300 hover:text-[#D4AF37] hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#070D18] text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Support Card */}
          <div className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-5 space-y-3 text-xs shadow-xl">
            <div className="flex items-center space-x-2 text-[#D4AF37]">
              <Phone className="w-4 h-4" />
              <span className="font-black uppercase tracking-wider text-[11px]">Uppal Support Desk</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Need custom packing or bulk corporate gifting advice?
            </p>
            <a
              href="https://wa.me/919515273464"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center space-x-1.5 hover:bg-emerald-900/60 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </aside>

        {/* ── MAIN CONTENT TAB PANELS ── */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Active Order Alert */}
              {pendingCount > 0 && orders.find(o => o.fulfillmentStatus !== 'DELIVERED') && (
                <div className="bg-gradient-to-r from-blue-950/90 to-[#0A111E] border border-blue-500/40 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Truck className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Consignment</span>
                        <h3 className="text-base font-black text-white">Order #{orders.find(o => o.fulfillmentStatus !== 'DELIVERED')?.orderId}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const activeOrd = orders.find(o => o.fulfillmentStatus !== 'DELIVERED');
                        if (activeOrd) setSelectedTrackOrder(activeOrd);
                        setActiveTab('track');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-1 hover:bg-blue-600 transition-colors"
                    >
                      <span>Live Tracker</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Latest Order Showcase */}
              {orders.length > 0 && (
                <div className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#D4AF37]" />
                      <span>Latest Order Details</span>
                    </h3>
                    <button onClick={() => setActiveTab('orders')} className="text-xs text-slate-400 hover:text-[#D4AF37] flex items-center space-x-1 font-bold">
                      <span>View All History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-mono font-black text-white text-base">#{orders[0].orderId}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Placed on {orders[0].date} • {orders[0].items.length} product(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#D4AF37] text-lg">₹{orders[0].totalAmount}/-</p>
                      <span className={`text-[10px] px-3 py-0.5 rounded-full font-black border ${STATUS_CONFIG[orders[0].fulfillmentStatus]?.color} ${STATUS_CONFIG[orders[0].fulfillmentStatus]?.badgeBg}`}>
                        {STATUS_CONFIG[orders[0].fulfillmentStatus]?.label}
                      </span>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {orders[0].items.map((it, idx) => (
                      <div key={idx} className="flex items-center space-x-3 bg-[#070D18] p-3 rounded-2xl border border-white/5">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/30 shrink-0 bg-[#0A111E]">
                          <Image src={it.image || '/images/raw_cashews_hero.webp'} alt={it.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{it.title}</p>
                          <p className="text-[11px] text-slate-400">{it.size} × {it.quantity}</p>
                        </div>
                        <p className="text-xs font-black text-[#D4AF37]">₹{it.price * it.quantity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleReorder(orders[0])}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Quick Re-Order</span>
                    </button>
                    <button
                      onClick={() => setInvoiceOrder(orders[0])}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Tax Invoice</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('coupons')}
                  className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 text-left hover:border-[#D4AF37] transition-all space-y-3 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">VIP Promo Codes</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{coupons.length} Active Discounts</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 text-left hover:border-[#D4AF37] transition-all space-y-3 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Tax Invoices</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Download GST Bills</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 text-left hover:border-[#D4AF37] transition-all space-y-3 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Shipping Address</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Uppal, Hyderabad Zone</p>
                  </div>
                </button>
              </div>

            </div>
          )}

          {/* ── TAB 2: MY ORDERS ── */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black font-display text-white">Order Fulfillment History</h2>
                  <p className="text-xs text-slate-400">Track and manage your past roastery cashew orders</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1.5 bg-[#0A111E] p-1 rounded-2xl border border-white/10">
                  {(['ALL', 'PROCESSING', 'DELIVERED'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        orderFilter === filter
                          ? 'bg-[#D4AF37] text-[#070D18]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter === 'ALL' ? 'All Orders' : filter === 'PROCESSING' ? 'In Transit' : 'Delivered'}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-[#0A111E] border border-white/10 rounded-3xl p-12 text-center space-y-4">
                  <ShoppingBag className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <p className="text-slate-300 font-bold">No orders found matching this filter.</p>
                  <Link href="/#shop" className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#070D18] text-xs uppercase font-black">
                    Explore Cashew Catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order._id || order.orderId} className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-6 space-y-4 shadow-xl">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <p className="font-mono font-black text-[#D4AF37] text-base">#{order.orderId}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Placed on {order.date}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${STATUS_CONFIG[order.fulfillmentStatus]?.color} ${STATUS_CONFIG[order.fulfillmentStatus]?.badgeBg}`}>
                            {STATUS_CONFIG[order.fulfillmentStatus]?.label}
                          </span>
                          <span className="text-base font-black text-white">₹{order.totalAmount}/-</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center space-x-3 bg-[#070D18] p-3 rounded-2xl border border-white/5">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/30 shrink-0">
                              <Image src={item.image || '/images/raw_cashews_hero.webp'} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{item.title}</p>
                              <p className="text-[10px] text-slate-400">{item.size} × {item.quantity}</p>
                            </div>
                            <p className="text-xs font-black text-[#D4AF37]">₹{item.price * item.quantity}/-</p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => { setSelectedTrackOrder(order); setActiveTab('track'); }}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-[#D4AF37] flex items-center space-x-1.5 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Consignment</span>
                          </button>
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleReorder(order)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Buy Again</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: LIVE TRACKING ── */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">Live Consignment Tracking</h2>
                <p className="text-xs text-slate-400">Real-time status updates from Uppal Roastery to your doorstep</p>
              </div>

              {/* Order Selector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {orders.map((o) => (
                  <button
                    key={o._id || o.orderId}
                    onClick={() => setSelectedTrackOrder(o)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all shrink-0 border ${
                      selectedTrackOrder?.orderId === o.orderId
                        ? 'bg-[#D4AF37] text-[#070D18] border-[#D4AF37] shadow-lg font-black'
                        : 'bg-[#0A111E] text-slate-300 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <p className="font-mono">#{o.orderId}</p>
                    <p className="text-[10px] opacity-75 mt-0.5">{o.date} • ₹{o.totalAmount}</p>
                  </button>
                ))}
              </div>

              {selectedTrackOrder && (
                <div className="bg-[#0A111E] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
                  
                  {/* Summary Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Tracking Consignment</span>
                      <h3 className="text-2xl font-black font-display text-white mt-0.5">#{selectedTrackOrder.orderId}</h3>
                      <p className="text-xs text-slate-400 mt-1">Booked on {selectedTrackOrder.date}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Estimated Delivery Date</p>
                      <p className="text-base font-black text-[#D4AF37]">{selectedTrackOrder.estimatedDelivery || 'Within 24-48 Hours'}</p>
                    </div>
                  </div>

                  {/* Courier Card */}
                  <div className="bg-[#070D18] border border-[#D4AF37]/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">{selectedTrackOrder.courierPartner || 'SVT Roastery Express Courier'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Waybill: {selectedTrackOrder.trackingNumber || 'SVT-HYD-LOCAL'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyCoupon(selectedTrackOrder.trackingNumber || selectedTrackOrder.orderId)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Step Progress Timeline */}
                  <div className="relative pl-6 space-y-0 max-w-xl mx-auto">
                    {ORDER_TIMELINE.map((step, idx) => {
                      const currentStep = getTimelineStep(selectedTrackOrder.fulfillmentStatus);
                      const isDone = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      const Icon = step.icon;

                      return (
                        <div key={step.key} className="relative flex items-start space-x-5 pb-8 last:pb-0">
                          {/* Vertical Connector Line */}
                          {idx < ORDER_TIMELINE.length - 1 && (
                            <div className={`absolute left-[-15px] top-7 w-0.5 h-full ${isDone ? 'bg-[#D4AF37]' : 'bg-slate-800'}`} />
                          )}

                          {/* Step Badge */}
                          <div className={`absolute left-[-24px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-all ${
                            isDone 
                              ? 'bg-[#D4AF37] border-[#D4AF37] text-[#070D18] shadow-[0_0_15px_rgba(212,175,55,0.7)]' 
                              : 'bg-[#0A111E] border-slate-700 text-slate-600'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          <div className={`pt-0.5 ${isCurrent ? 'opacity-100' : isDone ? 'opacity-90' : 'opacity-40'}`}>
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-black ${isCurrent ? 'text-[#D4AF37]' : isDone ? 'text-white' : 'text-slate-500'}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#070D18] text-[9px] font-black uppercase tracking-wider animate-pulse">
                                  Current Status
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: COUPONS ── */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">VIP Promo Codes & Offers</h2>
                <p className="text-xs text-slate-400">Exclusive discount vouchers tailored for our valued members</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <div
                    key={coupon.code}
                    className="bg-[#0A111E] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-xl space-y-0"
                  >
                    <div className="bg-gradient-to-r from-[#0D1527] to-[#141E30] px-6 py-5 border-b border-dashed border-[#D4AF37]/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-3xl font-black text-[#D4AF37]">{coupon.discountPercent}% OFF</span>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">Min order value: ₹{coupon.minOrderAmount}</p>
                        </div>
                        <Ticket className="w-9 h-9 text-[#D4AF37]/30" />
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-300 leading-relaxed">{coupon.description}</p>
                      
                      <div className="flex items-center justify-between bg-[#070D18] p-2 rounded-2xl border border-dashed border-[#D4AF37]/40">
                        <span className="font-mono font-black text-sm text-[#D4AF37] px-2">{coupon.code}</span>
                        <button
                          onClick={() => copyCoupon(coupon.code)}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                            copied === coupon.code
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#D4AF37] text-[#070D18] hover:brightness-110'
                          }`}
                        >
                          {copied === coupon.code ? '✓ Copied' : 'Copy Code'}
                        </button>
                      </div>

                      {coupon.expiresAt && (
                        <p className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                          <Clock className="w-3 h-3" />
                          <span>Valid through {coupon.expiresAt}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: INVOICES ── */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">Tax Invoices & GST Bills</h2>
                <p className="text-xs text-slate-400">Download or print verified tax invoices for your records</p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#0A111E] border border-white/10 rounded-3xl p-12 text-center space-y-4">
                  <Printer className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <p className="text-slate-300">No invoices generated yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order._id || order.orderId}
                      className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl"
                    >
                      <div className="space-y-1">
                        <p className="font-mono font-black text-[#D4AF37] text-base">#{order.orderId}</p>
                        <p className="text-xs text-slate-400">{order.date} • Total ₹{order.totalAmount} • {order.paymentMethod} ({order.paymentStatus})</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${STATUS_CONFIG[order.fulfillmentStatus]?.color} ${STATUS_CONFIG[order.fulfillmentStatus]?.badgeBg}`}>
                          {STATUS_CONFIG[order.fulfillmentStatus]?.label}
                        </span>
                        <button
                          onClick={() => setInvoiceOrder(order)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 6: PROFILE & ADDRESS ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">Profile & Delivery Preferences</h2>
                <p className="text-xs text-slate-400">Manage your shipping address and personal contact details</p>
              </div>

              {profileSavedMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileSavedMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">Recipient Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">Contact Phone</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">Colony / Locality</label>
                    <input
                      type="text"
                      value={profileForm.colony}
                      onChange={(e) => setProfileForm({ ...profileForm, colony: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block mb-1.5">PIN Code</label>
                    <input
                      type="text"
                      value={profileForm.pincode}
                      onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 transition-transform"
                  >
                    Save Address Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── TAB 7: WISHLIST ── */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">My Saved Cashew Selections</h2>
                <p className="text-xs text-slate-400">Gourmet varieties saved for your upcoming orders</p>
              </div>

              <div className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-12 text-center space-y-5 shadow-xl">
                <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Your Wishlist is Ready</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Explore our King Jumbo W180 and artisanal spiced blends to add favorite cashew grades directly to your list.
                  </p>
                </div>
                <Link
                  href="/#shop"
                  className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-lg"
                >
                  Browse Store Catalog
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── TAX INVOICE MODAL ── */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white text-slate-900 w-full max-w-xl p-8 rounded-3xl space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black font-display text-[#070D18]">SIDHI VINAYAKA TRADERS</h2>
                <p className="text-[11px] text-slate-600">Surya Nagar Colony, Uppal, Hyderabad - 500039</p>
                <p className="text-[11px] text-slate-600">Phone: +91 9515273464 / +91 8919620379</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">GSTIN: 36ABCDE1234F1Z5</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#B48328]">ORIGINAL TAX INVOICE</p>
                <p className="text-xs font-mono font-bold text-slate-800">#{invoiceOrder.orderId}</p>
                <p className="text-[11px] text-slate-600">Date: {invoiceOrder.date}</p>
              </div>
            </div>

            {/* Billed To */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider">Customer Details:</p>
              <p className="font-bold text-slate-900">{displayName}</p>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-slate-600">1-53/6 Surya Nagar Colony, Uppal, Hyderabad - 500039</p>
            </div>

            {/* Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070D18] text-white">
                  <th className="py-2.5 px-3 rounded-l-lg">Product Description</th>
                  <th className="py-2.5 px-3">Grade/Size</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoiceOrder.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-bold text-slate-900">{it.title}</td>
                    <td className="py-3 px-3 text-slate-600">{it.size}</td>
                    <td className="py-3 px-3 text-center text-slate-700">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">₹{it.price * it.quantity}/-</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-center font-black text-sm border-t-2 border-slate-900 pt-3">
              <div>
                <span className="text-slate-700">Payment Mode: {invoiceOrder.paymentMethod}</span>
                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase font-black">
                  {invoiceOrder.paymentStatus}
                </span>
              </div>
              <span className="text-[#B48328] text-xl">₹{invoiceOrder.totalAmount}/-</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#070D18] text-[#D4AF37] text-xs font-black uppercase tracking-wider rounded-xl flex items-center space-x-2 shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
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
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
