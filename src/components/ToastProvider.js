import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, opts = {}) => {
    const id = ++idCounter;
    const toast = {
      id,
      message,
      type: opts.type || 'info',
      duration: typeof opts.duration === 'number' ? opts.duration : 3500
    };
    setToasts((prev) => [...prev, toast]);
    if (toast.duration > 0) {
      setTimeout(() => remove(id), toast.duration);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({ show, remove }), [show, remove]);

  // Clear on route changes if SPA ever adds routing (no-op now)
  useEffect(() => () => setToasts([]), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-0 top-4 z-[100] flex flex-col items-center space-y-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-md w-full border text-sm rounded-lg shadow-lg px-4 py-3 flex items-start justify-between ${
              t.type === 'success' ? 'bg-green-50 border-green-600 text-green-700' :
              t.type === 'error' ? 'bg-red-50 border-red-600 text-red-700' :
              t.type === 'warning' ? 'bg-yellow-50 border-yellow-600 text-yellow-700' :
              'bg-white border-black text-black'
            }`}
          >
            <div className="pr-3">{t.message}</div>
            <button
              onClick={() => remove(t.id)}
              className="ml-2 text-xs underline opacity-70 hover:opacity-100"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;


