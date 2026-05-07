import React, { useState } from 'react';
import {
    Search,
    Bell,
    User,
    Menu as MenuIcon,
    X,
    ChevronDown,
    Sparkles,
    LogOut,
    Settings,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

interface NavbarProps {
    onMenuClick: () => void;
    isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isSidebarOpen }) => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!user) return null; // Safety check

    const handleLogout = async () => {
        await logout();
    };

    return (
        <nav className={`sticky top-0 z-90 w-full backdrop-blur-xl border-b px-6 lg:px-10 py-4 transition-colors duration-300 ${
            isLightMode
                ? 'bg-white/65 border-indigo-200/50'
                : 'bg-slate-950/80 border-white/5'
        }`}>
            <div className="flex items-center justify-between gap-8 h-12">
                <div className="flex items-center gap-4">
                    {/* Menu Toggle */}
                    <button
                        onClick={onMenuClick}
                        className={`p-2.5 border rounded-xl transition-all ${
                            isLightMode
                                ? 'bg-white/80 border-indigo-200/70 text-indigo-700 hover:bg-indigo-50'
                                : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        {isSidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
                    </button>

                    {/* Branding */}
                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-9 h-9 bg-linear-to-r from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                            <Sparkles size={20} strokeWidth={2.5} />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className={`text-lg font-black leading-none tracking-tighter uppercase ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                                COPILOT
                            </h1>
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">AI Finance</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xl group relative hidden md:block">
                    <div className={`absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors ${isLightMode ? 'text-slate-500 group-focus-within:text-indigo-500' : 'text-zinc-500 group-focus-within:text-indigo-400'}`}>
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search across your financial stack..."
                        className={`w-full border rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 transition-all font-medium ${
                            isLightMode
                                ? 'bg-white/85 border-indigo-200/70 text-slate-900 placeholder:text-slate-500 focus:ring-indigo-500/20 focus:border-indigo-500/40'
                                : 'bg-white/5 border-white/5 text-white placeholder:text-zinc-600 focus:ring-indigo-500/20 focus:border-indigo-500/30'
                        }`}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${isLightMode ? 'text-slate-500 bg-indigo-50 border-indigo-200/70' : 'text-zinc-600 bg-white/5 border-white/5'}`}>⌘K</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Multi-tier notifications icon */}
                    <button className={`relative p-3 border rounded-2xl transition-all group overflow-hidden ${isLightMode ? 'bg-white/85 border-indigo-200/70 text-slate-600 hover:text-slate-900' : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'}`}>
                        <Bell size={20} />
                        <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-500 border-2 rounded-full ${isLightMode ? 'border-white' : 'border-zinc-950'}`} />
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isLightMode ? 'bg-indigo-500/10' : 'bg-indigo-500/10'}`} />
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-3 p-1.5 pr-4 border rounded-2xl transition-all group ${isLightMode ? 'bg-white/85 border-indigo-200/70 hover:bg-indigo-50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner group-hover:scale-105 transition-transform overflow-hidden ${isLightMode ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-zinc-800 border-white/10 text-indigo-400'}`}>
                                {user.avatar ? (
                                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={18} />
                                )}
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className={`text-xs font-black leading-tight tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{user.name}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`}>Enterprise Tier</p>
                            </div>
                            <ChevronDown size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''} ${isLightMode ? 'text-slate-500' : 'text-zinc-500'}`} />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className={`absolute right-0 mt-3 w-64 backdrop-blur-2xl border rounded-4xl shadow-2xl z-20 overflow-hidden p-2 ${isLightMode ? 'bg-white/95 border-indigo-200/70' : 'bg-zinc-900/95 border-white/10'}`}
                                    >
                                        <div className="p-4 mb-2">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Authenticated as</p>
                                            <p className={`text-sm font-black truncate ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{user.email}</p>
                                        </div>

                                        <div className="space-y-1">
                                            {[
                                                { icon: User, label: 'Neural Profile', path: '/user/settings' },
                                                { icon: CreditCard, label: 'Subscription', path: '/user/settings' },
                                                { icon: Settings, label: 'System Prefs', path: '/user/settings' },
                                            ].map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => navigate(item.path)}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-sm font-bold tracking-tight ${isLightMode ? 'text-slate-600 hover:text-slate-900 hover:bg-indigo-50' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    <item.icon size={18} />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className={`mt-2 pt-2 border-t ${isLightMode ? 'border-indigo-200/70' : 'border-white/5'}`}>
                                            <button
                                                onClick={handleLogout}
                                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-3xl transition-all text-sm font-black tracking-tight ${isLightMode ? 'text-rose-600 hover:bg-rose-100' : 'text-red-400 hover:bg-red-500/10'}`}
                                            >
                                                <div className={`p-2 rounded-xl ${isLightMode ? 'bg-rose-100' : 'bg-red-500/10'}`}>
                                                    <LogOut size={16} />
                                                </div>
                                                Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
