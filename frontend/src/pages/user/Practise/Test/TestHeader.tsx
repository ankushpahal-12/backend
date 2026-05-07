import React from 'react';
import { Typography, IconButton } from '@mui/material';
import { ArrowLeft, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';
import Card from '../../../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

interface TestHeaderProps {
    title: string;
    subtitle: string;
    currentQuestion: number;
    totalQuestions: number;
    timeLeft: string;
    score?: number;
    completedPercentage: number;
}

const TestHeader: React.FC<TestHeaderProps> = ({
    title,
    subtitle,
    currentQuestion,
    totalQuestions,
    timeLeft,
    score,
    completedPercentage
}) => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const navigate = useNavigate();

    return (
        <div className="mb-6 space-y-6">
            {/* Top Bar: Title & Exit */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <IconButton 
                        onClick={() => navigate('/practice')}
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
                            {title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {subtitle}
                        </Typography>
                    </div>
                </div>
                <button className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                    isLightMode 
                    ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' 
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}>
                    <ArrowLeft size={16} className="rotate-180" /> Exit Test
                </button>
            </div>

            {/* Stats Bar */}
            <Card sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10">
                        <FileText size={24} />
                    </div>
                    <div>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                            Question
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>
                            {currentQuestion} <span className="text-sm text-slate-400">/ {totalQuestions}</span>
                        </Typography>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden h-10 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10">
                        <Clock size={24} />
                    </div>
                    <div>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                            Time Left
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#f43f5e', lineHeight: 1 }}>
                            {timeLeft}
                        </Typography>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden h-10 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                            Score
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1 }}>
                            {score ?? 0}
                        </Typography>
                    </div>
                </div>
            </Card>

            {/* Progress Bar */}
            <div className="flex items-center gap-4">
                <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${completedPercentage}%` }}
                    />
                </div>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: '85px', textAlign: 'right' }}>
                    {completedPercentage}% Completed
                </Typography>
            </div>
        </div>
    );
};

export default TestHeader;
