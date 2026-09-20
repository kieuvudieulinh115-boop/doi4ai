import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastNotification, ToastType } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastNotification = { id, message, type, title, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Viewport */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-950/30'
                  : isError
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200 shadow-rose-950/30'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 shadow-amber-950/30'
                  : 'bg-slate-900/90 border-slate-700 text-slate-200 shadow-black/40'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-semibold tracking-wide font-tech text-white mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed break-words">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Đóng thông báo"
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
