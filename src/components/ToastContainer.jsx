import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  X 
} from 'lucide-react';

function ToastItem({ toast, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = 100 / (toast.duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, isPaused, onDismiss]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
      progressBar: 'bg-emerald-500 dark:bg-emerald-400',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200/80 dark:border-amber-800/60',
      progressBar: 'bg-amber-500 dark:bg-amber-400',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-rose-500 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200/80 dark:border-rose-800/60',
      progressBar: 'bg-rose-500 dark:bg-rose-400',
    },
    info: {
      icon: Info,
      iconColor: 'text-sage-600 dark:text-sage-400',
      bgColor: 'bg-sage-50 dark:bg-sage-950/40',
      borderColor: 'border-sage-200/80 dark:border-sage-800/60',
      progressBar: 'bg-sage-600 dark:bg-sage-400',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const IconComponent = config.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 flex items-start gap-3.5 ${config.bgColor} ${config.borderColor} bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Icon */}
      <div className={`shrink-0 p-1.5 rounded-xl ${config.bgColor} ${config.iconColor}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/60">
        <div
          className={`h-full transition-all duration-75 ${config.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0 pointer-events-none transition-all"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
