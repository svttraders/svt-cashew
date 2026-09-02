import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gold' | 'spice' | 'secondary' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-navy-800 text-slate-200 border border-slate-700/60',
    gold: 'border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] font-semibold',
    spice: 'border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold',
    secondary: 'border-transparent bg-slate-800 text-slate-300',
    outline: 'border-slate-700 text-slate-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
