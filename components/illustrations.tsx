import React from 'react';

export function EmptyCartIllustration({ className = 'w-48 h-48' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Empty Cart Illustration"
    >
      <circle cx="150" cy="120" r="90" fill="#15243E" fillOpacity="0.4" />
      <circle cx="150" cy="120" r="70" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.4" />
      
      {/* Shopping Bag Outline */}
      <rect x="105" y="85" width="90" height="95" rx="16" fill="#0B1323" stroke="#D4AF37" strokeWidth="2.5" />
      <path d="M125 85V68C125 54.1929 136.193 43 150 43C163.807 43 175 54.1929 175 68V85" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Front Accent Pocket & Cashew Nut Silhouette */}
      <path d="M115 115H185" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <path
        d="M142 135C138 139 138 145 142 149C146 153 154 153 158 149C162 145 160 137 154 135C148 133 145 132 142 135Z"
        fill="#D4AF37"
        fillOpacity="0.8"
      />
      
      {/* Sparkles */}
      <path d="M92 65L94 72L101 74L94 76L92 83L90 76L83 74L90 72L92 65Z" fill="#D4AF37" fillOpacity="0.6" />
      <path d="M208 145L209 150L214 151L209 152L208 157L207 152L202 151L207 150L208 145Z" fill="#D4AF37" fillOpacity="0.6" />
    </svg>
  );
}

export function DirectFarmIllustration({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Direct Farm Sourcing"
    >
      <rect width="64" height="64" rx="16" fill="#15243E" fillOpacity="0.8" />
      <path d="M16 46C24 38 40 38 48 46" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 20V42" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 26C27 22 23 24 22 28C26 29 30 28 32 26Z" fill="#D4AF37" />
      <path d="M32 32C37 28 41 30 42 34C38 35 34 34 32 32Z" fill="#D4AF37" />
      <circle cx="48" cy="18" r="4" fill="#D4AF37" fillOpacity="0.5" />
    </svg>
  );
}

export function ZeroOilRoastingIllustration({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Zero Oil Roasting"
    >
      <rect width="64" height="64" rx="16" fill="#15243E" fillOpacity="0.8" />
      <path d="M20 40H44C46.2 40 48 38.2 48 36V34H16V36C16 38.2 17.8 40 20 40Z" fill="#D4AF37" fillOpacity="0.3" stroke="#D4AF37" strokeWidth="2" />
      <path d="M26 28C26 24 29 23 29 20" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 28C35 24 38 23 38 20" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 46C27 43 31 43 32 46C33 43 37 43 40 46" stroke="#C85A32" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function QualityAssuredIllustration({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Quality Assured Guarantee"
    >
      <rect width="64" height="64" rx="16" fill="#15243E" fillOpacity="0.8" />
      <circle cx="32" cy="32" r="14" stroke="#D4AF37" strokeWidth="2" strokeDasharray="2 2" />
      <path d="M26 32L30 36L38 28" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
