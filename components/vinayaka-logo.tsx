'use client';

import React from 'react';

interface VinayakaLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
  iconSize?: number;
  layout?: 'horizontal' | 'vertical';
  priority?: boolean;
}

export default function VinayakaLogo({
  className = '',
  showText = true,
  textColor = 'text-white',
  subtextColor = 'text-[#D4AF37]',
  iconSize = 38,
  layout = 'horizontal',
}: VinayakaLogoProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={`flex ${
        isHorizontal ? 'flex-row items-center space-x-3' : 'flex-col items-center justify-center text-center space-y-1.5'
      } group select-none ${className}`}
    >
      {/* Royal Lord Ganesha Vector Emblem */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{ width: iconSize, height: iconSize * 1.08 }}
      >
        <svg
          viewBox="0 0 500 550"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)]"
        >
          <defs>
            <linearGradient id="logoGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2C8" />
              <stop offset="35%" stopColor="#F5D77F" />
              <stop offset="70%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#A8791C" />
            </linearGradient>
            <filter id="ganeshaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#D4AF37" floodOpacity="0.4" />
            </filter>
          </defs>

          <g filter="url(#ganeshaGlow)" stroke="url(#logoGoldGradient)" strokeLinecap="round" strokeLinejoin="round">
            {/* Top Crown Finial Peak */}
            <path d="M 250 75 C 247 62 250 50 250 50 C 250 50 253 62 250 75 Z" strokeWidth="6" fill="none" />
            <circle cx="250" cy="45" r="4.5" fill="url(#logoGoldGradient)" stroke="none" />
            <path d="M 240 78 C 245 70 255 70 260 78" strokeWidth="5" fill="none" />

            {/* Crown Upper Tier Arch */}
            <path d="M 235 90 C 242 80 258 80 265 90" strokeWidth="5.5" fill="none" />
            <path d="M 232 92 C 230 115 270 115 268 92" strokeWidth="5.5" fill="none" />
            <path d="M 250 94 L 250 110" strokeWidth="4.5" />

            {/* Center Jewel */}
            <path d="M 250 116 C 244 125 244 135 250 144 C 256 135 256 125 250 116 Z" strokeWidth="5.5" fill="none" />

            {/* Ornate Filigree Crown Wings */}
            <path d="M 230 115 C 220 95 190 100 195 125 C 200 140 220 142 232 145" strokeWidth="5.5" fill="none" />
            <path d="M 215 122 C 210 112 198 115 200 128 C 202 136 212 138 220 138" strokeWidth="4" fill="none" />
            <path d="M 188 135 C 185 142 195 152 210 152 C 222 152 230 146 235 145" strokeWidth="5" fill="none" />

            <path d="M 270 115 C 280 95 310 100 305 125 C 300 140 280 142 268 145" strokeWidth="5.5" fill="none" />
            <path d="M 285 122 C 290 112 302 115 300 128 C 298 136 288 138 280 138" strokeWidth="4" fill="none" />
            <path d="M 312 135 C 315 142 305 152 290 152 C 278 152 270 146 265 145" strokeWidth="5" fill="none" />

            {/* Crown Base Arch Bands */}
            <path d="M 190 155 C 220 142 280 142 310 155" strokeWidth="6" fill="none" />
            <path d="M 200 168 C 225 156 275 156 300 168" strokeWidth="5.5" fill="none" />
            <path d="M 212 180 C 230 170 270 170 288 180" strokeWidth="5" fill="none" />

            <circle cx="250" cy="158" r="4.5" fill="url(#logoGoldGradient)" stroke="none" />
            <circle cx="218" cy="164" r="3.5" fill="url(#logoGoldGradient)" stroke="none" />
            <circle cx="282" cy="164" r="3.5" fill="url(#logoGoldGradient)" stroke="none" />

            {/* Sacred Tilak */}
            <path d="M 243 205 C 243 198 257 198 257 205 C 257 212 243 212 243 205 Z" strokeWidth="5" fill="none" />
            <path d="M 250 216 C 244 226 244 236 250 244 C 256 236 256 226 250 216 Z" strokeWidth="5" fill="none" />

            {/* Left & Right Ears */}
            <path d="M 148 195 L 202 188 C 205 240 216 295 248 340" strokeWidth="6.5" fill="none" />
            <path d="M 148 195 C 158 240 185 275 220 285" strokeWidth="6.5" fill="none" />
            <path d="M 220 285 C 235 305 242 318 220 320 C 232 305 238 290 238 275" strokeWidth="5" fill="none" />

            <path d="M 352 195 L 298 188 C 295 240 284 295 252 340" strokeWidth="6.5" fill="none" />
            <path d="M 352 195 C 342 240 315 275 280 285" strokeWidth="6.5" fill="none" />
            <path d="M 280 285 C 265 305 258 318 280 320 C 268 305 262 290 262 275" strokeWidth="5" fill="none" />

            {/* Flowing Trunk Sondh Arch & Inner Loop */}
            <path d="M 202 188 C 206 255 212 320 250 375 C 285 425 345 440 370 415 C 395 390 395 335 348 305 C 300 275 292 230 298 188" strokeWidth="6.5" fill="none" />
            <path d="M 248 340 C 275 390 325 410 350 392 C 372 376 372 342 340 325 C 315 312 300 330 312 350 C 322 365 348 360 352 342" strokeWidth="6.5" fill="none" />
            <path d="M 250 375 C 275 420 315 440 340 435 C 370 430 388 400 380 370 C 372 345 350 340 335 355 C 325 365 330 380 345 385" strokeWidth="6" fill="none" />
          </g>
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col ${isHorizontal ? 'items-start text-left' : 'items-center text-center'}`}>
          <span className={`font-serif font-black tracking-wider leading-none text-sm sm:text-base ${textColor}`}>
            SIDHI VINAYAKA
          </span>
          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mt-1 ${subtextColor}`}>
            TRADERS • UPPAL
          </span>
        </div>
      )}
    </div>
  );
}
