import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

export const Pricing = () => {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Basic',
      price: '$0',
      duration: 'forever',
      description: 'Perfect for casual learners wanting to try things out.',
      features: [
        '10 AI Generations per month',
        'Access to public question banks',
        'Basic Analytics',
        'Community Support'
      ],
      isPopular: false,
      btnText: 'Get Started',
      accentColor: 'from-slate-400 to-slate-500'
    },
    {
      name: 'Pro',
      price: billingInterval === 'monthly' ? '$12' : '$9.60',
      duration: '/month',
      subtext: billingInterval === 'monthly' ? 'Billed monthly. Cancel anytime.' : 'Billed annually ($115.20/yr). 20% off.',
      description: 'For serious students who want unlimited access to all features.',
      features: [
        'Unlimited AI Generations',
        'Advanced Radar Analytics',
        'Custom Learning Paths',
        'Export to Anki/Notion',
        'Priority Support',
        'API Access'
      ],
      isPopular: true,
      btnText: 'Start 14-Day Free Trial',
      accentColor: 'from-indigo-600 to-purple-600'
    },
    {
      name: 'Teams',
      price: billingInterval === 'monthly' ? '$49' : '$39.20',
      duration: '/month',
      subtext: billingInterval === 'monthly' ? 'Billed monthly. Cancel anytime.' : 'Billed annually ($470.40/yr). 20% off.',
      description: 'For educators and study groups managing multiple learners.',
      features: [
        'Everything in Pro',
        'Up to 20 Members',
        'Educator Dashboard',
        'Bulk Generation API',
        'Dedicated Account Manager',
        'SSO Integration'
      ],
      isPopular: false,
      btnText: 'Contact Sales',
      accentColor: 'from-pink-600 to-rose-600'
    },
  ];

  return (
    <section className="relative py-32 z-10 overflow-hidden" id="pricing">
      {/* Background Glows */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-indigo-200/20 to-transparent dark:from-indigo-500/5 blur-[120px]" />
        <div className="absolute bottom-1/3 -right-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-l from-pink-200/20 to-transparent dark:from-pink-500/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-full backdrop-blur-md">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Pricing Options
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Power Level</span>
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-semibold leading-relaxed max-w-2xl mx-auto">
            Get unlimited access to advanced AI study metrics, mock quiz generators, and personalized study feeds.
          </p>
        </motion.div>

        {/* Dynamic Monthly/Yearly Interval Switch */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <div className="flex items-center gap-3 bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 ${
                billingInterval === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 flex items-center gap-1.5 ${
                billingInterval === 'yearly'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-md scale-105'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Yearly billing
            </button>
          </div>
          
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 animate-bounce">
            🔥 Save 20% on Yearly
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-stretch"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -12, 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className={`relative flex flex-col p-8 lg:p-10 rounded-[2.5rem] backdrop-blur-xl border transition-all duration-300 group cursor-pointer ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-slate-900/95 to-slate-950/95 dark:from-slate-900/90 dark:to-slate-950/90 border-indigo-500/50 text-white shadow-2xl shadow-indigo-500/20 md:-translate-y-4 ring-2 ring-indigo-500/40 z-10 hover:shadow-indigo-500/40 hover:border-indigo-400' 
                  : 'bg-white/40 dark:bg-slate-900/30 border-white/60 dark:border-slate-800/80 text-slate-900 dark:text-white shadow-lg hover:shadow-2xl hover:border-indigo-400/30 dark:hover:border-indigo-400/50'
              }`}
            >
              {/* Glowing Halo around the popular Pro card */}
              {plan.isPopular && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] opacity-25 -z-10 blur-xl animate-pulse pointer-events-none group-hover:opacity-40 transition-opacity duration-500" />
              )}

              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Sparkles size={11} className="animate-spin" />
                  Most Popular
                </div>
              )}
              
              {/* Plan Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-3xl font-extrabold ${plan.isPopular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.name}
                  </h3>
                </div>
                <p className={`text-sm mb-8 leading-relaxed ${plan.isPopular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'} font-semibold`}>
                  {plan.description}
                </p>
                
                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-2 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={plan.price}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-5xl lg:text-6xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left duration-300"
                    >
                      {plan.price}
                    </motion.span>
                  </AnimatePresence>
                  
                  <span className={`font-bold text-sm ${plan.isPopular ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {plan.duration}
                  </span>
                </div>
                
                <p className={`text-[11px] font-bold tracking-tight h-5 ${plan.isPopular ? 'text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {plan.subtext || 'Billed monthly. Access public bank.'}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-4 flex-1 mb-10 border-t border-slate-100 dark:border-slate-800/60 pt-8">
                {plan.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.isPopular 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors'
                    }`}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span className={`font-semibold text-xs sm:text-sm ${plan.isPopular ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-md ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-indigo-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 group-hover:shadow-lg'
                }`}
              >
                {plan.btnText}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 text-center"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            All plans include unlimited access to our question banks and community support.
            <br />
            <span className="font-extrabold text-slate-800 dark:text-slate-200 block sm:inline mt-2 sm:mt-0">
              Need custom volume pricing?{' '}
              <a href="#contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Contact Enterprise
              </a>
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
