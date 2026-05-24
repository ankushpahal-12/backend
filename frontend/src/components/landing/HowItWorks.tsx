import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);
 import confusedImage from '../../assets/confused-image.jpg';
 import examperpImage from '../../assets/examperp-image.jpg';
 import analyticsImage from '../../assets/Analytics-image.jpg';
 import resultImage from '../../assets/Result.jpg';


export  const HowItWorks() {
  return (
    <div className="bg-[#030712] min-h-screen text-white font-sans overflow-x-hidden">
      {/* Intro Header Section to give room to scroll into the GSAP section */}
      <header className="py-24 px-6 text-center max-w-4xl mx-auto border-b border-gray-800">
        <span className="text-emerald-400 font-semibold tracking-wider uppercase text-sm px-3 py-1 bg-emerald-950/50 rounded-full border border-emerald-500/20">
          PrepExcel Workflow
        </span>
        <h1 className="text-4xl md:text-6xl font-black mt-6 tracking-tight leading-tight">
          How PrepExcel Guarantees <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Test Day Mastery</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto font-light">
          Scroll down to see our interactive smart engine transform study stress into peak exam performance in real-time.
        </p>
        <div className="mt-8 flex justify-center gap-3 animate-bounce">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </header>

      {/* Main GSAP Pinned Multi-step Interactive Showcase */}
      <HowItWorks />

      {/* Outro CTA Section to scroll out of the GSAP pin */}
      <section className="py-32 px-6 text-center max-w-3xl mx-auto border-t border-gray-900">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
          Ready to experience the smart way?
        </h2>
        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Start identifying your test weaknesses in under 5 minutes. No credit card required.
        </p>
        <div className="mt-8">
          <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-900/40 transition duration-300 transform hover:-translate-y-1">
            Start Practicing For Free
          </button>
        </div>
      </section>
    </div>
  );
}

const HowItWorks = () => {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    // Media Query listener to disable pinning on small mobile viewports for smooth scrolling
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Desktop pinning and sliding transitions
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%', // 300% of viewport height scroll distance
          scrub: 1, // Smooth scrolling transition timing
          pin: true, // Pins the section inside the screen
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Dynamically update active step index based on timeline progress
            const progress = self.progress;
            if (progress < 0.28) setActiveStep(1);
            else if (progress >= 0.28 && progress < 0.62) setActiveStep(2);
            else if (progress >= 0.62 && progress < 0.90) setActiveStep(3);
            else setActiveStep(4);
          }
        },
      });

      // Animate Image & Content 2 sliding up to cover Step 1
      tl.fromTo(
        '.work-slide-2',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 }
      )
      // Animate Image & Content 3 sliding up to cover Step 2
      .fromTo(
        '.work-slide-3',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 }
      )
      // Animate Image & Content 4 sliding up to cover Step 3
      .fromTo(
        '.work-slide-4',
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', duration: 1 }
      );
    });

    mm.add("(max-width: 767px)", () => {
      // Mobile cleanup / fallback: No pinning, normal layout
      setActiveStep(1);
    });

    return () => mm.revert(); // Clean up context and triggers safely on component unmount
  }, []);

  const stepsData = [
    {
      id: 1,
      tag: "STEP 1: INITIAL BENCHMARK",
      title: "Confused About Test Prep?",
      desc: "Unlock your full potential and achieve your target scores. Most students start blindly, wasting dozens of hours studying the wrong material.",
      color: "from-amber-400 to-orange-500",
      accent: "text-amber-400"
    },
    {
      id: 2,
      tag: "STEP 2: ADAPTIVE PRACTICE",
      title: "Online Practice Tests",
      desc: "Experience exact mock exam conditions. Dynamic pacing adjusts questions to target your boundary capability and push standard score benchmarks.",
      color: "from-blue-400 to-indigo-500",
      accent: "text-blue-400"
    },
    {
      id: 3,
      tag: "STEP 3: AI DIAGNOSIS",
      title: "AI-Powered Insights",
      desc: "Get deep diagnostics instantly. Identify structural weakness by subject category, difficulty levels, and pattern recognition metrics.",
      color: "from-teal-400 to-emerald-500",
      accent: "text-teal-400"
    },
    {
      id: 4,
      tag: "STEP 4: SCORE MASTERY",
      title: "Guaranteed Results",
      desc: "Transform structural confusion into clear academic mastery. Track targeted metrics as your progress curves rise directly to success benchmarks.",
      color: "from-emerald-400 to-cyan-500",
      accent: "text-emerald-400"
    }
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#030712]"
      id="how-it-works"
    >
      {/* Pinned Viewport Frame */}
      <div className="relative w-full md:h-screen flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: Sticky Content & Step Tracker */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 relative z-50 bg-[#030712]/95 border-r border-gray-900">
          
          {/* Step Progress Tracker */}
          <div className="flex items-center gap-3 mb-8 md:mb-0">
            {stepsData.map((step) => (
              <div key={step.id} className="flex-1 flex flex-col gap-2">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${
                  activeStep >= step.id 
                    ? `bg-gradient-to-r ${step.color} w-full` 
                    : 'bg-gray-800 w-full'
                }`} />
                <span className={`text-[10px] font-bold tracking-widest hidden md:inline transition-colors duration-300 ${
                  activeStep === step.id ? 'text-white' : 'text-gray-600'
                }`}>
                  0{step.id}
                </span>
              </div>
            ))}
          </div>

          {/* Scrolling text containers mapped directly to sliding trigger stages */}
          <div className="relative h-96 flex items-center">
            {stepsData.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <div
                  key={step.id}
                  className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-out ${
                    isActive 
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
                      : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                  }`}
                >
                  <span className={`font-black text-sm tracking-widest ${step.accent} mb-4 block`}>
                    {step.tag}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                    {step.title}
                  </h2>
                  <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                  
                  {/* Visual Features List inside Content */}
                  <ul className="mt-6 space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400`} />
                      Interactive smart adaptive tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400`} />
                      AI analytical micro-breakdowns
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Bottom Branding / Indicators */}
          <div className="hidden md:flex justify-between items-center text-xs text-gray-500">
            <span>PREPEXCEL DIGITAL SUITE</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Sync Active</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Absolute Sliding Graphic Canvas */}
        <div className="w-full md:w-1/2 h-[50vh] md:h-full relative overflow-hidden bg-gray-950">
          
          {/* SLIDE 1: Confused Student (Static Base Layer) */}
          <div className="work-slide-1 absolute inset-0 w-full h-full z-10 flex items-center justify-center p-6 bg-[#080710]">
            {/* Visual Screen Representation */}
            <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </div>
              <h3 className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">Student Diagnostics</h3>
              <p className="text-xl font-bold mb-4 text-white">Baseline Confidence Assessment</p>
              
              {/* Confused / Stressed graphic */}
              <div className="space-y-4 my-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                  <span className="text-sm font-medium text-gray-300">Anxiety & Pacing Score</span>
                  <span className="text-sm font-bold text-red-400">High Tension (84%)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <span className="text-sm font-medium text-gray-300">Weaknesses Untracked</span>
                  <span className="text-sm font-bold text-amber-400">7 Critical Areas</span>
                </div>
              </div>

              {/* Graphical Confusion Indicator */}
              <div className="w-full bg-gray-950 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-800">
                <span className="text-5xl mb-2">🤔</span>
                <span className="text-xs text-gray-400">"Am I focusing on the right topics?"</span>
              </div>
            </div>
          </div>

          {/* SLIDE 2: Practice Test (Initial translation: 100% Y) */}
          <div 
            className="work-slide-2 absolute inset-0 w-full h-full z-20 flex items-center justify-center p-6 bg-[#030B1C]"
            style={{ transform: 'translateY(100%)' }}
          >
            {/* Mock Practice Exam Screen */}
            <div className="w-full max-w-md bg-gray-900 border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-blue-950/50 p-4 border-b border-gray-800 flex justify-between items-center">
                <span className="text-xs text-blue-400 font-bold tracking-widest">REAL-TIME SIMULATION</span>
                <div className="bg-gray-950 text-blue-400 px-2.5 py-1 rounded text-xs font-mono border border-blue-500/20">
                  Time: 1h 45m
                </div>
              </div>
              <div className="p-6">
                <div className="text-xs text-gray-400 mb-2">Section: Verbal / Quant Foundations</div>
                <h4 className="text-base font-bold mb-4 text-white">Question 14: Analyze the logical reasoning pattern within the visual database chart...</h4>
                
                {/* Options list */}
                <div className="space-y-2 mt-4">
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-950/30 text-xs text-blue-300 font-semibold flex items-center justify-between">
                    <span>A. Linear Equation (Medium)</span>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div className="p-3 rounded-xl border border-gray-800 hover:border-blue-500/30 transition text-xs text-gray-400">
                    B. Qualitative Evaluation (High Difficulty)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3: AI Analytics Interface */}
          <div 
            className="work-slide-3 absolute inset-0 w-full h-full z-30 flex items-center justify-center p-6 bg-[#021015]"
            style={{ transform: 'translateY(100%)' }}
          >
            {/* Mock Dashboard Screen */}
            <div className="w-full max-w-md bg-gray-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-teal-400 font-bold tracking-widest text-xs">AI FEEDBACK LAYER</span>
                <span className="text-[10px] text-gray-500 font-mono">ID: PT_X029</span>
              </div>
              
              {/* Radial Analytics & Charts */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-teal-500/30 border-t-teal-400 mb-2">
                    <span className="text-sm font-bold">94.5%</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Quant Accuracy</span>
                </div>
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col items-center">
                  <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-emerald-500/30 border-t-emerald-400 mb-2">
                    <span className="text-sm font-bold">89%</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Pacing Speed</span>
                </div>
              </div>

              {/* Weakness Detection Indicator */}
              <div className="bg-teal-950/10 border border-teal-500/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-teal-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Insight Generated
                </div>
                <p className="text-xs text-gray-300 leading-normal">
                  Pacing errors occurring near question 15-20. Recommended drill: <b>Linear Progression Passages</b>.
                </p>
              </div>
            </div>
          </div>

          {/* SLIDE 4: Results Showcase */}
          <div 
            className="work-slide-4 absolute inset-0 w-full h-full z-40 flex items-center justify-center p-6 bg-[#010C0B]"
            style={{ transform: 'translateY(100%)' }}
          >
            {/* Victory / Mastery Card */}
            <div className="w-full max-w-sm bg-gradient-to-b from-gray-900 to-emerald-950/40 border border-emerald-500/40 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
              
              {/* Confetti simulation overlay style background */}
              <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <span className="text-3xl text-emerald-400 animate-pulse">🎓</span>
              </div>

              <h3 className="text-2xl font-black text-white tracking-tight">Success Achieved!</h3>
              <p className="text-emerald-400 font-semibold tracking-wider text-xs uppercase mt-1 mb-6">Target Score Unlocked</p>

              {/* Score Improvement Grid */}
              <div className="bg-gray-950 rounded-2xl p-4 border border-emerald-500/20 mb-6">
                <div className="grid grid-cols-2 divide-x divide-gray-800">
                  <div>
                    <span className="text-gray-500 text-[10px] block font-semibold">INITIAL RATIO</span>
                    <span className="text-xl font-bold text-gray-400">65%</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 text-[10px] block font-semibold">PREPEXCEL SCALE</span>
                    <span className="text-2xl font-black text-emerald-400">98.2%</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                "The targeted weakness drills raised my scoring accuracy by 33.2% in under 12 practice days."
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
export default HowItWorks;