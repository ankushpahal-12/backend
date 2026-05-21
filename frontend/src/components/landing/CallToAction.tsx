import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Brain, LayoutDashboard, Sparkles, CheckCircle2, BookOpen, Layers } from 'lucide-react';
import image1 from '../../assets/imgae1.png';
import image2 from '../../assets/image2.png';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 }
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotateX: 0,
    transition: { type: "spring", stiffness: 60, damping: 20 }
  },
  hover: {
    y: -12,
    scale: 1.03,
    rotateY: 2,
    rotateX: 2,
    boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};

export const CallToAction = () => {
  return (
    <section className="relative py-32 z-10 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-500/10 to-transparent blur-[150px]" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 space-y-32"
      >
        
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/5 dark:bg-slate-800/40 border border-indigo-500/10 dark:border-slate-700/60 rounded-full backdrop-blur-md mb-4">
            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs sm:text-sm font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
              The Architecture of Mastery
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Unprecedented Depth. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Absolute Clarity.</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
            Aura AI isn't just an interface—it's a paradigm shift in cognitive development. We engineered our neural pathways to mirror human pedagogical models, ensuring that every interaction not only provides answers, but fundamentally rewires your conceptual understanding.
          </p>
        </motion.div>

        {/* Feature 1: Image Left, Text Right */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Image Side */}
          <motion.div 
            variants={imageVariants}
            whileHover="hover"
            className="flex-1 w-full relative perspective-[1000px]"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />
            <div className="relative rounded-2xl overflow-hidden border border-white/60 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900 aspect-video lg:aspect-auto lg:h-[500px] transition-colors duration-300 hover:border-indigo-500/50">
              <img 
                src={image1} 
                alt="Deep Explainability Interface" 
                className="w-full h-full object-cover object-left-top scale-[1.01]"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
              {/* Premium Overlay Gloss */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
          
          {/* Text Side */}
          <motion.div variants={itemVariants} className="flex-1 space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/20">
              <Brain size={28} />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Deep Explainability & Synthesis Engine
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Superficial memorization fails under pressure. Our proprietary synthesis engine leverages high-dimensional embeddings to deconstruct complex topics into their fundamental axioms. It then reconstructs the knowledge dynamically, adapting its pedagogical style to your exact cognitive baseline.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <BookOpen size={20} className="text-indigo-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">Semantic Chunking</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Large topics are segmented into manageable psychological chunks for maximum retention.</p>
              </div>
              <div className="space-y-2">
                <Layers size={20} className="text-indigo-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">Contextual Scaffolding</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Hints and references automatically scale in complexity as your proficiency increases.</p>
              </div>
            </div>

            <ul className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {[
                "Line-by-line reasoning for complex mathematics and logic",
                "Dynamic difficulty scaling powered by real-time heuristic analysis",
                "Automated generation of counter-examples to challenge assumptions"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Feature 2: Text Left, Image Right */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Side */}
          <motion.div variants={itemVariants} className="flex-1 space-y-8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-500/20">
              <LayoutDashboard size={28} />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Predictive Visual Analytics
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                Stop guessing what you don't know. Our predictive models analyze micro-interactions—from time spent on a question to the specific types of hints requested—to generate a high-fidelity topographical map of your knowledge state. We predict knowledge decay before it happens.
              </p>
            </div>
            
            <article className="prose dark:prose-invert prose-indigo max-w-none text-slate-600 dark:text-slate-400 text-sm font-medium">
              <p>
                By aggregating millions of data points across the platform, Aura AI employs a sophisticated Elo rating system adapted for academic competencies. When you view your dashboard, you aren't just seeing past performance; you are looking at a statistically validated forecast of your examination readiness.
              </p>
            </article>

            <ul className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {[
                "Multi-dimensional radar charts mapping cognitive domains",
                "Ebbinghaus forgetting curve modeling for optimal review timing",
                "Hyper-targeted study paths automatically routing you to your weakest links"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Image Side */}
          <motion.div 
            variants={imageVariants}
            whileHover="hover"
            className="flex-1 w-full relative perspective-[1000px]"
          >
            <div className="absolute -inset-4 bg-gradient-to-bl from-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl -z-10" />
            <div className="relative rounded-2xl overflow-hidden border border-white/60 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900 aspect-video lg:aspect-auto lg:h-[500px] transition-colors duration-300 hover:border-purple-500/50">
              <img 
                src={image2} 
                alt="Visual Analytics Dashboard" 
                className="w-full h-full object-cover object-left-top scale-[1.01]"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

export default CallToAction;
