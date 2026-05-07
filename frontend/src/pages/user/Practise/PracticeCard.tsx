import React, { useState, useRef } from 'react';
import { Bookmark, Clock, ArrowLeft, CheckCircle2, ChevronRight, Sparkles, BrainCircuit, BarChart3 } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { useThemeContext } from '../../../context/ThemeContext';

interface PracticeCardProps {
    title: string;
    description: string;
    outcomes: string[];
    questions: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    progress: number;
    time?: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
    title,
    description,
    outcomes,
    questions,
    difficulty,
    progress,
    time,
    icon,
    color,
    bg
}) => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Spotlight Effect State
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    const difficultyColors = {
        Easy: 'text-emerald-500 bg-emerald-500/10',
        Medium: 'text-amber-500 bg-amber-500/10',
        Hard: 'text-rose-500 bg-rose-500/10'
    };

    const needsFocus = progress === 0;

    return (
        <div 
            className="relative h-[400px] w-full perspective-2000 group/card"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Spotlight Hover Glow Effect */}
            <motion.div
                className="absolute -inset-0.5 rounded-[26px] opacity-0 group-hover/card:opacity-100 transition duration-500 z-0"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            400px circle at ${mouseX}px ${mouseY}px,
                            ${isLightMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.4)'},
                            transparent 80%
                        )
                    `,
                }}
            />

            <motion.div
                className="relative w-full h-full preserve-3d cursor-default z-10"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
                {/* Front Side */}
                <div className={`absolute inset-0 backface-hidden p-6 rounded-[24px] border flex flex-col transition-all duration-500 ${
                    isLightMode 
                    ? 'bg-white/95 backdrop-blur-2xl border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]' 
                    : 'bg-slate-900/95 backdrop-blur-2xl border-white/5 shadow-2xl'
                } ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                    
                    {/* Header: Icon & Bookmark */}
                    <div className="flex items-start justify-between mb-5 relative">
                        <motion.div 
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${bg} ${color}`}
                        >
                            {icon}
                        </motion.div>
                        
                        {/* Dynamic Badges */}
                        {needsFocus && (
                            <div className="absolute left-16 top-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                <BrainCircuit size={12} />
                                Focus Area
                            </div>
                        )}

                        <motion.button 
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-slate-400 hover:text-indigo-500 transition-colors p-1"
                        >
                            <Bookmark size={20} />
                        </motion.button>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="mb-6">
                        <h3 className={`text-[20px] font-bold mb-2 tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                            {title}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-[12px] font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {questions} Questions
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${difficultyColors[difficulty]}`}>
                                {difficulty}
                            </span>
                        </div>
                    </div>

                    {/* Progress Section */}
                    {progress > 0 ? (
                        <div className="mb-6 space-y-2.5">
                            <div className="flex items-center justify-between text-[13px]">
                                <span className={`font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Last Attempt</span>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles size={12} className="text-amber-400" />
                                    <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{progress}%</span>
                                </div>
                            </div>
                            <div className="h-[6px] w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                    className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 animate-shimmer-fast bg-linear-to-r from-transparent via-white/40 to-transparent" />
                                </motion.div>
                            </div>
                            {time && (
                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 pt-1">
                                    <Clock size={12} className="text-emerald-500" />
                                    <span>{time}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mb-6 pt-1">
                            <div className="flex items-center justify-between text-[13px]">
                                <span className={`font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Last Attempt</span>
                                <span className={`font-medium px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>Not Attempted</span>
                            </div>
                            <div className="h-[32px]" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2.5 mt-auto relative z-20">
                        {progress > 0 ? (
                            <>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative w-full py-3.5 rounded-xl bg-linear-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white font-bold text-[14px] shadow-[0_8px_20px_-6px_rgba(99,102,241,0.5)] overflow-hidden group/btn"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Retake Session
                                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-3 rounded-xl border-2 text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                                        isLightMode 
                                        ? 'bg-white border-slate-100 text-[#8B5CF6] hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/5' 
                                        : 'bg-slate-900 border-white/5 text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5'
                                    }`}
                                >
                                    <BarChart3 size={16} />
                                    View Analysis
                                </motion.button>
                            </>
                        ) : (
                            <>
                                <motion.button 
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(99,102,241,0.6)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="relative w-full py-3.5 rounded-xl bg-linear-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] text-white font-bold text-[14px] shadow-[0_8px_20px_-6px_rgba(99,102,241,0.4)] overflow-hidden group/btn"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Start Practice
                                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                                </motion.button>
                                <div className="py-3 invisible">Spacer</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Back Side - Advanced Insights */}
                <div className={`absolute inset-0 backface-hidden p-8 rounded-[24px] border flex flex-col rotate-y-180 bg-linear-to-br transition-all duration-500 ${
                    isLightMode 
                    ? 'from-[#4F46E5] via-[#8B5CF6] to-[#ec4899] border-transparent shadow-[0_20px_50px_rgba(99,102,241,0.3)]' 
                    : 'from-slate-800 via-indigo-950 to-slate-900 border-white/10 shadow-2xl'
                } ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                    
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] rounded-[24px]" />

                    <div className="flex items-center gap-3 mb-6 relative">
                        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md shadow-inner border border-white/10">
                            <ArrowLeft size={16} className="text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-white tracking-tight">Curriculum</h4>
                    </div>

                    <p className="text-white/95 text-[14px] leading-relaxed mb-8 italic border-l-2 border-white/30 pl-4">
                        "{description}"
                    </p>

                    <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar relative">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-8 h-px bg-white/20" />
                            Key Learning Outcomes
                        </p>
                        <ul className="space-y-3">
                            {outcomes.map((outcome, idx) => (
                                <motion.li 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-start gap-3 text-[13px] text-white font-medium bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors cursor-default shadow-sm"
                                >
                                    <div className="mt-0.5 text-emerald-400">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <span className="leading-snug">{outcome}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse relative z-10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        Move mouse to flip
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PracticeCard;
