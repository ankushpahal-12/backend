import React, { useState } from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Send, Crown, Rocket, Check, X,
  FileText, Sparkles, BarChart2, BookOpen, Headphones,
  ChevronDown, HelpCircle, Shield, CreditCard, Lock
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import PricingToggle from './PricingToggle';
import PricingCard, { type PricingFeature } from './PricingCard';
import DashboardLayout from '../Dashboard/DashboardLayout';

const freeFeatures: PricingFeature[] = [
  { name: '5 Practice Tests / Month', included: true },
  { name: 'Basic Performance Analytics', included: true },
  { name: 'Limited Subject Access', included: true },
  { name: 'AI Insights', included: false },
  { name: 'Detailed Solutions', included: false },
];

const proFeatures: PricingFeature[] = [
  { name: 'Unlimited Practice Tests', included: true },
  { name: 'AI-Powered Insights', included: true },
  { name: 'Detailed Performance Analytics', included: true },
  { name: 'All Subject Access', included: true },
  { name: 'Smart Recommendations', included: true },
];

const premiumFeatures: PricingFeature[] = [
  { name: 'Everything in Pro', included: true },
  { name: 'Advanced AI Insights', included: true },
  { name: 'Personalized Study Plan', included: true },
  { name: 'Priority Support', included: true },
  { name: 'Early Access to New Features', included: true },
];

const compareFeatures = [
  { name: 'Practice Tests', icon: <FileText size={18} />, free: '5 / month', pro: 'Unlimited', premium: 'Unlimited' },
  { name: 'AI Insights', icon: <Sparkles size={18} />, free: false, pro: true, premium: true },
  { name: 'Performance Analytics', icon: <BarChart2 size={18} />, free: 'Basic', pro: 'Detailed', premium: 'Advanced' },
  { name: 'Subject Access', icon: <BookOpen size={18} />, free: 'Limited', pro: 'All Subjects', premium: 'All Subjects' },
  { name: 'Priority Support', icon: <Headphones size={18} />, free: false, pro: false, premium: true },
];

const faqs = [
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel anytime with no hidden fees.',
    icon: <HelpCircle size={20} className="text-white" />,
    iconBg: 'bg-[#6366f1]'
  },
  {
    question: 'Is there a free trial for Pro plan?',
    answer: 'Yes! You get a 7-day free trial on all paid plans.',
    icon: <CreditCard size={20} className="text-white" />,
    iconBg: 'bg-[#8b5cf6]'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI and wallets.',
    icon: <Shield size={20} className="text-white" />,
    iconBg: 'bg-[#a855f7]'
  }
];

const FAQItem = ({ faq }: { faq: any }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Card 
      onClick={() => setIsOpen(!isOpen)}
      sx={{ 
        p: 3, 
        display: 'flex', 
        gap: 3, 
        alignItems: 'flex-start', 
        cursor: 'pointer', 
        transition: 'all 0.3s ease', 
        '&:hover': { transform: 'translateY(-4px)' } 
      }}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${faq.iconBg}`}>
        {faq.icon}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3, fontSize: '0.95rem' }}>
            {faq.question}
          </Typography>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
          </motion.div>
        </div>
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 8 : 0 }}
          className="overflow-hidden"
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {faq.answer}
          </Typography>
        </motion.div>
      </div>
    </Card>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <DashboardLayout
      title="Choose the perfect plan for you"
      subtitle="Unlock the power of AI to study smarter, not harder."
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full relative z-10 pt-4"
      >
        
        {/* Toggle */}
        <motion.div variants={itemVariants}>
          <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div variants={itemVariants} className="h-full">
            <PricingCard
              plan="Free"
              description="Perfect for getting started"
              price="₹0"
              period="/month"
              features={freeFeatures}
              icon={<Send size={24} />}
              buttonText="Get Started Free"
              buttonVariant="outlined"
              iconBgColor="bg-indigo-50 dark:bg-indigo-500/10"
              iconColor="text-indigo-500"
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="h-full">
            <PricingCard
              plan="Pro"
              description="Best for serious learners"
              price={isYearly ? '₹199' : '₹249'}
              originalPrice={isYearly ? '₹249' : undefined}
              period="/month"
              features={proFeatures}
              icon={<Crown size={24} />}
              popular
              highlight
              buttonText="Upgrade to Pro"
              buttonVariant="contained"
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="h-full">
            <PricingCard
              plan="Premium"
              description="For those who want the best"
              price={isYearly ? '₹499' : '₹599'}
              originalPrice={isYearly ? '₹599' : undefined}
              period="/month"
              features={premiumFeatures}
              icon={<Rocket size={24} />}
              buttonText="Go Premium"
              buttonVariant="outlined"
              iconBgColor="bg-orange-50 dark:bg-orange-500/10"
              iconColor="text-orange-500"
            />
          </motion.div>
        </div>

        {/* Comparison Table */}
        <motion.div variants={itemVariants} className="mb-20">
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="p-4 font-bold text-slate-900 dark:text-white w-2/5">Compare Plans</th>
                    <th className="p-4 font-bold text-center text-slate-900 dark:text-white w-1/5">Free</th>
                    <th className="p-4 font-bold text-center text-slate-900 dark:text-white w-1/5">Pro</th>
                    <th className="p-4 font-bold text-center text-slate-900 dark:text-white w-1/5">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {compareFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="text-slate-400 dark:text-slate-500">{feature.icon}</div>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {feature.name}
                          </Typography>
                        </div>
                      </td>
                      <td className="p-4 text-center align-middle">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-500" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{feature.free}</Typography>
                        )}
                      </td>
                      <td className="p-4 text-center align-middle">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-500" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{feature.pro}</Typography>
                        )}
                      </td>
                      <td className="p-4 text-center align-middle">
                        {typeof feature.premium === 'boolean' ? (
                          feature.premium ? <Check size={18} className="mx-auto text-green-500" /> : <X size={18} className="mx-auto text-red-500" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{feature.premium}</Typography>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* FAQs */}
        <motion.div variants={itemVariants} className="mb-16 max-w-4xl mx-auto">
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 6, color: 'text.primary' }}>
            Frequently Asked Questions
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} faq={faq} />
            ))}
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div variants={itemVariants} className="text-center flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
          <Lock size={16} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Secure payments. Cancel anytime. Your data is protected.
          </Typography>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
};

export default PricingPage;
