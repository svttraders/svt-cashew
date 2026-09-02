import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gold' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default: 'bg-navy-800 text-slate-100 hover:bg-navy-700 border border-slate-700/50 shadow-sm active:translate-y-0.5',
      gold: 'gold-cta-button text-navy-950 font-bold active:translate-y-0.5',
      outline: 'border border-[#D4AF37]/30 bg-transparent text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/60 active:translate-y-0.5',
      secondary: 'bg-slate-800/80 text-slate-200 hover:bg-slate-700/80 border border-slate-700/40 active:translate-y-0.5',
      ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
      link: 'text-[#D4AF37] underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      default: 'h-10 px-4 py-2 gap-2',
      sm: 'h-8 px-3 text-[11px] gap-1.5 rounded-lg',
      lg: 'h-12 px-6 text-sm gap-2.5 rounded-2xl',
      icon: 'h-9 w-9 rounded-lg',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
