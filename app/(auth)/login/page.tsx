'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const syncUserWithMongoDB = async (firebaseUser: any) => {
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });
    } catch (err) {
      console.warn('MongoDB user sync warning:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (auth) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await syncUserWithMongoDB(userCred.user);
        router.push('/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      console.warn('Auth error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (auth) {
        const provider = new GoogleAuthProvider();
        const userCred = await signInWithPopup(auth, provider);
        await syncUserWithMongoDB(userCred.user);
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setError('Google sign-in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Gold Decor Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B192C] via-[#D4AF37] to-[#0B192C]" />

        <div className="text-center space-y-3 pt-2">
          <div className="relative h-14 w-48 mx-auto overflow-hidden">
            <Image
              src="/images/Header-logo.png"
              alt="Sidhi Vinayaka Traders Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black font-display text-[#0B192C]">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-slate-500">
            Access order tracking, store checkout & admin catalog management.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#0B192C] block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sahuravindra897@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0B192C] block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#0B192C] text-[#F8FAFC] font-bold text-xs rounded-xl hover:bg-[#1E3A8A] transition-all flex items-center justify-center space-x-2 shadow-md"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase tracking-wider font-bold">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 bg-slate-50 border border-slate-200 text-[#0B192C] font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center space-x-2"
        >
          <UserCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>Sign In with Google</span>
        </button>

        <div className="text-center pt-2">
          <Link href="/signup" className="text-xs font-bold text-[#D4AF37] hover:underline">
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
