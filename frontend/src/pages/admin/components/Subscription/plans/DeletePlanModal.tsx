import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeletePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeletePlanModal: React.FC<DeletePlanModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertTriangle size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Plan</h2>
          <p className="text-[13px] text-slate-500 font-medium">
            Are you sure you want to delete this plan? This action cannot be undone and will affect users currently subscribed.
          </p>
        </div>
        
        <div className="p-5 border-t border-slate-200 flex space-x-3 bg-slate-50">
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-[13px] font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2 text-[13px] font-bold text-white bg-rose-600 border border-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
          >
            Delete Plan
          </button>
        </div>
      </motion.div>
    </div>
  );
};
