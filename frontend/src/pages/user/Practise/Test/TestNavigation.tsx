import React from 'react';
import { Button, Typography, Switch } from '@mui/material';
import { ArrowLeft, ArrowRight, Bookmark, Flag, Send } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';

interface TestNavigationProps {
    onNext: () => void;
    onPrevious: () => void;
    onBookmark: () => void;
    onSubmit: () => void;
    isBookmarked: boolean;
    isFirstQuestion: boolean;
    isLastQuestion: boolean;
}

const TestNavigation: React.FC<TestNavigationProps> = ({
    onNext,
    onPrevious,
    onBookmark,
    onSubmit,
    isBookmarked,
    isFirstQuestion,
    isLastQuestion
}) => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <div className="space-y-6">
            {/* Main Navigation Row (Prev, Bookmark, Next) */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowLeft size={18} />}
                    onClick={onPrevious}
                    disabled={isFirstQuestion}
                    sx={{ 
                        borderRadius: '12px',
                        py: 1.5,
                        px: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                        borderColor: isLightMode ? '#e2e8f0' : '#334155',
                        color: isLightMode ? '#475569' : '#cbd5e1',
                        '&:hover': {
                            borderColor: isLightMode ? '#cbd5e1' : '#475569',
                            bgcolor: isLightMode ? '#f8fafc' : '#1e293b'
                        }
                    }}
                >
                    Previous
                </Button>

                <Button 
                    variant="text" 
                    startIcon={<Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />}
                    onClick={onBookmark}
                    sx={{ 
                        fontWeight: 700,
                        textTransform: 'none',
                        color: isBookmarked 
                            ? (isLightMode ? '#ea580c' : '#f97316') 
                            : (isLightMode ? '#64748b' : '#94a3b8')
                    }}
                >
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>

                <Button 
                    variant="contained" 
                    endIcon={<ArrowRight size={18} />}
                    onClick={onNext}
                    disabled={isLastQuestion}
                    sx={{ 
                        borderRadius: '12px',
                        py: 1.5,
                        px: 4,
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: '#6366f1',
                        '&:hover': { bgcolor: '#4f46e5' },
                        boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                    }}
                >
                    Next
                </Button>
            </div>

            <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />

            {/* Footer Row (Report, Auto Submit, Submit Test) */}
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <Button 
                    variant="text" 
                    startIcon={<Flag size={16} />}
                    sx={{ 
                        fontWeight: 600,
                        textTransform: 'none',
                        color: isLightMode ? '#64748b' : '#94a3b8'
                    }}
                >
                    Report an Issue
                </Button>

                <div className="flex items-center gap-3">
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Auto Submit
                    </Typography>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 dark:bg-emerald-500/10">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">On</span>
                    </div>
                </div>

                <Button 
                    variant="contained" 
                    endIcon={<Send size={18} />}
                    onClick={onSubmit}
                    sx={{ 
                        borderRadius: '12px',
                        py: 1.5,
                        px: 4,
                        fontWeight: 800,
                        textTransform: 'none',
                        bgcolor: '#f43f5e',
                        '&:hover': { bgcolor: '#e11d48' },
                        boxShadow: '0 4px 14px 0 rgba(244, 63, 94, 0.39)'
                    }}
                >
                    Submit Test
                </Button>
            </div>
        </div>
    );
};

export default TestNavigation;
