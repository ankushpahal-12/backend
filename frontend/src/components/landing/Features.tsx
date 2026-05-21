import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { BrainCircuit, Target, LineChart, Shield, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';

const featureGrid = [
  {
    id: 'ai-engine',
    title: 'Cognitive Synthesis Engine',
    description: 'Transform vast repositories of unstructured data—lecture transcripts, scientific papers, and raw notes—into highly structured, topologically accurate knowledge graphs and precision practice exams.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'from-blue-500/10 to-indigo-500/10',
    spotlightColor: 'rgba(59, 130, 246, 0.35)',
    colSpan: 'lg:col-span-2',
  },
  {
    id: 'targeting',
    title: 'Adaptive Targeting',
    description: 'Our heuristic models pinpoint cognitive vulnerabilities instantly, relentlessly routing your attention to low-performance domains until statistical mastery is achieved.',
    icon: Target,
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    spotlightColor: 'rgba(244, 63, 94, 0.35)',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'analytics',
    title: 'Predictive Analytics',
    description: 'Visualize your trajectory. Access high-dimensional radar charts predicting your examination readiness based on millions of aggregated data points.',
    icon: LineChart,
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'from-emerald-400/10 to-teal-500/10',
    spotlightColor: 'rgba(16, 185, 129, 0.35)',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'security',
    title: 'Enterprise-Grade Security',
    description: 'Military-grade AES-256 encryption shields your proprietary documents, course materials, and personal pedagogical data from unauthorized access.',
    icon: Shield,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'from-purple-500/10 to-indigo-500/10',
    spotlightColor: 'rgba(139, 92, 246, 0.35)',
    colSpan: 'lg:col-span-2',
  },
  {
    id: 'explanation',
    title: 'Deep Explainability',
    description: 'Eradicate blind spots. Receive immediate, multi-layered logical breakdowns for both correct and incorrect responses to fundamentally rewire comprehension.',
    icon: Lightbulb,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'from-amber-400/10 to-orange-500/10',
    spotlightColor: 'rgba(245, 158, 11, 0.35)',
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'retention',
    title: 'Dynamic Spaced Repetition',
    description: 'Leveraging customized Ebbinghaus forgetting curves, our scheduling algorithm dynamically adjusts review intervals to ensure absolute permanent retention.',
    icon: Sparkles,
    color: 'from-rose-400 to-pink-500',
    bgColor: 'from-rose-400/10 to-pink-500/10',
    spotlightColor: 'rgba(236, 72, 153, 0.35)',
    colSpan: 'lg:col-span-2',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  },
};

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '', spotlightColor }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={`group relative rounded-[2rem] overflow-hidden border border-slate-200/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-500 ${className}`}
    >
      {/* 🌟 Spotlight Border Glow (Webkit Mask Trick) */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2rem] transition-opacity duration-300 z-30"
        style={{
          opacity: isFocused ? 1 : 0,
          background: `radial-gradient(180px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 80%)`,
          border: '1.5px solid transparent',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      
      {/* Spotlight Ambient Base Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[2rem] transition-opacity duration-500 z-10"
        style={{
          opacity: isFocused ? 1 : 0,
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, ${spotlightColor.replace('0.35', '0.04')}, transparent 85%)`
        }}
      />
      
      <div className="relative z-20 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section className="relative py-32 w-full z-10 overflow-hidden" id="features">
      {/* Soft Ambient Background Orbs */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur-[120px]" />
        <div className="absolute bottom-[20%] right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-pink-500/5 to-rose-500/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="text-center max-w-4xl mx-auto mb-20 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100/50 dark:border-slate-700/60 rounded-full backdrop-blur-md">
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 tracking-wider uppercase">
              Platform Architecture
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Engineered for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Absolute Mastery.</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-3xl mx-auto">
            Aura AI doesn't just test your knowledge; it structurally rebuilds it. By unifying spaced repetition, high-dimensional analytics, and cognitive synthesis into one seamless platform, we guarantee maximum retention.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureGrid.map((feature) => (
            <SpotlightCard
              key={feature.id}
              spotlightColor={feature.spotlightColor}
              className={`${feature.colSpan} min-h-[300px]`}
            >
              <div className="h-full flex flex-col p-8 md:p-10 justify-between">
                <div>
                  {/* Icon Box */}
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg mb-8 transform transition-transform duration-300 group-hover:scale-110`}>
                    <feature.icon size={24} />
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-pink-500 dark:group-hover:from-white dark:group-hover:to-indigo-300 transition-all duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Explore Indicator */}
                <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <span>View Specifications</span>
                  <ArrowRight size={13} className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </div>

                {/* Shine Sweep Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1000ms] pointer-events-none" />
              </div>
            </SpotlightCard>
          ))}
        </motion.div>

        {/* Explore All Callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl transition-all inline-flex items-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-white/10"
          >
            Explore Interactive Demo →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
