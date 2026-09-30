import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'INFO') => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map(toast => {
          let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
          let border = 'border-white/10';
          let bg = 'bg-[#151515]/95';

          if (toast.type === 'SUCCESS') {
            icon = <CheckCircle2 className="w-5 h-5 text-[#D4AF37] shrink-0" />;
            border = 'border-[#D4AF37]/30';
          } else if (toast.type === 'ERROR') {
            icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
            border = 'border-rose-500/30';
          } else if (toast.type === 'WARNING') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            border = 'border-amber-400/30';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${border} ${bg} backdrop-blur-md shadow-2xl text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
            >
              {icon}
              <div className="flex-1 text-[#E5E5E5] text-xs font-medium leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/40 hover:text-white transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
