'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useCartStore } from '@/lib/cart-store';
import NotificationCenter from '@/components/notification-center';
import {
  Package, LogOut, User as UserIcon, Heart, ShoppingBag, ArrowRight,
  MapPin, Star, Ticket, Printer, Truck, CheckCircle2, Clock, Circle,
  ChevronRight, Bell, Shield, Edit2, Phone, Mail, MessageSquare,
  ChevronDown, AlertCircle, RefreshCw, Crown, ShieldCheck, Sparkles,
  Copy, Check, ExternalLink, Award, Gift, ArrowUpRight, CheckCircle,
  FileText, Navigation, Calendar, Send
} from 'lucide-react';

const SUPER_ADMIN_EMAILS = ['pa0174492@gmail.com', 'sahuravindra897@gmail.com'];

type TabId = 'overview' | 'orders' | 'track' | 'notifications' | 'coupons' | 'invoices' | 'profile' | 'wishlist';

interface TimelineEvent {
  status: string;
  title: string;
  description: string;
  timestamp: string | Date;
  courierPartner?: string;
  trackingNumber?: string;
  updatedBy?: string;
}

interface OrderItem {
  productId: string;
  title: string;
  size: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id?: string;
  orderId: string;
  userId?: string;
  createdAt?: string;
  customerDetails: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    colony: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  additionalCharges?: { id: string; name: string; amount: number }[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  timeline?: TimelineEvent[];
  trackingNumber?: string;
  courierPartner?: string;
  estimatedDelivery?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; badgeBg: string; border: string }> = {
  PENDING:    { color: 'text-amber-400', border: 'border-amber-500/40', badgeBg: 'bg-amber-950/80', label: 'Order Placed / Pending' },
  PROCESSING: { color: 'text-blue-400', border: 'border-blue-500/40',   badgeBg: 'bg-blue-950/80',  label: 'Roastery Processing' },
  SHIPPED:    { color: 'text-indigo-400', border: 'border-indigo-500/40', badgeBg: 'bg-indigo-950/80', label: 'Dispatched / In Transit' },
  DELIVERED:  { color: 'text-emerald-400', border: 'border-emerald-500/40', badgeBg: 'bg-emerald-950/80', label: 'Delivered Safely' },
  CANCELLED:  { color: 'text-rose-400', border: 'border-rose-500/40', badgeBg: 'bg-rose-950/80', label: 'Order Cancelled' },
};

const ORDER_MILESTONES = [
  { key: 'PENDING',    label: 'Order Placed',        icon: ShoppingBag,   desc: 'Order logged & verified at Uppal Roastery.' },
  { key: 'PROCESSING', label: 'Roasting & Packed',   icon: RefreshCw,     desc: 'Freshly sorted & vacuum packed at Uppal Facility.' },
  { key: 'SHIPPED',    label: 'Dispatched in Transit', icon: Truck,       desc: 'Handed over to courier with live waybill tracking.' },
  { key: 'DELIVERED',  label: 'Delivered',           icon: CheckCircle2,  desc: 'Package delivered safely to destination.' },
];

function getTimelineIndex(status: string) {
  const idx = ORDER_MILESTONES.findIndex(t => t.key === status);
  return idx === -1 ? 0 : idx;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabId | null;
  const orderIdParam = searchParams.get('orderId');

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'super-admin' | 'admin' | 'user'>('user');
  const [activeTab, setActiveTab] = useState<TabId>(tabParam || 'overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState('');
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PROCESSING' | 'DELIVERED'>('ALL');

  // Profile Address State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    colony: 'Uppal',
    city: 'Hyderabad',
    pincode: '500039'
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const { addItem, toggleCart } = useCartStore();

  const fetchOrders = async (currentUserEmail?: string, currentUserId?: string) => {
    try {
      const params = new URLSearchParams();
      if (currentUserEmail) params.set('email', currentUserEmail);
      if (currentUserId) params.set('userId', currentUserId);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
        if (data.orders.length > 0) {
          if (orderIdParam) {
            const found = data.orders.find((o: Order) => o.orderId === orderIdParam);
            setSelectedTrackOrder(found || data.orders[0]);
          } else {
            setSelectedTrackOrder(data.orders[0]);
          }
        } else {
          setSelectedTrackOrder(null);
        }
      } else {
        setOrders([]);
        setSelectedTrackOrder(null);
      }
    } catch {
      setOrders([]);
      setSelectedTrackOrder(null);
    }
  };

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

      await fetchOrders(email, currentUser.uid);

      // Load coupons
      try {
        const res = await fetch('/api/admin/coupons');
        const data = await res.json();
        if (data.success && data.coupons?.length > 0) setCoupons(data.coupons);
      } catch { /* ignore */ }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, orderIdParam]);

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    router.push('/');
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(''), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSavedMsg('Delivery preferences and contact information updated successfully!');
    setTimeout(() => setProfileSavedMsg(''), 4000);
  };

  const handleReorder = (order: Order) => {
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
  const pendingCount = orders.filter(o => o.fulfillmentStatus !== 'DELIVERED' && o.fulfillmentStatus !== 'CANCELLED').length;

  // VIP Loyalty Level
  const vipTier = totalSpent >= 5000 ? 'Gold VIP Elite' : totalSpent >= 2000 ? 'Silver VIP Member' : 'Bronze Shopper';
  const nextTierTarget = totalSpent >= 5000 ? 10000 : totalSpent >= 2000 ? 5000 : 2000;
  const progressPercent = Math.min(100, Math.round((totalSpent / nextTierTarget) * 100));

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'DELIVERED') return o.fulfillmentStatus === 'DELIVERED';
    if (orderFilter === 'PROCESSING') return o.fulfillmentStatus !== 'DELIVERED' && o.fulfillmentStatus !== 'CANCELLED';
    return true;
  });

  const TABS: { id: TabId; label: string; icon: any; badge?: number }[] = [
    { id: 'overview',      label: 'Overview',            icon: UserIcon },
    { id: 'orders',        label: 'My Orders',           icon: Package,      badge: orders.length > 0 ? orders.length : undefined },
    { id: 'track',         label: 'Live Tracking & Timeline', icon: Truck,   badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'notifications', label: 'Notifications',       icon: Bell },
    { id: 'coupons',       label: 'VIP Coupons',         icon: Ticket,       badge: coupons.length > 0 ? coupons.length : undefined },
    { id: 'invoices',      label: 'Tax Invoices',        icon: Printer },
    { id: 'profile',       label: 'Profile & Address',   icon: Edit2 },
    { id: 'wishlist',      label: 'My Wishlist',         icon: Heart },
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

            {/* Quick Actions & In-App Notification Center */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
              <NotificationCenter
                role="USER"
                userEmail={user.email || undefined}
                userId={user.uid}
                variant="dashboard"
              />

              <Link
                href="/#shop"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-lg transition-transform hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Fresh Cashews</span>
              </Link>

              <button
                type="button"
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
                {orders.length === 0
                  ? 'Place your first order to begin earning VIP loyalty points and unlock exclusive harvest discounts.'
                  : `Spend ₹${Math.max(0, nextTierTarget - totalSpent)} more to unlock Gold VIP exclusive discounts and priority harvest alerts.`}
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
                  type="button"
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
              Need custom roasting, weight alterations, or bulk corporate packs?
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
              
              {/* Active Order Alert (if any active order exists) */}
              {pendingCount > 0 && orders.find(o => o.fulfillmentStatus !== 'DELIVERED' && o.fulfillmentStatus !== 'CANCELLED') && (
                <div className="bg-gradient-to-r from-blue-950/90 to-[#0A111E] border border-blue-500/40 rounded-3xl p-6 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                        <Truck className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Consignment</span>
                        <h3 className="text-base font-black text-white">Order #{orders.find(o => o.fulfillmentStatus !== 'DELIVERED' && o.fulfillmentStatus !== 'CANCELLED')?.orderId}</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const activeOrd = orders.find(o => o.fulfillmentStatus !== 'DELIVERED' && o.fulfillmentStatus !== 'CANCELLED');
                        if (activeOrd) setSelectedTrackOrder(activeOrd);
                        setActiveTab('track');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-1 hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      <span>Live Timeline & Tracking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Latest Order Showcase (Only if user has actual orders) */}
              {orders.length > 0 ? (
                <div className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-6 space-y-4 shadow-xl">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#D4AF37]" />
                      <span>Latest Order Details</span>
                    </h3>
                    <button type="button" onClick={() => setActiveTab('orders')} className="text-xs text-slate-400 hover:text-[#D4AF37] flex items-center space-x-1 font-bold">
                      <span>View All History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-mono font-black text-white text-base">#{orders[0].orderId}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Placed on {orders[0].createdAt ? new Date(orders[0].createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'} • {orders[0].items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#D4AF37] text-lg">₹{orders[0].totalAmount}/-</p>
                      <span className={`text-[10px] px-3 py-0.5 rounded-full font-black border ${STATUS_CONFIG[orders[0].fulfillmentStatus]?.color} ${STATUS_CONFIG[orders[0].fulfillmentStatus]?.border} ${STATUS_CONFIG[orders[0].fulfillmentStatus]?.badgeBg}`}>
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

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setSelectedTrackOrder(orders[0]); setActiveTab('track'); }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Order Timeline</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(orders[0])}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors flex items-center space-x-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Tax Invoice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReorder(orders[0])}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition-colors flex items-center space-x-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Buy Again</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Pure Empty State for New Users (Zero Fake Data) */
                <div className="bg-[#0A111E] border border-[#D4AF37]/30 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-lg">
                    <ShoppingBag className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="text-xl font-black font-display text-white">Welcome to Your VIP Member Suite!</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You do not have any orders placed yet. Explore our King Jumbo W180 and fresh roastery spiced cashews to place your first order. Live tracking, package milestone alerts, and GST tax invoices will appear here automatically.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/#shop"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform flex items-center space-x-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Explore Cashew Catalog</span>
                    </Link>
                    <Link
                      href="/category/raw"
                      className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-colors"
                    >
                      Browse Raw W180 Cashews
                    </Link>
                  </div>
                </div>
              )}

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 text-left hover:border-[#D4AF37] transition-all space-y-3 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Tax Invoices</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{orders.length} Verified Invoices</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 text-left hover:border-[#D4AF37] transition-all space-y-3 group shadow-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Shipping Address</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Manage Delivery Info</p>
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
                {orders.length > 0 && (
                  <div className="flex items-center space-x-1.5 bg-[#0A111E] p-1 rounded-2xl border border-white/10">
                    {(['ALL', 'PROCESSING', 'DELIVERED'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setOrderFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          orderFilter === filter
                            ? 'bg-[#D4AF37] text-[#070D18]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {filter === 'ALL' ? 'All Orders' : filter === 'PROCESSING' ? 'In Progress' : 'Delivered'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-[#0A111E] border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                  <ShoppingBag className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Orders Placed Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Your real roastery orders and live package tracking will appear here once you place an order.
                  </p>
                  <Link href="/#shop" className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#070D18] text-xs uppercase font-black shadow-md hover:scale-105 transition-transform">
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
                          <p className="text-xs text-slate-400 mt-0.5">
                            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${STATUS_CONFIG[order.fulfillmentStatus]?.color} ${STATUS_CONFIG[order.fulfillmentStatus]?.border} ${STATUS_CONFIG[order.fulfillmentStatus]?.badgeBg}`}>
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
                            type="button"
                            onClick={() => { setSelectedTrackOrder(order); setActiveTab('track'); }}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-[#D4AF37] flex items-center space-x-1.5 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Timeline</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInvoiceOrder(order)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>
                        </div>

                        <button
                          type="button"
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

          {/* ── TAB 3: LIVE TRACKING & INTERACTIVE ORDER TIMELINE ── */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[#D4AF37]" />
                    <span>Live Consignment Timeline & Tracking</span>
                  </h2>
                  <p className="text-xs text-slate-400">Track real-time roastery processing, sorting, and courier milestones</p>
                </div>

                {orders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => user?.email && fetchOrders(user.email, user.uid)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#D4AF37] flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Status</span>
                  </button>
                )}
              </div>

              {orders.length === 0 || !selectedTrackOrder ? (
                /* Clean Empty State for Live Tracker */
                <div className="bg-[#0A111E] border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                  <Truck className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Active Orders to Track</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Place an order to activate live roastery processing stages, logistics consignment tracking, and estimated delivery dates.
                  </p>
                  <Link href="/#shop" className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#070D18] text-xs uppercase font-black shadow-md hover:scale-105 transition-transform">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order Selector Chips (if user has multiple orders) */}
                  {orders.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {orders.map((o) => (
                        <button
                          key={o._id || o.orderId}
                          type="button"
                          onClick={() => setSelectedTrackOrder(o)}
                          className={`px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all shrink-0 border ${
                            selectedTrackOrder?.orderId === o.orderId
                              ? 'bg-[#D4AF37] text-[#070D18] border-[#D4AF37] shadow-lg font-black'
                              : 'bg-[#0A111E] text-slate-300 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                          }`}
                        >
                          <p className="font-mono">#{o.orderId}</p>
                          <p className="text-[10px] opacity-75 mt-0.5">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'} • ₹{o.totalAmount}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Master Tracking Card */}
                  <div className="bg-[#0A111E] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
                    
                    {/* Summary Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Active Order Tracking</span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[selectedTrackOrder.fulfillmentStatus]?.color} ${STATUS_CONFIG[selectedTrackOrder.fulfillmentStatus]?.border} ${STATUS_CONFIG[selectedTrackOrder.fulfillmentStatus]?.badgeBg}`}>
                            {STATUS_CONFIG[selectedTrackOrder.fulfillmentStatus]?.label}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">#{selectedTrackOrder.orderId}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Placed on {selectedTrackOrder.createdAt ? new Date(selectedTrackOrder.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-slate-400">Total Order Amount</p>
                        <p className="text-xl font-black text-[#D4AF37]">₹{selectedTrackOrder.totalAmount}/-</p>
                        <p className="text-[11px] text-emerald-400 font-bold">{selectedTrackOrder.paymentMethod} • {selectedTrackOrder.paymentStatus}</p>
                      </div>
                    </div>

                    {/* Interactive Horizontal Milestone Bar */}
                    <div className="py-2">
                      <div className="relative">
                        {/* Connecting track line */}
                        <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 bg-slate-800 -translate-y-1/2 z-0" />
                        <div 
                          className="hidden sm:block absolute top-1/2 left-6 h-1 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                          style={{
                            width: `${(getTimelineIndex(selectedTrackOrder.fulfillmentStatus) / (ORDER_MILESTONES.length - 1)) * 88}%`
                          }}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
                          {ORDER_MILESTONES.map((step, idx) => {
                            const currentIdx = getTimelineIndex(selectedTrackOrder.fulfillmentStatus);
                            const isDone = idx <= currentIdx;
                            const isCurrent = idx === currentIdx;
                            const Icon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className={`flex sm:flex-col items-center sm:text-center p-3 rounded-2xl transition-all ${
                                  isCurrent
                                    ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/40 shadow-lg'
                                    : isDone
                                    ? 'bg-white/5 sm:bg-transparent'
                                    : 'opacity-40'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 sm:mb-2 transition-all mr-3 sm:mr-0 ${
                                  isDone
                                    ? 'bg-[#D4AF37] border-[#D4AF37] text-[#070D18] shadow-[0_0_15px_rgba(212,175,55,0.7)]'
                                    : 'bg-[#0A111E] border-slate-700 text-slate-500'
                                }`}>
                                  <Icon className="w-5 h-5" />
                                </div>

                                <div>
                                  <p className={`text-xs font-black ${isCurrent ? 'text-[#D4AF37]' : isDone ? 'text-white' : 'text-slate-400'}`}>
                                    {step.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{step.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Courier Waybill Information Card */}
                    <div className="bg-[#070D18] border border-[#D4AF37]/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center border border-[#D4AF37]/30 shrink-0">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider">Logistics Partner</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">Express Delivery</span>
                          </div>
                          <p className="text-sm font-black text-white mt-0.5">
                            {selectedTrackOrder.courierPartner || 'SVT Roastery Express Dispatch'}
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            Consignment Waybill: <strong className="text-[#D4AF37]">{selectedTrackOrder.trackingNumber || 'SVT-HYD-LOCAL'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyText(selectedTrackOrder.trackingNumber || selectedTrackOrder.orderId)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center space-x-1.5 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copied === (selectedTrackOrder.trackingNumber || selectedTrackOrder.orderId) ? 'Copied!' : 'Copy Waybill'}</span>
                        </button>

                        <a
                          href={`https://wa.me/919515273464?text=Hello%20SVT%20Team,%20please%20update%20me%20on%20Order%20${selectedTrackOrder.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Update</span>
                        </a>
                      </div>
                    </div>

                    {/* Detailed Timeline Audit Log */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <h4 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#D4AF37]" />
                          <span>Fulfillment Audit Log & Status History</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedTrackOrder.timeline?.length || 1} Milestone Event(s)
                        </span>
                      </div>

                      <div className="relative pl-6 space-y-6 max-w-2xl mx-auto pt-2">
                        {(selectedTrackOrder.timeline && selectedTrackOrder.timeline.length > 0
                          ? selectedTrackOrder.timeline
                          : [
                              {
                                status: selectedTrackOrder.fulfillmentStatus,
                                title: STATUS_CONFIG[selectedTrackOrder.fulfillmentStatus]?.label || 'Order Status Updated',
                                description: 'Order logged into Uppal roastery database.',
                                timestamp: selectedTrackOrder.createdAt || new Date(),
                              }
                            ]
                        ).map((event, idx, arr) => (
                          <div key={idx} className="relative flex items-start space-x-4">
                            {/* Vertical line connecting events */}
                            {idx < arr.length - 1 && (
                              <div className="absolute left-[-15px] top-6 w-0.5 h-full bg-[#D4AF37]/30" />
                            )}

                            {/* Badge */}
                            <div className="absolute left-[-22px] top-1 w-4 h-4 rounded-full bg-[#D4AF37] border-2 border-[#0B1323] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />

                            <div className="space-y-1 bg-[#070D18] p-4 rounded-2xl border border-white/5 w-full shadow-md">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <h5 className="text-xs font-black text-white">{event.title}</h5>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {event.timestamp
                                    ? new Date(event.timestamp).toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Recent'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">{event.description}</p>
                              {event.trackingNumber && (
                                <p className="text-[10px] text-[#D4AF37] font-mono font-bold pt-1">
                                  Waybill: {event.trackingNumber} ({event.courierPartner || 'Courier'})
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Destination & Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="bg-[#070D18] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                        <p className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Delivery Address</span>
                        </p>
                        <p className="font-bold text-white">{selectedTrackOrder.customerDetails.name}</p>
                        <p className="text-slate-400 font-mono">{selectedTrackOrder.customerDetails.phone}</p>
                        <p className="text-slate-300">
                          {selectedTrackOrder.customerDetails.address}, {selectedTrackOrder.customerDetails.colony}, {selectedTrackOrder.customerDetails.city} - {selectedTrackOrder.customerDetails.pincode}
                        </p>
                      </div>

                      <div className="bg-[#070D18] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                        <p className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Package Contents ({selectedTrackOrder.items.length} SKUs)</span>
                        </p>
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                          {selectedTrackOrder.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>{it.quantity}x {it.title} ({it.size})</span>
                              <span className="font-mono font-bold text-[#D4AF37]">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#D4AF37]" />
                  <span>Your Order & Harvest Notifications</span>
                </h2>
                <p className="text-xs text-slate-400">Real-time alerts regarding your consignments, discount codes, and fresh roasts</p>
              </div>

              <div className="bg-[#0A111E] border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-slate-300">In-App Notification Center</span>
                  <Link href="/dashboard?tab=track" className="text-xs text-[#D4AF37] font-bold hover:underline">
                    View Tracking Timeline →
                  </Link>
                </div>
                <p className="text-xs text-slate-400">
                  Click the Notification Bell in the top-right suite header or open your live consignment tracker to check real-time package updates.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB 5: COUPONS ── */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">VIP Promo Codes & Offers</h2>
                <p className="text-xs text-slate-400">Exclusive discount vouchers tailored for our valued members</p>
              </div>

              {coupons.length === 0 ? (
                <div className="bg-[#0A111E] border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                  <Ticket className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Active Coupons Right Now</h3>
                  <p className="text-xs text-slate-400">Special seasonal discount codes will be announced here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="bg-[#0A111E] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-xl space-y-0"
                    >
                      <div className="bg-gradient-to-r from-[#0D1527] to-[#141E30] px-6 py-5 border-b border-dashed border-[#D4AF37]/30">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-3xl font-black text-[#D4AF37]">
                              {coupon.discountType === 'FLAT' ? `₹${coupon.flatAmount} FLAT` : `${coupon.discountPercent}% OFF`}
                            </span>
                            <p className="text-xs text-slate-400 mt-1 font-semibold">Min order value: ₹{coupon.minOrderAmount || 500}</p>
                          </div>
                          <Ticket className="w-9 h-9 text-[#D4AF37]/30" />
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <p className="text-xs text-slate-300 leading-relaxed">{coupon.description || 'Exclusive offer on supreme cashews.'}</p>
                        
                        <div className="flex items-center justify-between bg-[#070D18] p-2 rounded-2xl border border-dashed border-[#D4AF37]/40">
                          <span className="font-mono font-black text-sm text-[#D4AF37] px-2">{coupon.code}</span>
                          <button
                            type="button"
                            onClick={() => copyText(coupon.code)}
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
              )}
            </div>
          )}

          {/* ── TAB 6: INVOICES ── */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black font-display text-white">Tax Invoices & GST Bills</h2>
                <p className="text-xs text-slate-400">Download or print verified tax invoices for your records</p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#0A111E] border border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                  <Printer className="w-14 h-14 text-[#D4AF37]/30 mx-auto" />
                  <h3 className="text-base font-bold text-white">No Tax Invoices Generated Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Verified GST tax bills are automatically created once you complete an order checkout.
                  </p>
                  <Link href="/#shop" className="inline-block px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#070D18] text-xs uppercase font-black shadow-md hover:scale-105 transition-transform">
                    Shop Products
                  </Link>
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
                        <p className="text-xs text-slate-400">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Recent'} • Total ₹{order.totalAmount} • {order.paymentMethod} ({order.paymentStatus})
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${STATUS_CONFIG[order.fulfillmentStatus]?.color} ${STATUS_CONFIG[order.fulfillmentStatus]?.border} ${STATUS_CONFIG[order.fulfillmentStatus]?.badgeBg}`}>
                          {STATUS_CONFIG[order.fulfillmentStatus]?.label}
                        </span>
                        <button
                          type="button"
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

          {/* ── TAB 7: PROFILE & ADDRESS ── */}
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

          {/* ── TAB 8: WISHLIST ── */}
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
                <p className="text-[11px] text-slate-600">
                  Date: {invoiceOrder.createdAt ? new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                </p>
              </div>
            </div>

            {/* Billed To */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
              <p className="font-black text-slate-900 uppercase text-[10px] tracking-wider">Customer Details:</p>
              <p className="font-bold text-slate-900">{invoiceOrder.customerDetails?.name || displayName}</p>
              <p className="text-slate-600">{invoiceOrder.customerDetails?.email || user.email}</p>
              <p className="text-slate-600">
                {invoiceOrder.customerDetails?.address}, {invoiceOrder.customerDetails?.colony || ''}, {invoiceOrder.customerDetails?.city || 'Hyderabad'} - {invoiceOrder.customerDetails?.pincode || '500039'}
              </p>
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
