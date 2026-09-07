'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-navy-950 text-slate-100 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#141E30] p-8 rounded-3xl border border-[#D4AF37]/30 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 bg-[#D4AF37] text-navy-950 rounded-2xl flex items-center justify-center mx-auto text-2xl font-black font-heading shadow-lg">
          404
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black font-heading text-white">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or cashew selection you are looking for could not be located or has moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3.5 gold-cta-button text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:scale-102 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    </div>
  );
}
