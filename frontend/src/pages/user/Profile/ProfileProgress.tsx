import React from 'react';
import { Typography } from '@mui/material';
import { Leaf, Atom, FlaskConical, Sigma } from 'lucide-react';
import { useThemeContext } from '../../../context/ThemeContext';

const progressData = [
    {
        subject: 'Biology',
        percentage: 70,
        status: 'Good',
        statusColor: 'text-emerald-500',
        barColor: 'bg-emerald-500',
        icon: <Leaf size={20} />,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
        subject: 'Physics',
        percentage: 50,
        status: 'Keep Practicing',
        statusColor: 'text-orange-500',
        barColor: 'bg-blue-500',
        icon: <Atom size={20} />,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
        subject: 'Chemistry',
        percentage: 85,
        status: 'Excellent',
        statusColor: 'text-emerald-500',
        barColor: 'bg-purple-500',
        icon: <FlaskConical size={20} />,
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-50 dark:bg-purple-500/10'
    },
    {
        subject: 'Mathematics',
        percentage: 60,
        status: 'Average',
        statusColor: 'text-orange-500',
        barColor: 'bg-orange-400',
        icon: <Sigma size={20} />,
        iconColor: 'text-orange-500',
        iconBg: 'bg-orange-50 dark:bg-orange-500/10'
    }
];

const ProfileProgress: React.FC = () => {
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
                    Your Progress
                </Typography>
                <button className="text-[13px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                    View Analytics
                </button>
            </div>

            <div className="space-y-6">
                {progressData.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full shrink-0 ${item.iconBg} ${item.iconColor}`}>
                            {item.icon}
                        </div>
                        
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isLightMode ? '#334155' : '#cbd5e1' }}>
                                    {item.subject}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc' }}>
                                    {item.percentage}%
                                </Typography>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${item.barColor}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <Typography variant="caption" className={`${item.statusColor} font-bold whitespace-nowrap min-w-[90px] text-right`}>
                                    {item.status}
                                </Typography>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileProgress;
