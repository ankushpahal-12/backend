import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, X } from 'lucide-react';
import type { UserSubscription } from '../hooks/useSubscriptions';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSubscription | null;
  onChangePlan: (id: string, newPlan: string) => void;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({ isOpen, onClose, user, onChangePlan }) => {
  const [selectedPlan, setSelectedPlan] = useState('');

  if (!isOpen || !user) return null;

  const plans = ['Basic', 'Pro', 'Enterprise'].filter(p => p !== user.planName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <ArrowUpCircle className="mr-2 text-blue-500" /> Upgrade/Downgrade
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Change the plan for <strong className="text-white">{user.userName}</strong>. Their current plan is <strong className="text-white">{user.planName}</strong>.
        </p>

        <div className="space-y-4 mb-8">
          <label className="block text-sm font-medium text-gray-400 mb-2">Select New Plan</label>
          <div className="grid grid-cols-1 gap-3">
            {plans.map(plan => (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedPlan === plan 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-white">{plan}</div>
                <div className="text-xs text-gray-500 mt-1">Switch to {plan} plan immediately.</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => selectedPlan && onChangePlan(user.id, selectedPlan)}
            disabled={!selectedPlan}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            Confirm Change
          </button>
        </div>
      </motion.div>
    </div>
  );
};
