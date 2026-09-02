'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminGuard from '@/components/admin-guard';
import { 
  LayoutDashboard, ShoppingBag, Bell, Package, 
  Search, SlidersHorizontal, RefreshCw, Eye, Upload, Save, CheckCircle2, 
  ImageIcon, Users, Ticket, BarChart3, MessageSquare, Printer, Truck, Shield, AlertTriangle,
  Sparkles, Flame
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';

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
  totalAmount: number;
  paymentMethod: 'UPI' | 'COD' | 'CARD';
  paymentStatus: 'PENDING' | 'PAID';
  fulfillmentStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'homepage' | 'users' | 'coupons' | 'analytics' | 'feedback'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Selected State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('SVT-8801');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Homepage Layout & Visuals State
  const [homepageSettings, setHomepageSettings] = useState({
    heroTitle: 'Supreme Quality Handpicked Cashews',
    heroSubtitle: 'Directly sourced from trusted orchards and freshly processed at our facility in Uppal, Hyderabad. Experience unmatched crunch and natural flavor.',
    heroImageUrl: '/images/raw_cashews_hero.webp',
    heroButtonText: 'Shop All Products',
    heroButtonLink: '#shop',
    announcementText: 'Direct Uppal Roastery Counter • 100% Pure W180 Jumbo & Gourmet Spiced Cashews • Wholesale & Retail',
    rawCardImage: '/images/raw_cashews_hero.webp',
    rawCardSubtitle: 'Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.',
    flavoredCardImage: '/images/tandoori_cashews_hero.webp',
    flavoredCardSubtitle: 'Peri Peri, Tandoori Masala & Pudina Herb infused with pure spices.',
    secondaryTitle: 'Artisanal Flavoured Blends',
    secondarySubtitle: 'Slow roasted with rich Indian spices for an irresistible crunch.',
    secondaryImageUrl: '/images/tandoori_cashews_hero.webp',
    secondaryButtonText: 'Explore Flavours',
    secondaryButtonLink: '/category/flavored',
  });
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Coupon Form State
  const [newCoupon, setNewCoupon] = useState({ code: '', discountPercent: 10, minOrderAmount: 500 });
  
  // Status Messages
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      // Orders
      const orderRes = await fetch('/api/orders');
      const orderData = await orderRes.json();
      if (orderData.success && orderData.orders && orderData.orders.length > 0) {
        setOrders(orderData.orders);
        setSelectedOrderId(orderData.orders[0].orderId);
      } else {
        setOrders([
          {
            orderId: 'SVT-8801',
            customerDetails: { name: 'A Kumar', phone: '+91 9515273464', address: '1-53/6 Surya Nagar Colony', colony: 'Uppal', city: 'Hyderabad', pincode: '500039' },
            items: [
              { productId: 'p1', title: 'W180 King Jumbo (1kg)', size: '1kg', quantity: 1, price: 900, image: '/images/raw_cashews_hero.png' },
              { productId: 'p2', title: 'Peri Peri 1kg', size: '1kg', quantity: 2, price: 880, image: '/images/tandoori_cashews_hero.png' }
            ],
            totalAmount: 2660,
            paymentMethod: 'UPI',
            paymentStatus: 'PAID',
            fulfillmentStatus: 'DELIVERED',
            trackingNumber: 'SVT-TRACK-8801',
            courierPartner: 'Local Uppal Express',
            createdAt: '2026-08-11'
          },
          {
            orderId: 'SVT-8802',
            customerDetails: { name: 'Ravindra Sahu', phone: '+91 8919620379', address: 'Plot 45 Main Road', colony: 'Uppal', city: 'Hyderabad', pincode: '500039' },
            items: [
              { productId: 'p1', title: 'W180 King Jumbo (1kg)', size: '1kg', quantity: 1, price: 900, image: '/images/raw_cashews_hero.png' }
            ],
            totalAmount: 900,
            paymentMethod: 'COD',
            paymentStatus: 'PAID',
            fulfillmentStatus: 'PENDING',
            createdAt: '2026-08-11'
          }
        ]);
      }

      // Homepage Settings
      const settingRes = await fetch('/api/admin/homepage');
      const settingData = await settingRes.json();
      if (settingData.success && settingData.settings) {
        setHomepageSettings(settingData.settings);
      }

      // Users
      const userRes = await fetch('/api/admin/users');
      const userData = await userRes.json();
      if (userData.success && userData.users) {
        setUsers(userData.users);
      }

      // Coupons
      const couponRes = await fetch('/api/admin/coupons');
      const couponData = await couponRes.json();
      if (couponData.success && couponData.coupons) {
        setCoupons(couponData.coupons);
      }

      // Feedback
      const feedbackRes = await fetch('/api/feedback');
      const feedbackData = await feedbackRes.json();
      if (feedbackData.success && feedbackData.feedback) {
        setFeedbackList(feedbackData.feedback);
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const handleUpdateFulfillment = async (orderId: string, fulfillmentStatus: string) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, fulfillmentStatus: fulfillmentStatus as any } : o));
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fulfillmentStatus })
    });
  };

  const handleUpdateTracking = async (orderId: string, trackingNumber: string, courierPartner: string) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, trackingNumber, courierPartner } : o));
    setStatusMsg(`Tracking updated for #${orderId}`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSaveHomepageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageSettings),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Homepage settings published live!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'heroImageUrl' | 'secondaryImageUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setHomepageSettings(prev => ({ ...prev, [targetField]: data.url }));
        setStatusMsg('Image uploaded to Cloudinary!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons([data.coupon, ...coupons]);
        setNewCoupon({ code: '', discountPercent: 10, minOrderAmount: 500 });
        setStatusMsg('New coupon created!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Coupon create error:', err);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#141E30] text-slate-100">
        
        {/* Left Sidebar (Matching Reference Screenshot 04) */}
        <aside className="w-16 sm:w-64 bg-[#0A111E] text-[#D4AF37] flex flex-col justify-between p-4 sm:p-6 shrink-0 border-r border-[#D4AF37]/30 shadow-2xl">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-10 w-44 hidden sm:block overflow-hidden">
                <Image src="/images/Header-logo.png" alt="SVT Logo" fill className="object-contain" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#141E30] font-black text-xl flex items-center justify-center sm:hidden shadow-md">
                SVT
              </div>
            </Link>

            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'orders'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">Order Management</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">Inventory Control</span>
              </button>

              <button
                onClick={() => setActiveTab('homepage')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'homepage'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">Image & Banner Editor</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'users'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">User Management</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'coupons'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">Coupon Manager</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">Analytics Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'feedback'
                    ? 'bg-[#D4AF37] text-[#141E30] shadow-lg font-black'
                    : 'text-slate-300 hover:bg-[#141E30] hover:text-[#D4AF37]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline uppercase tracking-wider">Complaints & Feedback</span>
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-[#D4AF37]/30 hidden sm:block text-xs">
            <div className="flex items-center space-x-2 text-[#D4AF37] font-bold">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Super Admin Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">pa0174492@gmail.com</p>
          </div>
        </aside>

        {/* Main Content Panel */}
        <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
          
          {/* Status Alert Banner */}
          {statusMsg && (
            <div className="p-4 bg-[#D4AF37] text-[#141E30] font-black text-xs rounded-2xl shadow-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-[#D4AF37]">
                {activeTab === 'orders' && '04 - Order Management Dashboard'}
                {activeTab === 'inventory' && 'Inventory Control Panel'}
                {activeTab === 'homepage' && 'Image & Banner Editor'}
                {activeTab === 'users' && 'User Management & Roles'}
                {activeTab === 'coupons' && 'Coupon & Promo Code Manager'}
                {activeTab === 'analytics' && 'Sales Analytics Dashboard'}
                {activeTab === 'feedback' && 'Customer Complaints & Feedback'}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Sidhi Vinayaka Traders • Enterprise Admin Suite
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/"
                target="_blank"
                className="px-5 py-2.5 gold-pill-button text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-md"
              >
                <Eye className="w-4 h-4" />
                <span>Live Website View</span>
              </Link>
            </div>
          </div>

          {/* TAB 1: ORDER MANAGEMENT DASHBOARD (Matching Reference Screenshot 04) */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0A111E] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-md">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-[#D4AF37]">Input Filter Order ID</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Filter Order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-4 py-2 rounded-xl border border-[#D4AF37]/30 bg-[#141E30] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-[#D4AF37]/30 bg-[#141E30] text-xs font-bold text-[#D4AF37] focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Order Management Table */}
              <div className="frosted-glass-navy rounded-3xl border border-[#D4AF37]/40 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0A111E] text-[#D4AF37] font-bold uppercase tracking-wider border-b border-[#D4AF37]/30">
                        <th className="py-4 px-4 w-8">
                          <input type="checkbox" className="rounded accent-[#D4AF37]" />
                        </th>
                        <th className="py-4 px-4">Order ID ↑</th>
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Customer Name</th>
                        <th className="py-4 px-4">Items</th>
                        <th className="py-4 px-4">Total Price</th>
                        <th className="py-4 px-4">Payment Status</th>
                        <th className="py-4 px-4">Fulfillment Status</th>
                        <th className="py-4 px-4 text-center">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4AF37]/15">
                      {filteredOrders.map((order) => {
                        const isSelected = order.orderId === selectedOrderId;

                        return (
                          <tr
                            key={order.orderId}
                            onClick={() => setSelectedOrderId(order.orderId)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#D4AF37]/15 text-white font-semibold' : 'hover:bg-[#0A111E]/60 text-slate-200'
                            }`}
                          >
                            <td className="py-4 px-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => setSelectedOrderId(order.orderId)}
                                className="rounded accent-[#D4AF37]"
                              />
                            </td>

                            <td className="py-4 px-4 font-mono font-bold text-[#D4AF37]">
                              #{order.orderId}
                            </td>

                            <td className="py-4 px-4 text-slate-400">
                              {order.createdAt}
                            </td>

                            <td className="py-4 px-4 font-bold text-white">
                              {order.customerDetails.name}
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {order.items[0]?.image && (
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#D4AF37]/30 shrink-0 bg-[#0A111E]">
                                    <Image src={order.items[0].image} alt="Thumbnail" fill className="object-cover" />
                                  </div>
                                )}
                                <div className="line-clamp-1 font-medium text-[11px] text-slate-300">
                                  {order.items.map(i => `${i.quantity}x ${i.title}`).join(', ')}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-black text-[#D4AF37]">
                              ₹{order.totalAmount}/-
                            </td>

                            <td className="py-4 px-4">
                              <span className="px-3 py-1 rounded-full font-bold text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                                Paid ({order.paymentMethod})
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <select
                                value={order.fulfillmentStatus}
                                onChange={(e) => handleUpdateFulfillment(order.orderId, e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#0A111E] text-[#D4AF37] border border-[#D4AF37]/40 focus:outline-none"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="DELIVERED">Delivered</option>
                              </select>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInvoiceOrder(order);
                                }}
                                className="p-2 bg-[#D4AF37] text-[#141E30] rounded-xl hover:brightness-110 shadow-md inline-flex items-center space-x-1 font-bold text-[10px]"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Invoice</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-[#0A111E] border-t border-[#D4AF37]/30 flex items-center justify-between text-xs text-slate-400">
                  <span>Showing {filteredOrders.length} orders</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY CONTROL PANEL */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="frosted-glass-navy p-6 rounded-3xl space-y-6">
                <h2 className="text-xl font-black font-display text-[#D4AF37] border-b border-[#D4AF37]/30 pb-3">
                  Inventory Stock Management
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INITIAL_PRODUCTS.map((prod) => (
                    <div key={prod._id} className="bg-[#0A111E] p-5 rounded-2xl border border-[#D4AF37]/30 space-y-4 shadow-md">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#D4AF37]/40 shrink-0">
                          <Image src={prod.images[0]} alt={prod.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{prod.title}</h4>
                          <p className="text-xs text-[#D4AF37] font-black">₹{prod.price}/-</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-300">
                          <span>Stock Quantity:</span>
                          <span className="font-bold text-emerald-400">{prod.stockQuantity || 150} kg</span>
                        </div>
                        <input
                          type="number"
                          defaultValue={prod.stockQuantity || 150}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-[#141E30] text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBPAGE LAYOUT & IMAGE STUDIO */}
          {activeTab === 'homepage' && (
            <div className="space-y-8 max-w-5xl">
              {/* Header with Live Preview Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/60 p-5 rounded-2xl border border-white/10">
                <div>
                  <h2 className="text-xl font-bold font-heading text-white">
                    Webpage Layout & Visuals Manager
                  </h2>
                  <p className="text-xs text-slate-400">
                    Customize titles, banners, images, category highlights, and announcements in real-time.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                      showLivePreview 
                        ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] font-bold shadow-sm'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>{showLivePreview ? 'Live Preview Enabled' : 'Enable Live Preview'}</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Visual Live Preview Mockup */}
              {showLivePreview && (
                <div className="p-6 rounded-3xl border border-[#D4AF37]/30 bg-navy-950 shadow-elevated space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Live Desktop Preview Simulator</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Updates live as you edit below</span>
                  </div>

                  {/* Mock Announcement Bar */}
                  <div className="bg-navy-900 text-center py-1 text-[10px] text-slate-300 font-medium rounded-lg border border-white/5 truncate px-2">
                    {homepageSettings.announcementText || 'Announcement text preview'}
                  </div>

                  {/* Mock Hero Banner */}
                  <div className="relative rounded-2xl overflow-hidden glass-panel p-6 border border-white/10 text-center space-y-3">
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-white max-w-xl mx-auto line-clamp-1">
                      {homepageSettings.heroTitle}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-lg mx-auto line-clamp-2">
                      {homepageSettings.heroSubtitle}
                    </p>
                    <div className="pt-1">
                      <span className="inline-block px-4 py-1.5 gold-cta-button text-[11px] font-bold text-navy-950 uppercase">
                        {homepageSettings.heroButtonText || 'Shop Now'}
                      </span>
                    </div>
                    <div className="relative aspect-[21/9] max-w-md mx-auto rounded-xl overflow-hidden border border-white/10 bg-navy-900 mt-3 shadow-md">
                      <Image
                        src={homepageSettings.heroImageUrl || '/images/raw_cashews_hero.webp'}
                        alt="Hero preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Mock Category Split */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-navy-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#D4AF37] font-bold block uppercase">Raw Cashews</span>
                        <p className="text-[9px] text-slate-400 line-clamp-1">{homepageSettings.rawCardSubtitle}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-white/10 shrink-0">
                        <Image src={homepageSettings.rawCardImage || '/images/raw_cashews_hero.webp'} alt="Raw" fill className="object-cover" />
                      </div>
                    </div>

                    <div className="p-3 bg-navy-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-rose-400 font-bold block uppercase">Flavoured</span>
                        <p className="text-[9px] text-slate-400 line-clamp-1">{homepageSettings.flavoredCardSubtitle}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-white/10 shrink-0">
                        <Image src={homepageSettings.flavoredCardImage || '/images/tandoori_cashews_hero.webp'} alt="Flavoured" fill className="object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Form */}
              <form onSubmit={handleSaveHomepageSettings} className="space-y-6">
                
                {/* 1. Top Announcement Bar */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="text-sm font-bold font-heading text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                    <span>Top Header Announcement Ticker</span>
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Announcement Message</label>
                    <input
                      type="text"
                      value={homepageSettings.announcementText}
                      onChange={(e) => setHomepageSettings({ ...homepageSettings, announcementText: e.target.value })}
                      placeholder="e.g. Direct Uppal Roastery Counter • 100% Pure W180 Jumbo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* 2. Hero Headline, Subtitle & Primary Banner Image */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold font-heading text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                    <span>Hero Section & Primary Visual Banner</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Main Title</label>
                      <input
                        type="text"
                        value={homepageSettings.heroTitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Subtitle</label>
                      <textarea
                        rows={2}
                        value={homepageSettings.heroSubtitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={homepageSettings.heroButtonText}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroButtonText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">CTA Button Link</label>
                      <input
                        type="text"
                        value={homepageSettings.heroButtonLink}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroButtonLink: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Image Path or Cloudinary URL</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={homepageSettings.heroImageUrl}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroImageUrl: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                      <label className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold rounded-xl cursor-pointer transition-colors border border-white/10 flex items-center space-x-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImageUrl')} className="hidden" />
                      </label>
                    </div>

                    {/* Quick Preset Selector */}
                    <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400">
                      <span>Quick Presets:</span>
                      {[
                        { label: 'King Jumbo Hero', path: '/images/raw_cashews_hero.webp' },
                        { label: 'Bowl Presentation', path: '/images/raw-cashews-nuts-bowl-marble-background.webp' },
                        { label: 'Gourmet Jars', path: '/images/cashew-nuts-ai-generated.webp' },
                        { label: 'Tandoori Masala', path: '/images/tandoori_cashews_hero.webp' },
                      ].map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setHomepageSettings({ ...homepageSettings, heroImageUrl: preset.path })}
                          className={`px-2 py-0.5 rounded-md border text-[10px] transition-colors ${
                            homepageSettings.heroImageUrl === preset.path
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-semibold'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Category Showcase Split Cards */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold font-heading text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                    <span>Homepage Category Feature Cards</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Raw Cashew Card Config */}
                    <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase">Raw Cashews Card</span>
                        <Badge variant="gold">/category/raw</Badge>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={homepageSettings.rawCardSubtitle}
                          onChange={(e) => setHomepageSettings({ ...homepageSettings, rawCardSubtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-navy-900 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Image URL</label>
                        <input
                          type="text"
                          value={homepageSettings.rawCardImage}
                          onChange={(e) => setHomepageSettings({ ...homepageSettings, rawCardImage: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-navy-900 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Flavoured Cashew Card Config */}
                    <div className="p-4 rounded-xl bg-navy-950 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-400 uppercase">Flavoured Cashews Card</span>
                        <Badge variant="spice">/category/flavored</Badge>
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Subtitle</label>
                        <input
                          type="text"
                          value={homepageSettings.flavoredCardSubtitle}
                          onChange={(e) => setHomepageSettings({ ...homepageSettings, flavoredCardSubtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-navy-900 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Image URL</label>
                        <input
                          type="text"
                          value={homepageSettings.flavoredCardImage}
                          onChange={(e) => setHomepageSettings({ ...homepageSettings, flavoredCardImage: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-navy-900 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Secondary Showcase Promo Banner */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-sm font-bold font-heading text-white border-b border-white/10 pb-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" strokeWidth={2} />
                    <span>Secondary Promotional Banner</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Promo Title</label>
                      <input
                        type="text"
                        value={homepageSettings.secondaryTitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, secondaryTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Promo Button Text</label>
                      <input
                        type="text"
                        value={homepageSettings.secondaryButtonText}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, secondaryButtonText: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Promo Subtitle</label>
                      <textarea
                        rows={2}
                        value={homepageSettings.secondarySubtitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, secondarySubtitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Banner Image URL</label>
                      <input
                        type="text"
                        value={homepageSettings.secondaryImageUrl}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, secondaryImageUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>
                </div>

                {/* Save and Publish Actions */}
                <div className="flex items-center space-x-4 pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-8 py-3.5 gold-cta-button font-bold text-xs uppercase tracking-wider flex items-center space-x-2 text-navy-950 shadow-lg"
                  >
                    <Save className="w-4 h-4" strokeWidth={2} />
                    <span>{savingSettings ? 'Publishing Changes...' : 'Save & Publish Changes Live'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={fetchAllAdminData}
                    className="px-4 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-white/10"
                  >
                    Reset to Published
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 4: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="frosted-glass-navy p-6 rounded-3xl space-y-6">
              <h2 className="text-xl font-black font-display text-[#D4AF37] border-b border-[#D4AF37]/30 pb-3">
                Registered Users & Super Admin Designation
              </h2>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0A111E] text-[#D4AF37] font-bold uppercase border-b border-[#D4AF37]/30">
                      <th className="py-3 px-4">User Email</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/15">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-[#0A111E]/50">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{u.email}</td>
                        <td className="py-3.5 px-4 text-slate-300">{u.displayName || 'Customer'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                            u.role === 'super-admin' ? 'bg-[#D4AF37] text-[#141E30]' : 'bg-slate-700 text-white'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-emerald-400 font-bold text-[10px]">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: COUPON MANAGER */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleCreateCoupon} className="frosted-glass-navy p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-black font-display text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2">
                  Create New Discount Coupon
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="COUPON CODE (e.g. WELCOME10)"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#0A111E] text-xs text-white uppercase focus:outline-none"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Discount % (e.g. 10)"
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                    className="px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/30 bg-[#0A111E] text-xs text-white focus:outline-none"
                  />
                  <button type="submit" className="px-4 py-2.5 gold-pill-button text-xs uppercase font-black">
                    Create Coupon
                  </button>
                </div>
              </form>

              <div className="frosted-glass-navy p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-black font-display text-[#D4AF37]">Active Promo Coupons</h3>
                <div className="space-y-2">
                  {coupons.map((c) => (
                    <div key={c._id} className="flex justify-between items-center bg-[#0A111E] p-3 rounded-xl border border-[#D4AF37]/30">
                      <div>
                        <span className="font-mono font-black text-[#D4AF37] text-sm">{c.code}</span>
                        <span className="text-xs text-slate-300 ml-3">{c.discountPercent}% OFF (Min order ₹{c.minOrderAmount})</span>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full font-bold">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="frosted-glass-navy p-6 rounded-3xl space-y-2 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
                  <p className="text-3xl font-black text-[#D4AF37]">₹{totalRevenue.toLocaleString()}/-</p>
                </div>
                <div className="frosted-glass-navy p-6 rounded-3xl space-y-2 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Orders</p>
                  <p className="text-3xl font-black text-emerald-400">{orders.length}</p>
                </div>
                <div className="frosted-glass-navy p-6 rounded-3xl space-y-2 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase">Registered Customers</p>
                  <p className="text-3xl font-black text-white">{users.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: COMPLAINTS & FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="frosted-glass-navy p-6 rounded-3xl space-y-4">
              <h2 className="text-xl font-black font-display text-[#D4AF37] border-b border-[#D4AF37]/30 pb-3">
                Customer Complaints & Feedback Inbox
              </h2>

              <div className="space-y-3">
                {feedbackList.map((f) => (
                  <div key={f._id} className="bg-[#0A111E] p-4 rounded-2xl border border-[#D4AF37]/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{f.name} ({f.email})</span>
                      <span className="text-[10px] px-3 py-1 rounded-full font-bold bg-[#D4AF37] text-[#141E30]">
                        {f.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{f.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* PRINTABLE INVOICE MODAL */}
        {invoiceOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 w-full max-w-2xl p-8 rounded-3xl space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-2xl font-black font-display text-[#141E30]">SIDHI VINAYAKA TRADERS</h2>
                  <p className="text-xs text-slate-600">Surya Nagar Colony, Uppal, Hyderabad - 500039</p>
                  <p className="text-xs text-slate-600">Phone: +91 9515273464 / +91 8919620379</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black font-mono text-[#D4AF37]">TAX INVOICE</p>
                  <p className="text-xs font-bold font-mono text-slate-700">#{invoiceOrder.orderId}</p>
                  <p className="text-[11px] text-slate-500">{invoiceOrder.createdAt}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">Billed To:</p>
                <p className="font-bold text-base">{invoiceOrder.customerDetails.name}</p>
                <p>{invoiceOrder.customerDetails.address}, {invoiceOrder.customerDetails.colony}</p>
                <p>{invoiceOrder.customerDetails.city} - {invoiceOrder.customerDetails.pincode}</p>
                <p>Phone: {invoiceOrder.customerDetails.phone}</p>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold border-b border-slate-900">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoiceOrder.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-bold">{it.title}</td>
                      <td className="py-2.5 px-3">{it.size}</td>
                      <td className="py-2.5 px-3">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-bold">₹{it.price * it.quantity}/-</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900 text-sm font-black">
                <span>Total Amount Paid ({invoiceOrder.paymentMethod}):</span>
                <span className="text-[#D4AF37] text-xl">₹{invoiceOrder.totalAmount}/-</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setInvoiceOrder(null)}
                  className="px-5 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 rounded-xl bg-[#141E30] text-[#D4AF37] text-xs font-bold flex items-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
