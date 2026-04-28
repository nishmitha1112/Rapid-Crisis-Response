import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Zap } from 'lucide-react';

export type ToastType = 'info' | 'alert' | 'success';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-24 right-8 z-[1000] flex flex-col items-end space-y-4 pointer-events-none">
        {toasts.map((n) => (
          <div 
            key={n.id}
            className={`pointer-events-auto flex items-center space-x-4 px-6 py-4 rounded-2xl border backdrop-blur-2xl shadow-xl animate-in slide-in-from-right-full duration-300 ${
              n.type === 'alert' 
                ? 'bg-white/95 border-rose-200 text-rose-900 shadow-rose-500/5' 
                : n.type === 'success' 
                  ? 'bg-white/95 border-emerald-200 text-emerald-900 shadow-emerald-500/5'
                  : 'bg-white/95 border-blue-200 text-blue-900 shadow-blue-500/5'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              n.type === 'alert' ? 'bg-rose-100 text-rose-600' : n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {n.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> : n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${
                n.type === 'alert' ? 'text-rose-500' : n.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
              }`}>
                {n.type === 'alert' ? 'Critical Alert' : n.type === 'success' ? 'Command Verified' : 'Tactical Update'}
              </p>
              <p className="text-sm font-black leading-tight">{n.message}</p>
            </div>
            <button 
              onClick={() => removeToast(n.id)}
              className="ml-2 p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
            >
              <Zap className="w-4 h-4 rotate-45" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
