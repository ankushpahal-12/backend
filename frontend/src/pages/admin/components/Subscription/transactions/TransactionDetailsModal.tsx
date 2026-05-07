import React from 'react';
import { motion } from 'framer-motion';
import { X, Receipt, CheckCircle, XCircle } from 'lucide-react';
import type { Transaction } from '../hooks/useTransactions';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ isOpen, onClose, transaction }) => {
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
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Receipt size={18} className="text-slate-500" />
            <h2 className="text-lg font-bold text-gray-900">Transaction Details</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">Amount</p>
              <div className="text-3xl font-extrabold text-gray-900">₹{transaction.amount}</div>
            </div>
            <div className={`flex items-center px-3 py-1.5 rounded-lg border ${
              transaction.status === 'succeeded' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 
              transaction.status === 'failed' ? 'bg-rose-50 text-rose-600 border-rose-200/50' : 
              'bg-amber-50 text-amber-600 border-amber-200/50'
            }`}>
              {transaction.status === 'succeeded' ? <CheckCircle size={16} className="mr-1.5" /> : <XCircle size={16} className="mr-1.5" />}
              <span className="text-[13px] font-bold capitalize">{transaction.status}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-[13px]">
              <span className="text-slate-500 font-medium">Transaction ID</span>
              <span className="font-bold text-gray-900">{transaction.id}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-slate-500 font-medium">Date & Time</span>
              <span className="font-bold text-gray-900">
                {new Date(transaction.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-slate-500 font-medium">Customer</span>
              <span className="font-bold text-gray-900">{transaction.userName} ({transaction.userEmail})</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-slate-500 font-medium">Payment Gateway</span>
              <span className="font-bold text-gray-900">Razorpay</span>
            </div>
            {transaction.gatewayResponse && (
              <div className="mt-6">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Gateway Response (JSON)</p>
                <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-[11px] font-mono text-slate-600">
                    {JSON.stringify(transaction.gatewayResponse, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
