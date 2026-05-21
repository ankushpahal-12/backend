import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, Star, Users, CheckCircle, GraduationCap, Sparkles, Brain, Send, HelpCircle, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';

// Interactive doubt samples
const MOCK_DOUBTS = [
  {
    pill: '🔬 Quantum Entanglement',
    text: 'Explain quantum entanglement simply.',
    tags: ['Physics', 'Quantum'],
    explanation: 'Quantum entanglement is a mind-bending physical phenomenon where two or more particles become interconnected. When this happens, the physical state of one particle instantly determines the state of the other, no matter how far apart they are (even across the universe!).',
    question: 'Does quantum entanglement allow us to transmit binary messages faster than light?',
    options: [
      'Yes, instantly across any distance.',
      'No, because the measurements look completely random until compared.',
      'Only if the particles are inside a vacuum.'
    ],
    correctIdx: 1,
    explanationHint: 'Correct! Although the states are instantly correlated, no usable information or message can be transmitted faster than light. You still need classical communication to compare results!'
  },
  {
    pill: '🌿 Photosynthesis',
    text: 'Explain Photosynthesis and its main product.',
    tags: ['Biology', 'Science'],
    explanation: 'Photosynthesis is the biological process where plants, algae, and certain bacteria capture light energy from the sun and convert it into chemical energy (glucose) which fuels their growth, releasing oxygen as a vital byproduct.',
    question: 'Which primary pigment absorbs sunlight in green plants?',
    options: [
      'Carotenoids',
      'Chlorophyll',
      'Anthocyanins'
    ],
    correctIdx: 1,
    explanationHint: 'Spot on! Chlorophyll is the green pigment in chloroplasts that absorbs light energy, primarily in the blue and red wavelengths.'
  },
  {
    pill: '📐 Pythagorean Theorem',
    text: 'What is the Pythagorean Theorem and why does it work?',
    tags: ['Math', 'Geometry'],
    explanation: 'The Pythagorean Theorem is a fundamental rule in geometry stating that in a right-angled triangle, the area of the square whose side is the hypotenuse (c) is equal to the sum of the areas of the squares on the other two sides (a and b): a² + b² = c².',
    question: 'If a right triangle has legs of lengths 3 and 4, what is the hypotenuse?',
    options: [
      '5',
      '6',
      '7'
    ],
    correctIdx: 0,
    explanationHint: 'Correct! 3² + 4² = 9 + 16 = 25. The square root of 25 is exactly 5.'
  }
];

export const Hero = () => {
  const navigate = useNavigate();

  // Navigation handlers
  const handleStartFree = async () => {
    try {
      const sid = await initAuthSession('signup');
      navigate(`/user/register?sid=${sid}&mode=signup`);
    } catch {
      toast.error('Failed to initialize session. Please try again.');
    }
  };

  // Doubt Box States
  const [selectedDoubtIdx, setSelectedDoubtIdx] = useState<number | null>(null);
  const [typedText, setTypedText] = useState('');
  const [aiState, setAiState] = useState<'idle' | 'analyzing' | 'explaining' | 'complete'>('idle');
  const [streamingExplanation, setStreamingExplanation] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'none' | 'correct' | 'incorrect'>('none');

  // Trigger typing simulation
  const handleSelectDoubt = (idx: number) => {
    if (aiState === 'analyzing' || aiState === 'explaining') return;
    
    setSelectedDoubtIdx(idx);
    setTypedText('');
    setAiState('idle');
    setStreamingExplanation('');
    setSelectedAnswer(null);
    setAnsweredState('none');

    // Simulate user typing
    const targetText = MOCK_DOUBTS[idx].text;
    let currentIdx = 0;
    
    const typingTimer = setInterval(() => {
      if (currentIdx < targetText.length) {
        setTypedText((prev) => prev + targetText.charAt(currentIdx));
        currentIdx++;
      } else {
        clearInterval(typingTimer);
      }
    }, 25);
  };

  // Simulate AI Response
  const handleAskAI = () => {
    if (selectedDoubtIdx === null || typedText.trim() === '') return;
    
    setAiState('analyzing');
    
    // Simulate analyzing step
    setTimeout(() => {
      setAiState('explaining');
      const targetExplanation = MOCK_DOUBTS[selectedDoubtIdx].explanation;
      let charIdx = 0;
      setStreamingExplanation('');

      const streamTimer = setInterval(() => {
        if (charIdx < targetExplanation.length) {
          setStreamingExplanation((prev) => prev + targetExplanation.charAt(charIdx));
          charIdx += 4; // Stream multiple characters for smooth pacing
        } else {
          clearInterval(streamTimer);
          setStreamingExplanation(targetExplanation); // Ensure complete match
          setAiState('complete');
        }
      }, 15);
    }, 1200);
  };

  // Handle MCQ click
  const handleAnswerClick = (optIdx: number) => {
    if (selectedDoubtIdx === null || aiState !== 'complete') return;
    setSelectedAnswer(optIdx);
    if (optIdx === MOCK_DOUBTS[selectedDoubtIdx].correctIdx) {
      setAnsweredState('correct');
      toast.success('Awesome! Correct answer.');
    } else {
      setAnsweredState('incorrect');
      toast.error('Not quite! Try again.');
    }
  };

  // Stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }
    }
  };

  return (
    <section id="home" className="relative min-h-screen w-full flex flex-col items-center overflow-hidden bg-transparent pt-32 lg:pt-36 pb-20">
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[5%] left-[5%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent blur-[130px] dark:from-indigo-500/15 dark:via-purple-500/15" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-pink-500/10 via-rose-500/10 to-transparent blur-[120px] dark:from-pink-500/15 dark:via-rose-500/15" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          
          {/* LEFT CONTENT: Value Prop */}
          <motion.div 
            className="flex-1 text-left space-y-8 max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Interactive Beta Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100/50 dark:border-slate-700/60 backdrop-blur-xl shadow-sm"
            >
              <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 tracking-wider uppercase">Next-Gen AI Learning Tool</span>
            </motion.div>

            {/* Title */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight"
            >
              Got a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Doubt?</span> <br />
              Ask. Learn. Improve.
            </motion.h1>

            {/* Description */}
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium"
            >
              From complex confusion to total clarity in seconds. Aura extracts core concepts, creates personalized summaries, and tests your mastery dynamically.
            </motion.p>

            {/* Quick Actions */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4 pt-2"
            >
              <motion.button 
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStartFree}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                Start Practicing Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white font-bold rounded-2xl transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Play size={14} className="text-indigo-600 dark:text-white fill-current ml-0.5" />
                </div>
                Watch 1-Min Demo
              </motion.button>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center gap-8 pt-4 border-t border-slate-100 dark:border-slate-800/60"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-slate-800 dark:text-white">4.9/5</span>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">Trusted by 10,000+ Students</p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT CONTENT: Interactive doubt card widget */}
          <motion.div 
            className="flex-1 w-full max-w-xl relative lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Interactive Doubt Box Container */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-b from-white/70 to-white/30 dark:from-slate-900/80 dark:to-slate-950/40 backdrop-blur-2xl border border-white dark:border-slate-800/80 shadow-[0_30px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
              
              {/* Box header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Brain size={20} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Interactive Doubt Playground</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">EXPERIENCE AURA REAL-TIME</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI Engine Live</span>
                </div>
              </div>

              {/* Doubt Pill Presets */}
              <div className="mb-5 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select a sample doubt to ask:</p>
                <div className="flex flex-wrap gap-2">
                  {MOCK_DOUBTS.map((doubt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectDoubt(idx)}
                      disabled={aiState === 'analyzing' || aiState === 'explaining'}
                      className={`text-xs px-3.5 py-2 rounded-xl font-bold border transition-all duration-300 ${
                        selectedDoubtIdx === idx
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white hover:bg-slate-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {doubt.pill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input box */}
              <div className="relative mb-6">
                <textarea
                  value={typedText}
                  onChange={(e) => {
                    if (aiState === 'idle' || aiState === 'complete') {
                      setTypedText(e.target.value);
                      setSelectedDoubtIdx(null);
                    }
                  }}
                  disabled={aiState === 'analyzing' || aiState === 'explaining'}
                  placeholder="Type your own study doubt here..."
                  className="w-full min-h-[90px] p-4 pr-12 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all"
                />
                <button
                  onClick={handleAskAI}
                  disabled={typedText.trim() === '' || aiState === 'analyzing' || aiState === 'explaining'}
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 flex items-center justify-center transition-all shadow-md shadow-indigo-500/10 focus:outline-none"
                >
                  <Send size={15} />
                </button>
              </div>

              {/* AI Streaming Result Output */}
              <AnimatePresence mode="wait">
                {aiState !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="p-5 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30"
                  >
                    {/* State header */}
                    <div className="flex items-center gap-2 mb-3">
                      {aiState === 'analyzing' && (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Synthesis Engine analyzing...</span>
                        </>
                      )}
                      {aiState === 'explaining' && (
                        <>
                          <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Generating Concept Map...</span>
                        </>
                      )}
                      {aiState === 'complete' && selectedDoubtIdx !== null && (
                        <>
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Synthesis Complete</span>
                        </>
                      )}
                    </div>

                    {/* Explanations Text */}
                    {streamingExplanation && (
                      <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-semibold font-sans mb-5 border-l-2 border-indigo-400 pl-3">
                        {streamingExplanation}
                      </div>
                    )}

                    {/* Dynamic MCQ component */}
                    {aiState === 'complete' && selectedDoubtIdx !== null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-4 border-t border-indigo-100/40 dark:border-indigo-900/20"
                      >
                        <div className="flex items-center gap-1.5 mb-3 text-slate-800 dark:text-slate-200">
                          <HelpCircle size={15} className="text-indigo-500" />
                          <p className="text-xs font-black tracking-tight uppercase">Instant Practice Quiz:</p>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mb-3">{MOCK_DOUBTS[selectedDoubtIdx].question}</p>
                        <div className="space-y-2">
                          {MOCK_DOUBTS[selectedDoubtIdx].options.map((opt, oIdx) => {
                            const isCorrect = oIdx === MOCK_DOUBTS[selectedDoubtIdx].correctIdx;
                            const isSelected = selectedAnswer === oIdx;
                            
                            let optStyle = 'bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
                            if (isSelected) {
                              optStyle = isCorrect
                                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300';
                            }
                            
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleAnswerClick(oIdx)}
                                className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-3 ${optStyle}`}
                              >
                                <span>{opt}</span>
                                {isSelected && (
                                  isCorrect ? <Check size={14} className="text-emerald-500 flex-shrink-0" /> : <X size={14} className="text-rose-500 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Hint box */}
                        {answeredState !== 'none' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-[11px] font-bold text-slate-500 dark:text-slate-400"
                          >
                            {MOCK_DOUBTS[selectedDoubtIdx].explanationHint}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Interactive Dashboard Glow */}
              <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500/2 to-purple-500/2 blur-2xl pointer-events-none" />
            </div>

            {/* Glowing Halo around interactive container */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-20 -z-10 blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

