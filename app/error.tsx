'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] bg-navy-950 text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#141E30] p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <AlertTriangle className="w-8 h-8 text-[#D4AF37]" strokeWidth={2} />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black font-heading text-white">
            Something Went Wrong
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            An unexpected error occurred while loading this page. You can reload or return to the shop.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-[#D4AF37] text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-slate-200 font-bold text-xs rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" />
            <span>Back to Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
