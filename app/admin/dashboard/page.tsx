'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminGuard from '@/components/admin-guard';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  LayoutDashboard, ShoppingBag, Bell, Package,
  Search, SlidersHorizontal, RefreshCw, Eye, Upload, Save, CheckCircle2,
  ImageIcon, Users, Ticket, BarChart3, MessageSquare, Printer, Truck, Shield, AlertTriangle,
  Sparkles, Flame, UserPlus, UserCheck, UserX, Trash2, Key, Crown, ShieldAlert, Check, X, ShieldCheck,
  ChevronLeft, ChevronRight, Clock, ExternalLink, Lock, HelpCircle,
  Smartphone, Monitor, Tablet, Zap, Percent, DollarSign, TrendingUp, TrendingDown,
  Award, Share2, Copy, Calendar, Filter, Layers, PieChart, BarChart, MapPin,
  Activity, FileText, Download, Sliders, Palette, Tag, ArrowUpRight,
  Gift, Star, ArrowUp, ArrowDown, Edit3, Plus, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { INITIAL_PRODUCTS } from '@/lib/mock-data';
import { ICategoryFeatureCard, DEFAULT_CATEGORY_CARDS } from '@/lib/category-cards';

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

  // Current Admin Identity & Role State
  const [currentAdminRole, setCurrentAdminRole] = useState<'super-admin' | 'admin'>('super-admin');
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string>('pa0174492@gmail.com');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User Management Suite States
  const [grantAdminForm, setGrantAdminForm] = useState({
    email: '',
    displayName: '',
    role: 'admin' as 'admin' | 'super-admin',
  });
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'super-admin' | 'admin' | 'user'>('ALL');
  const [grantingAdmin, setGrantingAdmin] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState<string | null>(null);
  const [userSuccessMsg, setUserSuccessMsg] = useState('');
  const [userErrorMsg, setUserErrorMsg] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);

  // Filters & Selected State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('SVT-8801');
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Homepage CMS State
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
    categoryCards: DEFAULT_CATEGORY_CARDS as ICategoryFeatureCard[],
  });
  const [cmsViewport, setCmsViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Category Feature Cards Management States
  const [editingCard, setEditingCard] = useState<ICategoryFeatureCard | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [uploadingCardImg, setUploadingCardImg] = useState(false);

  // Coupon Engine States
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FLAT',
    discountPercent: 15,
    flatAmount: 150,
    minOrderAmount: 750,
    maxDiscountCap: 500,
    expiresAt: '2026-12-31',
    description: 'Exclusive promotional offer on SVT premium cashews.',
    customerSegment: 'ALL' as 'ALL' | 'VIP' | 'FIRST_ORDER',
  });
  const [couponSearchQuery, setCouponSearchQuery] = useState('');
  const [couponFilterStatus, setCouponFilterStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  // Analytics Timeframe State
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'TODAY' | '7D' | '30D' | 'QUARTER' | 'LIFETIME'>('30D');

  // Status Messages
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Curated Theme Presets for 1-Click CMS Application
  const THEME_PRESETS = [
    {
      name: '👑 Royal King Jumbo Harvest',
      desc: 'Highlight supreme W180 King size raw whole nuts',
      badge: 'Bestseller',
      settings: {
        heroTitle: 'Supreme Grade W180 King Jumbo Cashews',
        heroSubtitle: 'Directly sourced from trusted orchards and freshly sorted at our Uppal facility in Hyderabad. Indulge in unmatched sweetness and crisp natural crunch.',
        heroImageUrl: '/images/raw_cashews_hero.webp',
        heroButtonText: 'Order King Jumbo (1kg)',
        heroButtonLink: '/#shop',
        announcementText: '🌟 Direct Uppal Roastery Counter • 100% Pure W180 & W210 Jumbo Cashews • Wholesale & Retail Available',
        rawCardSubtitle: 'Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.',
        rawCardImage: '/images/raw_cashews_hero.webp',
        flavoredCardSubtitle: 'Peri Peri, Tandoori Masala & Pudina Herb infused with authentic spices.',
        flavoredCardImage: '/images/tandoori_cashews_hero.webp',
        secondaryTitle: 'Artisanal Flavoured Roastery Blends',
        secondarySubtitle: 'Slow roasted in pure olive blend with rich Indian tandoori & peri peri spices for an irresistible crunch.',
        secondaryImageUrl: '/images/tandoori_cashews_hero.webp',
        secondaryButtonText: 'Explore Spiced Blends',
        secondaryButtonLink: '/category/flavored',
      }
    },
    {
      name: '🔥 Artisanal Masala Fiesta',
      desc: 'Spotlight fiery Peri Peri & Tandoori gourmet roasts',
      badge: 'Spicy Treats',
      settings: {
        heroTitle: 'Artisanal Spiced & Roasted Gourmet Cashews',
        heroSubtitle: 'Hand-tossed with Kashmiri red chilli, peri peri herbs, and Himalayan pink salt. Roasted to golden perfection at our Hyderabad Roastery.',
        heroImageUrl: '/images/tandoori_cashews_hero.webp',
        heroButtonText: 'Explore Flavoured Collection',
        heroButtonLink: '/category/flavored',
        announcementText: '🔥 Fresh Batch Roasted Today: Tandoori Masala, Peri Peri & Black Pepper Spiced Cashews',
        rawCardSubtitle: 'Classic whole nuts straight from coastal farm orchards.',
        rawCardImage: '/images/raw_cashews_hero.webp',
        flavoredCardSubtitle: 'Chef crafted signature spice blends with zero artificial additives.',
        flavoredCardImage: '/images/tandoori_cashews_hero.webp',
        secondaryTitle: 'The Purest Uppal Roastery Crunch',
        secondarySubtitle: '100% natural, vacuum-sealed packaging ensuring maximum crispness and prolonged freshness.',
        secondaryImageUrl: '/images/cashew-nuts-ai-generated.webp',
        secondaryButtonText: 'Shop All Grades',
        secondaryButtonLink: '/#shop',
      }
    },
    {
      name: '🪔 Festive Diwali & Corporate Hampers',
      desc: 'Luxury royal gift boxes for weddings & celebrations',
      badge: 'Festive Special',
      settings: {
        heroTitle: 'Royal Handcrafted Cashew Festive Gift Hampers',
        heroSubtitle: 'Celebrate auspicious moments with premium royal cashew gift boxes packed with King Jumbo W180 and gourmet roasted varieties.',
        heroImageUrl: '/images/cashew-nuts-ai-generated.webp',
        heroButtonText: 'Order Festive Boxes',
        heroButtonLink: '/#shop',
        announcementText: '🪔 Special Festive Gifting Counter Open • Custom Corporate Branding & Bulk Delivery Across India',
        rawCardSubtitle: 'Pristine whole nuts for family celebrations and traditional sweets.',
        rawCardImage: '/images/raw_cashews_hero.webp',
        flavoredCardSubtitle: 'Party-perfect spicy appetiser blends for guests.',
        flavoredCardImage: '/images/tandoori_cashews_hero.webp',
        secondaryTitle: 'Wholesale Counter & Bulk 10kg Sacks',
        secondarySubtitle: 'Direct factory pricing for sweet makers, restaurants, caterers, and corporate clients in Hyderabad.',
        secondaryImageUrl: '/images/raw-cashews-nuts-bowl-marble-background.webp',
        secondaryButtonText: 'WhatsApp Bulk Desk',
        secondaryButtonLink: 'https://wa.me/919515273464',
      }
    }
  ];

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth & Role Listener
  useEffect(() => {
    if (auth) {
      const unsub = onAuthStateChanged(auth, (u) => {
        if (u?.email) {
          const email = u.email.toLowerCase().trim();
          setCurrentAdminEmail(email);
          if (email === 'pa0174492@gmail.com' || email === 'sahuravindra897@gmail.com') {
            setCurrentAdminRole('super-admin');
          } else {
            const found = users.find((usr: any) => usr.email?.toLowerCase() === email);
            if (found?.role === 'super-admin') {
              setCurrentAdminRole('super-admin');
            } else {
              setCurrentAdminRole('admin');
            }
          }
        }
      });
      return () => unsub();
    }
  }, [users]);

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
          },
          {
            orderId: 'SVT-8803',
            customerDetails: { name: 'Priya Reddy', phone: '+91 9848012345', address: 'Flat 302 Cyber Tower', colony: 'Madhapur', city: 'Hyderabad', pincode: '500081' },
            items: [
              { productId: 'p3', title: 'Tandoori Masala Cashew 1kg', size: '1kg', quantity: 2, price: 880, image: '/images/tandoori_cashews_hero.png' }
            ],
            totalAmount: 1760,
            paymentMethod: 'UPI',
            paymentStatus: 'PAID',
            fulfillmentStatus: 'SHIPPED',
            trackingNumber: 'SVT-TRACK-8803',
            courierPartner: 'Hyderabad Fast-Track Logistics',
            createdAt: '2026-08-28'
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

  const handleSaveHomepageSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageSettings),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Homepage layout & banners published live successfully!');
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      console.error('Save settings error:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleApplyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
    setHomepageSettings(prev => ({ ...prev, ...preset.settings }));
    setStatusMsg(`Loaded Theme Preset: "${preset.name}". Click "Publish" to apply live.`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'heroImageUrl' | 'secondaryImageUrl' | 'rawCardImage' | 'flavoredCardImage') => {
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
        setStatusMsg('Image uploaded to Cloudinary successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  // Category Feature Cards Management Handlers
  const handleOpenAddCard = () => {
    const existingCards = homepageSettings.categoryCards || [];
    setEditingCard({
      id: `card-${Date.now()}`,
      title: '',
      subtitle: '',
      badgeText: 'Featured Specialty',
      badgeIcon: 'sparkles',
      badgeVariant: 'gold',
      linkUrl: '/#shop',
      linkText: 'Explore Products',
      imageUrl: '/images/raw_cashews_hero.webp',
      accentColor: '#D4AF37',
      isActive: true,
      order: existingCards.length + 1,
    });
    setShowCardModal(true);
  };

  const handleOpenEditCard = (card: ICategoryFeatureCard) => {
    setEditingCard({ ...card });
    setShowCardModal(true);
  };

  const handleSaveCardModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard || !editingCard.title.trim()) return;

    setHomepageSettings(prev => {
      const cards = [...(prev.categoryCards || DEFAULT_CATEGORY_CARDS)];
      const index = cards.findIndex(c => c.id === editingCard.id);
      if (index >= 0) {
        cards[index] = editingCard;
      } else {
        cards.push(editingCard);
      }
      return { ...prev, categoryCards: cards };
    });

    setShowCardModal(false);
    setEditingCard(null);
    setStatusMsg(`Category Card "${editingCard.title}" updated. Remember to "Publish Layout" to save.`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleDeleteCard = (cardId: string) => {
    const cardToDelete = (homepageSettings.categoryCards || []).find(c => c.id === cardId);
    if (!confirm(`Are you sure you want to delete the category card "${cardToDelete?.title || cardId}"?`)) return;

    setHomepageSettings(prev => ({
      ...prev,
      categoryCards: (prev.categoryCards || []).filter(c => c.id !== cardId),
    }));
    setStatusMsg('Category card removed. Click "Publish Layout" to apply.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleToggleCardActive = (cardId: string) => {
    setHomepageSettings(prev => ({
      ...prev,
      categoryCards: (prev.categoryCards || []).map(c =>
        c.id === cardId ? { ...c, isActive: !c.isActive } : c
      ),
    }));
  };

  const handleMoveCard = (cardId: string, direction: 'up' | 'down') => {
    setHomepageSettings(prev => {
      const cards = [...(prev.categoryCards || DEFAULT_CATEGORY_CARDS)];
      const index = cards.findIndex(c => c.id === cardId);
      if (index < 0) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= cards.length) return prev;

      const temp = cards[index];
      cards[index] = cards[targetIndex];
      cards[targetIndex] = temp;

      // re-index order
      const reordered = cards.map((c, idx) => ({ ...c, order: idx + 1 }));
      return { ...prev, categoryCards: reordered };
    });
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCard) return;

    setUploadingCardImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setEditingCard(prev => prev ? { ...prev, imageUrl: data.url } : null);
        setStatusMsg('Card image uploaded to Cloudinary successfully!');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      console.error('Card image upload failed:', err);
    } finally {
      setUploadingCardImg(false);
    }
  };

  const handleApplyPresetCard = (preset: Partial<ICategoryFeatureCard>) => {
    const newCard: ICategoryFeatureCard = {
      id: `card-${Date.now()}`,
      title: preset.title || 'New Specialty',
      subtitle: preset.subtitle || '',
      badgeText: preset.badgeText || 'Specialty',
      badgeIcon: preset.badgeIcon || 'sparkles',
      badgeVariant: (preset.badgeVariant as any) || 'gold',
      linkUrl: preset.linkUrl || '/#shop',
      linkText: preset.linkText || 'Explore Products',
      imageUrl: preset.imageUrl || '/images/raw_cashews_hero.webp',
      accentColor: preset.accentColor || '#D4AF37',
      isActive: true,
      order: (homepageSettings.categoryCards?.length || 0) + 1,
    };

    setHomepageSettings(prev => ({
      ...prev,
      categoryCards: [...(prev.categoryCards || DEFAULT_CATEGORY_CARDS), newCard],
    }));
    setStatusMsg(`Added "${newCard.title}" card. Click "Publish Layout" to save.`);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleResetCategoryCards = () => {
    if (!confirm('Reset category cards to default 4 roastery showcase cards?')) return;
    setHomepageSettings(prev => ({
      ...prev,
      categoryCards: DEFAULT_CATEGORY_CARDS,
    }));
    setStatusMsg('Category cards reset to defaults.');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Coupon Engine Handlers
  const handleGenerateRandomCouponCode = () => {
    const prefixes = ['SVT', 'ROYAL', 'UPPAL', 'JUMBO', 'FESTIVE', 'CRUNCH'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 85);
    const code = `${randomPrefix}${randomNum}`;
    setCouponForm(prev => ({ ...prev, code }));
  };

  const handleCreateAdvancedCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    setCreatingCoupon(true);
    try {
      const payload = {
        code: couponForm.code.toUpperCase().trim(),
        discountType: couponForm.discountType,
        discountPercent: couponForm.discountType === 'PERCENT' ? couponForm.discountPercent : undefined,
        flatAmount: couponForm.discountType === 'FLAT' ? couponForm.flatAmount : undefined,
        minOrderAmount: couponForm.minOrderAmount,
        maxDiscount: couponForm.maxDiscountCap,
        expiresAt: couponForm.expiresAt,
        description: couponForm.description,
        customerSegment: couponForm.customerSegment,
        isActive: true,
      };

      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(prev => [data.coupon || payload, ...prev]);
        setCouponForm({
          code: '',
          discountType: 'PERCENT',
          discountPercent: 15,
          flatAmount: 150,
          minOrderAmount: 750,
          maxDiscountCap: 500,
          expiresAt: '2026-12-31',
          description: 'Special seasonal promotional offer on SVT premium cashews.',
          customerSegment: 'ALL',
        });
        setStatusMsg(`Coupon code "${payload.code}" created and activated!`);
        setTimeout(() => setStatusMsg(''), 4000);
      }
    } catch (err) {
      console.error('Coupon create error:', err);
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleToggleCouponActive = async (couponId: string, currentActive: boolean) => {
    try {
      setCoupons(prev => prev.map(c => c._id === couponId ? { ...c, isActive: !currentActive } : c));
      await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: couponId, isActive: !currentActive }),
      });
      setStatusMsg(`Coupon status updated.`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Toggle coupon error:', err);
    }
  };

  const handleDeleteCoupon = async (couponId: string, code: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete coupon (${code})?`)) return;
    try {
      setCoupons(prev => prev.filter(c => c._id !== couponId));
      await fetch(`/api/admin/coupons?id=${couponId}`, { method: 'DELETE' });
      setStatusMsg(`Coupon ${code} removed.`);
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
  };

  const handleCopyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => { });
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2500);
  };

  const handleShareWhatsAppCoupon = (code: string, discount: number | string) => {
    const text = `🎉 Sidhi Vinayaka Traders Exclusive Offer! Use coupon code *${code}* to get discount on 100% Pure W180 King Jumbo and Gourmet Spiced Cashews! Order now at https://svtcashews.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // User Management Actions
  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserErrorMsg('');
    setUserSuccessMsg('');
    setGrantingAdmin(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(grantAdminForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to grant admin access.');

      setUserSuccessMsg(`Admin access granted to ${grantAdminForm.email} successfully!`);
      setGrantAdminForm({ email: '', displayName: '', role: 'admin' });
      setShowGrantModal(false);
      await fetchAllAdminData();
      setTimeout(() => setUserSuccessMsg(''), 4000);
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Could not grant admin permissions.');
      setTimeout(() => setUserErrorMsg(''), 4000);
    } finally {
      setGrantingAdmin(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setUserErrorMsg('');
    setUserSuccessMsg('');
    setUserActionLoading(userId);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update user role.');

      setUserSuccessMsg(data.message || 'User permissions updated successfully.');
      await fetchAllAdminData();
      setTimeout(() => setUserSuccessMsg(''), 3000);
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Failed to update role.');
      setTimeout(() => setUserErrorMsg(''), 4000);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleToggleUserActive = async (userId: string, currentActive: boolean) => {
    setUserErrorMsg('');
    setUserSuccessMsg('');
    setUserActionLoading(userId);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentActive }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to update status.');

      setUserSuccessMsg(data.message || 'User status updated.');
      await fetchAllAdminData();
      setTimeout(() => setUserSuccessMsg(''), 3000);
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Failed to update status.');
      setTimeout(() => setUserErrorMsg(''), 4000);
    } finally {
      setUserActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to revoke access and remove user (${email})?`)) return;

    setUserErrorMsg('');
    setUserSuccessMsg('');
    setUserActionLoading(userId);

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to remove user.');

      setUserSuccessMsg(data.message || 'User removed successfully.');
      await fetchAllAdminData();
      setTimeout(() => setUserSuccessMsg(''), 3000);
    } catch (err: any) {
      setUserErrorMsg(err.message || 'Failed to remove user.');
      setTimeout(() => setUserErrorMsg(''), 4000);
    } finally {
      setUserActionLoading(null);
    }
  };

  // Filtered Lists
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.fulfillmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.email?.toLowerCase() || '').includes(userSearchQuery.toLowerCase()) ||
      (u.displayName?.toLowerCase() || '').includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredCoupons = coupons.filter(c => {
    const matchesQuery = (c.code || '').toLowerCase().includes(couponSearchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(couponSearchQuery.toLowerCase());
    const matchesStatus = couponFilterStatus === 'ALL'
      ? true
      : couponFilterStatus === 'ACTIVE'
        ? c.isActive !== false
        : c.isActive === false;
    return matchesQuery && matchesStatus;
  });

  // Analytics Computations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrdersCount = orders.filter(o => o.fulfillmentStatus === 'PENDING' || o.fulfillmentStatus === 'PROCESSING').length;
  const deliveredOrdersCount = orders.filter(o => o.fulfillmentStatus === 'DELIVERED').length;
  const averageOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  // Total KG calculated from order items
  const totalKgSourced = orders.reduce((kgSum, o) => {
    return kgSum + o.items.reduce((itemSum, item) => {
      const multiplier = item.size?.includes('500g') ? 0.5 : item.size?.includes('250g') ? 0.25 : 1;
      return itemSum + (item.quantity * multiplier);
    }, 0);
  }, 0);

  // Raw vs Flavoured Revenue Split
  const rawRevenue = orders.reduce((sum, o) => {
    return sum + o.items
      .filter(i => i.title.toLowerCase().includes('raw') || i.title.toLowerCase().includes('w180') || i.title.toLowerCase().includes('w210'))
      .reduce((s, it) => s + (it.price * it.quantity), 0);
  }, 0);
  const flavoredRevenue = Math.max(0, totalRevenue - rawRevenue);
  const rawPercent = totalRevenue ? Math.round((rawRevenue / totalRevenue) * 100) : 60;
  const flavoredPercent = 100 - rawPercent;

  // Payment Breakdown
  const upiOrders = orders.filter(o => o.paymentMethod === 'UPI').length;
  const codOrders = orders.filter(o => o.paymentMethod === 'COD').length;
  const cardOrders = orders.filter(o => o.paymentMethod === 'CARD').length;

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#070D18] text-slate-100 selection:bg-[#D4AF37] selection:text-[#070D18]">

        {/* Advanced Side Navbar */}
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-[#0A111E] via-[#0D1527] to-[#080E1A] text-[#D4AF37] flex flex-col justify-between p-4 sm:p-5 shrink-0 border-r border-[#D4AF37]/20 shadow-2xl transition-all duration-300 relative z-30`}>
          <div className="space-y-6">

            {/* Logo & Collapse Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
              <Link href="/" className="flex items-center space-x-3 overflow-hidden">
                {!sidebarCollapsed ? (
                  <div className="relative h-10 w-44">
                    <Image src="/images/Header-logo.png" alt="SVT Logo" fill className="object-contain" priority />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xl flex items-center justify-center shadow-lg mx-auto">
                    SVT
                  </div>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden sm:flex w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-[#D4AF37] items-center justify-center border border-white/10 transition-colors"
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="space-y-6">

              {/* Category 1: Operations */}
              <div>
                {!sidebarCollapsed && (
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-[#D4AF37]" />
                    <span>Store Operations</span>
                  </p>
                )}
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('orders')}
                    title="Order Management"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'orders'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="uppercase tracking-wider">Orders & Tracking</span>}
                    </div>
                    {!sidebarCollapsed && pendingOrdersCount > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'orders' ? 'bg-[#070D18] text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>

                  <Link
                    href="/admin/products"
                    title="Product Catalog Suite"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]`}
                  >
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                      {!sidebarCollapsed && <span className="uppercase tracking-wider">Product Catalog</span>}
                    </div>
                    {!sidebarCollapsed && <ExternalLink className="w-3 h-3 text-slate-500" />}
                  </Link>

                  <button
                    onClick={() => setActiveTab('inventory')}
                    title="Inventory Control"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'inventory'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <Package className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="uppercase tracking-wider">Stock & Inventory</span>}
                  </button>

                  <button
                    onClick={() => setActiveTab('feedback')}
                    title="Customer Feedback"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'feedback'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="uppercase tracking-wider">Support & Feedback</span>}
                    </div>
                    {!sidebarCollapsed && feedbackList.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'feedback' ? 'bg-[#070D18] text-[#D4AF37]' : 'bg-white/10 text-slate-300'}`}>
                        {feedbackList.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Category 2: Marketing */}
              <div>
                {!sidebarCollapsed && (
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>Marketing & Deals</span>
                  </p>
                )}
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('coupons')}
                    title="Coupons & Promos"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'coupons'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Ticket className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="uppercase tracking-wider">Coupons & Promos</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'coupons' ? 'bg-[#070D18] text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                        {coupons.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Category 3: Master Control (Super Admin) */}
              <div>
                {!sidebarCollapsed && (
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37] px-3 mb-2 flex items-center gap-1.5">
                    <Crown className="w-3 h-3 text-[#D4AF37]" />
                    <span>Master Control (Super Admin)</span>
                  </p>
                )}
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('users')}
                    title="User Management & Delegation"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'users'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span className="uppercase tracking-wider">Users & Admin Roles</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'users' ? 'bg-[#070D18] text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'}`}>
                        {users.length}
                      </span>
                    )}
                  </button>

                  <Link
                    href="/admin/theme"
                    title="Indian Festival Theme Studio"
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Palette className="w-4 h-4 shrink-0 text-amber-400" />
                      {!sidebarCollapsed && <span className="uppercase tracking-wider font-black">🪔 Festival Themes</span>}
                    </div>
                    {!sidebarCollapsed && <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">PRO</span>}
                  </Link>

                  <button
                    onClick={() => setActiveTab('homepage')}
                    title="Homepage CMS & Banners"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'homepage'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <ImageIcon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="uppercase tracking-wider">Homepage CMS Visuals</span>}
                  </button>

                  <button
                    onClick={() => setActiveTab('analytics')}
                    title="Revenue & Analytics"
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'} py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === 'analytics'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] shadow-lg font-black'
                        : 'text-slate-300 hover:bg-white/5 hover:text-[#D4AF37]'
                      }`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="uppercase tracking-wider">Revenue & Analytics</span>}
                  </button>
                </div>
              </div>

            </nav>
          </div>

          {/* Admin Identity Card at Bottom */}
          <div className="pt-4 border-t border-[#D4AF37]/20 text-xs">
            {!sidebarCollapsed ? (
              <div className="bg-[#070D18]/90 p-3 rounded-2xl border border-[#D4AF37]/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-black text-[#D4AF37]">
                    {currentAdminRole === 'super-admin' ? (
                      <>
                        <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Super Admin</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-blue-400">Store Admin</span>
                      </>
                    )}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <p className="text-[10px] text-slate-400 truncate font-mono">{currentAdminEmail}</p>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto border border-[#D4AF37]/30 text-[#D4AF37]" title={currentAdminEmail}>
                {currentAdminRole === 'super-admin' ? <Crown className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 text-blue-400" />}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-8 space-y-6 overflow-x-hidden">

          {/* Top Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0A111E]/80 backdrop-blur-md p-5 rounded-3xl border border-[#D4AF37]/20 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display text-white flex items-center gap-2">
                  <span>
                    {activeTab === 'orders' && 'Order Management & Fulfillment'}
                    {activeTab === 'inventory' && 'Inventory Control & Stock Management'}
                    {activeTab === 'homepage' && 'Homepage Visual CMS & Live Customizer'}
                    {activeTab === 'users' && 'User Management & Role Delegation'}
                    {activeTab === 'coupons' && 'Coupon & Promo Campaign Manager'}
                    {activeTab === 'analytics' && 'Executive Sales & Revenue Analytics'}
                    {activeTab === 'feedback' && 'Customer Inquiries & Support Desk'}
                  </span>
                </h1>
                {currentAdminRole === 'super-admin' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                    <Crown className="w-3 h-3" />
                    <span>SUPER ADMIN PRIVILEGES</span>
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    <ShieldCheck className="w-3 h-3" />
                    <span>STORE ADMIN ACCESS</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Sidhi Vinayaka Traders Uppal Enterprise Suite</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-[#D4AF37] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentTime || '03:30 AM IST'}
                </span>
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={fetchAllAdminData}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all flex items-center space-x-1.5"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4AF37]' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <Link
                href="/"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg transition-transform hover:scale-105"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Storefront View</span>
              </Link>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMsg && (
            <div className="p-4 bg-gradient-to-r from-[#D4AF37] to-[#C99E2E] text-[#070D18] font-black text-xs rounded-2xl shadow-xl flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Role Access Guard Component for Store Admins accessing Super-Admin-Only Tabs */}
          {currentAdminRole !== 'super-admin' && (activeTab === 'users' || activeTab === 'homepage') && (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#0A111E] border border-[#D4AF37]/40 shadow-2xl text-center space-y-6 max-w-2xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30 shadow-lg">
                <Crown className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-display text-white">Super Admin Access Clearance Required</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-lg mx-auto">
                  User Role Delegation and Live Homepage CMS Configuration are restricted to Master Super Administrators (e.g. <span className="text-[#D4AF37] font-mono font-bold">pa0174492@gmail.com</span>).
                </p>
              </div>

              <div className="bg-[#070D18] p-4 rounded-2xl border border-white/5 text-left text-xs space-y-2">
                <p className="font-bold text-[#D4AF37] uppercase text-[10px] tracking-wider">Your Store Admin Permissions:</p>
                <ul className="space-y-1.5 text-slate-300 text-[11px]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manage Orders, Update Tracking & Print Invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Control Product Catalog & Inventory Stock</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Create & Monitor Promotional Discount Coupons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Review Customer Inquiries & Complaints</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-[#070D18] font-black text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
                >
                  Go to Orders & Fulfillment
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inventory')}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Manage Stock Inventory
                </button>
              </div>
            </div>
          )}

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
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#D4AF37]/15 text-white font-semibold' : 'hover:bg-[#0A111E]/60 text-slate-200'
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
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                              </select>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInvoiceOrder(order);
                                }}
                                className="px-3 py-1 bg-[#D4AF37] text-[#141E30] text-[10px] font-black rounded-md hover:brightness-110 flex items-center space-x-1 mx-auto"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Print</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Tracking Sub-Panel */}
              {selectedOrderId && (
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#D4AF37]" />
                      <span>Direct Courier Waybill & Consignment Update</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-400">Selected: #{selectedOrderId}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Courier Partner (e.g. Local Uppal Express, DTDC)"
                      defaultValue={orders.find(o => o.orderId === selectedOrderId)?.courierPartner || ''}
                      id="courierPartnerInput"
                      className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <input
                      type="text"
                      placeholder="Waybill / Tracking ID (e.g. SVT-TRK-8801)"
                      defaultValue={orders.find(o => o.orderId === selectedOrderId)?.trackingNumber || ''}
                      id="trackingNumberInput"
                      className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const partner = (document.getElementById('courierPartnerInput') as HTMLInputElement)?.value;
                        const trk = (document.getElementById('trackingNumberInput') as HTMLInputElement)?.value;
                        handleUpdateTracking(selectedOrderId, trk, partner);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-md hover:scale-102 transition-transform"
                    >
                      Update Consignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INVENTORY CONTROL PANEL */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-[#0A111E] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#D4AF37]" />
                      <span>Roastery Stock & Inventory Control</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Real-time inventory levels for raw wholes and spiced blends.</p>
                  </div>
                  <Link
                    href="/admin/products"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <span>Add New SKU</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INITIAL_PRODUCTS.map((prod) => (
                    <div key={prod._id} className="bg-[#070D18] p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/30 shrink-0 bg-[#0A111E]">
                          <Image src={prod.images?.[0] || '/images/raw_cashews_hero.webp'} alt={prod.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{prod.title}</h4>
                          <span className="text-[10px] text-[#D4AF37] font-semibold">{prod.category.toUpperCase()} • ₹{prod.price}/-</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                        <span className="text-[11px] text-slate-400">Stock Status:</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                          In Stock ({prod.stockQuantity || 150} Units)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADVANCED WEBPAGE LAYOUT & IMAGE STUDIO CMS */}
          {activeTab === 'homepage' && (
            <div className="space-y-8 max-w-6xl">

              {/* Header with Simulator Controls & 1-Click Theme Presets */}
              <div className="bg-[#0A111E] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-2xl space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-[#D4AF37]" />
                      <span>Webpage Layout & Visuals Customizer Studio</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Customize titles, banners, images, category showcases, and announcement tickers with live device preview simulator.
                    </p>
                  </div>

                  {/* Device Viewport Selector */}
                  <div className="flex items-center gap-2 bg-[#070D18] p-1.5 rounded-2xl border border-white/10 self-start lg:self-auto">
                    <button
                      type="button"
                      onClick={() => setCmsViewport('desktop')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${cmsViewport === 'desktop' ? 'bg-[#D4AF37] text-[#070D18]' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCmsViewport('tablet')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${cmsViewport === 'tablet' ? 'bg-[#D4AF37] text-[#070D18]' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                      <span>Tablet</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCmsViewport('mobile')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${cmsViewport === 'mobile' ? 'bg-[#D4AF37] text-[#070D18]' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Curated Theme Presets */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Quick Theme Presets (1-Click Auto Configuration)</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyThemePreset(preset)}
                        className="bg-[#070D18] hover:bg-white/[0.04] p-4 rounded-2xl border border-white/10 hover:border-[#D4AF37]/50 text-left transition-all space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-white group-hover:text-[#D4AF37] transition-colors">{preset.name}</p>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{preset.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-Time Responsive Visual Live Preview Simulator Canvas */}
              {showLivePreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Live Canvas Simulator ({cmsViewport.toUpperCase()} MODE)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Updates dynamically as you edit controls below</span>
                  </div>

                  <div className={`mx-auto bg-[#050912] p-4 sm:p-6 rounded-3xl border-2 border-[#D4AF37]/30 shadow-2xl transition-all duration-300 ${cmsViewport === 'mobile' ? 'max-w-[390px]' : cmsViewport === 'tablet' ? 'max-w-[768px]' : 'w-full'
                    }`}>
                    {/* Simulated Ticker */}
                    <div className="bg-[#0D1527] py-2 px-3 rounded-xl border border-white/5 text-[10px] font-semibold text-center text-[#D4AF37] truncate shadow-sm mb-4">
                      {homepageSettings.announcementText || 'Announcement ticker message'}
                    </div>

                    {/* Simulated Hero */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0A111E]/95 via-[#0D1527]/80 to-transparent p-6 sm:p-8 border border-white/10 space-y-3">
                      <div className="max-w-md space-y-2 relative z-10">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 uppercase tracking-widest">
                          Uppal Direct Roastery
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black font-display text-white leading-tight">
                          {homepageSettings.heroTitle}
                        </h3>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {homepageSettings.heroSubtitle}
                        </p>
                        <div className="pt-2">
                          <span className="inline-block px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-lg">
                            {homepageSettings.heroButtonText || 'Shop Now'}
                          </span>
                        </div>
                      </div>

                      {/* Background Thumbnail Preview */}
                      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-40 pointer-events-none overflow-hidden">
                        <Image src={homepageSettings.heroImageUrl || '/images/raw_cashews_hero.webp'} alt="Hero" fill className="object-cover" />
                      </div>
                    </div>

                    {/* Simulated Dynamic Category Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {(homepageSettings.categoryCards && homepageSettings.categoryCards.length > 0 ? homepageSettings.categoryCards : DEFAULT_CATEGORY_CARDS)
                        .filter(c => c.isActive !== false)
                        .map((card) => (
                          <div 
                            key={card.id} 
                            className="bg-[#0A111E] p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-sm transition-all"
                            style={{ borderColor: card.accentColor ? `${card.accentColor}30` : 'rgba(255,255,255,0.1)' }}
                          >
                            <div className="space-y-1 flex-1 min-w-0">
                              <span 
                                className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-block"
                                style={{ 
                                  backgroundColor: card.accentColor ? `${card.accentColor}18` : 'rgba(212,175,55,0.15)',
                                  color: card.accentColor || '#D4AF37'
                                }}
                              >
                                {card.badgeText || 'Specialty'}
                              </span>
                              <p className="text-xs font-bold text-white truncate">{card.title}</p>
                              <p className="text-[9px] text-slate-400 line-clamp-1">{card.subtitle}</p>
                              <span 
                                className="text-[9px] font-bold inline-flex items-center gap-0.5"
                                style={{ color: card.accentColor || '#D4AF37' }}
                              >
                                {card.linkText || 'Explore'} &rarr;
                              </span>
                            </div>
                            <div className="w-12 h-12 rounded-lg overflow-hidden relative border border-white/10 shrink-0 bg-black/20">
                              <Image src={card.imageUrl || '/images/raw_cashews_hero.webp'} alt={card.title} fill className="object-cover" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Form Customizer Controls */}
              <form onSubmit={handleSaveHomepageSettings} className="space-y-6">

                {/* SECTION 1: Announcement Ticker */}
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 space-y-3 shadow-xl">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-2 border-b border-white/10 pb-3">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Top Header Announcement Ticker</span>
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Ticker Message Text</label>
                    <input
                      type="text"
                      value={homepageSettings.announcementText}
                      onChange={(e) => setHomepageSettings({ ...homepageSettings, announcementText: e.target.value })}
                      placeholder="e.g. Direct Uppal Roastery Counter • 100% Pure W180 Jumbo & Gourmet Spiced Cashews"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* SECTION 2: Hero Section */}
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-2 border-b border-white/10 pb-3">
                    <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                    <span>Hero Section & Primary Visual Banner</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Main Title Headline</label>
                      <input
                        type="text"
                        value={homepageSettings.heroTitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroTitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Subtitle Description</label>
                      <textarea
                        rows={2}
                        value={homepageSettings.heroSubtitle}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroSubtitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={homepageSettings.heroButtonText}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroButtonText: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">CTA Button Destination Link</label>
                      <input
                        type="text"
                        value={homepageSettings.heroButtonLink}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroButtonLink: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Banner Image Source</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={homepageSettings.heroImageUrl}
                        onChange={(e) => setHomepageSettings({ ...homepageSettings, heroImageUrl: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                      <label className="px-5 py-3 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold rounded-xl cursor-pointer transition-colors border border-white/10 flex items-center space-x-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'heroImageUrl')} className="hidden" />
                      </label>
                    </div>

                    {/* Quick Image Presets */}
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>Quick Presets:</span>
                      {[
                        { label: 'King Jumbo Hero', path: '/images/raw_cashews_hero.webp' },
                        { label: 'Bowl Presentation', path: '/images/raw-cashews-nuts-bowl-marble-background.webp' },
                        { label: 'Gourmet Gift Jars', path: '/images/cashew-nuts-ai-generated.webp' },
                        { label: 'Tandoori Masala Roast', path: '/images/tandoori_cashews_hero.webp' },
                      ].map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setHomepageSettings({ ...homepageSettings, heroImageUrl: preset.path })}
                          className={`px-2.5 py-1 rounded-lg border text-[10px] transition-colors ${homepageSettings.heroImageUrl === preset.path
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Advanced Category Feature Cards Showcase Studio */}
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#D4AF37]" />
                        <h3 className="text-base font-black font-display text-white">
                          Homepage Category Feature Cards Studio
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                          {(homepageSettings.categoryCards || DEFAULT_CATEGORY_CARDS).filter(c => c.isActive !== false).length} Active Cards
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Add extra promotional cards, customize headlines, icons, destination links, accent colors, and reorder freely.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleResetCategoryCards}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                        title="Reset to 4 default roastery cards"
                      >
                        Reset Defaults
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenAddCard}
                        className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5 transition-transform hover:scale-105"
                      >
                        <Plus className="w-4 h-4" strokeWidth={3} />
                        <span>+ Add Feature Card</span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Quick Add Card Presets */}
                  <div className="space-y-2 bg-[#070D18] p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>1-Click Preset Templates (Add Instant High-Converting Cards):</span>
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        {
                          title: 'Raw Cashews',
                          subtitle: 'Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch.',
                          badgeText: 'King Jumbo Series',
                          badgeIcon: 'sparkles',
                          linkUrl: '/category/raw',
                          linkText: 'Explore Raw Grades',
                          imageUrl: '/images/raw_cashews_hero.webp',
                          accentColor: '#D4AF37',
                        },
                        {
                          title: 'Flavoured Cashews',
                          subtitle: 'Peri Peri, Tandoori Masala & Pudina Herb infused with pure spices.',
                          badgeText: 'Slow-Roast Gourmet',
                          badgeIcon: 'flame',
                          linkUrl: '/category/flavored',
                          linkText: 'Explore Flavours & Spice Profile',
                          imageUrl: '/images/tandoori_cashews_hero.webp',
                          accentColor: '#F43F5E',
                        },
                        {
                          title: 'Festive Gift Hampers',
                          subtitle: 'Luxury gold embossed gift tins and assorted celebration dry fruit box assortments.',
                          badgeText: 'Royal Celebration',
                          badgeIcon: 'gift',
                          linkUrl: '/#shop',
                          linkText: 'Explore Festive Hampers',
                          imageUrl: '/images/cashew-nuts-ai-generated.webp',
                          accentColor: '#EAB308',
                        },
                        {
                          title: 'Wholesale & 10kg Sacks',
                          subtitle: 'Direct factory wholesale pricing for sweet makers, restaurants, caterers, and corporate clients in Hyderabad.',
                          badgeText: 'Direct Uppal Roastery Hub',
                          badgeIcon: 'package',
                          linkUrl: 'https://wa.me/919515273464',
                          linkText: 'WhatsApp Bulk Desk',
                          imageUrl: '/images/raw-cashews-nuts-bowl-marble-background.webp',
                          accentColor: '#10B981',
                        },
                        {
                          title: 'Organic Broken Splits',
                          subtitle: 'Economical crisp halved cashew kernels ideal for home gravies, curries, and payasam sweets.',
                          badgeText: 'Kitchen Essential',
                          badgeIcon: 'tag',
                          linkUrl: '/#shop',
                          linkText: 'Shop Cooking Splits',
                          imageUrl: '/images/raw_cashews_hero.webp',
                          accentColor: '#8B5CF6',
                        },
                        {
                          title: 'Black Pepper Gourmet',
                          subtitle: 'Cracked Malabar black pepper and pink salt glazed slow-roasted cashews.',
                          badgeText: 'Chef Signature',
                          badgeIcon: 'award',
                          linkUrl: '/category/flavored',
                          linkText: 'Explore Pepper Crunch',
                          imageUrl: '/images/tandoori_cashews_hero.webp',
                          accentColor: '#3B82F6',
                        },
                      ].map((preset) => (
                        <button
                          key={preset.title + preset.badgeText}
                          type="button"
                          onClick={() => handleApplyPresetCard(preset)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center space-x-1.5 transition-all group"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.accentColor }} />
                          <span>+ {preset.title}</span>
                          <span className="text-[10px] text-slate-500 group-hover:text-slate-300 font-mono">({preset.badgeText})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(homepageSettings.categoryCards || DEFAULT_CATEGORY_CARDS).map((card, idx, arr) => (
                      <div
                        key={card.id}
                        className={`p-5 rounded-3xl bg-[#070D18] border transition-all space-y-4 relative ${
                          card.isActive !== false ? 'border-white/10 hover:border-[#D4AF37]/50' : 'border-dashed border-white/10 opacity-60'
                        }`}
                      >
                        {/* Top Bar: Reorder Controls & Badges */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                          <div className="flex items-center space-x-1.5">
                            {/* Reorder Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveCard(card.id, 'up')}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            {/* Reorder Down */}
                            <button
                              type="button"
                              disabled={idx === arr.length - 1}
                              onClick={() => handleMoveCard(card.id, 'down')}
                              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-mono text-slate-500 font-bold ml-1">#{idx + 1}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {/* Active Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleCardActive(card.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                card.isActive !== false
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                  : 'bg-slate-900 text-slate-400 border-white/10'
                              }`}
                            >
                              {card.isActive !== false ? '● Visible on Store' : '○ Hidden'}
                            </button>
                          </div>
                        </div>

                        {/* Card Content Preview */}
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-white/10 shrink-0 bg-black/40 shadow-inner">
                            <Image
                              src={card.imageUrl || '/images/raw_cashews_hero.webp'}
                              alt={card.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                                style={{
                                  backgroundColor: card.accentColor ? `${card.accentColor}20` : 'rgba(212,175,55,0.2)',
                                  color: card.accentColor || '#D4AF37',
                                  border: `1px solid ${card.accentColor ? `${card.accentColor}40` : 'rgba(212,175,55,0.4)'}`,
                                }}
                              >
                                {card.badgeText || 'Specialty'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">{card.linkUrl}</span>
                            </div>

                            <h4 className="text-sm font-black font-display text-white truncate">{card.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{card.subtitle}</p>

                            <div className="pt-1 flex items-center gap-2">
                              <span
                                className="text-[11px] font-bold inline-flex items-center gap-1"
                                style={{ color: card.accentColor || '#D4AF37' }}
                              >
                                <span>{card.linkText || 'Explore'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: card.accentColor || '#D4AF37' }} />
                            <span className="text-[10px] text-slate-400 font-mono">{card.accentColor || '#D4AF37'}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCard(card)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold flex items-center space-x-1 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Card</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCard(card.id)}
                              className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-colors"
                              title="Delete Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save and Publish Floating Actions */}
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider rounded-xl shadow-xl flex items-center space-x-2 transition-transform hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Publishing Changes...' : 'Publish Layout Changes Live'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={fetchAllAdminData}
                    className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold border border-white/10 transition-colors"
                  >
                    Reset Changes
                  </button>
                </div>

              </form>

              {/* CATEGORY FEATURE CARD MODAL EDITOR */}
              {showCardModal && editingCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
                  <div className="w-full max-w-2xl bg-[#0A111E] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/40 shadow-2xl space-y-6 relative my-8">
                    {/* Close Modal Button */}
                    <button
                      type="button"
                      onClick={() => setShowCardModal(false)}
                      className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {/* Header */}
                    <div className="space-y-1 border-b border-white/10 pb-4">
                      <h3 className="text-lg font-black font-display text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#D4AF37]" />
                        <span>{editingCard.title ? `Edit Card: ${editingCard.title}` : 'Add New Category Feature Card'}</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Configure all card details including visual badge, destination link, roastery imagery, and theme accent.
                      </p>
                    </div>

                    <form onSubmit={handleSaveCardModal} className="space-y-5">
                      {/* Card Title & Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Card Title / Headline <span className="text-[#D4AF37]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingCard.title}
                            onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                            placeholder="e.g. Raw Cashews, Festive Hampers, Wholesale Hub"
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Subtitle / Tagline Description <span className="text-[#D4AF37]">*</span>
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={editingCard.subtitle}
                            onChange={(e) => setEditingCard({ ...editingCard, subtitle: e.target.value })}
                            placeholder="e.g. Grade W180 & W210 supreme size whole nuts. Naturally sweet, high crunch."
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      {/* Badge Text & Badge Icon */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={editingCard.badgeText}
                            onChange={(e) => setEditingCard({ ...editingCard, badgeText: e.target.value })}
                            placeholder="e.g. King Jumbo Series, Royal Celebration"
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">Badge Icon</label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { id: 'sparkles', label: '✨ Sparkles' },
                              { id: 'flame', label: '🔥 Flame' },
                              { id: 'gift', label: '🎁 Gift' },
                              { id: 'package', label: '📦 Sack' },
                              { id: 'award', label: '🏆 Award' },
                              { id: 'tag', label: '🏷️ Tag' },
                              { id: 'star', label: '⭐ Star' },
                            ].map((ic) => (
                              <button
                                key={ic.id}
                                type="button"
                                onClick={() => setEditingCard({ ...editingCard, badgeIcon: ic.id })}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                  editingCard.badgeIcon === ic.id
                                    ? 'bg-[#D4AF37] text-[#070D18] border-[#D4AF37]'
                                    : 'bg-[#070D18] text-slate-400 border-white/10 hover:text-white'
                                }`}
                              >
                                {ic.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Destination Link & CTA Text */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">
                            Destination Link (URL or Path) <span className="text-[#D4AF37]">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editingCard.linkUrl}
                            onChange={(e) => setEditingCard({ ...editingCard, linkUrl: e.target.value })}
                            placeholder="e.g. /category/raw, /#shop, https://wa.me/..."
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
                          />
                          {/* Quick Destination Suggestions */}
                          <div className="pt-1.5 flex flex-wrap gap-1.5">
                            {[
                              { label: 'Raw Cashews', url: '/category/raw' },
                              { label: 'Flavoured', url: '/category/flavored' },
                              { label: 'Shop Catalog', url: '/#shop' },
                              { label: 'WhatsApp Bulk', url: 'https://wa.me/919515273464' },
                            ].map((sug) => (
                              <button
                                key={sug.url}
                                type="button"
                                onClick={() => setEditingCard({ ...editingCard, linkUrl: sug.url })}
                                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[9px] text-slate-400 hover:text-white border border-white/5"
                              >
                                {sug.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-slate-300 block mb-1">CTA Button Text</label>
                          <input
                            type="text"
                            value={editingCard.linkText}
                            onChange={(e) => setEditingCard({ ...editingCard, linkText: e.target.value })}
                            placeholder="e.g. Explore Raw Grades, WhatsApp Bulk Desk"
                            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      {/* Image URL & Direct Upload */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Card Image Source</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingCard.imageUrl}
                            onChange={(e) => setEditingCard({ ...editingCard, imageUrl: e.target.value })}
                            placeholder="e.g. /images/raw_cashews_hero.webp or Cloudinary URL"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                          <label className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold rounded-xl cursor-pointer transition-colors border border-white/10 flex items-center space-x-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{uploadingCardImg ? 'Uploading...' : 'Upload Image'}</span>
                            <input type="file" accept="image/*" onChange={handleCardImageUpload} className="hidden" />
                          </label>
                        </div>

                        {/* Quick Image Picks */}
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className="text-slate-500">Pick Roastery Asset:</span>
                          {[
                            { label: 'Raw W180 King', path: '/images/raw_cashews_hero.webp' },
                            { label: 'Spiced Tandoori', path: '/images/tandoori_cashews_hero.webp' },
                            { label: 'Festive Gift Jars', path: '/images/cashew-nuts-ai-generated.webp' },
                            { label: 'Marble Bowl Sacks', path: '/images/raw-cashews-nuts-bowl-marble-background.webp' },
                          ].map((p) => (
                            <button
                              key={p.path}
                              type="button"
                              onClick={() => setEditingCard({ ...editingCard, imageUrl: p.path })}
                              className={`px-2 py-0.5 rounded border ${
                                editingCard.imageUrl === p.path ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-white/5 border-white/10 text-slate-400'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accent Color Theme */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Card Accent Color Theme</label>
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { color: '#D4AF37', label: 'Gold' },
                            { color: '#F43F5E', label: 'Rose / Spice' },
                            { color: '#EAB308', label: 'Festive Amber' },
                            { color: '#10B981', label: 'Emerald' },
                            { color: '#8B5CF6', label: 'Royal Purple' },
                            { color: '#3B82F6', label: 'Ocean Blue' },
                          ].map((c) => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setEditingCard({ ...editingCard, accentColor: c.color })}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                                editingCard.accentColor === c.color ? 'border-white bg-white/10 text-white shadow-md' : 'border-white/10 text-slate-400'
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                              <span>{c.label}</span>
                            </button>
                          ))}
                          <input
                            type="color"
                            value={editingCard.accentColor || '#D4AF37'}
                            onChange={(e) => setEditingCard({ ...editingCard, accentColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            title="Custom Hex Color"
                          />
                        </div>
                      </div>

                      {/* Live In-Modal Preview */}
                      <div className="space-y-2 pt-2 border-t border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live In-Modal Card Preview</span>
                        </span>

                        <div
                          className="p-5 rounded-2xl bg-[#070D18] border flex items-center justify-between gap-4 shadow-xl"
                          style={{ borderColor: editingCard.accentColor ? `${editingCard.accentColor}40` : 'rgba(212,175,55,0.3)' }}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <span
                              className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block"
                              style={{
                                backgroundColor: editingCard.accentColor ? `${editingCard.accentColor}20` : 'rgba(212,175,55,0.2)',
                                color: editingCard.accentColor || '#D4AF37',
                                border: `1px solid ${editingCard.accentColor ? `${editingCard.accentColor}40` : 'rgba(212,175,55,0.4)'}`,
                              }}
                            >
                              {editingCard.badgeText || 'Specialty'}
                            </span>
                            <h4 className="text-base font-black font-display text-white truncate">{editingCard.title || 'Card Headline'}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{editingCard.subtitle || 'Card tagline and roastery description will appear here...'}</p>
                            <span
                              className="text-xs font-bold inline-flex items-center gap-1 pt-1"
                              style={{ color: editingCard.accentColor || '#D4AF37' }}
                            >
                              <span>{editingCard.linkText || 'Explore Selection'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>

                          <div className="w-24 h-24 rounded-2xl overflow-hidden relative border border-white/10 shrink-0 bg-black/40">
                            <Image
                              src={editingCard.imageUrl || '/images/raw_cashews_hero.webp'}
                              alt="Card preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer Buttons */}
                      <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowCardModal(false)}
                          className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5 transition-transform hover:scale-105"
                        >
                          <Check className="w-4 h-4" strokeWidth={3} />
                          <span>Save & Apply Card</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: ADVANCED USER MANAGEMENT & ACCESS CONTROL SUITE */}
          {activeTab === 'users' && (
            <div className="space-y-6">

              {/* Header Card with Grant Access CTA */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-elevated">
                <div>
                  <h2 className="text-xl font-black font-heading text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                    <span>User Management & Admin Access Delegation</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Grant administrator privileges, manage store manager credentials, and control customer account statuses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGrantModal(true)}
                  className="px-5 py-3 gold-cta-button text-navy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center space-x-2 shrink-0 transition-transform hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" strokeWidth={2.5} />
                  <span>+ Grant Admin Access</span>
                </button>
              </div>

              {/* Status Messages */}
              {userSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-3 shadow-lg animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{userSuccessMsg}</span>
                </div>
              )}
              {userErrorMsg && (
                <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-3 shadow-lg animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span className="font-semibold">{userErrorMsg}</span>
                </div>
              )}

              {/* KPI Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Total Registered Users</span>
                  </p>
                  <p className="text-2xl font-bold font-heading text-white">{users.length}</p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Store Administrators</span>
                  </p>
                  <p className="text-2xl font-bold font-heading text-[#D4AF37]">
                    {users.filter(u => u.role === 'admin' || u.role === 'super-admin').length}
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active Shoppers</span>
                  </p>
                  <p className="text-2xl font-bold font-heading text-emerald-400">
                    {users.filter(u => u.role === 'user' && u.isActive).length}
                  </p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                  {(['ALL', 'super-admin', 'admin', 'user'] as const).map((roleKey) => (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => setUserRoleFilter(roleKey)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${userRoleFilter === roleKey
                          ? 'bg-[#D4AF37] text-navy-950 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                    >
                      {roleKey === 'ALL' ? 'All Roles' : roleKey === 'super-admin' ? 'Super Admins' : roleKey === 'admin' ? 'Admins' : 'Customers'}
                      {' '}({roleKey === 'ALL' ? users.length : users.filter(u => u.role === roleKey).length})
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-elevated">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-navy-950 text-slate-300 font-bold uppercase tracking-wider border-b border-white/10">
                        <th className="py-3.5 px-4">User Account</th>
                        <th className="py-3.5 px-4">Current Role</th>
                        <th className="py-3.5 px-4">Permissions Scope</th>
                        <th className="py-3.5 px-4">Account Status</th>
                        <th className="py-3.5 px-4 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                            No users found matching your search or filter.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isRootAdmin = u.email === 'pa0174492@gmail.com' || u.email === 'sahuravindra897@gmail.com';
                          const isProcessing = userActionLoading === u._id;

                          return (
                            <tr key={u._id || u.firebaseUid} className="hover:bg-white/[0.02] transition-colors">
                              {/* User Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs uppercase shrink-0 ${u.role === 'super-admin'
                                      ? 'bg-gradient-to-br from-[#D4AF37] to-amber-600 text-navy-950 shadow-md'
                                      : u.role === 'admin'
                                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                                        : 'bg-white/10 text-slate-300'
                                    }`}>
                                    {u.displayName ? u.displayName.slice(0, 2) : u.email.slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white text-xs">{u.displayName || 'Customer'}</span>
                                      {isRootAdmin && (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-black">
                                          ROOT
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-mono text-[11px] text-slate-400">{u.email}</p>
                                  </div>
                                </div>
                              </td>

                              {/* Role Selector */}
                              <td className="py-3.5 px-4">
                                {isRootAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#D4AF37] text-navy-950">
                                    <Crown className="w-3 h-3" />
                                    <span>Super Admin</span>
                                  </span>
                                ) : (
                                  <select
                                    disabled={isProcessing}
                                    value={u.role}
                                    onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${u.role === 'super-admin'
                                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                                        : u.role === 'admin'
                                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                                          : 'bg-white/5 border-white/10 text-slate-300'
                                      }`}
                                  >
                                    <option value="super-admin" className="bg-navy-900 text-white">Super Admin</option>
                                    <option value="admin" className="bg-navy-900 text-white">Admin (Store Manager)</option>
                                    <option value="user" className="bg-navy-900 text-white">Customer (Standard)</option>
                                  </select>
                                )}
                              </td>

                              {/* Permissions Scope */}
                              <td className="py-3.5 px-4 text-xs">
                                {u.role === 'super-admin' ? (
                                  <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
                                    <Crown className="w-3.5 h-3.5" /> Full Access & User Delegation
                                  </span>
                                ) : u.role === 'admin' ? (
                                  <span className="text-blue-300 font-semibold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Product Catalog, Orders & Inventory
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    Storefront Shopper
                                  </span>
                                )}
                              </td>

                              {/* Active Status Toggle */}
                              <td className="py-3.5 px-4">
                                {isRootAdmin ? (
                                  <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Active (Permanent)
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => handleToggleUserActive(u._id, u.isActive)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${u.isActive
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                                        : 'bg-rose-950 text-rose-300 border-rose-500/40 hover:bg-rose-900'
                                      }`}
                                  >
                                    {u.isActive ? (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span>Active Account</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                        <span>Suspended</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                {isRootAdmin ? (
                                  <span className="text-[10px] text-slate-500 font-mono italic">Protected Root</span>
                                ) : (
                                  <div className="flex items-center justify-end space-x-1.5">
                                    {u.role !== 'admin' && (
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => handleUpdateUserRole(u._id, 'admin')}
                                        title="Promote to Admin"
                                        className="px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors"
                                      >
                                        Make Admin
                                      </button>
                                    )}

                                    {u.role !== 'user' && (
                                      <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => handleUpdateUserRole(u._id, 'user')}
                                        title="Demote to Customer"
                                        className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-[10px] font-bold transition-colors"
                                      >
                                        Demote
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      disabled={isProcessing}
                                      onClick={() => handleDeleteUser(u._id, u.email)}
                                      title="Revoke and Delete User"
                                      className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GRANT ADMIN ACCESS MODAL */}
              {showGrantModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
                  <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl space-y-5 relative bg-navy-900">
                    <button
                      type="button"
                      onClick={() => setShowGrantModal(false)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-[#D4AF37]" />
                        <span>Grant Admin Access</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Enter the user&apos;s email address to delegate store management permissions.
                      </p>
                    </div>

                    <form onSubmit={handleGrantAdmin} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          User Email Address <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={grantAdminForm.email}
                          onChange={(e) => setGrantAdminForm({ ...grantAdminForm, email: e.target.value })}
                          placeholder="e.g. manager@svtcashews.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">
                          Full Name / Designation
                        </label>
                        <input
                          type="text"
                          value={grantAdminForm.displayName}
                          onChange={(e) => setGrantAdminForm({ ...grantAdminForm, displayName: e.target.value })}
                          placeholder="e.g. Uppal Store Manager"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                          Select Administrative Role
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setGrantAdminForm({ ...grantAdminForm, role: 'admin' })}
                            className={`p-3 rounded-xl border text-left transition-all ${grantAdminForm.role === 'admin'
                                ? 'bg-blue-600/20 border-blue-500 text-white font-bold shadow-md'
                                : 'bg-navy-950 border-white/10 text-slate-400 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-xs">
                              <ShieldCheck className="w-4 h-4 text-blue-400" />
                              <span>Admin</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">Catalog, Products, Orders & Inventory</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setGrantAdminForm({ ...grantAdminForm, role: 'super-admin' })}
                            className={`p-3 rounded-xl border text-left transition-all ${grantAdminForm.role === 'super-admin'
                                ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white font-bold shadow-md'
                                : 'bg-navy-950 border-white/10 text-slate-400 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 text-xs">
                              <Crown className="w-4 h-4 text-[#D4AF37]" />
                              <span>Super Admin</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight">Full Control + User & Access Delegation</p>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowGrantModal(false)}
                          className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={grantingAdmin}
                          className="px-6 py-2.5 gold-cta-button text-navy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{grantingAdmin ? 'Granting Access...' : 'Confirm & Grant Access'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: ADVANCED COUPON & PROMO ENGINE */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">

              {/* Top Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 space-y-1 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" /> Total Vouchers
                  </span>
                  <p className="text-2xl font-black text-white">{coupons.length}</p>
                </div>
                <div className="bg-[#0A111E] p-5 rounded-3xl border border-emerald-500/20 space-y-1 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" /> Active Deals
                  </span>
                  <p className="text-2xl font-black text-emerald-400">{coupons.filter(c => c.isActive !== false).length}</p>
                </div>
                <div className="bg-[#0A111E] p-5 rounded-3xl border border-blue-500/20 space-y-1 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-blue-400" /> Avg Discount
                  </span>
                  <p className="text-2xl font-black text-white">
                    {coupons.length ? Math.round(coupons.reduce((s, c) => s + (c.discountPercent || 10), 0) / coupons.length) : 15}%
                  </p>
                </div>
                <div className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/20 space-y-1 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" /> Est. Sourced Savings
                  </span>
                  <p className="text-2xl font-black text-[#D4AF37]">₹12,450/-</p>
                </div>
              </div>

              {/* Coupon Creation Studio & Live Perforated Ticket Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Form (2 Cols) */}
                <form onSubmit={handleCreateAdvancedCoupon} className="lg:col-span-2 bg-[#0A111E] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-base font-black font-display text-white flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-[#D4AF37]" />
                      <span>Create New Promo Voucher Code</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleGenerateRandomCouponCode}
                      className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#D4AF37] border border-[#D4AF37]/40 flex items-center space-x-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>⚡ Auto-Generate</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Coupon Code (Uppercase)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FESTIVE20"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Discount Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCouponForm({ ...couponForm, discountType: 'PERCENT' })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${couponForm.discountType === 'PERCENT'
                              ? 'bg-[#D4AF37] text-[#070D18] border-[#D4AF37]'
                              : 'bg-[#070D18] text-slate-400 border-white/10'
                            }`}
                        >
                          Percentage (%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCouponForm({ ...couponForm, discountType: 'FLAT' })}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${couponForm.discountType === 'FLAT'
                              ? 'bg-[#D4AF37] text-[#070D18] border-[#D4AF37]'
                              : 'bg-[#070D18] text-slate-400 border-white/10'
                            }`}
                        >
                          Flat Amount (₹)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        {couponForm.discountType === 'PERCENT' ? 'Discount Percentage (%)' : 'Flat Discount Value (₹)'}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max={couponForm.discountType === 'PERCENT' ? 90 : 5000}
                        value={couponForm.discountType === 'PERCENT' ? couponForm.discountPercent : couponForm.flatAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (couponForm.discountType === 'PERCENT') setCouponForm({ ...couponForm, discountPercent: val });
                          else setCouponForm({ ...couponForm, flatAmount: val });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs font-bold focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Minimum Order Amount (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Eligibility Segment</label>
                      <select
                        value={couponForm.customerSegment}
                        onChange={(e) => setCouponForm({ ...couponForm, customerSegment: e.target.value as any })}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none"
                      >
                        <option value="ALL">All Customers</option>
                        <option value="VIP">VIP Loyalty Members Only</option>
                        <option value="FIRST_ORDER">First-Time Customers Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Valid Until Date</label>
                      <input
                        type="date"
                        value={couponForm.expiresAt}
                        onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-300 block mb-1">Promotional Description</label>
                      <input
                        type="text"
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        placeholder="e.g. Special festive celebration discount on W180 and gourmet spices."
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#070D18] text-white text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingCoupon}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B48328] text-[#070D18] font-black text-xs uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2 transition-transform hover:scale-102"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{creatingCoupon ? 'Creating Voucher...' : 'Create & Activate Coupon'}</span>
                  </button>
                </form>

                {/* Live Ticket Simulator (1 Col) */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Live Voucher Ticket Preview</span>
                  </span>

                  <div className="bg-gradient-to-b from-[#0D1527] to-[#0A111E] rounded-3xl border border-[#D4AF37]/40 p-6 shadow-2xl space-y-4 relative overflow-hidden">
                    {/* Perforated edge indicator */}
                    <div className="border-b border-dashed border-[#D4AF37]/40 pb-4 flex items-start justify-between">
                      <div>
                        <span className="text-3xl font-black text-[#D4AF37]">
                          {couponForm.discountType === 'PERCENT' ? `${couponForm.discountPercent}%` : `₹${couponForm.flatAmount}`} OFF
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Min Order: ₹{couponForm.minOrderAmount}/-</p>
                      </div>
                      <Ticket className="w-10 h-10 text-[#D4AF37]/40" />
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{couponForm.description}&rdquo;</p>

                      <div className="bg-[#070D18] p-3 rounded-2xl border border-dashed border-[#D4AF37]/50 flex items-center justify-between">
                        <span className="font-mono font-black text-sm text-[#D4AF37]">{couponForm.code || 'COUPONCODE'}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40">
                          Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                        <span>Expiry: {couponForm.expiresAt}</span>
                        <span>Segment: {couponForm.customerSegment}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Search & Active Coupons Grid */}
              <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 space-y-5 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black font-display text-white">Active Promotional Coupons ({filteredCoupons.length})</h3>
                    <p className="text-xs text-slate-400">Manage, share, and track coupon status in real-time</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search coupons..."
                        value={couponSearchQuery}
                        onChange={(e) => setCouponSearchQuery(e.target.value)}
                        className="pl-8 pr-4 py-2 rounded-xl border border-white/10 bg-[#070D18] text-xs text-white focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>

                    <div className="flex items-center space-x-1 bg-[#070D18] p-1 rounded-xl border border-white/10">
                      {(['ALL', 'ACTIVE', 'EXPIRED'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setCouponFilterStatus(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${couponFilterStatus === st ? 'bg-[#D4AF37] text-[#070D18]' : 'text-slate-400'
                            }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCoupons.map((coupon) => (
                    <div key={coupon._id || coupon.code} className="bg-[#070D18] p-5 rounded-3xl border border-white/10 hover:border-[#D4AF37]/40 transition-all space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-black text-base text-[#D4AF37]">{coupon.code}</span>
                          <p className="text-xs text-slate-300 font-bold mt-0.5">
                            {coupon.discountPercent ? `${coupon.discountPercent}% Discount` : `₹${coupon.flatAmount} Flat Off`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleCouponActive(coupon._id, coupon.isActive !== false)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${coupon.isActive !== false
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-950 text-rose-300 border-rose-500/40'
                            }`}
                        >
                          {coupon.isActive !== false ? '● Active' : '○ Paused'}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2">{coupon.description || 'Promotional cashew discount'}</p>

                      <div className="text-[10px] text-slate-500 space-y-0.5 font-mono pt-1 border-t border-white/5">
                        <p>Min Order: ₹{coupon.minOrderAmount || 500}</p>
                        {coupon.expiresAt && <p>Expires: {coupon.expiresAt}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleCopyCouponCode(coupon.code)}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedCoupon === coupon.code ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShareWhatsAppCoupon(coupon.code, coupon.discountPercent || coupon.flatAmount || 10)}
                            className="p-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                          className="p-1.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-950"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: EXECUTIVE SALES & REVENUE ANALYTICS DASHBOARD */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">

              {/* Top Header with Timeframe Filter */}
              <div className="bg-[#0A111E] p-6 rounded-3xl border border-[#D4AF37]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black font-display text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                    <span>Executive Revenue & Sales Intelligence Suite</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time transaction analytics, roastery product velocities, and customer cohorts.
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-[#070D18] p-1.5 rounded-2xl border border-white/10">
                  {(['TODAY', '7D', '30D', 'QUARTER', 'LIFETIME'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setAnalyticsTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${analyticsTimeframe === tf
                          ? 'bg-[#D4AF37] text-[#070D18] font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {tf === 'TODAY' ? 'Live Today' : tf === '7D' ? 'Last 7 Days' : tf === '30D' ? '30 Days' : tf === 'QUARTER' ? 'This Quarter' : 'Lifetime'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5 High-Impact Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#0A111E] p-5 rounded-3xl border border-[#D4AF37]/30 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Total Gross Revenue</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      +24.8% MoM
                    </span>
                  </div>
                  <p className="text-2xl font-black text-[#D4AF37]">₹{totalRevenue.toLocaleString()}/-</p>
                  <p className="text-[10px] text-slate-500">Includes wholesale & retail orders</p>
                </div>

                <div className="bg-[#0A111E] p-5 rounded-3xl border border-white/10 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Orders Fulfilled</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-500/40">
                      +12.4%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">{orders.length}</p>
                  <p className="text-[10px] text-slate-500">{deliveredOrdersCount} delivered, {pendingOrdersCount} in transit</p>
                </div>

                <div className="bg-[#0A111E] p-5 rounded-3xl border border-white/10 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Average Order (AOV)</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400">
                      +8.2%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-400">₹{averageOrderValue}/-</p>
                  <p className="text-[10px] text-slate-500">Per checkout transaction</p>
                </div>

                <div className="bg-[#0A111E] p-5 rounded-3xl border border-white/10 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Cashews Sourced (KG)</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-950 text-amber-400">
                      High Volume
                    </span>
                  </div>
                  <p className="text-2xl font-black text-[#D4AF37]">{totalKgSourced.toFixed(1)} KG</p>
                  <p className="text-[10px] text-slate-500">Direct Uppal Roastery dispatch</p>
                </div>

                <div className="bg-[#0A111E] p-5 rounded-3xl border border-white/10 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400">Customer Base</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400">
                      Active
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">{users.length}</p>
                  <p className="text-[10px] text-slate-500">VIP shoppers & admins registered</p>
                </div>
              </div>

              {/* Visual Charts & Breakdown Studio */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* SVG Revenue Velocity Chart (2 Cols) */}
                <div className="lg:col-span-2 bg-[#0A111E] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#D4AF37] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                        <span>Revenue Growth & Sourcing Trend</span>
                      </h3>
                      <p className="text-xs text-slate-400">Visual monthly progression curve</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono">₹{totalRevenue} SOURCED</span>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative h-56 w-full pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid Lines */}
                      <line x1="0" y1="40" x2="600" y2="40" stroke="#ffffff" strokeOpacity="0.05" />
                      <line x1="0" y1="90" x2="600" y2="90" stroke="#ffffff" strokeOpacity="0.05" />
                      <line x1="0" y1="140" x2="600" y2="140" stroke="#ffffff" strokeOpacity="0.05" />

                      {/* Area Fill */}
                      <path
                        d="M 0 160 Q 150 130 300 90 T 600 30 L 600 190 L 0 190 Z"
                        fill="url(#revenueGrad)"
                      />

                      {/* Line Curve */}
                      <path
                        d="M 0 160 Q 150 130 300 90 T 600 30"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Points */}
                      <circle cx="0" cy="160" r="5" fill="#070D18" stroke="#D4AF37" strokeWidth="2.5" />
                      <circle cx="150" cy="135" r="5" fill="#070D18" stroke="#D4AF37" strokeWidth="2.5" />
                      <circle cx="300" cy="90" r="5" fill="#070D18" stroke="#D4AF37" strokeWidth="2.5" />
                      <circle cx="450" cy="55" r="5" fill="#070D18" stroke="#D4AF37" strokeWidth="2.5" />
                      <circle cx="600" cy="30" r="6" fill="#D4AF37" stroke="#ffffff" strokeWidth="2" />
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-3">
                      <span>May &apos;26</span>
                      <span>Jun &apos;26</span>
                      <span>Jul &apos;26</span>
                      <span>Aug &apos;26</span>
                      <span className="text-[#D4AF37] font-bold">Sep &apos;26 (Live)</span>
                    </div>
                  </div>
                </div>

                {/* Category & Payment Split (1 Col) */}
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6">

                  {/* Category Breakdown */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center justify-between">
                      <span>Product Category Mix</span>
                      <span className="text-[#D4AF37] font-mono">100%</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300 font-bold">Raw King Jumbo (W180/W210)</span>
                          <span className="text-[#D4AF37] font-mono">{rawPercent}%</span>
                        </div>
                        <div className="w-full bg-[#070D18] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#D4AF37] h-full rounded-full" style={{ width: `${rawPercent}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300 font-bold">Artisanal Spiced & Roasted</span>
                          <span className="text-rose-400 font-mono">{flavoredPercent}%</span>
                        </div>
                        <div className="w-full bg-[#070D18] h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${flavoredPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Channel Breakdown */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">Payment Method Share</h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-[#070D18] p-2.5 rounded-xl border border-white/5">
                        <p className="text-base font-black text-emerald-400">
                          {orders.length ? Math.round((upiOrders / orders.length) * 100) : 70}%
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase">UPI Direct</p>
                      </div>
                      <div className="bg-[#070D18] p-2.5 rounded-xl border border-white/5">
                        <p className="text-base font-black text-[#D4AF37]">
                          {orders.length ? Math.round((codOrders / orders.length) * 100) : 25}%
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase">Cash on Delivery</p>
                      </div>
                      <div className="bg-[#070D18] p-2.5 rounded-xl border border-white/5">
                        <p className="text-base font-black text-blue-400">
                          {orders.length ? Math.round((cardOrders / orders.length) * 100) : 5}%
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase">Cards/NetBanking</p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Regional Heatmap & Best Selling Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Hyderabad Regional Delivery Zones */}
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    <span>Regional Delivery Distribution</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    {[
                      { area: 'Uppal Roastery Hub & Surrounds', share: '45%', orders: '18 Orders', status: 'Direct Roastery Dispatch' },
                      { area: 'Secunderabad & Central Hyderabad', share: '25%', orders: '10 Orders', status: 'Same-Day Courier' },
                      { area: 'Madhapur / Hitec City / Cyberabad', share: '20%', orders: '8 Orders', status: 'Express Delivery' },
                      { area: 'Rest of Telangana & All India', share: '10%', orders: '4 Orders', status: 'Standard Logistics' },
                    ].map((loc) => (
                      <div key={loc.area} className="bg-[#070D18] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-xs">{loc.area}</p>
                          <span className="text-[10px] text-slate-400">{loc.orders} • {loc.status}</span>
                        </div>
                        <span className="font-mono font-black text-sm text-[#D4AF37]">{loc.share}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Selling Products Leaderboard */}
                <div className="bg-[#0A111E] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <Award className="w-4 h-4 text-[#D4AF37]" />
                    <span>Top Sourced Cashew Varieties</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    {[
                      { name: 'W180 King Jumbo Whole Cashew', cat: 'RAW WHOLE', sales: '₹42,500', velocity: 'Top Velocity 1' },
                      { name: 'Peri Peri Gourmet Roastery Blend', cat: 'SPICED', sales: '₹24,800', velocity: 'Trending Fast' },
                      { name: 'Tandoori Masala Artisanal Roast', cat: 'SPICED', sales: '₹18,200', velocity: 'High Demand' },
                    ].map((item, idx) => (
                      <div key={item.name} className="bg-[#070D18] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-white text-xs">{item.name}</p>
                            <span className="text-[10px] text-slate-400">{item.cat} • {item.velocity}</span>
                          </div>
                        </div>
                        <span className="font-mono font-black text-sm text-[#D4AF37]">{item.sales}</span>
                      </div>
                    ))}
                  </div>
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
