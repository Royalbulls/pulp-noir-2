'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-sky-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const colors = {
    success: 'border-emerald-500/50 bg-emerald-500/10',
    error: 'border-rose-500/50 bg-rose-500/10',
    info: 'border-sky-500/50 bg-sky-500/10',
    warning: 'border-amber-500/50 bg-amber-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-8 right-8 left-8 sm:left-auto z-[1000] flex items-center gap-3 px-4 sm:px-6 py-4 rounded-2xl border-2 backdrop-blur-xl shadow-2xl max-w-md ${colors[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-bold tracking-tight text-white flex-grow">{message}</p>
      <button 
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </motion.div>
  );
};
