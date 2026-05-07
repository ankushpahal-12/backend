import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import type { Transaction } from '../hooks/useTransactions';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onConfirm: (id: string, reason: string) => void;
}

export const RefundModal: React.FC<RefundModalProps> = ({ isOpen, onClose, transaction, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !transaction) return null;

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
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4 border border-amber-100">
            <AlertCircle size={24} strokeWidth={2.5} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Issue Refund</h2>
          <p className="text-[13px] text-slate-500 font-medium mb-5">
            You are about to refund <strong className="text-gray-900">₹{transaction.amount}</strong> to {transaction.userName}.
          </p>

          <div>
            <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Reason for refund</label>
            <textarea 
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g. Customer requested cancellation within 14 days"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-200 flex space-x-3 bg-slate-50">
          <button 
            onClick={onClose}
            className="flex-1 py-2 text-[13px] font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm(transaction.id, reason);
              onClose();
            }}
            disabled={!reason.trim()}
            className="flex-1 py-2 text-[13px] font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            Confirm Refund
          </button>
        </div>
      </motion.div>
    </div>
  );
};
