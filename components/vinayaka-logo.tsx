import React from 'react';

interface VinayakaLogoProps {
  className?: string;
  showText?: boolean;
  textColor?: string;
  iconSize?: number;
}

export default function VinayakaLogo({
  className = '',
  showText = true,
  textColor = 'text-[#FAF6EE]',
  iconSize = 36,
}: VinayakaLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Golden Lord Vinayaka Line Art SVG */}
      <svg
        width={iconSize}
        height={iconSize * 1.1}
        viewBox="0 0 100 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#D4AF37] transition-transform hover:scale-105"
      >
        {/* Crown Mukut */}
        <path
          d="M50 8L44 24H56L50 8Z"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 24C44 21 56 21 62 24"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Ears */}
        <path
          d="M36 34C22 34 16 46 22 56C28 62 34 60 38 52"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M64 34C78 34 84 46 78 56C72 62 66 60 62 52"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Head & Tilak */}
        <path
          d="M40 32C45 28 55 28 60 32"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M50 28V36"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Trunk (Sond) curving smoothly */}
        <path
          d="M50 36C50 48 42 62 42 74C42 84 50 88 56 84C62 80 58 70 52 72"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Tusks (Danta) */}
        <path
          d="M40 48H44"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M56 48H60"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Modak Detail */}
        <circle cx="50" cy="94" r="3" fill="currentColor" />
      </svg>

      {showText && (
        <div className="text-center mt-1">
          <span className={`font-serif font-bold tracking-wide block text-sm sm:text-base leading-none ${textColor}`}>
            SVT Supreme Cashews
          </span>
        </div>
      )}
    </div>
  );
}
