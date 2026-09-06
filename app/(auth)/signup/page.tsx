'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Lock, Mail, ArrowRight, User as UserIcon, ShieldCheck, KeyRound, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'DETAILS' | 'OTP'>('DETAILS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Email delivery status popup modal
  const [statusPopup, setStatusPopup] = useState<{
    show: boolean;
    status: 'SUCCESS' | 'ERROR';
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const syncUserWithMongoDB = async (firebaseUser: any, displayName: string) => {
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: displayName || firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || '',
        }),
      });
    } catch (err) {
      console.warn('MongoDB user sync warning:', err);
    }
  };

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setStatusPopup(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP code.');
      }

      setStep('OTP');
      setResendTimer(60);
      setCanResend(false);

      if (data.emailSent) {
        setStatusPopup({
          show: true,
          status: 'SUCCESS',
          title: 'Verification Email Sent Successfully! ✓',
          description: `A 6-digit OTP code has been delivered to ${email}. Please check your Inbox and Spam/Junk folder.`,
        });
        setInfoMessage(`Verification code dispatched to ${email}. Check your inbox.`);
      } else {
        setStatusPopup({
          show: true,
          status: 'ERROR',
          title: 'Email Delivery Notice',
          description: data.emailError || 'Email could not be dispatched via SMTP. Check your connection or spam folder.',
        });
        setInfoMessage(`Code generated. Please check server logs or retry.`);
      }
    } catch (err: any) {
      setError(err.message || 'Error sending verification code.');
      setStatusPopup({
        show: true,
        status: 'ERROR',
        title: 'Failed to Send Code',
        description: err.message || 'Unable to communicate with email server.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;
    setError(null);
    setLoading(true);
    setStatusPopup(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setResendTimer(60);
      setCanResend(false);
      if (data.emailSent) {
        setStatusPopup({
          show: true,
          status: 'SUCCESS',
          title: 'Fresh Verification Code Sent! ✓',
          description: `A new 6-digit OTP has been dispatched to ${email}. Check your inbox.`,
        });
        setInfoMessage(`A fresh verification code was dispatched to ${email}.`);
      } else {
        setStatusPopup({
          show: true,
          status: 'ERROR',
          title: 'Email Delivery Notice',
          description: data.emailError || 'Email could not be dispatched.',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create Firebase account
  const handleVerifyOtpAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Verify OTP with our secure endpoint
      const verifyRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Invalid verification code.');
      }

      // 2. Code is verified! Create Firebase Auth user
      if (auth) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name && userCred.user) {
          await updateProfile(userCred.user, { displayName: name });
        }
        await syncUserWithMongoDB(userCred.user, name);

        if (email.toLowerCase() === 'sahuravindra897@gmail.com' || email.toLowerCase() === 'pa0174492@gmail.com') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error('Signup verification error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is disabled in Firebase Console. Please enable "Email/Password" under Firebase Console -> Authentication -> Sign-in method.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please click "Sign In" below.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to complete signup. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-navy-950 text-slate-100">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-elevated space-y-6 relative overflow-hidden">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-900 via-[#D4AF37] to-navy-900" />

        {/* Header Branding */}
        <div className="text-center space-y-2 pt-2">
          <Link href="/" className="inline-block">
            <div className="relative h-12 w-48 mx-auto overflow-hidden">
              <Image
                src="/images/footer-logo.webp"
                alt="Sidhi Vinayaka Traders"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-heading text-white">
            {step === 'DETAILS' ? 'Create an Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs text-slate-400">
            {step === 'DETAILS' 
              ? 'Join Sidhi Vinayaka Traders for supreme cashew orders.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* High-Visibility Email Delivery Status Pop-Up Modal */}
        {statusPopup && statusPopup.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4 relative ${
              statusPopup.status === 'SUCCESS'
                ? 'bg-navy-900 border-emerald-500/50 text-white'
                : 'bg-navy-900 border-amber-500/50 text-white'
            }`}>
              <button
                type="button"
                onClick={() => setStatusPopup(null)}
                className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  statusPopup.status === 'SUCCESS'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {statusPopup.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1 pr-4">
                  <h3 className="font-bold font-heading text-sm text-white">
                    {statusPopup.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {statusPopup.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStatusPopup(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    statusPopup.status === 'SUCCESS'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-black'
                      : 'bg-[#D4AF37] hover:brightness-110 text-navy-950 font-black'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error / Info Alerts */}
        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-emerald-500/10 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 text-center leading-relaxed flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* STEP 1: Details Form */}
        {step === 'DETAILS' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ravindra Sahu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-navy-900 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-navy-900 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-navy-900 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gold-cta-button text-navy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Verify Email & Continue</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtpAndCreate} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 text-center">
                6-Digit Security Code
              </label>
              <div className="relative max-w-xs mx-auto">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[12px] font-mono text-2xl py-3 rounded-xl border border-[#D4AF37]/50 bg-navy-900 text-[#D4AF37] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-4" strokeWidth={1.75} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 gold-cta-button text-navy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Verifying Account...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                  <span>Verify & Create Account</span>
                </>
              )}
            </button>

            {/* Resend & Back Controls */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Change Email</span>
              </button>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#D4AF37] font-semibold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
                  <span>Resend Code</span>
                </button>
              ) : (
                <span className="text-slate-500">
                  Resend in {resendTimer}s
                </span>
              )}
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#D4AF37] hover:underline">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
