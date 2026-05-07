import React from 'react';
import { Typography } from '@mui/material';
import { User, Lock, Bell, Sun, Trash2, ChevronRight } from 'lucide-react';
import { useThemeContext } from '../../../context/ThemeContext';

const ProfileSettings: React.FC = () => {
    const { mode, toggleTheme } = useThemeContext();
    const isLightMode = mode === 'light';

    const settingsItems = [
        {
            title: 'Personal Information',
            description: 'Update your personal details',
            icon: <User size={18} />,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50 dark:bg-blue-500/10',
            onClick: () => {}
        },
        {
            title: 'Change Password',
            description: 'Update your password',
            icon: <Lock size={18} />,
            iconColor: 'text-blue-500',
            iconBg: 'bg-blue-50 dark:bg-blue-500/10',
            onClick: () => {}
        },
        {
            title: 'Notification Preferences',
            description: 'Manage your notifications',
            icon: <Bell size={18} />,
            iconColor: 'text-amber-500',
            iconBg: 'bg-amber-50 dark:bg-amber-500/10',
            onClick: () => {}
        },
        {
            title: 'Theme',
            description: 'Choose your preferred theme',
            icon: <Sun size={18} />,
            iconColor: 'text-purple-500',
            iconBg: 'bg-purple-50 dark:bg-purple-500/10',
            onClick: toggleTheme,
            rightAction: (
                <div className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 capitalize mr-2">
                    {mode}
                </div>
            )
        },
        {
            title: 'Delete Account',
            description: 'Permanently delete your account',
            icon: <Trash2 size={18} />,
            iconColor: 'text-rose-500',
            iconBg: 'bg-rose-50 dark:bg-rose-500/10',
            titleColor: 'text-rose-500',
            onClick: () => {}
        }
    ];

    return (
        <div className={`p-6 rounded-[20px] h-full ${
            isLightMode 
            ? 'bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]' 
            : 'bg-slate-900 border border-white/5'
        }`}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc', mb: 6 }}>
                Account Settings
            </Typography>

            <div className="space-y-6">
                {settingsItems.map((item, index) => (
                    <div 
                        key={index} 
                        onClick={item.onClick}
                        className="flex items-center gap-4 cursor-pointer group"
                    >
                        <div className={`p-2.5 rounded-full ${item.iconBg} ${item.iconColor}`}>
                            {item.icon}
                        </div>
                        
                        <div className="flex-1">
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: item.titleColor ? '' : (isLightMode ? '#0f172a' : '#f8fafc'), mb: 0.5 }} className={item.titleColor}>
                                {item.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {item.description}
                            </Typography>
                        </div>

                        <div className="flex items-center">
                            {item.rightAction}
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileSettings;
