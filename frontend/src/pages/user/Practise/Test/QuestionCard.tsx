import React from 'react';
import { Typography, Chip, Button } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';

interface QuestionCardProps {
    questionText: string;
    type?: string;
    onAskHint?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
    questionText,
    type = 'Single Choice'
}) => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <div className="mb-8 space-y-6">
            <div className="flex items-center justify-between">
                <Chip 
                    label={type} 
                    size="small"
                    sx={{ 
                        fontWeight: 700, 
                        color: isLightMode ? '#6366f1' : '#818cf8',
                        bgcolor: isLightMode ? '#eef2ff' : 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '8px'
                    }} 
                />
            </div>

            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.4 }}>
                {questionText}
            </Typography>
        </div>
    );
};

export default QuestionCard;
