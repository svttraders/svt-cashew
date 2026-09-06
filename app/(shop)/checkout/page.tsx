'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useCartStore } from '@/lib/cart-store';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { 
  ChevronRight, CheckCircle, Ticket, ArrowLeft, 
  ShieldCheck, Truck, CreditCard, Banknote, Smartphone, 
  AlertCircle, Sparkles, Printer, Lock, KeyRound, RefreshCw, PhoneCall, Check, Send
} from 'lucide-react';
import { EmptyCartIllustration } from '@/components/illustrations';
import { Badge } from '@/components/ui/badge';

declare global {
  interface Window {
    Razorpay: any;
    recaptchaVerifier: any;
  }
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const orderTotal = Math.max(0, subtotal - discountAmount);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'ONLINE' as 'ONLINE' | 'COD' | 'UPI' | 'CARD',
  });

  // Phone SMS Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Timer countdown for SMS resend
  useEffect(() => {
    let timer: any;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  // Clean initialization of Firebase reCAPTCHA verifier
  const initRecaptchaVerifier = () => {
    if (typeof window === 'undefined' || !auth) return null;
    try {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn('Recaptcha clear warning:', e);
        }
        window.recaptchaVerifier = null;
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('Firebase reCAPTCHA verified successfully');
        },
        'expired-callback': () => {
          console.warn('Firebase reCAPTCHA expired, resetting');
        },
      });

      return window.recaptchaVerifier;
    } catch (err: any) {
      console.error('RecaptchaVerifier error:', err);
      return null;
    }
  };

  // Send real SMS OTP using Google Firebase SMS Server
  const handleSendPhoneOtp = async () => {
    setOtpError('');
    setOtpSuccessMsg('');

    let rawPhone = formData.phone.trim();
    // Normalize to E.164 standard format (+91 followed by 10 digits)
    const digitsOnly = rawPhone.replace(/\D/g, '');
    let formattedNumber = rawPhone;

    if (!rawPhone.startsWith('+')) {
      if (digitsOnly.length === 10) {
        formattedNumber = `+91${digitsOnly}`;
      } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        formattedNumber = `+${digitsOnly}`;
      } else {
        formattedNumber = `+91${digitsOnly}`;
      }
    }

    if (digitsOnly.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number with country code (e.g. +91 9515273464)');
      return;
    }

    setSendingOtp(true);

    try {
      if (!auth) {
        throw new Error('Firebase Authentication is not initialized.');
      }

      const verifier = initRecaptchaVerifier();
      if (!verifier) {
        throw new Error('Unable to initialize Firebase security check.');
      }

      console.log(`[Firebase Phone Auth] Requesting SMS to: ${formattedNumber}`);
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      setResendTimer(60);
      setCanResend(false);
      setOtpSuccessMsg(`SMS verification code sent to ${formattedNumber} via Google Firebase SMS server. Please check your phone.`);
    } catch (fbErr: any) {
      console.error('Firebase signInWithPhoneNumber error:', fbErr);
      if (fbErr.code === 'auth/billing-not-enabled' || fbErr.message?.includes('billing-not-enabled')) {
        setOtpError('Firebase Phone SMS requires Google Cloud Billing / Blaze plan linked in Firebase Console. If you recently enabled it, Google may take 2-5 minutes to propagate. To test without billing, add your mobile number under Firebase Console -> Authentication -> Sign-in method -> Phone -> "Phone numbers for testing".');
      } else if (fbErr.code === 'auth/operation-not-allowed') {
        setOtpError('Firebase Phone Auth requires "Phone" to be enabled in Firebase Console (Authentication -> Sign-in method -> Phone).');
      } else if (fbErr.code === 'auth/invalid-phone-number') {
        setOtpError('Invalid phone number format. Please ensure format is +91 followed by 10 digits.');
      } else if (fbErr.code === 'auth/too-many-requests') {
        setOtpError('SMS request quota reached for this number. Please wait a few minutes before retrying.');
      } else if (fbErr.code === 'auth/captcha-check-failed') {
        setOtpError('Security reCAPTCHA verification failed. Please try again.');
      } else {
        setOtpError(fbErr.message || 'Failed to send SMS code. Check your internet connection and phone number.');
      }
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Phone SMS OTP from the user's SMS inbox
  const handleVerifyPhoneOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter the full 6-digit SMS code received on your phone.');
      return;
    }

    setVerifyingOtp(true);
    setOtpError('');

    try {
      if (!confirmationResult) {
        throw new Error('No active SMS session found. Please click "Send Verification OTP" first.');
      }

      await confirmationResult.confirm(otpCode.trim());
      setIsPhoneVerified(true);
      setOtpSent(false);
      setOtpSuccessMsg('Phone number verified successfully via Google Firebase SMS!');
    } catch (err: any) {
      console.error('Firebase OTP confirmation error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setOtpError('Incorrect 6-digit verification code. Please check your SMS and try again.');
      } else if (err.code === 'auth/code-expired') {
        setOtpError('Verification code has expired. Please click "Resend Code" to get a fresh SMS.');
      } else {
        setOtpError(err.message || 'Verification failed. Please verify the code and retry.');
      }
    } finally {
      setVerifyingOtp(false);
    }
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

  const handleOnlineRazorpayPayment = async (orderPayload: any) => {
    try {
      // 1. Initiate Razorpay Order on server
      const rzpRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderTotal,
          receipt: `ORD_${Date.now().toString().slice(-8)}`,
          notes: {
            customerName: formData.name,
            customerPhone: formData.phone,
          },
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpData.success || !rzpData.order) {
        throw new Error(rzpData.error || 'Failed to initialize payment gateway.');
      }

      // 2. Save initial Order in DB
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

      // 3. Launch Razorpay Checkout Modal
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
            // 4. Verify cryptographic signature on server
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
              setErrorMessage('Payment verification note: ' + (verifyData.error || 'Please contact support.'));
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setErrorMessage('Network error during verification. Contact store with Payment ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setErrorMessage('Payment was cancelled or closed. You can retry anytime.');
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
        throw new Error('Razorpay SDK is loading. Please click pay again in a second.');
      }
    } catch (error: any) {
      console.error('Razorpay process error:', error);
      setErrorMessage(error.message || 'Payment processing failed.');
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Require Phone Verification
    if (!isPhoneVerified) {
      setErrorMessage('Please verify your mobile number via SMS OTP before placing the order.');
      return;
    }

    setLoading(true);

    const orderPayload = {
      customerDetails: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        colony: formData.city || 'Hyderabad',
        city: formData.city,
        pincode: formData.pincode,
      },
      items: items.map((item) => ({
        productId: item.productId,
        title: item.title,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      totalAmount: orderTotal,
      paymentMethod: formData.paymentMethod,
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
        setErrorMessage(err.message || 'Error creating order.');
      } finally {
        setLoading(false);
      }
    } else {
      // Razorpay Online Gateway
      await handleOnlineRazorpayPayment(orderPayload);
    }
  };

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-4 bg-navy-950 text-slate-100 flex flex-col items-center justify-center min-h-[60vh]">
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
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-20 text-center space-y-6 bg-navy-950 text-slate-100">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#D4AF37] text-navy-950 rounded-3xl flex items-center justify-center mx-auto shadow-elevated animate-pulse">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <Badge variant="gold" className="px-3 py-1 text-xs">Payment & Order Confirmed</Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">Thank You for Your Order!</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your premium cashew order has been successfully placed with Sidhi Vinayaka Traders.
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
            <span className="text-slate-400">Payment Method</span>
            <span className="font-semibold text-emerald-400 uppercase">{confirmedOrder.paymentMethod}</span>
          </div>

          {confirmedOrder.razorpayPaymentId && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Razorpay Payment ID</span>
              <span className="font-mono text-slate-300 font-semibold">{confirmedOrder.razorpayPaymentId}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Status</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
              {confirmedOrder.paymentStatus === 'PAID' ? 'PAID / CONFIRMED' : 'COD / RECEIVED'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-sm font-bold text-white">
            <span>Total Paid</span>
            <span className="text-[#D4AF37] text-base font-heading">₹{confirmedOrder.totalAmount}/-</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Our dispatch team at Surya Nagar Colony, Uppal is preparing your order for express dispatch.
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
    <div className="bg-navy-950 min-h-screen text-slate-100 pb-20 overflow-x-hidden w-full">
      {/* Razorpay Script Loader */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayReady(true)}
      />

      {/* Invisible Recaptcha Container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
        <nav className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
          <span className="text-[#D4AF37] font-semibold">Secure Checkout</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <h1 className="text-xl sm:text-3xl font-extrabold font-heading text-white">Delivery & Payment Checkout</h1>
          <div className="inline-flex items-center space-x-1.5 text-[11px] sm:text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30 w-fit">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Razorpay Encrypted</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center space-x-3 shadow-lg">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* Left Column: Shipping & Details with Phone SMS Verification */}
          <div className="lg:col-span-7 glass-panel p-5 sm:p-8 rounded-3xl space-y-6 shadow-elevated">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold font-heading text-white">
                1. Delivery Address & Contact
              </h2>
              <span className="text-[11px] text-[#D4AF37] font-semibold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hyderabad & All India Dispatch</span>
                <span className="sm:hidden">Express Dispatch</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ravindra Sahu"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email (For Razorpay Receipt)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            {/* GOOGLE FIREBASE PHONE SMS VERIFICATION MODULE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-navy-900/80 border border-[#D4AF37]/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                  <span>Phone Number (Firebase SMS OTP Verification)</span>
                </label>
                {isPhoneVerified ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Verified via SMS ✓</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-semibold">SMS Verification Required</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    required
                    disabled={isPhoneVerified}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setIsPhoneVerified(false);
                      setOtpSent(false);
                    }}
                    placeholder="+91 9515273464"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] disabled:opacity-70"
                  />
                </div>

                {!isPhoneVerified && (
                  <button
                    type="button"
                    onClick={handleSendPhoneOtp}
                    disabled={sendingOtp}
                    className="px-5 py-2.5 bg-[#D4AF37] hover:brightness-110 text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingOtp ? 'Sending SMS OTP...' : otpSent ? 'Resend SMS' : 'Send SMS Verification Code'}</span>
                  </button>
                )}
              </div>

              {/* OTP Input and Verification Box */}
              {otpSent && !isPhoneVerified && (
                <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                  <p className="text-[11px] text-slate-300">
                    Enter the 6-digit code received on your phone via SMS:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 6-digit SMS OTP"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-navy-950 text-[#D4AF37] font-mono text-sm tracking-widest font-extrabold focus:outline-none text-center"
                        autoFocus
                      />
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyPhoneOtp}
                      disabled={verifyingOtp || otpCode.length < 6}
                      className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{verifyingOtp ? 'Verifying...' : 'Confirm SMS Code'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Didn&apos;t receive SMS?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="text-[#D4AF37] font-bold hover:underline"
                      >
                        Resend SMS Code
                      </button>
                    ) : (
                      <span>Resend available in {resendTimer}s</span>
                    )}
                  </div>
                </div>
              )}

              {otpError && (
                <p className="text-[11px] font-semibold text-rose-400 leading-relaxed bg-rose-950/60 p-2.5 rounded-xl border border-rose-500/30">
                  {otpError}
                </p>
              )}
              {otpSuccessMsg && (
                <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/30">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{otpSuccessMsg}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Street Address / House No.</label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Flat / House No., Street Name, Landmark"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
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
                  placeholder="e.g. Hyderabad"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Pincode</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 500039"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-navy-950 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider block">2. Choose Payment Mode</label>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'ONLINE' })}
                  className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-2 ${
                    formData.paymentMethod === 'ONLINE'
                      ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-lg font-bold'
                      : 'bg-navy-950 text-slate-200 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-5 h-5" strokeWidth={2} />
                      <span className="text-xs font-black uppercase">Razorpay Online Gateway</span>
                    </div>
                    <Badge variant={formData.paymentMethod === 'ONLINE' ? 'default' : 'gold'}>Recommended</Badge>
                  </div>
                  <p className={`text-[11px] leading-tight ${formData.paymentMethod === 'ONLINE' ? 'text-navy-900 font-medium' : 'text-slate-400'}`}>
                    UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, NetBanking, EMI & Wallets
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  className={`p-4 rounded-2xl text-left transition-all border flex flex-col gap-2 ${
                    formData.paymentMethod === 'COD'
                      ? 'bg-[#D4AF37] text-navy-950 border-[#D4AF37] shadow-lg font-bold'
                      : 'bg-navy-950 text-slate-200 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Banknote className="w-5 h-5" strokeWidth={2} />
                    <span className="text-xs font-black uppercase">Cash on Delivery (COD)</span>
                  </div>
                  <p className={`text-[11px] leading-tight ${formData.paymentMethod === 'COD' ? 'text-navy-900 font-medium' : 'text-slate-400'}`}>
                    Pay in cash upon doorstep delivery in Hyderabad & Uppal region
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Coupon */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl space-y-5 shadow-elevated">
              <h3 className="font-bold font-heading text-base text-white border-b border-white/10 pb-3 flex items-center justify-between">
                <span>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className="text-xs text-[#D4AF37] font-semibold">100% Guaranteed</span>
              </h3>

              {/* Items Breakdown */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs bg-navy-950/80 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-navy-900">
                        <Image src={item.image || "/images/raw_cashews_hero.webp"} alt={item.title} fill className="object-cover" />
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

              {/* Coupon Application */}
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
                  <span className="text-[#D4AF37] font-heading text-lg">₹{orderTotal}</span>
                </div>
              </div>

              {/* Payment Action CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 gold-cta-button font-bold text-xs uppercase tracking-wider shadow-2xl mt-2 text-navy-950 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Securing & Processing Order...</span>
                ) : !isPhoneVerified ? (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>VERIFY PHONE TO PLACE ORDER • ₹{orderTotal}</span>
                  </>
                ) : formData.paymentMethod === 'ONLINE' ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>PAY VIA RAZORPAY • ₹{orderTotal}</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>CONFIRM COD ORDER • ₹{orderTotal}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 pt-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Instant verified dispatch • SVT Uppal</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
