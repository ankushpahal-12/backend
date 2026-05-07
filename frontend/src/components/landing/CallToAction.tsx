import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';
import { ArrowRight, Zap } from 'lucide-react';

export const CallToAction = () => {
  const navigate = useNavigate();

  const handleCTA = async () => {
    try {
      const sid = await initAuthSession('signup');
      navigate(`/user/register?sid=${sid}&mode=signup`);
    } catch {
      toast.error('Failed to initialize session. Please try again.');
    }
  };

  return (
    <section className="relative py-24 z-10 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 rounded-full bg-gradient-to-r from-indigo-300/20 via-purple-300/20 to-pink-300/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl lg:rounded-[3rem] bg-gradient-to-br from-white/50 to-purple-50/50 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-2xl border border-white/60 dark:border-slate-700/60 px-6 sm:px-10 lg:px-12 py-16 lg:py-24 shadow-2xl dark:shadow-2xl"
        >
          {/* Animated Gradient Background */}
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 z-0"
          />

          {/* Decorative Elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-96 h-96 rounded-full border border-indigo-300/20 dark:border-indigo-700/20 -mr-48 -mt-48"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full border border-pink-300/20 dark:border-pink-700/20 -ml-36 -mb-36"
          />

          <div className="relative z-10 flex flex-col items-center space-y-6 lg:space-y-8 max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-full backdrop-blur-md"
            >
              <Zap size={14} className="text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Limited Time Offer
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white"
            >
              <span className="block">Ready to</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                Ace Your Exam?
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl"
            >
              Join thousands of students who are already using our AI to learn faster, retain more, and score higher.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCTA}
                className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {'Create Free Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 sm:px-10 sm:py-5 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white font-bold rounded-full hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all text-sm sm:text-base"
                >
                  Learn More
                </motion.button>
              )
            </motion.div>

            {/* Trust Line */}
            (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold tracking-widest uppercase"
              >
                ✓ No credit card required • 14-day free trial • Cancel anytime
              </motion.p>
            )
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToAction;
