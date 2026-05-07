import React from 'react';
import { Typography } from '@mui/material';
import { Target, ClipboardList, Flame, Trophy } from 'lucide-react';
import { useThemeContext } from '../../../context/ThemeContext';

const stats = [
    {
        title: 'Accuracy',
        value: '78%',
        hint: '+12% from last month',
        icon: <Target size={20} />,
        iconColor: 'text-indigo-600',
        iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
        hintColor: 'text-emerald-500'
    },
    {
        title: 'Tests Completed',
        value: '45',
        hint: '+8 from last month',
        icon: <ClipboardList size={20} />,
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-50 dark:bg-purple-500/10',
        hintColor: 'text-emerald-500'
    },
    {
        title: 'Current Streak',
        value: '7 Days',
        hint: 'Keep it up! 🔥',
        icon: <Flame size={20} />,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50 dark:bg-orange-500/10',
        hintColor: 'text-orange-500'
    },
    {
        title: 'Global Rank',
        value: 'Top 12%',
        hint: 'Among all users',
        icon: <Trophy size={20} />,
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-50 dark:bg-purple-500/10',
        hintColor: 'text-slate-400'
    }
];

const ProfileStats: React.FC = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <div 
                    key={index}
                    className={`p-6 rounded-[20px] flex flex-col items-center text-center ${
                        isLightMode 
                        ? 'bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]' 
                        : 'bg-slate-900 border border-white/5'
                    }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2.5 rounded-full ${stat.iconBg} ${stat.iconColor}`}>
                            {stat.icon}
                        </div>
                        <Typography variant="body2" sx={{ color: isLightMode ? '#64748b' : '#94a3b8', fontWeight: 600 }}>
                            {stat.title}
                        </Typography>
                    </div>
                    
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: isLightMode ? '#0f172a' : '#f8fafc' }}>
                        {stat.value}
                    </Typography>
                    
                    <Typography variant="caption" className={`${stat.hintColor} font-bold`}>
                        {stat.hint}
                    </Typography>
                </div>
            ))}
        </div>
    );
};

export default ProfileStats;
