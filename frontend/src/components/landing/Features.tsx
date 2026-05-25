import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import analyticsImg from '../../assets/Analytics-image.jpg';
import examperpImg from '../../assets/examperp-image.jpg';
import heroImage3 from '../../assets/hero-image3.png';
import dashboardImg from '../../assets/dashboard.jpg';
import heroImage4 from '../../assets/hero-image4.png';
import image2 from '../../assets/image2.png';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: 1,
    tag: "01 / PERFORMANCE ANALYTICS",
    heading: "AI-Powered Performance Analytics",
    subtext: "Track every improvement with intelligent score analysis, subject breakdowns, accuracy heatmaps, and real-time performance insights powered by advanced AI systems.",
    bullets: [
      "Dynamic accuracy and pacing tracking",
      "Subject-by-subject cognitive breakdown",
      "AI-driven exam readiness predictions"
    ],
    image: analyticsImg,
    color: "from-amber-500 to-orange-600",
    accent: "text-amber-600",
    glowColor: "rgba(245,158,11,0.06)"
  },
  {
    id: 2,
    tag: "02 / ADAPTIVE ENGINE",
    heading: "Adaptive Mock Test Engine",
    subtext: "Experience realistic exam simulations with dynamically adjusted difficulty levels, adaptive pacing, and AI-driven question selection tailored to your preparation level.",
    bullets: [
      "Dynamic, real-time question scaling",
      "Adaptive time-pressure thresholds",
      "Authentic high-fidelity exam interfaces"
    ],
    image: examperpImg,
    color: "from-blue-500 to-indigo-600",
    accent: "text-blue-600",
    glowColor: "rgba(59,130,246,0.06)"
  },
  {
    id: 3,
    tag: "03 / WEAKNESS DETECTION",
    heading: "Precision Weakness Detection",
    subtext: "Advanced AI models analyze your answer patterns to detect knowledge gaps, recurring mistakes, and high-risk topics that require immediate improvement.",
    bullets: [
      "Instant recurring mistake tagging",
      "High-risk conceptual gap reporting",
      "Focused recovery study suggestions"
    ],
    image: heroImage3,
    color: "from-purple-500 to-pink-600",
    accent: "text-purple-600",
    glowColor: "rgba(168,85,247,0.06)"
  },
  {
    id: 4,
    tag: "04 / SCORE PROGRESSION",
    heading: "Track Every Improvement",
    subtext: "Monitor your growth journey with detailed progress tracking, score trends, performance timelines, and intelligent benchmark comparisons across every practice session.",
    bullets: [
      "Psychologically powerful growth curves",
      "Historical score trend telemetry",
      "Peer percentile benchmark comparisons"
    ],
    image: dashboardImg,
    color: "from-emerald-500 to-teal-600",
    accent: "text-emerald-600",
    glowColor: "rgba(16,185,129,0.06)"
  },
  {
    id: 5,
    tag: "05 / ASSESSMENT SECURITY",
    heading: "Enterprise-Grade Test Security",
    subtext: "Protect every assessment with intelligent monitoring, anti-cheat systems, secure browser controls, and advanced AI-powered session protection mechanisms.",
    bullets: [
      "Automated live gaze vector scanning",
      "Integrated environmental device detection",
      "Tamper-proof browser tab locking"
    ],
    image: heroImage4,
    color: "from-indigo-500 to-cyan-600",
    accent: "text-indigo-600",
    glowColor: "rgba(99,102,241,0.06)"
  },
  {
    id: 6,
    tag: "06 / STUDY DISPATCH",
    heading: "Personalized AI Study Guidance",
    subtext: "Receive personalized recommendations, smart study plans, AI-generated revision strategies, and targeted preparation guidance designed specifically for your performance profile.",
    bullets: [
      "Modern automated AI revision strategies",
      "Highly tailored study schedules",
      "Immediate weak-domain learning paths"
    ],
    image: image2,
    color: "from-pink-500 to-rose-600",
    accent: "text-pink-600",
    glowColor: "rgba(236,72,153,0.06)"
  }
];

interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index }) => {
  const isImageLeft = index % 2 === 0;
  const isLeft = index % 2 === 0;

  return (
    /* Static outer wrapper. w-full and border-none spans edge-to-edge */
    <div className="feature-landscape-card w-full border-b border-slate-200/40 bg-white/70 backdrop-blur-xl select-none relative overflow-hidden flex justify-center py-6 sm:py-8 lg:py-10">
      
      {/* Soft internal background glow */}
      <div 
        className="absolute -inset-px pointer-events-none transition-opacity duration-700 opacity-20 group-hover:opacity-40 z-0"
        style={{
          background: `radial-gradient(400px circle at 50% 50%, ${feature.glowColor.replace('0.06', '0.15')}, transparent 80%)`
        }}
      />

      {/* Grid container centered inside the edge-to-edge background card, animated with Framer Motion */}
      <motion.div 
        initial={{ opacity: 0, x: isLeft ? -100 : 100, y: 15 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ 
          type: "spring", 
          stiffness: 45, 
          damping: 14, 
          mass: 0.9, 
          duration: 0.8 
        }}
        className="w-full max-w-[1440px] px-6 sm:px-12 lg:px-16 xl:px-20 relative z-10"
      >
        
        {/* 12-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center w-full">
          
          {/* IMAGE PANEL (lg:col-span-7) */}
          {/* On mobile, image is order-1 to render on top. On desktop, alternates based on index (isImageLeft) */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`lg:col-span-7 flex justify-center items-center order-1 w-full ${
              isImageLeft ? 'lg:order-1' : 'lg:order-2'
            }`}
          >
            {/* Minimized padding inside the card to maximize the widescreen image width */}
            <div className="w-full p-1 sm:p-2 lg:p-3 flex justify-center items-center">
              <div className="relative w-full aspect-[16/9.5] rounded-[1.2rem] sm:rounded-[1.8rem] bg-slate-950 overflow-hidden shadow-xl border border-slate-200/50">
                <img
                  src={feature.image}
                  alt={feature.heading}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-[1200ms] hover:scale-105"
                />
                {/* Radial glow vignette overlay on hover */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-40 hover:opacity-80"
                  style={{
                    background: `radial-gradient(circle at center, transparent 35%, ${feature.glowColor} 100%)`,
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* CONTENT PANEL (lg:col-span-5) */}
          {/* On mobile, text is order-2. On desktop, alternates based on index */}
          <div className={`lg:col-span-5 flex flex-col justify-center order-2 px-2 sm:px-4 lg:px-6 ${
            isImageLeft ? 'lg:order-2' : 'lg:order-1'
          }`}>
            {/* Neon Step Badge */}
            <span className={`text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r ${feature.color}`}>
              {feature.tag}
            </span>
            
            {/* Main Title */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tight mb-5 leading-tight">
              {feature.heading}
            </h3>
            
            {/* Subtext Description */}
            <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed mb-6">
              {feature.subtext}
            </p>
            
            {/* Bullet specifications */}
            <ul className="space-y-3.5 mb-2">
              {feature.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${feature.color} flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm`}>
                    <Check size={11} strokeWidth={4} />
                  </div>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Synchronize GSAP ScrollTrigger with Lenis smooth scrolling if active
    if ((window as any).lenis) {
      const lenisInstance = (window as any).lenis;
      lenisInstance.on('scroll', ScrollTrigger.update);
    }

    // Refresh ScrollTrigger to calculate correct layout offsets
    ScrollTrigger.refresh();

    // Clean up event listeners on unmount
    return () => {
      if ((window as any).lenis) {
        const lenisInstance = (window as any).lenis;
        lenisInstance.off('scroll', ScrollTrigger.update);
      }
    };
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#FAF9F6] via-[#FDFBF7] to-[#F5F2EB] py-20 lg:py-32 border-t border-slate-200/50 font-sans"
      id="features"
    >
      {/* Background Soft Mesh Grid and flows - Clean light theme styling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-[-10vw] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none mix-blend-multiply z-0" />
      <div className="absolute bottom-[20%] right-[-10vw] w-[45vw] h-[45vw] rounded-full bg-orange-400/5 blur-[140px] pointer-events-none mix-blend-multiply z-0" />

      {/* Main Container - Limits max width and centers widescreen content */}
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 xl:px-20 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="text-left max-w-4xl mb-16 lg:mb-24 space-y-4 select-none"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 border border-slate-950/10 rounded-full w-fit backdrop-blur-md">
            <Sparkles size={12} className="text-[#e5a93b] animate-pulse" />
            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 tracking-[0.2em] uppercase">
              Platform Architecture
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 uppercase leading-[1.1]">
            Engineered for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e5a93b] via-amber-600 to-yellow-600">Absolute Mastery.</span>
          </h2>
          
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-semibold leading-relaxed max-w-2xl">
            Aura AI doesn't just test your knowledge; it structurally rebuilds it. By unifying spaced repetition, high-dimensional analytics, and cognitive synthesis into one seamless platform, we guarantee maximum retention.
          </p>
        </motion.div>
      </div>

      {/* 6 Stacked Features List - w-full spans completely edge-to-edge with no gaps to the window border */}
      <div className="flex flex-col w-full gap-0">
        {features.map((feature, idx) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={idx}
          />
        ))}
      </div>
    </section>
  );
};

export default Features;
