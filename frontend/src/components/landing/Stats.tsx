import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { motion } from 'framer-motion';

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  icon?: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, suffix = '', prefix = '', duration = 2.5, icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(Math.floor(easeProgress * value));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  const formattedCount = new Intl.NumberFormat('en-US').format(count);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center p-8 space-y-3 text-center relative z-10"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl"
        >
          {icon}
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-5xl lg:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400"
      >
        {prefix}{formattedCount}{suffix}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-2"
      >
        {label}
      </motion.div>
    </motion.div>
  );
};

export const Stats = () => {
  return (
    <section className="relative py-12 w-full z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto -mt-10 lg:-mt-16 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-white/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-2xl rounded-3xl border border-white/60 dark:border-slate-700/60 shadow-2xl dark:shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20 dark:divide-slate-700/20">
          <StatItem 
            label="Active Learners" 
            value={50} 
            suffix="k+" 
            icon="👥"
          />
          <StatItem 
            label="Questions Bank" 
            value={1.2} 
            suffix="M+"
            icon="❓"
          />
          <StatItem 
            label="Score Boost" 
            value={28} 
            suffix="%"
            icon="📈"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Stats;
