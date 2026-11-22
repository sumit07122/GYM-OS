import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-[#090D16]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {title && <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>}
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">{description}</p>}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
