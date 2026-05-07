import React from 'react';
import { Typography } from '@mui/material';
import { Flame, Target, Star, Award } from 'lucide-react';
import { useThemeContext } from '../../../context/ThemeContext';

const achievements = [
    {
        title: '7 Day Streak',
        description: 'Maintain a 7-day streak',
        progress: '7/7',
        status: 'Completed',
        icon: <Flame size={18} />,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50 dark:bg-orange-500/10'
    },
    {
        title: 'Accuracy Master',
        description: 'Achieve 90% accuracy',
        progress: '90%',
        status: 'Completed',
        icon: <Target size={18} />,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
        title: 'Test Taker',
        description: 'Complete 50 tests',
        progress: '45/50',
        status: 'Completed',
        icon: <Star size={18} />,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
        title: 'AI Explorer',
        description: 'Get AI insights 10 times',
        progress: '10/10',
        status: 'Completed',
        icon: <Award size={18} />,
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-50 dark:bg-purple-500/10'
    }
];

const ProfileAchievements: React.FC = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <div className={`p-6 rounded-[20px] h-full ${
            isLightMode 
            ? 'bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]' 
            : 'bg-slate-900 border border-white/5'
        }`}>
            <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc' }}>
                    Achievements
                </Typography>
                <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    View All
                </button>
            </div>

            <div className="space-y-6">
                {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full ${achievement.iconBg} ${achievement.iconColor}`}>
                            {achievement.icon}
                        </div>
                        
                        <div className="flex-1">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isLightMode ? '#0f172a' : '#f8fafc', mb: 0.5 }}>
                                {achievement.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {achievement.description}
                            </Typography>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                            <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                {achievement.status}
                            </div>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {achievement.progress}
                            </Typography>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileAchievements;
