import React from 'react';
import { Typography, Button, IconButton } from '@mui/material';
import { MapPin, Calendar, Edit2, Quote } from 'lucide-react';
import { useThemeContext } from '../../../context/ThemeContext';

const ProfileHeader: React.FC = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <div className={`p-8 rounded-[24px] relative overflow-hidden flex flex-col md:flex-row items-center md:items-start justify-between gap-6 ${
            isLightMode 
            ? 'bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50' 
            : 'bg-linear-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-white/5'
        }`}>
            {/* Soft glow background effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-400/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-[0_10px_30px_rgba(99,102,241,0.2)] bg-indigo-100 flex items-center justify-center">
                        <img 
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ankush&backgroundColor=e0e7ff" 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button className="absolute bottom-0 right-2 p-2 rounded-full bg-white shadow-md text-slate-600 hover:text-indigo-600 transition-colors border border-slate-100">
                        <Edit2 size={14} />
                    </button>
                </div>

                {/* Info */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 mt-2">
                    <Typography variant="h4" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc', mb: 0.5, letterSpacing: '-0.02em' }}>
                        Ankush Verma
                    </Typography>
                    <Typography variant="body1" sx={{ color: isLightMode ? '#64748b' : '#94a3b8', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        ankushverma@gmail.com
                    </Typography>
                    
                    <div className="flex flex-col sm:flex-row items-center md:items-start gap-2 sm:gap-6">
                        <div className={`flex items-center gap-1.5 text-[14px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            <MapPin size={16} /> India
                        </div>
                        <div className={`flex items-center gap-1.5 text-[14px] font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            <Calendar size={16} /> Joined March 2024
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Elements */}
            <div className="relative z-10 flex flex-col items-center md:items-end justify-between h-full gap-8 w-full md:w-auto shrink-0 mt-4 md:mt-0">
                <Button 
                    variant="contained" 
                    startIcon={<Edit2 size={16} />}
                    sx={{ 
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        background: '#6366f1',
                        '&:hover': { background: '#4f46e5' },
                        boxShadow: '0 4px 14px 0 rgba(99,102,241,0.39)'
                    }}
                >
                    Edit Profile
                </Button>

                <div className={`mt-auto px-6 py-4 rounded-2xl flex gap-3 max-w-sm ${
                    isLightMode 
                    ? 'bg-white/60 backdrop-blur-sm border border-white shadow-sm' 
                    : 'bg-white/5 backdrop-blur-md border border-white/10'
                }`}>
                    <Quote className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: isLightMode ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                        Consistency today,<br />Excellence tomorrow. 🚀
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
