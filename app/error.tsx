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
    <div className="min-h-[70vh] bg-[#FAF6EE] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#FFFDF9] p-8 rounded-3xl border border-[#E2DACB] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black font-display text-[#193324]">
            Something Went Wrong
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            An unexpected error occurred. Please try refreshing the page or return to the storefront homepage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-[#193324] text-[#FAF6EE] font-bold text-xs rounded-full hover:bg-[#132B1D] transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 text-[#D4AF37]" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-[#F5F0E6] border border-[#E2DACB] text-slate-800 font-bold text-xs rounded-full hover:bg-[#EFE8D8] transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4 text-[#193324]" />
            <span>Go Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
