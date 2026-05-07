import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Play, 
    BookOpen, 
    BarChart3, 
    Clock,
    Target,
    Flame,
    TrendingUp,
    Shield,
    ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../Dashboard/DashboardLayout';
import Card from '../../../components/ui/Card';
import { useThemeContext } from '../../../context/ThemeContext';

// Define the practice topics
const practiceTopics = [
    {
        title: 'Biology',
        description: 'Cellular structures to complex ecosystems.',
        questions: 50,
        difficulty: 'Medium',
        progress: 72,
        time: 'Completed in 12 min',
        color: '#10b981', // Emerald
        bg: 'rgba(16, 185, 129, 0.1)',
        path: '/practice/test/biology'
    },
    {
        title: 'Physics',
        description: 'Mechanics, electromagnetism, and quantum physics.',
        questions: 50,
        difficulty: 'Medium',
        progress: 0,
        color: '#3b82f6', // Blue
        bg: 'rgba(59, 130, 246, 0.1)',
        path: '/practice/test/physics'
    },
    {
        title: 'Chemistry',
        description: 'Matter, properties, and chemical reactions.',
        questions: 50,
        difficulty: 'Hard',
        progress: 65,
        time: 'Completed in 18 min',
        color: '#8b5cf6', // Violet
        bg: 'rgba(139, 92, 246, 0.1)',
        path: '/practice/test/chemistry'
    }
];

// Framer Motion Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const PracticePage: React.FC = () => {
    const { mode } = useThemeContext();
    const isLight = mode === 'light';
    const navigate = useNavigate();

    return (
        <DashboardLayout 

            title="Practice Center" 
            subtitle="Choose a topic and start practicing to improve your scores."
        >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 pb-20">
                {/* Left Column - Topics Grid */}
                <div className="space-y-6 lg:col-span-8">
                    <div className="flex items-center justify-between">
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            All Topics
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Chip label="All Subjects" variant="outlined" clickable />
                            <Chip label="Difficulty: All" variant="outlined" clickable />
                        </Stack>
                    </div>

                    <motion.div 
                        variants={containerVariants} 
                        initial="hidden" 
                        animate="show" 
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {practiceTopics.map((topic, index) => (
                            <motion.div key={index} variants={itemVariants} whileHover={{ y: -4 }}>
                                <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div style={{ backgroundColor: topic.bg, color: topic.color, padding: '12px', borderRadius: '16px' }}>
                                            <BookOpen size={24} />
                                        </div>
                                    </div>

                                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                                        {topic.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 3 }}>
                                        {topic.questions} Questions • {topic.difficulty}
                                    </Typography>

                                    {topic.progress > 0 ? (
                                        <div className="mb-6 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                                    Last Attempt
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                                    {topic.progress}%
                                                </Typography>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${topic.progress}%` }} />
                                            </div>
                                            {topic.time && (
                                                <div className="flex items-center gap-1.5 pt-1">
                                                    <Clock size={14} className="text-emerald-500" />
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                        {topic.time}
                                                    </Typography>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mb-6 pt-1">
                                            <div className="flex justify-between items-center">
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                                    Last Attempt
                                                </Typography>
                                                <Chip label="Not Attempted" size="small" sx={{ height: 20, fontSize: '10px', fontWeight: 700 }} />
                                            </div>
                                            <div className="h-8" />
                                        </div>
                                    )}

                                    <div className="mt-auto space-y-2 pt-4">
                                        {topic.progress > 0 ? (
                                            <>
                                                <Button 
                                                    fullWidth 
                                                    variant="contained" 
                                                    endIcon={<Play size={16} />}
                                                    onClick={() => navigate(topic.path)}
                                                    sx={{ 
                                                        borderRadius: '12px', 
                                                        py: 1.5, 
                                                        fontWeight: 800,
                                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Retake
                                                </Button>
                                                <Button 
                                                    fullWidth 
                                                    variant="outlined" 
                                                    startIcon={<BarChart3 size={16} />}
                                                    sx={{ 
                                                        borderRadius: '12px', 
                                                        py: 1.5, 
                                                        fontWeight: 700,
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    View Analysis
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button 
                                                    fullWidth 
                                                    variant="contained" 
                                                    endIcon={<Play size={16} />}
                                                    onClick={() => navigate(topic.path)}
                                                    sx={{ 
                                                        borderRadius: '12px', 
                                                        py: 1.5, 
                                                        fontWeight: 800,
                                                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                                        textTransform: 'none'
                                                    }}
                                                >
                                                    Start Practice
                                                </Button>
                                                <div className="h-[48px] invisible" />
                                            </>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Right Column - AI Insights & Stats */}
                <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-28 h-fit">
                    {/* Massive AI Banner mimicking Dashboard AI Insights */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24, delay: 0.2 }}>
                        <Card sx={{ 
                            p: 3, 
                            background: isLight 
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${isLight ? 'rgba(99, 102, 241, 0.2)' : 'rgba(168, 85, 247, 0.2)'}`,
                        }}>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl mix-blend-screen pointer-events-none" />
                            
                            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Sparkles size={20} />
                                </div>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isLight ? '#4f46e5' : '#a855f7' }}>
                                    AI Recommendation
                                </Typography>
                            </Stack>

                            <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.3 }}>
                                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Biology</span> next.
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 4, lineHeight: 1.6 }}>
                                You're currently at 72% mastery. Our AI detected consistent gaps in your DNA structure knowledge.
                            </Typography>

                            <Button 
                                variant="contained" 
                                fullWidth 
                                endIcon={<ArrowUpRight size={18} />}
                                sx={{ 
                                    py: 1.5, 
                                    borderRadius: '12px',
                                    fontWeight: 800,
                                    background: isLight ? '#0f172a' : '#ffffff',
                                    color: isLight ? '#ffffff' : '#0f172a',
                                    '&:hover': {
                                        background: isLight ? '#1e293b' : '#f8fafc',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)'
                                    },
                                    transition: 'all 0.3s'
                                }}
                            >
                                Start Recommended
                            </Button>
                        </Card>
                    </motion.div>

                    {/* Quick Stats Grid mimicking Dashboard Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card sx={{ p: 2 }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <Target size={18} />
                                    </div>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Daily Goal</Typography>
                                </div>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>2/5</Typography>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <Card sx={{ p: 2 }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                        <Flame size={18} />
                                    </div>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Streak</Typography>
                                </div>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>7 Days</Typography>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <Card sx={{ p: 2 }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <TrendingUp size={18} />
                                    </div>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Accuracy</Typography>
                                </div>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>68%</Typography>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                            <Card sx={{ p: 2 }}>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <Shield size={18} />
                                    </div>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>Rank</Typography>
                                </div>
                                <Typography variant="h6" sx={{ fontWeight: 900 }}>Top 12%</Typography>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PracticePage;
