import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'active' | 'expiring' | 'expired' | 'frozen' | 'info' | 'neutral' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => {
  const variants = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    expiring: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    expired: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    frozen: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    info: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
