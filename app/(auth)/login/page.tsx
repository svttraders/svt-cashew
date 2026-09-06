'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const ADMIN_EMAILS = ['pa0174492@gmail.com', 'sahuravindra897@gmail.com'];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const syncUserWithMongoDB = async (firebaseUser: any) => {
    try {
      const res = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });
      const data = await res.json();
      return data?.user;
    } catch (err) {
      console.warn('MongoDB user sync warning:', err);
      return null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMsg(null);

    try {
      if (auth) {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const dbUser = await syncUserWithMongoDB(userCred.user);

        const userEmail = userCred.user.email?.toLowerCase().trim() || '';
        if (ADMIN_EMAILS.includes(userEmail) || dbUser?.role === 'admin' || dbUser?.role === 'super-admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is disabled in Firebase. Enable "Email/Password" under Firebase Console -> Authentication -> Sign-in method.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please check your credentials or register.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to many failed attempts. Reset your password or try later.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        const userCred = await signInWithPopup(auth, provider);
        const dbUser = await syncUserWithMongoDB(userCred.user);

        const userEmail = userCred.user.email?.toLowerCase().trim() || '';
        if (ADMIN_EMAILS.includes(userEmail) || dbUser?.role === 'admin' || dbUser?.role === 'super-admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is disabled in Firebase. Enable "Google" under Firebase Console -> Authentication -> Sign-in method.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in was interrupted. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first to receive a password reset link.');
      return;
    }

    setResetLoading(true);
    setError(null);
    setInfoMsg(null);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
        setInfoMsg(`Password reset link sent to ${email.trim()}. Check your inbox.`);
      }
    } catch (err: any) {
      setError(err.message || 'Could not send password reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-navy-950 text-slate-100">
      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-elevated space-y-6 relative overflow-hidden bg-navy-950/90">
        
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-navy-900 via-[#D4AF37] to-navy-900" />

        <div className="text-center space-y-2 pt-2">
          <Link href="/" className="inline-block">
            <div className="relative h-12 w-48 mx-auto overflow-hidden">
              <Image
                src="/images/footer-logo.webp"
                alt="Sidhi Vinayaka Traders Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-2xl font-bold font-heading text-white flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>Sign In to Account</span>
          </h1>
          <p className="text-xs text-slate-400">
            Access order tracking, admin catalog suite & instant checkout.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 text-center">
            {error}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 bg-emerald-500/10 text-emerald-300 text-xs font-semibold rounded-xl border border-emerald-500/30 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sahuravindra897@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-navy-900 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-[11px] text-[#D4AF37] hover:underline font-semibold"
              >
                {resetLoading ? 'Sending link...' : 'Forgot password?'}
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-navy-900 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" strokeWidth={1.75} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 gold-cta-button text-navy-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-navy-950" strokeWidth={2.5} />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase tracking-wider font-bold">or</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          <UserCheck className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
          <span>Sign In with Google</span>
        </button>

        <div className="text-center pt-2 border-t border-white/10">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold text-[#D4AF37] hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
