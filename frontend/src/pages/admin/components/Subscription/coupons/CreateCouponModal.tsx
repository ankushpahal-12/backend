import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2 } from 'lucide-react';
import type { Coupon } from '../hooks/useCoupons';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (coupon: Omit<Coupon, 'id' | 'currentUses' | 'status' | 'createdAt' | 'usedBy'>) => void;
}

export const CreateCouponModal: React.FC<CreateCouponModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    maxUses: '' as string | number,
    hasExpiration: false,
    expirationDate: '',
    eligiblePlans: ['all']
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  const handlePlanToggle = (plan: string) => {
    if (plan === 'all') {
      setFormData(prev => ({ ...prev, eligiblePlans: ['all'] }));
      return;
    }
    setFormData(prev => {
      const plans = prev.eligiblePlans.filter(p => p !== 'all');
      if (plans.includes(plan)) {
        const newPlans = plans.filter(p => p !== plan);
        return { ...prev, eligiblePlans: newPlans.length === 0 ? ['all'] : newPlans };
      }
      return { ...prev, eligiblePlans: [...plans, plan] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      maxUses: formData.maxUses === '' ? null : Number(formData.maxUses),
      expirationDate: formData.hasExpiration && formData.expirationDate ? new Date(formData.expirationDate).toISOString() : null,
      eligiblePlans: formData.eligiblePlans
    });
  };

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
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-gray-900">Create New Coupon</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="couponForm" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Coupon Code</label>
              <div className="flex space-x-2">
                <input 
                  type="text" required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] font-mono text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                  placeholder="e.g. SUMMER25"
                />
                <button 
                  type="button" 
                  onClick={generateCode}
                  className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-[13px] font-bold text-slate-700 hover:bg-slate-200 transition-colors flex items-center space-x-1"
                >
                  <Wand2 size={14} />
                  <span>Auto Generate</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Discount Type</label>
                <select 
                  value={formData.discountType}
                  onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Discount Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-[13px]">
                    {formData.discountType === 'percentage' ? '%' : '₹'}
                  </div>
                  <input 
                    type="number" required min="1" max={formData.discountType === 'percentage' ? 100 : undefined}
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-[13px] font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Usage Limit</label>
                <input 
                  type="number" min="1"
                  value={formData.maxUses}
                  onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Expiration</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.hasExpiration}
                      onChange={e => setFormData({ ...formData, hasExpiration: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[13px] font-medium text-gray-900">Set expiration date</span>
                  </label>
                  {formData.hasExpiration && (
                    <input 
                      type="datetime-local" required
                      value={formData.expirationDate}
                      onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-2">Eligible Plans</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'basic', 'pro', 'premium'].map(plan => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => handlePlanToggle(plan)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
                      formData.eligiblePlans.includes(plan) 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {plan === 'all' ? 'All Plans' : plan.charAt(0).toUpperCase() + plan.slice(1) + ' Plan'}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="couponForm"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
          >
            Create Coupon
          </button>
        </div>
      </motion.div>
    </div>
  );
};
