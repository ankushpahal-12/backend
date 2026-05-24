import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles, Zap, Shield, BarChart3, BookOpen, GraduationCap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import image from '../../assets/image.png';
import heroImage1 from '../../assets/hero-image1.png';
import heroImage2 from '../../assets/hero-image2.png';
import heroImage7 from '../../assets/hero-image7.png';
import { Magnetic } from './Magnetic';
import { gsap } from 'gsap';

/* ─── Sparkle Keyword popover component ───────────────────────── */
interface SparkleKeywordProps {
  children: React.ReactNode;
  popoverTitle: string;
  popoverDesc: string;
  popoverStat: string;
}

const SparkleKeyword: React.FC<SparkleKeywordProps> = ({ children, popoverTitle, popoverDesc, popoverStat }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <span 
      className="relative inline-block cursor-help group z-30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 border-b border-dashed border-cyan-400/40 pb-0.5 group-hover:border-cyan-400 transition-all font-black">
        {children}
      </span>
      
      {/* Subtle Floating Sparkles (Avoid exploding particles; highly minimalist, slow-drifting) */}
      <AnimatePresence>
        {isHovered && (
          <>
            {/* Shimmer star 1 */}
            <motion.span
              initial={{ opacity: 0, scale: 0, x: -10, y: 0 }}
              animate={{ opacity: 0.8, scale: 1, x: -18, y: -25, rotate: 90 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute text-cyan-400 pointer-events-none"
            >
              <Sparkles size={8} className="fill-current" />
            </motion.span>
            {/* Shimmer star 2 */}
            <motion.span
              initial={{ opacity: 0, scale: 0, x: 10, y: 0 }}
              animate={{ opacity: 0.8, scale: 0.9, x: 22, y: -15, rotate: -45 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.8, ease: 'easeOut', delay: 0.1 }}
              className="absolute text-purple-400 pointer-events-none"
            >
              <Sparkles size={6} className="fill-current" />
            </motion.span>
            
            {/* Glass micro-popover displaying technological schematic */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: -10, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 rounded-2xl bg-[#090d16]/95 border border-cyan-500/25 backdrop-blur-xl shadow-2xl pointer-events-none z-50 text-left font-sans"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase block mb-1">
                {popoverTitle}
              </span>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed mb-2">
                {popoverDesc}
              </p>
              <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 text-[10px] font-bold text-slate-400">
                <Zap size={10} className="text-cyan-400" />
                <span>Metrics: <strong className="text-white">{popoverStat}</strong></span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
};

/* ─── modular test category item with independent smooth 3D tilt ─── */
interface CategoryItemProps {
  imageSrc: string;
  title: string;
  desc: string;
  glowColor: string;
  glowClass: string;
  stepIndex: number;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ imageSrc, title, desc, glowColor, glowClass, stepIndex }) => {
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const tiltSpringX = useSpring(tiltX, { stiffness: 100, damping: 18 });
  const tiltSpringY = useSpring(tiltY, { stiffness: 100, damping: 18 });
  
  const rotateX = useTransform(tiltSpringY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(tiltSpringX, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center cursor-pointer select-none group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      {/* EXTREMELY LARGE image container with custom zoom magnification */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ 
          scale: 1.08, 
          y: -15,
        }}
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          y: { duration: 5.5 + stepIndex * 0.5, repeat: Infinity, ease: 'easeInOut' },
          scale: { type: 'spring', stiffness: 200, damping: 20 },
        }}
        className={`w-full h-[260px] sm:h-[350px] md:h-[380px] lg:h-[460px] xl:h-[500px] overflow-hidden flex items-center justify-center transition-all duration-300 pointer-events-auto rounded-[2rem] hover:${glowClass}`}
      >
        {/* Scale increased to 1.32 (magnifying by 32% to crop whitespace margins and show massive detailed models) */}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain filter transition-all duration-500 scale-[1.32] group-hover:scale-[1.38]"
          style={{ transform: 'translateZ(40px)' }}
        />
      </motion.div>
      
      <div className="text-center mt-8 z-10" style={{ transform: 'translateZ(20px)' }}>
        <h4 className="text-xl font-black text-white tracking-wide uppercase transition-colors duration-300 group-hover:text-cyan-400">
          {title}
        </h4>
        <p className="text-xs text-slate-400 mt-2.5 font-medium max-w-[320px] mx-auto leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
};

/* ─── main hero component ─────────────────────────────────────── */
export const Hero = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();

  // Monochrome Cine Grain Turbulence Seed State
  const [noiseSeed, setNoiseSeed] = useState(0);

  // Scroll Parallax for subtle text/button shifts
  const textParallax = useTransform(scrollY, [0, 600], [0, -20]);

  // Spotlight Cursor Tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Film grain noise seeds & GSAP orchestrated button fade-in
  useEffect(() => {
    // 1. Film grain seed loop (Cinema flicker)
    const grainInterval = setInterval(() => {
      setNoiseSeed(Math.random());
    }, 60);

    // 2. GSAP entrance timeline for buttons
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo('.hero-cta-group', 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.0, delay: 0.4 }
      )
      .fromTo('.hero-categories-box',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2 },
        '-=0.8'
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.5'
      );
    }, containerRef);

    return () => {
      clearInterval(grainInterval);
      ctx.revert();
    };
  }, []);

  // Smooth scroll down to explore
  const handleScrollDown = () => {
    const nextSection = document.querySelector('#stats') || document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(nextSection, { offset: -20, duration: 1.4 });
      } else {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Dynamically generate 42 telemetry bars with an increasing and decreasing sine wave height pattern
  // and a continuous spectral color shift (Cyan -> Blue -> Indigo -> Purple -> Pink -> Rose -> Amber -> Teal)
  const telemetryBars = Array.from({ length: 42 }).map((_, i) => {
    // Generate an increasing and decreasing height pattern using sine/cosine waves
    const angle = (i / 41) * Math.PI * 3.2; // ~3 full waves across the screen
    // Base height ranging from 45 to 175
    const baseHeight = 90 + Math.sin(angle) * 65 + Math.cos(angle * 2) * 20;
    const finalHeight = Math.max(30, Math.min(180, Math.round(baseHeight)));

    // Choose unique gradient colors across the section to ensure it's not the same color
    const colors = [
      'from-cyan-500/35 to-transparent hover:from-cyan-400',
      'from-blue-500/35 to-transparent hover:from-blue-400',
      'from-indigo-500/35 to-transparent hover:from-indigo-400',
      'from-purple-500/35 to-transparent hover:from-purple-400',
      'from-pink-500/35 to-transparent hover:from-pink-400',
      'from-rose-500/35 to-transparent hover:from-rose-400',
      'from-amber-500/35 to-transparent hover:from-amber-400',
      'from-teal-500/35 to-transparent hover:from-teal-400',
    ];
    // Map colors continuously across the 42 bars to create a smooth spectrum gradient transition
    const colorIndex = Math.floor((i / 42) * colors.length);
    const color = colors[colorIndex % colors.length];

    return {
      height: finalHeight,
      color,
      delay: i * 0.045,
      duration: 2.2 + (i % 3) * 0.5,
    };
  });

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden bg-[#021d26] text-slate-100 flex flex-col justify-end select-none"
    >
      {/* ── Native fully-responsive mockup image driving the top section height ── */}
      <div className="relative w-full z-10 border-b border-white/5">
        <img
          src={image}
          alt="PrepExcel Mockup Design"
          className="w-full h-auto block pointer-events-none z-0"
        />

        {/* ================== PIXEL-PERFECT RESPONSIVE BUTTON OVERLAY (SCALES WITH IMAGE) ================== */}
        <motion.div
          style={{ y: textParallax }}
          className="hero-cta-group absolute left-[6.2%] bottom-[12%] sm:bottom-[13%] lg:bottom-[14%] xl:bottom-[15%] z-30 flex flex-row items-center justify-start gap-2.5 sm:gap-6 pointer-events-none"
        >
          <button
            disabled
            className="group relative pl-4 pr-1.5 py-1.5 sm:pl-8 sm:pr-3 sm:py-3.5 bg-[#ff5a00] text-white font-extrabold rounded-full flex items-center justify-between gap-2.5 sm:gap-5 shadow-lg shadow-[#ff5a00]/30 opacity-75 cursor-not-allowed pointer-events-none select-none text-[7px] sm:text-[10px] md:text-xs tracking-wider"
          >
            START PRACTICING NOW
            <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-[#ff5a00] flex-shrink-0">
              <ArrowRight className="w-2.5 h-2.5 sm:w-4 sm:h-4" strokeWidth={3} />
            </div>
          </button>

          <button
            disabled
            className="text-white hover:text-slate-200 font-extrabold underline underline-offset-4 cursor-not-allowed pointer-events-none opacity-75 select-none text-[7px] sm:text-[10px] md:text-xs tracking-wider"
          >
            Take a Free Demo Test
          </button>
        </motion.div>
      </div>

      {/* ── premium animated monochrome turbulence (cinema film grain feel) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.022] mix-blend-overlay z-50">
        <filter id="monochromeCinemaNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed={noiseSeed} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#monochromeCinemaNoise)" />
      </svg>

      {/* ── Neural Grid Mesh Background Overlay ── */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none z-0"
        style={{
          maskImage: 'radial-gradient(circle at center, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, #000 70%, transparent 100%)'
        }}
      />

      {/* Dynamic Grid Spotlight Overlay */}
      {isHovered && (
        <div
          className="absolute pointer-events-none w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/4 to-cyan-500/4 blur-[130px] transition-all duration-200 ease-out z-0 mix-blend-screen"
          style={{
            left: mousePos.x - 300,
            top: mousePos.y - 300,
          }}
        />
      )}

      {/* ================== EXTREME LARGE TEST CATEGORIES CONTAINER (DIFFERENT COLOR SECTION) ================== */}
      <div className="w-full relative bg-gradient-to-b from-[#02000d] via-[#11052c] to-[#04000b] overflow-hidden">
        
        {/* Layered, multicolored neon radial auras to ensure a highly dynamic spectrum bg */}
        <div className="absolute top-1/4 left-[-10vw] w-[50vw] h-[50vw] rounded-full bg-cyan-500/8 blur-[130px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-1/2 left-1/4 w-[45vw] h-[45vw] rounded-full bg-purple-500/8 blur-[140px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-1/4 right-[-10vw] w-[55vw] h-[55vw] rounded-full bg-pink-500/8 blur-[150px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[35vw] h-[35vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none mix-blend-screen" />

        {/* Glowing Neural Mesh in this section */}
        <div className="absolute inset-0 bg-radial-gradient(circle at center, rgba(99,102,241,0.03), transparent 70%) pointer-events-none" />

        <div className="hero-categories-box w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 xl:px-24 pt-24 pb-44 relative z-20 flex flex-col items-center">
          <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300 tracking-[0.3em] uppercase mb-4 text-center block select-none">
            🔥 Core Examination Focus Domains
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white text-center tracking-tight mb-6 uppercase select-none">
            Master Specialized Online Certified Tests
          </h2>

          <p className="text-slate-400 font-medium text-sm sm:text-base text-center max-w-3xl mx-auto leading-relaxed mb-20 sm:mb-28 select-none">
            Choose a focus area to begin your adaptive simulated practice. Each specialized testing environment is equipped with genuine, exam-grade assessment questions, exact certification timelines, and integrated automated AI proctoring controls.
          </p>

          {/* 3-Column horizontal borderless showcase - FREE FLOWING layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 sm:gap-20 lg:gap-24 w-full items-stretch">
            <CategoryItem
              imageSrc={heroImage1}
              title="Networking & Security"
              glowColor="rgba(99,102,241,0.3)"
              glowClass="drop-shadow-[0_25px_40px_rgba(99,102,241,0.35)]"
              desc="Configure robust secure network topologies, firewall rule layers, and threat detection vectors."
              stepIndex={0}
            />
            <CategoryItem
              imageSrc={heroImage2}
              title="Artificial Intelligence"
              glowColor="rgba(168,85,247,0.3)"
              glowClass="drop-shadow-[0_25px_40px_rgba(168,85,247,0.35)]"
              desc="Master neural network weights, decision forests, genetic training patterns, and reinforcement learning."
              stepIndex={1}
            />
            <CategoryItem
              imageSrc={heroImage7}
              title="CS Fundamentals"
              glowColor="rgba(6,182,212,0.3)"
              glowClass="drop-shadow-[0_25px_40px_rgba(6,182,212,0.35)]"
              desc="Deconstruct digital logic gates, compass coordinates, guidance values, and abacus counting principles."
              stepIndex={2}
            />
          </div>
        </div>

        {/* ================== INCREASING AND DECREASING BOTTOM FREQUENCY Equalizer WAVE PATTERN ================== */}
        <div className="absolute bottom-[3px] left-0 right-0 h-44 flex items-end justify-between px-3 sm:px-6 md:px-12 pointer-events-none z-10 opacity-80 gap-[2px] sm:gap-[3px]">
          {telemetryBars.map((bar, i) => (
            <motion.div
              key={i}
              animate={{
                height: [bar.height - 18, bar.height + 18, bar.height - 18]
              }}
              transition={{
                duration: bar.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: bar.delay
              }}
              className={`flex-1 rounded-t-full bg-gradient-to-t ${bar.color} transition-all duration-300 pointer-events-auto cursor-pointer`}
              style={{ minHeight: '12px' }}
            />
          ))}
        </div>

        {/* Asymmetric Wave Clipping Mask at bottom separating hero from Stats */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden pointer-events-none z-20 leading-none">
          <svg className="relative block w-full h-[20px] sm:h-[60px]" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120 Z" className="fill-[#ffffff] dark:fill-slate-950" />
          </svg>
        </div>

        {/* ================== BOTTOM HERO: PREMIUM SCROLL INDICATOR ================== */}
        <motion.div
          className="hero-scroll-indicator absolute bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer group"
          onClick={handleScrollDown}
        >
          <span className="text-[7px] sm:text-[10px] font-black text-slate-500/80 uppercase tracking-[0.25em] transition-colors duration-300 group-hover:text-cyan-400 select-none">
            Scroll to Explore
          </span>
          <div className="w-4 h-6 sm:w-6 sm:h-10 rounded-full border border-slate-700/80 group-hover:border-cyan-500/80 flex items-start justify-center p-0.5 sm:p-1.5 transition-all duration-300 backdrop-blur-sm bg-slate-950/20">
            <motion.div
              animate={{
                y: [0, 8, 0],
                opacity: [1, 0.4, 1]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-0.5 h-1 sm:w-1 sm:h-1.5 rounded-full bg-slate-400 group-hover:bg-cyan-400 transition-all duration-300"
            />
          </div>
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-slate-600 group-hover:text-cyan-400 transition-colors duration-300"
          >
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
