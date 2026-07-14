'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/30">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{title}</h3>
                <p className="text-zinc-400 text-sm font-medium">{message}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onCancel}
                className="flex-1 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase tracking-widest text-xs transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
