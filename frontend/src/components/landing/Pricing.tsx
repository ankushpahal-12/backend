import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: '$0',
    duration: 'forever',
    description: 'Perfect for casual learners wanting to try things out.',
    features: ['10 AI Generations per month', 'Access to public question banks', 'Basic Analytics', 'Community Support'],
    isPopular: false,
    btnText: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$12',
    duration: '/month',
    description: 'For serious students who want unlimited access to all features.',
    features: ['Unlimited AI Generations', 'Advanced Radar Analytics', 'Custom Learning Paths', 'Export to Anki/Notion', 'Priority Support', 'API Access'],
    isPopular: true,
    btnText: 'Start 14-Day Free Trial',
  },
  {
    name: 'Teams',
    price: '$49',
    duration: '/month',
    description: 'For educators and study groups managing multiple learners.',
    features: ['Everything in Pro', 'Up to 20 Members', 'Educator Dashboard', 'Bulk Generation API', 'Dedicated Account Manager', 'SSO Integration'],
    isPopular: false,
    btnText: 'Contact Sales',
  },
];

export const Pricing = () => {
  return (
    <section className="relative py-32 z-10 overflow-hidden" id="pricing">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/3 -left-1/3 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-200/20 to-transparent blur-[100px]" />
        <div className="absolute bottom-1/3 -right-1/3 w-96 h-96 rounded-full bg-gradient-to-l from-pink-200/20 to-transparent blur-[100px]" />
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
              Simple Pricing
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
            Transparent Pricing
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Choose the plan that best fits your learning needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex flex-col p-8 lg:p-10 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
                plan.isPopular 
                  ? 'bg-gradient-to-b from-indigo-600/95 to-purple-700/95 dark:from-indigo-700/80 dark:to-purple-800/80 border-indigo-400/50 dark:border-indigo-500/50 text-white shadow-2xl shadow-indigo-500/30 dark:shadow-indigo-900/30 md:-translate-y-6 ring-2 ring-indigo-400/50' 
                  : 'bg-white/40 dark:bg-slate-800/40 border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white shadow-lg hover:shadow-xl hover:border-white/80 dark:hover:border-slate-700/80'
              }`}
            >
              {plan.isPopular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-400 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg"
                >
                  Most Popular
                </motion.div>
              )}
              
              {/* Plan Header */}
              <div className="mb-8">
                <h3 className={`text-3xl font-black mb-3 ${plan.isPopular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-8 leading-relaxed ${plan.isPopular ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-400'} font-medium`}>
                  {plan.description}
                </p>
                
                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-5xl lg:text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className={`font-semibold ${plan.isPopular ? 'text-indigo-200' : 'text-slate-600 dark:text-slate-400'}`}>
                    {plan.duration}
                  </span>
                </div>
                {plan.duration !== 'forever' && (
                  <p className={`text-xs font-medium ${plan.isPopular ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-500'}`}>
                    Billed monthly. Cancel anytime.
                  </p>
                )}
              </div>

              {/* Features List */}
              <div className="space-y-4 flex-1 mb-10 border-t border-white/20 dark:border-slate-700/30 pt-8">
                {plan.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      plan.isPopular 
                        ? 'bg-white/20 text-white' 
                        : 'bg-indigo-500/20 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className={`font-medium text-sm ${plan.isPopular ? 'text-indigo-50' : 'text-slate-700 dark:text-slate-300'}`}>
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg hover:shadow-xl ${
                  plan.isPopular
                    ? 'bg-white text-indigo-700 hover:bg-slate-50 dark:bg-slate-100 dark:hover:bg-slate-200'
                    : 'bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white dark:from-indigo-600 dark:to-pink-600'
                }`}
              >
                {plan.btnText}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            All plans include unlimited access to our question banks and community support.
            <br />
            <span className="font-semibold">Need enterprise pricing? <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Contact us</a></span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
