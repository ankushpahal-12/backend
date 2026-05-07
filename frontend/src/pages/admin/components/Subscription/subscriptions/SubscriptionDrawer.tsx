import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, History, User } from 'lucide-react';
import type { UserSubscription } from '../hooks/useSubscriptions';

interface SubscriptionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSubscription | null;
}

export const SubscriptionDrawer: React.FC<SubscriptionDrawerProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Subscription Details</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user.userName}</h3>
                  <p className="text-gray-400">{user.userEmail}</p>
                </div>
              </div>

              {/* Current Plan */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                  <CreditCard size={16} className="mr-2" /> Current Plan
                </h4>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-white">{user.planName}</span>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium uppercase">
                      {user.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Current period ends: <span className="text-gray-300 font-medium">{new Date(user.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* History Mock */}
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                  <History size={16} className="mr-2" /> Billing History
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-800">
                    <div>
                      <div className="font-medium text-white text-sm">Invoice #INV-2026-001</div>
                      <div className="text-xs text-gray-500">May 1, 2026</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white text-sm">$29.00</div>
                      <div className="text-xs text-emerald-400">Paid</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
