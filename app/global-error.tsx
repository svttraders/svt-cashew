'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Global Error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A111E] text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#141E30] p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <AlertTriangle className="w-8 h-8 text-[#D4AF37]" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">
              Application Error
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              We encountered a temporary issue while loading the application.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="flex-1 py-3 px-4 bg-[#D4AF37] text-[#0A111E] font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>

            <Link
              href="/"
              className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-slate-200 font-bold text-xs rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4 text-[#D4AF37]" />
              <span>Home Store</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
