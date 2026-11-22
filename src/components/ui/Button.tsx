import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#090D16] disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#090D16] font-semibold shadow-sm hover:shadow-glow',
      secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-[#1E293B] dark:hover:bg-[#334155] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-white/10',
      outline: 'bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
      destructive: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm',
      ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
      md: 'text-sm px-4 py-2 rounded-md gap-2',
      lg: 'text-base px-6 py-2.5 rounded-lg gap-2.5',
      icon: 'p-2 rounded-md',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
