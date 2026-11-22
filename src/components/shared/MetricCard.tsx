import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  iconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  className,
}) => {
  return (
    <div className={cn('bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-card hover:border-slate-300 dark:hover:border-white/20 transition-all', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</span>
        <div className={cn('p-2.5 rounded-lg border', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50">{value}</div>
        
        <div className="mt-2 flex items-center justify-between text-xs">
          {trend ? (
            <div className={cn('flex items-center gap-1 font-medium', trend.isPositive ? 'text-emerald-400' : 'text-rose-400')}>
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
            </div>
          ) : (
            <span className="text-slate-500">Live operational</span>
          )}

          {subValue && <span className="text-slate-400">{subValue}</span>}
        </div>
      </div>
    </div>
  );
};
