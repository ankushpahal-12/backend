import React from 'react';
import { Typography, IconButton, Tooltip } from '@mui/material';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionPaletteProps {
    totalQuestions: number;
    currentQuestion: number;
    answeredQuestions: number[];
    markedForReview: number[];
    onQuestionSelect: (q: number) => void;
    isOpen: boolean;
    onToggle: () => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
    totalQuestions,
    currentQuestion,
    answeredQuestions,
    markedForReview,
    onQuestionSelect,
    isOpen,
    onToggle
}) => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    const questions = Array.from({ length: totalQuestions }, (_, i) => i + 1);

    const getStatusStyles = (q: number) => {
        if (q === currentQuestion) {
            return isLightMode 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-blue-500 text-blue-400 bg-blue-500/10';
        }
        if (markedForReview.includes(q)) {
            return isLightMode 
                ? 'border-amber-500 text-amber-600 bg-amber-50' 
                : 'border-amber-500 text-amber-400 bg-amber-500/10';
        }
        if (answeredQuestions.includes(q)) {
            return isLightMode 
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50' 
                : 'border-emerald-500 text-emerald-400 bg-emerald-500/10';
        }
        return isLightMode 
            ? 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50' 
            : 'border-slate-700 text-slate-400 bg-slate-800 hover:bg-slate-700';
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-4">
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc', whiteSpace: 'nowrap' }}>
                                Question Palette
                            </Typography>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <Tooltip title={isOpen ? "Collapse Palette" : "Expand Palette"} placement="left">
                    <IconButton 
                        onClick={onToggle}
                        sx={{ 
                            color: isLightMode ? '#64748b' : '#94a3b8',
                            bgcolor: isLightMode ? '#f8fafc' : '#1e293b',
                            '&:hover': { bgcolor: isLightMode ? '#f1f5f9' : '#334155' }
                        }}
                    >
                        {isOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                    </IconButton>
                </Tooltip>
            </div>

            {/* Content (Only visible if open) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-1 overflow-hidden"
                    >
                        <div className="mb-6 grid grid-cols-5 gap-3">
                            {questions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => onQuestionSelect(q)}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-colors ${getStatusStyles(q)}`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        <div className="my-6 h-px w-full bg-slate-100 dark:bg-slate-800" />

                        {/* Legend */}
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: isLightMode ? '#0f172a' : '#f8fafc' }}>
                            Legend
                        </Typography>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded border border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>Answered</Typography>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded border border-blue-500 bg-blue-50 dark:bg-blue-500/10" />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>Current</Typography>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>Not Answered</Typography>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-4 rounded border border-amber-500 bg-amber-50 dark:bg-amber-500/10" />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>Marked for Review</Typography>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuestionPalette;
