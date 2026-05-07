import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { Plan } from '../hooks/usePlans';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Omit<Plan, 'id'>) => void;
  initialData?: Plan;
}

export const PlanFormModal: React.FC<PlanFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    interval: 'monthly' as 'monthly' | 'yearly',
    features: [''],
    status: 'active' as 'active' | 'archived',
    isPopular: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      features: formData.features.filter(f => f.trim() !== '')
    });
    onClose();
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
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Edit Plan' : 'Create New Plan'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <form id="planForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Plan Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Pro Plan"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Price (₹)</label>
                <input 
                  type="number" required min="0"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Billing Interval</label>
                <select 
                  value={formData.interval}
                  onChange={e => setFormData({ ...formData, interval: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Features</label>
              <div className="space-y-2">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex space-x-2">
                    <input 
                      type="text" required
                      value={feature}
                      onChange={e => handleFeatureChange(idx, e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder={`Feature ${idx + 1}`}
                    />
                    {formData.features.length > 1 && (
                      <button type="button" onClick={() => removeFeature(idx)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                onClick={addFeature}
                className="mt-2 text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                + Add another feature
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <p className="text-[13px] font-bold text-gray-900">Mark as Popular</p>
                <p className="text-[11px] text-slate-500 font-medium">Highlight this plan on the pricing page</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.isPopular}
                  onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
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
            form="planForm"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm"
          >
            {initialData ? 'Save Changes' : 'Create Plan'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
