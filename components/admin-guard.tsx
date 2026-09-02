'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || !currentUser.email) {
        setAuthorized(false);
        setLoading(false);
        router.push('/login');
        return;
      }

      const email = currentUser.email.toLowerCase().trim();
      setUserEmail(email);

      // Check if user is super-admin or admin
      const isSuperAdmin = email === 'pa0174492@gmail.com' || email === 'sahuravindra897@gmail.com';

      if (isSuperAdmin) {
        setAuthorized(true);
        setLoading(false);
      } else {
        // Query server role
        try {
          const res = await fetch('/api/admin/users');
          const data = await res.json();
          if (data.success && data.users) {
            const dbUser = data.users.find((u: any) => u.email?.toLowerCase() === email);
            if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super-admin')) {
              setAuthorized(true);
            } else {
              setAuthorized(false);
            }
          } else {
            setAuthorized(false);
          }
        } catch (err) {
          setAuthorized(false);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center text-slate-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#D4AF37] tracking-wider uppercase">Authenticating Access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl text-center space-y-5 border border-rose-500/30 shadow-elevated">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
            <Lock className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Access Restricted</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Admin Management Suite is reserved for authorized store administrators. 
            <br />
            User ({userEmail || 'Guest'}) does not have administrator permissions.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 gold-cta-button text-xs font-bold text-navy-950 uppercase tracking-wider"
            >
              Sign In as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
