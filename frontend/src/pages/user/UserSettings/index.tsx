import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Smartphone, Bell, CreditCard } from 'lucide-react';
import MainLayout from '../../../components/layouts/MainLayout';
import { getCurrentUser, updateProfile, getMySessions, terminateSession as apiTerminateSession, changePassword } from '../../../services/dataService';
import toast from 'react-hot-toast';

// Sub-components
import Identity from './identity';
import Security from './security';
import Session from './session';
import Signals from './signals';
import Treasury from './treasury';
import AccountManage from './accountmanage';

const UserSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        currency: 'INR',
        savingsTarget: 20
    });
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    interface SessionType {
        _id: string;
        device?: string;
        ip?: string;
        lastUsed: string;
        isCurrent: boolean;
    }

    const [sessions, setSessions] = useState<SessionType[]>([]);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        webhooks: false,
        aiInsights: true
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const fetchUserData = useCallback(async () => {
        try {
            const data = await getCurrentUser();
            if (data) {
                setFormData({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    email: data.email || '',
                    currency: data.currency || 'INR',
                    savingsTarget: data.savingsTarget || 20
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            toast.error('Failed to load profile data.');
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        try {
            const response = await getMySessions();
            setSessions(response.data.sessions || []);
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
            toast.error('Failed to load active sessions.');
        }
    }, []);

    useEffect(() => {
        fetchUserData();
        fetchSessions();
    }, [fetchUserData, fetchSessions]);

    const handleSave = async () => {
        setIsSaving(true);
        const promise = updateProfile(formData);
        toast.promise(promise, {
            loading: 'Saving identity...',
            success: 'Profile updated successfully.',
            error: (err) => err?.response?.data?.message || 'Failed to sync identity.',
        });
        try {
            await promise;
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New password sequences do not match.');
            return;
        }
        if (!passwordData.current || !passwordData.new) {
            toast.error('Please fill in all password fields.');
            return;
        }
        setIsChangingPassword(true);
        try {
            await toast.promise(
                changePassword({ currentPassword: passwordData.current, password: passwordData.new }),
                {
                    loading: 'Rotating master key...',
                    success: 'Password changed successfully. You will be logged out of all sessions.',
                    error: (err) => err?.response?.data?.message || 'Authorization failure — check your current password.',
                }
            );
            setPasswordData({ current: '', new: '', confirm: '' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const terminateSession = async (sessionId: string) => {
        try {
            await toast.promise(
                apiTerminateSession(sessionId),
                {
                    loading: 'Terminating node...',
                    success: 'Session terminated successfully.',
                    error: 'Failed to terminate session.',
                }
            );
            setSessions(sessions.filter(s => s._id !== sessionId));
        } catch {
            // toast.promise already showed the error
        }
    };

    const tabs = [
        { id: 'profile', label: 'Identity', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'sessions', label: 'Sessions', icon: Smartphone },
        { id: 'notifications', label: 'Signals', icon: Bell },
        { id: 'billing', label: 'Treasury', icon: CreditCard },
    ];

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-6">
                {/* Horizontal Sub-Navbar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap border ${activeTab === tab.id
                                ? 'bg-emerald-500 text-black font-bold border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : 'bg-white/5 text-zinc-400 hover:text-white border-white/5 hover:bg-white/10'
                                }`}
                        >
                            <tab.icon size={18} />
                            <span className="text-sm tracking-tight">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-8 items-start">
                    {/* Main Content Area */}
                    <div className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-12"
                            >
                                {activeTab === 'profile' && (
                                    <Identity
                                        formData={formData}
                                        setFormData={setFormData}
                                        handleSave={handleSave}
                                        isSaving={isSaving}
                                    />
                                )}

                                {activeTab === 'security' && (
                                    <Security
                                        passwordData={passwordData}
                                        setPasswordData={setPasswordData}
                                        handlePasswordChange={handlePasswordChange}
                                        isChangingPassword={isChangingPassword}
                                    />
                                )}

                                {activeTab === 'sessions' && (
                                    <Session
                                        sessions={sessions}
                                        terminateSession={terminateSession}
                                    />
                                )}

                                {activeTab === 'notifications' && (
                                    <Signals
                                        notifications={notifications}
                                        setNotifications={setNotifications}
                                    />
                                )}

                                {activeTab === 'billing' && (
                                    <div className="space-y-12">
                                        <Treasury />
                                        <AccountManage />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default UserSettings;
