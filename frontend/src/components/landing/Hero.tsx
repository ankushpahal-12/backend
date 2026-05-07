import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, Users, CheckCircle, GraduationCap } from 'lucide-react';
import image1 from '../../assets/imgae1.png';
import image2 from '../../assets/image2.png';

export const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section id="home" className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-[#05060f] pt-24 pb-12">
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="absolute top-[20%] right-[-15%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[70%] h-[50%] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Left Content */}
          <motion.div 
            className="flex-1 text-left space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">AI-Powered Learning Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight"
            >
              Got a <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">Doubt?</span> <br />
              Ask. Learn. Improve.
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed font-medium"
            >
              From confusion to clarity in seconds. Our AI explains, guides, and helps you master every concept.
            </motion.p>

            {/* Actions */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-5"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#f43f5e] text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
              >
                Start Practicing Free
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center gap-2 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Play size={18} className="text-white fill-white ml-1" />
                </div>
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Process Flow Image */}
            <motion.div 
              variants={itemVariants}
              className="pt-10 lg:pt-16"
            >
              <img 
                src={image1} 
                alt="Process Flow" 
                className="w-full max-w-2xl rounded-3xl"
              />
            </motion.div>
          </motion.div>

          {/* Right Content: Dashboard Mockup */}
          <motion.div 
            className="flex-1 relative mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 100, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: -15 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            style={{ perspective: "2000px" }}
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotateX: [0, 2, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="relative z-20"
            >
              <img 
                src={image2} 
                alt="Dashboard Mockup" 
                className="w-full h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-3xl"
              />
            </motion.div>

            {/* Join Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -bottom-10 right-0 z-30 p-5 rounded-3xl bg-[#1a1b2e]/90 border border-white/10 backdrop-blur-xl shadow-2xl max-w-[280px]"
            >
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1a1b2e] bg-gradient-to-br from-indigo-500 to-purple-500 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                Join 10,000+ students already improving every day 🚀
              </p>
            </motion.div>

            {/* Extra AI Robot (Decorative) */}
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-20 -bottom-20 z-10 w-48 h-48 opacity-40 pointer-events-none"
            >
              <div className="w-full h-full bg-gradient-to-t from-indigo-500/20 to-transparent blur-3xl rounded-full" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="w-full max-w-7xl mx-auto px-4 mt-20 lg:mt-32"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 px-10 rounded-[40px] bg-white/[0.02] border border-white/10 backdrop-blur-md">
          {[
            { label: "Active Students", value: "10,000+", icon: Users, color: "text-indigo-400" },
            { label: "Improvement Rate", value: "95%", icon: CheckCircle, color: "text-emerald-400" },
            { label: "Student Rating", value: "4.8/5", icon: Star, color: "text-yellow-400" },
            { label: "Questions Practiced", value: "50M+", icon: GraduationCap, color: "text-purple-400" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 font-bold tracking-wide uppercase mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Trusted By Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="w-full max-w-7xl mx-auto px-4 py-20 text-center space-y-12"
      >
        <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
          Trusted by students from top institutions
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          {['IIT Delhi', 'AIIMS', 'BITS Pilani', 'NIT Trichy', 'Delhi University'].map((logo) => (
            <span key={logo} className="text-xl lg:text-2xl font-black text-white tracking-tighter">
              {logo}
            </span>
          ))}
          <span className="text-sm text-slate-600 font-bold italic">and more...</span>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
