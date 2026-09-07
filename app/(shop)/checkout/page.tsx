'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useCartStore } from '@/lib/cart-store';
import SafeImage from '@/components/ui/safe-image';
import { 
  ChevronRight, CheckCircle, Ticket, ArrowLeft, 
  ShieldCheck, Truck, CreditCard, Banknote, Smartphone, 
  AlertCircle, Sparkles, Printer, Lock, RefreshCw, Check, 
  Send, Mail, Phone, MapPin, Edit3, MessageSquare, QrCode,
  Package, Info, ChevronDown, CheckCircle2, X
} from 'lucide-react';
import { EmptyCartIllustration } from '@/components/illustrations';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AdditionalCharge {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'FLAT' | 'PERCENT';
  isOptional: boolean;
  defaultSelected: boolean;
  enabled: boolean;
}

interface CustomPaymentMethod {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  extraFee: number;
  enabled: boolean;
}

interface PaymentSettingsData {
  razorpay: {
    enabled: boolean;
    title: string;
    description: string;
    badge: string;
    discountPercent: number;
    minOrder: number;
  };
  cod: {
    enabled: boolean;
    title: string;
    description: string;
    extraFee: number;
    minOrder: number;
    maxOrder: number;
    allowedRegions: string;
  };
  directUpi: {
    enabled: boolean;
    title: string;
    description: string;
    upiId: string;
    payeeName: string;
    qrImageUrl?: string;
    discountPercent: number;
  };
  customMethods: CustomPaymentMethod[];
  additionalCharges: AdditionalCharge[];
  verificationSettings: {
    requireDoubleCheck: boolean;
    enableWhatsAppUpdates: boolean;
    allowCustomerNotes: boolean;
  };
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  // Dynamic Payment Settings from Admin
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData>({
    razorpay: {
      enabled: true,
      title: 'Razorpay Online Gateway',
      description: 'UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, EMI & Wallets',
      badge: 'Recommended • Fast & Secure',
      discountPercent: 0,
      minOrder: 0,
    },
    cod: {
      enabled: true,
      title: 'Cash on Delivery (COD)',
      description: 'Pay in cash upon doorstep delivery in Hyderabad & Uppal region',
      extraFee: 0,
      minOrder: 0,
      maxOrder: 25000,
      allowedRegions: 'Hyderabad, Uppal & All India',
    },
    directUpi: {
      enabled: true,
      title: 'Direct UPI QR Scan & Pay',
      description: 'Scan SVT Official QR via PhonePe, GPay, Paytm or BHIM with instant zero-fee settlement',
      upiId: '9515273464@ybl',
      payeeName: 'Sidhi Vinayaka Traders',
      qrImageUrl: '',
      discountPercent: 0,
    },
    customMethods: [],
    additionalCharges: [
      {
        id: 'express_pack',
        name: 'Eco-Friendly Airtight Packaging',
        description: 'Multi-layer food grade sealing for lasting crispness',
        amount: 0,
        type: 'FLAT',
        isOptional: true,
        defaultSelected: true,
        enabled: true,
      },
    ],
    verificationSettings: {
      requireDoubleCheck: true,
      enableWhatsAppUpdates: true,
      allowCustomerNotes: true,
    },
  });

  // Selected dynamic optional charges
  const [selectedChargeIds, setSelectedChargeIds] = useState<string[]>([]);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    pincode: '500039',
    paymentMethod: 'ONLINE',
    notes: '',
    whatsappUpdates: true,
    upiTransactionRef: '',
  });

  // Email typo suggestion state
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

  // Double Check Verification Modal State
  const [showDoubleCheckModal, setShowDoubleCheckModal] = useState(false);
  const [isContactConfirmed, setIsContactConfirmed] = useState(false);

  // Direct UPI Modal
  const [showUpiModal, setShowUpiModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Listen to Auth State to attach userId and auto-fill contact info
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setFormData((prev) => ({
          ...prev,
          name: prev.name || user.displayName || '',
          email: prev.email || user.email || '',
        }));
      }
    });
    return () => unsub();
  }, []);

  // Fetch admin payment settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/payment-settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setPaymentSettings(data.settings);
          // Pre-select default charges
          if (data.settings.additionalCharges) {
            const defaults = data.settings.additionalCharges
              .filter((c: AdditionalCharge) => c.enabled && (c.defaultSelected || !c.isOptional))
              .map((c: AdditionalCharge) => c.id);
            setSelectedChargeIds(defaults);
          }
        }
      } catch (err) {
        console.warn('Using default payment settings:', err);
      }
    }
    loadSettings();
  }, []);

  // Smart Email Typo Detection
  const checkEmailTypo = (email: string) => {
    const commonDomains: Record<string, string> = {
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'yaho.com': 'yahoo.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
    };

    const parts = email.split('@');
    if (parts.length === 2) {
      const domain = parts[1].toLowerCase();
      if (commonDomains[domain]) {
        setEmailSuggestion(`${parts[0]}@${commonDomains[domain]}`);
        return;
      }
    }
    setEmailSuggestion(null);
  };

  // Calculations
  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  // Active additional charges calculation
  const activeAdditionalCharges = useMemo(() => {
    if (!paymentSettings.additionalCharges) return [];
    return paymentSettings.additionalCharges
      .filter((c) => c.enabled && (!c.isOptional || selectedChargeIds.includes(c.id)))
      .map((c) => {
        const fee = c.type === 'PERCENT' ? Math.round((subtotal * c.amount) / 100) : c.amount;
        return {
          id: c.id,
          name: c.name,
          amount: fee,
        };
      });
  }, [paymentSettings.additionalCharges, selectedChargeIds, subtotal]);

  const totalAdditionalCharges = activeAdditionalCharges.reduce((acc, c) => acc + c.amount, 0);

  // Payment method specific charge/discount
  const paymentMethodAdjustment = useMemo(() => {
    if (formData.paymentMethod === 'COD' && paymentSettings.cod?.extraFee) {
      return { type: 'FEE', amount: paymentSettings.cod.extraFee, label: 'COD Handling Fee' };
    }
    if (formData.paymentMethod === 'ONLINE' && paymentSettings.razorpay?.discountPercent) {
      const disc = Math.round((subtotal * paymentSettings.razorpay.discountPercent) / 100);
      return { type: 'DISCOUNT', amount: disc, label: `Online Payment Discount (${paymentSettings.razorpay.discountPercent}%)` };
    }
    if (formData.paymentMethod === 'DIRECT_UPI' && paymentSettings.directUpi?.discountPercent) {
      const disc = Math.round((subtotal * paymentSettings.directUpi.discountPercent) / 100);
      return { type: 'DISCOUNT', amount: disc, label: `Direct UPI Discount (${paymentSettings.directUpi.discountPercent}%)` };
    }
    return null;
  }, [formData.paymentMethod, paymentSettings, subtotal]);

  const orderTotal = useMemo(() => {
    let total = Math.max(0, subtotal - discountAmount) + totalAdditionalCharges;
    if (paymentMethodAdjustment) {
      if (paymentMethodAdjustment.type === 'FEE') {
        total += paymentMethodAdjustment.amount;
      } else if (paymentMethodAdjustment.type === 'DISCOUNT') {
        total = Math.max(0, total - paymentMethodAdjustment.amount);
      }
    }
    return total;
  }, [subtotal, discountAmount, totalAdditionalCharges, paymentMethodAdjustment]);

  // Clean formatted phone
  const cleanPhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.toUpperCase().trim();
    if (code === 'WELCOME10') {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (code === 'SVTDIWALI' || code === 'SVT15') {
      setDiscountPercent(15);
      setCouponApplied(true);
    } else if (code === 'SUPER20') {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10, SVT15 or SUPER20');
    }
  };

  // Validation before triggering Double Check
  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    const cleanDigits = formData.phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for delivery contact.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address to receive your order invoice.');
      return false;
    }
    if (!formData.address.trim()) {
      setErrorMessage('Please provide your complete street address / house details.');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.replace(/\D/g, '').length !== 6) {
      setErrorMessage('Please enter a valid 6-digit delivery pincode.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // User clicks "Proceed to Order / Confirm Details"
  const handleProceedClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentSettings.verificationSettings?.requireDoubleCheck && !isContactConfirmed) {
      setShowDoubleCheckModal(true);
      return;
    }

    // Direct proceed if already confirmed or double-check disabled
    processOrderPlacement();
  };

  // Confirmed in Double Check Modal
  const handleConfirmAndProceed = () => {
    setIsContactConfirmed(true);
    setShowDoubleCheckModal(false);
    processOrderPlacement();
  };

  const processOrderPlacement = async () => {
    setLoading(true);
    setErrorMessage('');

    const orderPayload = {
      userId: currentUser?.uid || undefined,
      customerDetails: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || (currentUser?.email ? currentUser.email.trim() : ''),
        address: formData.address.trim(),
        colony: formData.city || 'Hyderabad',
        city: formData.city || 'Hyderabad',
        pincode: formData.pincode.trim(),
      },
      items: items.map((item) => ({
        productId: item.productId,
        title: item.title,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      subtotal,
      discountAmount,
      additionalCharges: activeAdditionalCharges,
      totalAmount: orderTotal,
      paymentMethod: formData.paymentMethod,
      whatsappUpdates: formData.whatsappUpdates,
      notes: formData.notes,
    };

    if (formData.paymentMethod === 'COD') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (data.success && data.order) {
          setConfirmedOrder(data.order);
          clearCart();
        } else {
          setErrorMessage(data.error || 'Failed to place cash on delivery order.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error creating COD order.');
      } finally {
        setLoading(false);
      }
    } else if (formData.paymentMethod === 'DIRECT_UPI') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderPayload,
            paymentStatus: 'PENDING',
            notes: `Direct UPI Transfer. Ref: ${formData.upiTransactionRef || 'Pending Ref'} | ${formData.notes}`,
          }),
        });

        const data = await res.json();
        if (data.success && data.order) {
          setConfirmedOrder(data.order);
          clearCart();
        } else {
          setErrorMessage(data.error || 'Failed to record Direct UPI order.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Error recording Direct UPI order.');
      } finally {
        setLoading(false);
      }
    } else {
      // Razorpay Online Gateway
      await handleOnlineRazorpayPayment(orderPayload);
    }
  };

  const handleOnlineRazorpayPayment = async (orderPayload: any) => {
    try {
      // 1. Create Razorpay Order
      const rzpRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderTotal,
          receipt: `ORD_${Date.now().toString().slice(-8)}`,
          notes: {
            customerName: formData.name,
            customerPhone: formData.phone,
            email: formData.email,
          },
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpData.success || !rzpData.order) {
        throw new Error(rzpData.error || 'Failed to initialize payment gateway.');
      }

      // 2. Pre-save order in DB
      const dbOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderPayload,
          razorpayOrderId: rzpData.order.id,
          paymentStatus: 'PENDING',
        }),
      });

      const dbOrderData = await dbOrderRes.json();
      const currentDbOrder = dbOrderData.order;

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: rzpData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SQCz0Kir1JiUtt',
        amount: rzpData.order.amount,
        currency: rzpData.order.currency || 'INR',
        name: 'Sidhi Vinayaka Traders',
        description: 'SVT Gourmet Cashews Order Payment',
        image: '/images/Header-logo.png',
        order_id: rzpData.order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#D4AF37',
          backdrop_color: '#0A111E',
        },
        handler: async function (response: any) {
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: currentDbOrder?.orderId || rzpData.order.receipt,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setConfirmedOrder({
                ...currentDbOrder,
                paymentStatus: 'PAID',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              });
              clearCart();
            } else {
              setErrorMessage('Payment verification notice: ' + (verifyData.error || 'Please contact store support.'));
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setErrorMessage('Network error during verification. Reference Payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setErrorMessage('Payment window was closed. You can retry anytime.');
          },
        },
      };

      if (typeof window !== 'undefined' && window.Razorpay) {
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (resp: any) {
          setLoading(false);
          setErrorMessage(`Payment Failed: ${resp.error?.description || 'Transaction declined'}`);
        });
        paymentObject.open();
      } else {
        throw new Error('Razorpay Gateway is readying. Please click Pay again in 1 second.');
      }
    } catch (error: any) {
      console.error('Razorpay process error:', error);
      setErrorMessage(error.message || 'Payment processing failed.');
      setLoading(false);
    }
  };

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-4 bg-[#0A111E] text-slate-100 flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyCartIllustration className="w-40 h-40 sm:w-48 sm:h-48 mb-2" />
        <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400 max-w-xs">Add gourmet raw or roasted cashews to your cart to proceed with checkout.</p>
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
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 text-center space-y-6 bg-[#0A111E] text-slate-100">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#D4AF37] text-navy-950 rounded-3xl flex items-center justify-center mx-auto shadow-elevated animate-pulse">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <Badge variant="gold" className="px-3 py-1 text-xs">Order Placed Successfully</Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">Thank You for Your Order!</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your gourmet cashew order has been confirmed with Sidhi Vinayaka Traders. Dispatch updates will be sent to your mobile & email.
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-navy-900/90 border border-white/10 max-w-md mx-auto text-xs space-y-3 text-left shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-slate-400">Order Reference</span>
            <span className="text-sm font-mono font-bold text-[#D4AF37]">#{confirmedOrder.orderId || confirmedOrder._id}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Recipient Phone</span>
            <span className="font-semibold text-white font-mono">{confirmedOrder.customerDetails?.phone || formData.phone}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Invoice Email</span>
            <span className="font-semibold text-slate-200">{confirmedOrder.customerDetails?.email || formData.email}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Payment Mode</span>
            <span className="font-semibold text-emerald-400 uppercase">{confirmedOrder.paymentMethod}</span>
          </div>

          {confirmedOrder.razorpayPaymentId && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Razorpay Payment ID</span>
              <span className="font-mono text-slate-300 font-semibold">{confirmedOrder.razorpayPaymentId}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Fulfillment Status</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              {confirmedOrder.paymentStatus === 'PAID' ? 'PAID / CONFIRMED' : 'ORDER RECEIVED (COD/PENDING)'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold text-white">
            <span>Total Payable</span>
            <span className="text-[#D4AF37] text-base font-heading">₹{confirmedOrder.totalAmount}/-</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Express dispatch team at Surya Nagar Colony, Uppal is packing your gourmet cashews with airtight sealing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3.5 gold-cta-button text-xs font-bold text-navy-950 uppercase tracking-wider text-center"
          >
            Back to Store
          </Link>
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-xs font-bold rounded-xl transition-colors border border-white/10 flex items-center justify-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#070D18] min-h-screen text-slate-100 pb-20 overflow-x-hidden w-full">
      {/* Razorpay Script Loader */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayReady(true)}
      />

      {/* Top Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <span className="text-[#D4AF37] font-semibold">Express Secure Checkout</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <h1 className="text-xl sm:text-3xl font-extrabold font-heading text-white">Delivery & Payment Checkout</h1>
          <div className="inline-flex items-center space-x-2 text-[11px] sm:text-xs text-emerald-400 bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-500/30 w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>SSL 256-Bit Encrypted Direct Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-3 shadow-lg animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleProceedClick} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Delivery Address, Smart Contact & Payment Methods */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Customer Contact & Delivery Info */}
            <div className="glass-panel p-5 sm:p-8 rounded-3xl space-y-6 shadow-elevated border border-white/10 bg-[#0E1726]/80">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-navy-950 font-black text-xs flex items-center justify-center">1</span>
                  <h2 className="text-base font-bold font-heading text-white">
                    Delivery Address & Contact Details
                  </h2>
                </div>
                <span className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Uppal, Hyderabad & Pan-India</span>
                </span>
              </div>

              {/* Full Name & Smart Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <span>Recipient Full Name</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setIsContactConfirmed(false);
                    }}
                    placeholder="e.g. Ravindra Sahu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Email Address (For Tax Invoice)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, email: val });
                      checkEmailTypo(val);
                      setIsContactConfirmed(false);
                    }}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                  {emailSuggestion && (
                    <div className="mt-1.5 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-[11px] text-amber-300">
                      <span>Did you mean <strong className="underline">{emailSuggestion}</strong>?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, email: emailSuggestion });
                          setEmailSuggestion(null);
                        }}
                        className="px-2 py-0.5 bg-[#D4AF37] text-navy-950 font-bold rounded text-[10px] hover:brightness-110"
                      >
                        Use Correction
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Smart Mobile Number with Double-Check Ready Indicator */}
              <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/90 border border-[#D4AF37]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                    <span>Mobile Phone Number (Active Delivery Contact)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  {isContactConfirmed ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Double-Checked & Verified ✓</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified at Checkout</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-mono font-bold">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={14}
                    value={formData.phone}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setFormData({ ...formData, phone: raw });
                      setIsContactConfirmed(false);
                    }}
                    placeholder="95152 73464"
                    className="w-full pl-16 pr-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs font-mono tracking-wider placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.whatsappUpdates}
                      onChange={(e) => setFormData({ ...formData, whatsappUpdates: e.target.checked })}
                      className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-950"
                    />
                    <span className="text-slate-300">Receive live dispatch & tracking updates on WhatsApp</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium">Zero OTP Hassle • Fast Confirmation</span>
                </div>
              </div>

              {/* Delivery Address, City, Pincode */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Door / House No., Apartment & Street Address</span>
                  <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Flat 302, Sai Residency, Near Uppal Metro / Bus Depot"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">City / Region</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <span>Postal Pincode</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 500039"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Optional Delivery Instructions */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Order Notes / Dispatch Instructions (Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Leave package with building security or call on arrival"
                  className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Section 2: Flexible Payment Methods (Super Admin Dynamic) */}
            <div className="glass-panel p-5 sm:p-8 rounded-3xl space-y-5 shadow-elevated border border-white/10 bg-[#0E1726]/80">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-navy-950 font-black text-xs flex items-center justify-center">2</span>
                  <h2 className="text-base font-bold font-heading text-white">
                    Select Payment Gateway
                  </h2>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe & Encrypted
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Razorpay Online */}
                {paymentSettings.razorpay?.enabled && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'ONLINE' })}
                    className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-2 ${
                      formData.paymentMethod === 'ONLINE'
                        ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-xl font-bold'
                        : 'bg-navy-950 text-slate-200 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Smartphone className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          {paymentSettings.razorpay.title || 'Razorpay Online Gateway'}
                        </span>
                      </div>
                      <Badge variant={formData.paymentMethod === 'ONLINE' ? 'default' : 'gold'}>
                        {paymentSettings.razorpay.badge || 'Recommended'}
                      </Badge>
                    </div>
                    <p className={`text-[11px] leading-tight ${formData.paymentMethod === 'ONLINE' ? 'text-navy-950 font-medium' : 'text-slate-400'}`}>
                      {paymentSettings.razorpay.description}
                    </p>
                    {paymentSettings.razorpay.discountPercent > 0 && (
                      <span className="text-[10px] font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-md w-fit">
                        🎁 Instant {paymentSettings.razorpay.discountPercent}% Discount on Online Pay
                      </span>
                    )}
                  </button>
                )}

                {/* Direct UPI Scan & Pay */}
                {paymentSettings.directUpi?.enabled && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'DIRECT_UPI' })}
                    className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-2 ${
                      formData.paymentMethod === 'DIRECT_UPI'
                        ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-xl font-bold'
                        : 'bg-navy-950 text-slate-200 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <QrCode className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          {paymentSettings.directUpi.title || 'Direct UPI QR Scan & Pay'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                        Zero Convenience Fee
                      </span>
                    </div>
                    <p className={`text-[11px] leading-tight ${formData.paymentMethod === 'DIRECT_UPI' ? 'text-navy-950 font-medium' : 'text-slate-400'}`}>
                      {paymentSettings.directUpi.description}
                    </p>
                    {formData.paymentMethod === 'DIRECT_UPI' && (
                      <div className="mt-2 p-3 bg-navy-950 text-white rounded-xl border border-white/20 text-xs space-y-1.5">
                        <p className="text-[11px] font-mono text-[#D4AF37]">
                          SVT UPI ID: <strong>{paymentSettings.directUpi.upiId}</strong> ({paymentSettings.directUpi.payeeName})
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Transfer ₹{orderTotal} via GPay / PhonePe / Paytm. Enter UTR reference below:
                        </p>
                        <input
                          type="text"
                          value={formData.upiTransactionRef}
                          onChange={(e) => setFormData({ ...formData, upiTransactionRef: e.target.value })}
                          placeholder="Enter 12-digit UPI Reference / UTR Number"
                          className="w-full px-3 py-1.5 rounded-lg bg-navy-900 border border-white/20 text-xs font-mono text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    )}
                  </button>
                )}

                {/* Cash on Delivery (COD) */}
                {paymentSettings.cod?.enabled && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-2 ${
                      formData.paymentMethod === 'COD'
                        ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-xl font-bold'
                        : 'bg-navy-950 text-slate-200 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Banknote className="w-5 h-5" strokeWidth={2.2} />
                        <span className="text-xs font-black uppercase tracking-wide">
                          {paymentSettings.cod.title || 'Cash on Delivery (COD)'}
                        </span>
                      </div>
                      {paymentSettings.cod.extraFee > 0 ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                          +₹{paymentSettings.cod.extraFee} Fee
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                          Free COD
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-tight ${formData.paymentMethod === 'COD' ? 'text-navy-950 font-medium' : 'text-slate-400'}`}>
                      {paymentSettings.cod.description}
                    </p>
                  </button>
                )}

                {/* Custom Admin Payment Methods */}
                {paymentSettings.customMethods?.filter(m => m.enabled).map((cm) => (
                  <button
                    key={cm.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: cm.id })}
                    className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-2 ${
                      formData.paymentMethod === cm.id
                        ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-xl font-bold'
                        : 'bg-navy-950 text-slate-200 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-wide">{cm.name}</span>
                      </div>
                      {cm.extraFee > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                          +₹{cm.extraFee}
                        </span>
                      )}
                    </div>
                    {cm.description && (
                      <p className={`text-[11px] leading-tight ${formData.paymentMethod === cm.id ? 'text-navy-950 font-medium' : 'text-slate-400'}`}>
                        {cm.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Dynamic Additional Services / Charges (Optional & Custom Admin configured) */}
            {paymentSettings.additionalCharges?.some(c => c.enabled) && (
              <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-4 border border-white/10 bg-[#0E1726]/80">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#D4AF37]" />
                    <span>Packaging & Additional Services</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">SVT Handcrafted Care</span>
                </div>

                <div className="space-y-2.5">
                  {paymentSettings.additionalCharges.filter(c => c.enabled).map((charge) => {
                    const isSelected = !charge.isOptional || selectedChargeIds.includes(charge.id);
                    return (
                      <label
                        key={charge.id}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white'
                            : 'bg-navy-950/60 border-white/5 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {charge.isOptional ? (
                            <input
                              type="checkbox"
                              checked={selectedChargeIds.includes(charge.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedChargeIds([...selectedChargeIds, charge.id]);
                                } else {
                                  setSelectedChargeIds(selectedChargeIds.filter(id => id !== charge.id));
                                }
                              }}
                              className="rounded border-white/20 text-[#D4AF37] focus:ring-[#D4AF37] bg-navy-950"
                            />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-white">{charge.name}</p>
                            {charge.description && (
                              <p className="text-[11px] text-slate-400">{charge.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#D4AF37] shrink-0 ml-2">
                          {charge.amount === 0 ? 'FREE' : `+₹${charge.amount}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary, Coupon & Double-Check Trigger CTA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-5 shadow-elevated border border-white/10 bg-[#0E1726]/80 sticky top-6">
              <h3 className="font-bold font-heading text-base text-white border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="text-xs text-[#D4AF37] font-semibold">100% Guaranteed</span>
              </h3>

              {/* Items Breakdown with SafeImage Fallback */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-navy-950/80 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-navy-900">
                        <SafeImage src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate max-w-[130px] sm:max-w-[160px]">{item.title}</p>
                        <p className="text-[11px] text-slate-400">{item.size} • Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#D4AF37] font-heading text-sm">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Promo Coupon Code */}
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

              {/* Live Price Calculation with Dynamic Surcharges */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">₹{subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Coupon Discount ({discountPercent}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {/* Additional Dynamic Charges breakdown */}
                {activeAdditionalCharges.map((charge) => (
                  <div key={charge.id} className="flex justify-between text-slate-300">
                    <span className="truncate max-w-[200px]">{charge.name}</span>
                    <span className="text-white font-medium">
                      {charge.amount === 0 ? 'FREE' : `+₹${charge.amount}`}
                    </span>
                  </div>
                ))}

                {/* Payment method adjustment */}
                {paymentMethodAdjustment && (
                  <div className={`flex justify-between font-medium ${paymentMethodAdjustment.type === 'DISCOUNT' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <span>{paymentMethodAdjustment.label}</span>
                    <span>
                      {paymentMethodAdjustment.type === 'DISCOUNT' ? `-₹${paymentMethodAdjustment.amount}` : `+₹${paymentMethodAdjustment.amount}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery (Uppal / Hyderabad)</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Total Payable</span>
                  <span className="text-[#D4AF37] font-heading text-xl">₹{orderTotal}</span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 gold-cta-button font-black text-xs uppercase tracking-wider shadow-2xl mt-2 text-navy-950 transition-all flex items-center justify-center space-x-2 cursor-pointer hover:brightness-110 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Order...
                  </span>
                ) : formData.paymentMethod === 'ONLINE' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>DOUBLE-CHECK & PAY VIA RAZORPAY • ₹{orderTotal}</span>
                  </>
                ) : formData.paymentMethod === 'DIRECT_UPI' ? (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>CONFIRM DIRECT UPI PAYMENT • ₹{orderTotal}</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>DOUBLE-CHECK & CONFIRM COD • ₹{orderTotal}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Instant dispatch verification • Uppal Outlet</span>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* ADVANCED DOUBLE-CHECK CONTACT & ORDER VERIFICATION MODAL */}
      {showDoubleCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0E1726] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setShowDoubleCheckModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-black uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Final Double-Check Verification</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
                Review Your Contact & Delivery Details
              </h2>
              <p className="text-xs text-slate-400">
                Please ensure your mobile number and email are 100% correct so our Uppal dispatch team can deliver without delays.
              </p>
            </div>

            {/* Contact Verification Highlight Cards */}
            <div className="space-y-3">
              {/* Phone Card */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-[#D4AF37]/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Mobile & WhatsApp Contact
                    </span>
                    <p className="text-sm font-black text-white font-mono">
                      {cleanPhoneNumber(formData.phone)}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Active Calling
                </span>
              </div>

              {/* Email Card */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Official E-Receipt & Invoice Destination
                    </span>
                    <p className="text-xs font-semibold text-slate-200 truncate max-w-[220px]">
                      {formData.email}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  Receipt Ready
                </span>
              </div>

              {/* Address Review */}
              <div className="p-4 rounded-2xl bg-navy-950/60 border border-white/10 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> Dispatch Destination
                  </span>
                  <span className="font-mono text-[#D4AF37]">PIN: {formData.pincode}</span>
                </div>
                <p className="font-medium text-slate-200">
                  {formData.name} • {formData.address}, {formData.city} - {formData.pincode}
                </p>
              </div>

              {/* WhatsApp Opt-in Notice */}
              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl text-xs text-emerald-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time dispatch tracking will be sent to WhatsApp & SMS</span>
                </div>
              </div>
            </div>

            {/* Total Payable Reminder */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-white/10 text-xs">
              <span className="text-slate-400">Total Order Amount ({formData.paymentMethod})</span>
              <span className="text-base font-black text-[#D4AF37] font-heading">₹{orderTotal}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDoubleCheckModal(false)}
                className="w-full sm:w-1/3 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndProceed}
                disabled={loading}
                className="w-full sm:w-2/3 py-3.5 gold-cta-button text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-lg hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                <span>Looks 100% Correct • Proceed to Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
