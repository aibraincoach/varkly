import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import type { Toast as ToastItem } from '../../contexts/toastTypes';

const iconMap = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const styleMap = {
  success: 'bg-ink text-ground border border-ink',
  error: 'bg-ink text-ground border border-ink',
  info: 'bg-white text-ink border border-line',
};

const ToastItemComponent: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const Icon = iconMap[toast.type];
  const style = styleMap[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-sm ${style}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} aria-hidden />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:bg-ink/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" strokeWidth={2.5} aria-hidden />
      </button>
    </motion.div>
  );
};

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItemComponent key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Toast;
