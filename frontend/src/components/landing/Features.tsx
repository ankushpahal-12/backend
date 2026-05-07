import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Target, LineChart, Zap, Shield, Sparkles, LayoutGrid, TrendingUp, Lock, Lightbulb } from 'lucide-react';

const featureGrid = [
  {
    id: 'ai-engine',
    title: 'AI Synthesis Engine',
    description: 'Transform extensive lecture notes and dense PDF chapters into pinpoint accurate mock exams automatically.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-500/10 to-indigo-500/10',
    colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-1',
  },
  {
    id: 'targeting',
    title: 'Precision Targeting',
    description: 'Identify your weakest domains and test you relentlessly on them.',
    icon: Target,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
  },
  {
    id: 'analytics',
    title: 'Deep Analytics',
    description: 'Visualize your trajectory with multi-dimensional radar charts of mastery.',
    icon: LineChart,
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'from-emerald-400/10 to-teal-500/10',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
  },
  {
    id: 'security',
    title: 'Bank-Grade Security',
    description: 'Enterprise infrastructure keeping your proprietary course materials strictly confidential.',
    icon: Shield,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'from-purple-500/10 to-indigo-500/10',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
  },
  {
    id: 'explanation',
    title: 'Instant AI Explanations',
    description: 'Detailed breakdowns generated instantly for correct and incorrect answers.',
    icon: Lightbulb,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'from-amber-400/10 to-orange-500/10',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
  },
  {
    id: 'retention',
    title: 'Spaced Repetition',
    description: 'Scientifically proven review schedules ensuring lasting knowledge retention.',
    icon: Sparkles,
    color: 'from-rose-400 to-pink-500',
    bgColor: 'from-rose-400/10 to-pink-500/10',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
  },
];

export const Features = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="relative py-32 w-full z-10 overflow-hidden" id="features">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-200/30 to-purple-200/30 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-pink-200/30 to-rose-200/30 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-full backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Powerful Features
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            Everything You Need to Learn Better
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Advanced tools engineered to accelerate your learning and maximize retention.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          <AnimatePresence>
            {featureGrid.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onMouseEnter={() => setHoveredId(feature.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${feature.colSpan} ${feature.rowSpan} min-h-[280px]`}
              >
                {/* Glassmorphic Background */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-500`}
                  animate={{
                    borderColor: hoveredId === feature.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                    boxShadow: hoveredId === feature.id 
                      ? '0 20px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)'
                      : '0 8px 32px rgba(0,0,0,0.04)'
                  }}
                />

                {/* Colored overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color}`}
                  animate={{ opacity: hoveredId === feature.id ? 0.08 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col p-8">
                  {/* Icon Container */}
                  <motion.div
                    animate={{ y: hoveredId === feature.id ? -4 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg mb-6`}
                  >
                    <feature.icon size={28} />
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 dark:group-hover:from-white group-hover:via-slate-800 dark:group-hover:via-slate-200 transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    {/* Learn More indicator */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: hoveredId === feature.id ? 1 : 0, x: hoveredId === feature.id ? 0 : -10 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${feature.color} mt-6`}
                    >
                      Explore More
                      <motion.span animate={{ x: hoveredId === feature.id ? 4 : 0 }}>→</motion.span>
                    </motion.div>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 pointer-events-none"
                  animate={{ x: hoveredId === feature.id ? ['-100%', '100%'] : '-100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all"
          >
            See All Features →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
