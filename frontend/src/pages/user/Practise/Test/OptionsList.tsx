import React from 'react';
import { Typography } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';

interface Option {
    label: string; // 'A', 'B', 'C', 'D'
    text: string;
}

interface OptionsListProps {
    options: Option[];
    selectedOption: string | null;
    onSelectOption: (label: string) => void;
    explanation?: string; // Optional: shown if user wants to review
}

const OptionsList: React.FC<OptionsListProps> = ({
    options,
    selectedOption,
    onSelectOption,
    explanation
}) => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <div className="space-y-4">
            {options.map((opt) => {
                const isSelected = selectedOption === opt.label;
                
                // Styling based on selection state
                const baseStyles = 'flex cursor-pointer items-center gap-5 rounded-2xl border p-5 transition-all duration-200';
                const unselectedStyles = isLightMode 
                    ? 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50' 
                    : 'border-white/5 bg-slate-900 hover:border-white/10 hover:bg-slate-800';
                const selectedStyles = isLightMode
                    ? 'border-indigo-200 bg-indigo-50/50 shadow-[0_4px_20px_rgb(99,102,241,0.05)]'
                    : 'border-indigo-500/30 bg-indigo-500/10 shadow-[0_4px_20px_rgb(99,102,241,0.1)]';

                return (
                    <div 
                        key={opt.label}
                        onClick={() => onSelectOption(opt.label)}
                        className={`${baseStyles} ${isSelected ? selectedStyles : unselectedStyles}`}
                    >
                        {/* Radio indicator */}
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected 
                                ? 'border-indigo-500 bg-indigo-500' 
                                : isLightMode ? 'border-slate-300' : 'border-slate-600'
                        }`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        
                        {/* Label Badge */}
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: 800, 
                                color: isSelected 
                                    ? (isLightMode ? '#4f46e5' : '#818cf8') 
                                    : (isLightMode ? '#0f172a' : '#f8fafc') 
                            }}
                        >
                            {opt.label}
                        </Typography>

                        {/* Option Text */}
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: isSelected ? 600 : 500, 
                                color: isSelected 
                                    ? (isLightMode ? '#4338ca' : '#a5b4fc') 
                                    : 'text.secondary' 
                            }}
                        >
                            {opt.text}
                        </Typography>
                    </div>
                );
            })}

            {/* Explanation Box */}
            {explanation && (
                <div className={`mt-6 rounded-2xl p-5 ${isLightMode ? 'bg-indigo-50/80' : 'bg-indigo-500/5 border border-indigo-500/10'}`}>
                    <div className="mb-2 flex items-center gap-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            <Lightbulb size={14} />
                        </div>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isLightMode ? '#4f46e5' : '#818cf8' }}>
                            Explanation
                        </Typography>
                    </div>
                    <Typography variant="body2" sx={{ color: isLightMode ? '#475569' : '#94a3b8', fontWeight: 500, lineHeight: 1.6, pl: 9 }}>
                        {explanation}
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default OptionsList;
