import React from 'react';
import { Typography } from '@mui/material';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { useThemeContext } from '../../../context/ThemeContext';

const activities = [
    {
        title: 'Completed Biology Test',
        description: 'Score: 85% • 25 Questions',
        time: '2h ago',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
        title: 'Retook Physics Test',
        description: 'Score: 78% • 25 Questions',
        time: '1d ago',
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
        title: 'Completed Chemistry Test',
        description: 'Score: 92% • 25 Questions',
        time: '2d ago',
        color: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-500/10'
    },
    {
        title: 'AI Insight Generated',
        description: 'Weak areas identified',
        time: '3d ago',
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-500/10'
    }
];

const ProfileActivity: React.FC = () => {
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
                    Recent Activity
                </Typography>
                <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    View All
                </button>
            </div>

            <div className="space-y-6">
                {activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 cursor-pointer group">
                        <div className={`p-2 rounded-full ${activity.bg} ${activity.color}`}>
                            <CheckCircle2 size={18} />
                        </div>
                        
                        <div className="flex-1">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isLightMode ? '#0f172a' : '#f8fafc', mb: 0.5 }}>
                                {activity.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {activity.description}
                            </Typography>
                        </div>

                        <div className="flex items-center gap-2">
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                {activity.time}
                            </Typography>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileActivity;
