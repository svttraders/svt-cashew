import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-[#FAF6EE] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#FFFDF9] p-8 rounded-3xl border border-[#E2DACB] shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-[#193324] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto text-2xl font-black font-display">
          404
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black font-display text-[#193324]">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The page or cashew product you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#193324] text-[#FAF6EE] font-bold text-xs rounded-full hover:bg-[#132B1D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Back to Storefront</span>
        </Link>
      </div>
    </div>
  );
}
