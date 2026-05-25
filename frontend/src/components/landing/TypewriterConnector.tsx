import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Cpu, Code } from 'lucide-react';

const phrases = [
  "HOW IT WORKS: 4 SIMPLE STEPS TO MASTERING YOUR PREPARATION...",
  "STEP 01 // IDENTIFY INITIAL GAPS & DETECT CONCEPTUAL WEAKNESSES.",
  "STEP 02 // PRACTICE DYNAMIC TESTS THAT AUTOMATICALLY SCALE IN DIFFICULTY.",
  "STEP 03 // REVEAL COGNITIVE MAPS & COMPREHENSIVE ACCURACY HEATMAPS.",
  "STEP 04 // TARGET REVISION DRILLS TO CLOSE GAPS & SECURE TOP GRADES.",
  "READY TO EXPERIENCE THE WORKFLOW? SCROLL DOWN TO DEPLOY THE LIVE STACK..."
];

export const TypewriterConnector = () => {
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullPhrase = phrases[currentPhraseIdx];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing characters
        setCurrentText(fullPhrase.slice(0, currentText.length + 1));
        setTypingSpeed(45 + Math.random() * 30); // Dynamic variable typing speed for realistic look

        if (currentText === fullPhrase) {
          // Pause at the end of phrase
          timer = setTimeout(() => setIsDeleting(true), 2500);
          return;
        }
      } else {
        // Deleting characters
        setCurrentText(fullPhrase.slice(0, currentText.length - 1));
        setTypingSpeed(20);

        if (currentText === '') {
          setIsDeleting(false);
          setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
          setTypingSpeed(100);
          return;
        }
      }

      timer = setTimeout(handleTyping, typingSpeed);
    };

    timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIdx, typingSpeed]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#F5F2EB] via-[#0F0E0C] to-[#000000] py-12 sm:py-16 flex flex-col items-center justify-center font-mono select-none">
      
      {/* Dynamic Grid Background Overlay - transition from features mesh to dark */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(229,169,59,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(229,169,59,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      
      {/* ambient orange glow behind the console terminal */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[25vw] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-[130px] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="w-full max-w-[1200px] px-6 sm:px-12 relative z-10 flex flex-col items-center">
        
        {/* Connection swoosh connector lines */}
        <div className="w-px h-8 bg-gradient-to-b from-slate-400/30 to-amber-500/50 mb-6" />

        {/* Dynamic Typewriter Terminal Box */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
          className="w-full max-w-[850px] rounded-2xl border border-amber-500/20 bg-black/90 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden"
        >
          {/* Subtle scanning scanner line */}
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent top-0 animate-[scan_6s_linear_infinite]" />

          {/* Terminal Header */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-2 sm:inline hidden">
                Aura AI Core // How It Works pipeline
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-amber-500/60">
              <span className="flex items-center gap-1.5 bg-amber-500/5 px-2.5 py-1 border border-amber-500/10 rounded-md">
                <Cpu size={11} className="animate-pulse" />
                PROCESS ACTIVE
              </span>
            </div>
          </div>

          {/* Terminal Console Body */}
          <div className="min-h-[140px] sm:min-h-[90px] flex items-center justify-start text-left px-2 select-text selection:bg-amber-500/30 selection:text-white">
            <div className="text-[13px] sm:text-[15px] font-medium leading-relaxed tracking-wide text-slate-200">
              <span className="text-[#e5a93b] font-black mr-2.5 select-none">$</span>
              <span>{currentText}</span>
              {/* Monospace terminal flashing cursor */}
              <span className="inline-block w-2.5 h-[17px] bg-[#e5a93b] ml-1.5 animate-[blink_1s_step-start_infinite] align-middle shadow-[0_0_8px_#e5a93b]" />
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 mt-6 text-[10px] text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <Terminal size={10} className="text-slate-600" />
              USER: AUTHENTICATED
            </span>
            <span className="text-slate-600">SECURE SHELL v2.85</span>
          </div>
        </motion.div>

        {/* Connection swoosh connector lines */}
        <div className="w-px h-8 bg-gradient-to-b from-amber-500/50 to-slate-800/30 mt-6" />

        {/* Interactive scroll cue badge */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 mt-1 cursor-default select-none"
        >
          <span className="text-[10px] font-black tracking-[0.25em] text-[#e5a93b] uppercase">
            Scroll to Deploy
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-700 flex justify-center p-1 bg-black/40">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e5a93b]" />
          </div>
        </motion.div>

      </div>

      {/* Styled JSX embedded keyframe definitions for scanning and blinking effects */}
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; opacity: 0.15; }
          100% { top: 0%; }
        }
      `}</style>
    </section>
  );
};

export default TypewriterConnector;
