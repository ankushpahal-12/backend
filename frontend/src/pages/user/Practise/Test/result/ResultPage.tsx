import React, { useState } from 'react';
import { Typography, Button, Stack, Chip, CircularProgress, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    TrendingUp, 
    Sparkles,
    RefreshCw,
    BookOpen
} from 'lucide-react';
import DashboardLayout from './../../../Dashboard/DashboardLayout';
import Card from '../../../../../components/ui/Card';
import { useThemeContext } from '../../../../../context/ThemeContext';
import QuestionCard from '../QuestionCard';
import TestNavigation from '../TestNavigation';

// Mock Data
const MOCK_QUESTIONS = [
    {
        number: 1,
        question: "What is the primary function of mitochondria in a cell?",
        userAnswer: "A",
        correctAnswer: "A",
        explanation: "Mitochondria is known as the powerhouse of the cell because it produces energy (ATP) through cellular respiration.",
        options: [
            { label: "A", text: "Mitochondria" },
            { label: "B", text: "Ribosome" },
            { label: "C", text: "Nucleus" },
            { label: "D", text: "Golgi Apparatus" }
        ]
    },
    {
        number: 2,
        question: "Which of the following is the powerhouse of the cell?",
        userAnswer: "B",
        correctAnswer: "A",
        explanation: "Mitochondria is known as the powerhouse of the cell because it produces energy (ATP) through cellular respiration.",
        options: [
            { label: "A", text: "Mitochondria" },
            { label: "B", text: "Ribosome" },
            { label: "C", text: "Nucleus" },
            { label: "D", text: "Golgi Apparatus" }
        ]
    },
    {
        number: 3,
        question: "Chlorophyll is found in which of the following?",
        userAnswer: "C",
        correctAnswer: "C",
        explanation: "Chlorophyll is a green pigment, present in all green plants and in cyanobacteria, responsible for the absorption of light to provide energy for photosynthesis.",
        options: [
            { label: "A", text: "Nucleus" },
            { label: "B", text: "Cytoplasm" },
            { label: "C", text: "Chloroplast" },
            { label: "D", text: "Mitochondria" }
        ]
    },
    {
        number: 4,
        question: "Which hormone is responsible for growth in plants?",
        userAnswer: "B",
        correctAnswer: "D",
        explanation: "Auxins are a class of plant hormones (or plant-growth regulators) with some morphogen-like characteristics.",
        options: [
            { label: "A", text: "Cytokinin" },
            { label: "B", text: "Ethylene" },
            { label: "C", text: "Abscisic Acid" },
            { label: "D", text: "Auxin" }
        ]
    }
];

const TestPage: React.FC = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const [navOpen, setNavOpen] = useState(false);
    const [filter, setFilter] = useState<'All' | 'Correct' | 'Incorrect'>('All');

    // Simulate clicking back or opening test nav
    const handleBack = () => {
        window.history.back();
    };

    const filteredQuestions = MOCK_QUESTIONS.filter(q => {
        if (filter === 'All') return true;
        if (filter === 'Correct') return q.userAnswer === q.correctAnswer;
        if (filter === 'Incorrect') return q.userAnswer !== q.correctAnswer;
        return true;
    });

    const correctIds = [1, 3, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 17, 18, 19, 20];
    const incorrectIds = [2, 4, 12, 16];

    return (
        <DashboardLayout title="Practice Test" subtitle="Review your test performance and answers.">
            <div className="mx-auto max-w-5xl pb-24">
                {/* Custom Header */}
                <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                        <IconButton 
                            onClick={handleBack}
                            sx={{ 
                                bgcolor: isLightMode ? '#f1f5f9' : '#1e293b', 
                                color: isLightMode ? '#0f172a' : '#f8fafc',
                                '&:hover': { bgcolor: isLightMode ? '#e2e8f0' : '#334155' }
                            }}
                        >
                            <ArrowLeft size={20} />
                        </IconButton>
                        <div>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc' }}>
                                Biology Practice Test
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                20 Questions • Medium
                            </Typography>
                        </div>
                    </div>
                    <Button 
                        variant="outlined" 
                        startIcon={<FileText size={16} />}
                        sx={{ 
                            borderRadius: '12px',
                            fontWeight: 700,
                            borderColor: isLightMode ? '#e2e8f0' : '#334155',
                            color: isLightMode ? '#475569' : '#cbd5e1',
                            bgcolor: isLightMode ? '#ffffff' : '#0f172a',
                            textTransform: 'none'
                        }}
                    >
                        Review Test
                    </Button>
                </div>

                {/* Hero Results Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card sx={{ 
                        p: { xs: 4, md: 6 }, 
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        overflow: 'hidden',
                        position: 'relative',
                        mb: 4
                    }}>
                        {/* Decorative background shapes */}
                        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-indigo-400/30 blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row md:gap-12">
                            {/* Circular Progress */}
                            <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white/10 shrink-0">
                                <CircularProgress 
                                    variant="determinate" 
                                    value={80} 
                                    size={144} 
                                    thickness={4} 
                                    sx={{ color: '#10b981', position: 'absolute', zIndex: 2 }} 
                                />
                                <CircularProgress 
                                    variant="determinate" 
                                    value={100} 
                                    size={144} 
                                    thickness={4} 
                                    sx={{ color: 'rgba(255,255,255,0.2)', position: 'absolute', zIndex: 1 }} 
                                />
                                <div className="text-center">
                                    <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                                        80%
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                                        Accuracy
                                    </Typography>
                                </div>
                            </div>

                            {/* Center Text */}
                            <div className="flex-1 text-center md:text-left">
                                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                                    Great Job, Ankush! 
                                </Typography>
                                <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 600, mb: 1 }}>
                                    Your Score
                                </Typography>
                                <div className="flex items-baseline justify-center gap-2 md:justify-start">
                                    <Typography variant="h2" sx={{ fontWeight: 900, lineHeight: 1 }}>
                                        16
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, opacity: 0.8 }}>
                                        / 20
                                    </Typography>
                                </div>
                                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md">
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        You have passed the test!
                                    </Typography>
                                </div>
                            </div>

                            {/* Trophy / Illustration (Placeholder using Emoji) */}
                            <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm md:flex">
                                <Typography sx={{ fontSize: '4rem', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }}>
                                    🏆
                                </Typography>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Stats Grid */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
                                <CheckCircle2 size={20} />
                            </div>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
                                Correct
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>16</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>80%</Typography>
                        </Card>
                    </motion.div>
                    
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10">
                                <XCircle size={20} />
                            </div>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
                                Wrong
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, mb: 0.5 }}>4</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>20%</Typography>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                                <Clock size={20} />
                            </div>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
                                Time Taken
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>12m 45s</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Avg. 00:38 / Q</Typography>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500 dark:bg-purple-500/10">
                                <TrendingUp size={20} />
                            </div>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
                                Score
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>80 / 100</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Good</Typography>
                        </Card>
                    </motion.div>
                </div>

                {/* AI Insights Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card sx={{ p: 4, mb: 6, border: `1px solid ${isLightMode ? '#e2e8f0' : '#334155'}` }}>
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <Sparkles size={20} className="text-indigo-500" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                        AI Insights
                                    </Typography>
                                </Stack>
                                <div className="space-y-1">
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        You performed really well! 💪
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        You are strong in <span className="font-bold text-indigo-500">Cell Biology</span> and <span className="font-bold text-indigo-500">Genetics</span>.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        Focus more on <span className="font-bold text-rose-500">Plant Biology</span> to improve further.
                                    </Typography>
                                </div>
                            </div>

                            {/* Chart Placeholder */}
                            <div className="flex items-center gap-6">
                                <div className="relative h-24 w-24 shrink-0 rounded-full border-[12px] border-emerald-500" style={{ borderRightColor: '#fbbf24', borderBottomColor: '#f43f5e' }}>
                                    <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-white dark:bg-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500"/> <span className="font-semibold text-slate-600 dark:text-slate-300">Strong Topics</span></div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">70%</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-400"/> <span className="font-semibold text-slate-600 dark:text-slate-300">Average Topics</span></div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">20%</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-rose-500"/> <span className="font-semibold text-slate-600 dark:text-slate-300">Weak Topics</span></div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">10%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Question Analysis List */}
                <div className="mb-8">
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            Question Analysis
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant={filter === 'All' ? 'contained' : 'outlined'} 
                                onClick={() => setFilter('All')}
                                sx={{ 
                                    borderRadius: '8px', 
                                    textTransform: 'none', 
                                    fontWeight: 700,
                                    bgcolor: filter === 'All' ? (isLightMode ? '#ede9fe' : '#4c1d95') : 'transparent',
                                    color: filter === 'All' ? (isLightMode ? '#6d28d9' : '#ddd6fe') : 'text.secondary',
                                    borderColor: isLightMode ? '#e2e8f0' : '#334155',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none' }
                                }}
                            >
                                All
                            </Button>
                            <Button 
                                variant={filter === 'Correct' ? 'contained' : 'outlined'} 
                                onClick={() => setFilter('Correct')}
                                sx={{ 
                                    borderRadius: '8px', 
                                    textTransform: 'none', 
                                    fontWeight: 700,
                                    borderColor: isLightMode ? '#e2e8f0' : '#334155',
                                    color: filter === 'Correct' ? 'white' : 'text.secondary',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none' }
                                }}
                            >
                                Correct
                            </Button>
                            <Button 
                                variant={filter === 'Incorrect' ? 'contained' : 'outlined'} 
                                onClick={() => setFilter('Incorrect')}
                                sx={{ 
                                    borderRadius: '8px', 
                                    textTransform: 'none', 
                                    fontWeight: 700,
                                    borderColor: isLightMode ? '#e2e8f0' : '#334155',
                                    color: filter === 'Incorrect' ? 'white' : 'text.secondary',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: 'none' }
                                }}
                            >
                                Incorrect
                            </Button>
                        </Stack>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Decorative Line on left */}
                        <div className="absolute left-[24px] sm:left-[28px] top-6 bottom-6 w-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />
                        
                        {filteredQuestions.map((q) => (
                            <QuestionCard
                                key={q.number}
                                number={q.number}
                                question={q.question}
                                options={q.options}
                                userAnswer={q.userAnswer}
                                correctAnswer={q.correctAnswer}
                                explanation={q.explanation}
                            />
                        ))}

                        <div className="mt-6 text-center">
                            <Button 
                                variant="outlined" 
                                endIcon={<ArrowLeft size={16} className="-rotate-90" />}
                                sx={{ 
                                    borderRadius: '12px', 
                                    py: 1.5, 
                                    px: 4,
                                    fontWeight: 700,
                                    borderColor: isLightMode ? '#e2e8f0' : '#334155',
                                    color: 'text.primary',
                                    textTransform: 'none'
                                }}
                            >
                                View All Questions
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col gap-4 sm:flex-row">
                    <Button 
                        variant="outlined" 
                        fullWidth
                        startIcon={<RefreshCw size={18} />}
                        sx={{ 
                            py: 2, 
                            borderRadius: '16px', 
                            fontWeight: 800,
                            fontSize: '1rem',
                            borderColor: isLightMode ? '#e2e8f0' : '#334155',
                            color: 'text.primary',
                            textTransform: 'none',
                            bgcolor: isLightMode ? 'white' : '#0f172a'
                        }}
                    >
                        Retake Test
                    </Button>
                    <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={<BookOpen size={18} />}
                        sx={{ 
                            py: 2, 
                            borderRadius: '16px', 
                            fontWeight: 800,
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            textTransform: 'none',
                            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        Practice Weak Areas
                    </Button>
                </div>
            </div>

            {/* Floating Navigation Palette */}
            <TestNavigation 
                open={navOpen} 
                onClose={() => setNavOpen(false)} 
                onOpen={() => setNavOpen(true)}
                totalQuestions={20}
                correctQuestions={correctIds}
                incorrectQuestions={incorrectIds}
                unattemptedQuestions={[]}
                onQuestionClick={(q) => console.log('Scroll to question', q)}
            />
        </DashboardLayout>
    );
};

export default TestPage;
