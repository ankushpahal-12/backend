import React from 'react';
import { motion } from 'framer-motion';
import { Check, Edit2, Trash2 } from 'lucide-react';
import type { Plan } from '../hooks/usePlans';

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onEdit, onDelete }) => {
  let borderColor = 'border-t-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-600';
  let badgeText = 'Popular';
  let subText = 'Perfect for beginners';

  if (plan.name.toLowerCase().includes('pro')) {
    borderColor = 'border-t-blue-500';
    badgeColor = 'bg-blue-50 text-blue-600';
    badgeText = 'Most Popular';
    subText = 'Best for serious learners';
  } else if (plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('enterprise')) {
    borderColor = 'border-t-purple-500';
    badgeColor = 'bg-purple-50 text-purple-600';
    badgeText = 'Best Value';
    subText = 'Complete learning solution';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white border border-[#e6ecf7] border-t-4 ${borderColor} rounded-xl p-6 flex flex-col h-full hover:shadow-lg transition-shadow
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
          <p className="text-xs text-slate-500 font-medium">{subText}</p>
        </div>
        {plan.isPopular && (
          <div className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${badgeColor}`}>
            {badgeText}
          </div>
        )}
      </div>

      <div className="my-5 flex items-baseline">
        <span className="text-[28px] font-extrabold text-gray-900">₹{plan.price}</span>
        <span className="text-slate-500 text-sm font-medium ml-1">/ {plan.interval}</span>
        {plan.status === 'active' && (
          <span className="ml-auto bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-100">Active</span>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start space-x-2 text-[13px] font-medium text-slate-700">
            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mb-6 pt-6 border-t border-[#e6ecf7]">
        <div className="text-[15px] font-bold text-gray-900">{(Math.floor(Math.random() * 800) + 100)} Users</div>
        <div className="text-xs text-slate-500 font-medium">Total Subscriptions</div>
      </div>

      <div className="mt-auto flex gap-3">
        <button 
          onClick={() => onEdit(plan)} 
          className="flex-1 py-2 text-[13px] font-bold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Edit Plan
        </button>
        <button 
          onClick={() => onDelete(plan.id)} 
          className="flex-1 py-2 text-[13px] font-bold text-rose-500 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};
