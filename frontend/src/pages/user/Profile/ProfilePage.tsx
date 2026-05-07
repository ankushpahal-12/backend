import React from 'react';
import { motion } from 'framer-motion';
import MainLayout from '../../../components/layouts/MainLayout';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ProfileProgress from './ProfileProgress';
import ProfileActivity from './ProfileActivity';
import ProfileAchievements from './ProfileAchievements';
import ProfileSettings from './ProfileSettings';
import { Typography } from '@mui/material';
import { useThemeContext } from '../../../context/ThemeContext';

const ProfilePage: React.FC = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    return (
        <MainLayout>
            <div className={`min-h-screen w-full pb-20 pt-6 px-4 sm:px-6 lg:px-8 ${isLightMode ? 'bg-[#FAFAFA]' : 'bg-[#0B0F19]'}`}>
                <div className="max-w-[1200px] mx-auto space-y-8">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-2">
                        <Typography variant="h5" sx={{ fontWeight: 800, color: isLightMode ? '#0f172a' : '#f8fafc' }}>
                            Profile
                        </Typography>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <ProfileHeader />
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <ProfileStats />
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Left Column */}
                        <div className="space-y-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                <ProfileProgress />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                                <ProfileActivity />
                            </motion.div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                                <ProfileAchievements />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                                <ProfileSettings />
                            </motion.div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default ProfilePage;
