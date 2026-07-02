/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

type Toast = { id: string; message: string };

const ToastContext = createContext<{ notify: (message: string) => void } | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      notify: (message: string) => {
        const id = crypto.randomUUID();
        setToasts((current) => [...current, { id, message }]);
        window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 font-semibold shadow-soft">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
