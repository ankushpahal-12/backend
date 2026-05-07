import React from 'react';
import { motion } from 'framer-motion';

type PricingToggleProps = {
  isYearly: boolean;
  setIsYearly: (value: boolean) => void;
};

const PricingToggle: React.FC<PricingToggleProps> = ({ isYearly, setIsYearly }) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="relative flex items-center p-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
        <button
          onClick={() => setIsYearly(false)}
          className={`relative px-6 py-2.5 text-sm font-bold rounded-full transition-colors z-10 ${
            !isYearly ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {!isYearly && (
            <motion.div
              layoutId="pricing-toggle"
              className="absolute inset-0 bg-[#6366f1] rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Monthly</span>
        </button>

        <button
          onClick={() => setIsYearly(true)}
          className={`relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-full transition-colors z-10 ${
            isYearly ? 'text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {isYearly && (
            <motion.div
              layoutId="pricing-toggle"
              className="absolute inset-0 bg-[#6366f1] rounded-full"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">Yearly</span>
          <span className={`relative z-10 px-2.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
            isYearly ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
          }`}>
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
};

export default PricingToggle;
