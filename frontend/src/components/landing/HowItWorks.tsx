import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Cpu, FileCheck, ArrowRight, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Content',
    description: 'Provide your notes, PDFs, or just enter a topic name. We support all formats.',
    number: '01'
  },
  {
    icon: Cpu,
    title: 'AI Processing',
    description: 'Our engine extracts key concepts and generates high-quality questions instantly.',
    number: '02'
  },
  {
    icon: FileCheck,
    title: 'Begin Testing',
    description: 'Take the quiz, review AI-powered explanations, and track your mastery.',
    number: '03'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const HowItWorks = () => {
  return (
    <section className="relative py-32 z-10 overflow-hidden" id="how-it-works">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/2 -right-1/3 w-96 h-96 rounded-full bg-gradient-to-l from-indigo-200/20 to-transparent blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-full backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Simple Process
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            From Notes to Mastery
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Three incredibly fast steps to transform your learning journey.
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
          {/* Connection lines - hidden on mobile */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent dark:via-indigo-700" style={{ top: '80px' }} />
          <div className="hidden md:block absolute top-20 right-1/4 left-1/4 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent dark:via-indigo-700" style={{ top: '80px' }} />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative group"
            >
              <div className="relative p-8 lg:p-10 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/40 to-white/20 dark:from-slate-800/40 dark:to-slate-900/20 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                
                {/* Step Number Badge */}
                <div className="absolute -top-5 -right-5 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                  {step.number}
                </div>

                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg mb-8 group-hover:shadow-2xl transition-all"
                >
                  <step.icon size={40} strokeWidth={1.5} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                  {step.title}
                </h3>

                <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed flex-1 mb-6">
                  {step.description}
                </p>

                {/* Arrow indicator */}
                {index < steps.length - 1 && (
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="hidden md:flex items-center justify-end text-indigo-600 dark:text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Ready to supercharge your learning?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all"
          >
            Get Started Free →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
