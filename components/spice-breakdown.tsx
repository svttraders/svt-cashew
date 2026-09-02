'use client';

import React from 'react';
import Image from 'next/image';
import { SpiceIngredient } from '@/lib/mock-data';

interface SpiceBreakdownProps {
  spices?: SpiceIngredient[];
  flavorName?: string;
}

export default function SpiceBreakdown({ spices = [], flavorName }: SpiceBreakdownProps) {
  if (!spices || spices.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-[#193324] font-display">
        Spice Ingredient Breakdown
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {spices.map((spice, idx) => (
          <div
            key={idx}
            className="p-3 bg-[#F5F0E6] rounded-2xl border border-[#E2DACB] flex flex-col items-center text-center space-y-2 hover:bg-[#EFE8D8] transition-colors"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-[#E7DFCE]">
              <Image
                src={spice.image || "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=300&q=80"}
                alt={spice.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-[#193324] leading-tight">{spice.name}</p>
              {spice.description && (
                <p className="text-[10px] text-slate-500 mt-0.5">{spice.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
