import React, { useCallback, useState } from 'react';
import { ToastContext } from './toast-context';
import type { Toast, ToastType } from './toastTypes';

let toastId = 0;
const genId = () => `toast-${++toastId}-${Date.now()}`;

const DEFAULT_DURATION = 3000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'success', duration = DEFAULT_DURATION) => {
      const id = genId();
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
