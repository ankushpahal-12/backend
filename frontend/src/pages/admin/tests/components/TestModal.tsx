import React from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
}

export const TestModal: React.FC<TestModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  variant = 'default' 
}) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`absolute inset-0 backdrop-blur-sm ${
            isLightMode ? 'bg-slate-900/20' : 'bg-black/60'
          }`}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${
            isLightMode ? 'bg-white' : 'bg-slate-900 border border-white/10'
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isLightMode ? 'border-slate-100' : 'border-white/10'
          }`}>
            <div className="flex items-center gap-3">
              {variant === 'danger' && <AlertCircle className="text-rose-500" size={24} />}
              <h2 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                isLightMode ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className={`p-6 overflow-y-auto ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
              isLightMode ? 'border-slate-100 bg-slate-50' : 'border-white/10 bg-slate-950/50'
            }`}>
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
