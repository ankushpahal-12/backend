import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, FileCheck, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Study Materials',
    description: 'Upload your lecture notes, dense textbooks, slide decks, or simply enter a topic name. Aura handles all formats.',
    number: '01',
    color: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/10'
  },
  {
    icon: Cpu,
    title: 'AI Concept Extraction',
    description: 'Our advanced neural synthesis model analyzes key definitions, structures, and creates deep conceptual maps.',
    number: '02',
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/10'
  },
  {
    icon: FileCheck,
    title: 'Start Adaptive Testing',
    description: 'Generate high-fidelity, weak-domain specific questions, review instant explanations, and master concepts.',
    number: '03',
    color: 'from-pink-500 to-rose-500',
    shadow: 'shadow-pink-500/10'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  }
};

export const HowItWorks = () => {
  return (
    <section className="relative py-32 z-10 overflow-hidden" id="how-it-works">
      
      {/* Background soft ambient drops */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] -right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-indigo-500/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-[10%] -left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-purple-500/5 to-transparent blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-24 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100/50 dark:border-slate-700/60 rounded-full backdrop-blur-md">
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 tracking-wider uppercase">
              Onboarding Path
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            From Notes to Exam Mastery
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-semibold leading-relaxed">
            Three simple, high-velocity steps to unlock your learning potential.
          </p>
        </motion.div>

        {/* Steps Grid with connectors */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {/* Animated Connecting SVG Path (Hidden on Mobile) */}
          <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-[2px] z-0 pointer-events-none">
            <svg className="w-full h-full" overflow="visible">
              <path
                d="M 0,0 Q 250,50 500,0 T 1000,0"
                fill="none"
                stroke="rgba(99, 102, 241, 0.15)"
                strokeWidth="2"
                strokeDasharray="8 6"
              />
              <motion.path
                d="M 0,0 Q 250,50 500,0 T 1000,0"
                fill="none"
                stroke="url(#step-gradient)"
                strokeWidth="2"
                strokeDasharray="8 6"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              <defs>
                <linearGradient id="step-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group z-10"
            >
              <div className="relative p-8 lg:p-10 rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 shadow-lg hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-500 flex flex-col h-full cursor-pointer group">
                
                {/* Step Number Neon Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-sm shadow-lg ${step.shadow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {step.number}
                </div>

                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  className={`w-20 h-20 rounded-[1.75rem] bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md ${step.shadow} mb-8`}
                >
                  <step.icon size={36} strokeWidth={1.5} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {step.title}
                </h3>

                <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-semibold leading-relaxed flex-1 mb-6">
                  {step.description}
                </p>

                {/* Arrow indicator for next steps */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex justify-end text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                    <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center space-y-6"
        >
          <p className="text-slate-500 dark:text-slate-400 font-semibold">
            Ready to experience frictionless automated quizzing?
          </p>
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
          >
            Create Your First Exam Free
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;

