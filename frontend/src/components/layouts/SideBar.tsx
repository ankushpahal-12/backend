import React, { useState } from 'react';
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Sparkles,
    LogOut,
    User,
    Settings,
    CreditCard,
    Moon,
    Sun,
    PanelLeftClose,
    ChevronDown,
    FileText
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import { Note } from '@mui/icons-material';

interface SideBarProps {
    open: boolean;
    onClose: () => void;
    width: number;
}

interface SubmenuItem {
    text: string;
    path: string;
}

interface NavItem {
    text: string;
    icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>;
    path: string;
    submenu?: SubmenuItem[];
}

const SideBar: React.FC<SideBarProps> = ({ open, onClose, width }) => {
    const location = useLocation();
    const { logout } = useAuth();
    const { mode, toggleColorMode } = useThemeContext();
    const isLightMode = mode === 'light';
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

    const isAdmin = location.pathname.startsWith('/admin');

    const navItems: NavItem[] = isAdmin ? [
        { text: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { text: 'User Management', icon: User, path: '/admin/users' },
        { text: 'Security', icon: Settings, path: '/admin/security' },
        { text: 'Settings', icon: Settings, path: '/admin/settings' },
        { text: 'Subscriptions', icon: CreditCard, path: '/admin/subscriptions' },
        { text: 'Support Tickets', icon: BookOpen, path: '/admin/support/tickets' },
        { 
            text: 'Tests', 
            icon: FileText, 
            path: '/admin/tests',
            submenu: [
                { text: 'All Tests', path: '/admin/tests' },
                { text: 'Create Test', path: '/admin/tests/create' },
                { text: 'Question Bank', path: '/admin/tests/question-bank' },
                { text: 'Categories', path: '/admin/tests/categories' },
                { text: 'Analytics', path: '/admin/tests/analytics' },
            ]
        },
    ] : [
        { text: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
        { text: 'Practice', icon: BookOpen, path: '/user/practice' },
        { text: 'Notes', icon: Note, path: '/user/notes'},
        { text: 'Analytics', icon: BarChart3, path: '/user/analytics' },
        { text: 'AI Insights', icon: Sparkles, path: '/user/ai-insights' },
        { text: 'Pricing', icon: CreditCard, path: '/user/pricing' },
        { text: 'Support', icon: BookOpen, path: '/user/support' },
        { text: 'Profile', icon: User, path: '/user/profile' },
        { text: 'Settings', icon: Settings, path: '/user/settings' },
    ];

    const handleLogout = async () => {
        await logout();
    };

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: -width, opacity: 0 }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className={`fixed inset-0 backdrop-blur-sm z-110 lg:hidden ${isLightMode ? 'bg-slate-900/20' : 'bg-black/60'}`}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial="closed"
                animate={open ? "open" : "closed"}
                variants={sidebarVariants}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed top-0 left-0 h-screen z-120 border-r backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl transition-colors duration-300 ${
                    isLightMode
                        ? 'border-indigo-200/70 bg-white/88 shadow-indigo-200/40'
                        : 'border-indigo-200/10 bg-slate-950/95 shadow-indigo-950/50'
                }`}
                style={{ width }}
            >
                <div className="pointer-events-none absolute inset-0">
                    <div className={`absolute -top-28 -left-28 h-72 w-72 rounded-full blur-3xl ${isLightMode ? 'bg-indigo-300/35' : 'bg-indigo-500/20'}`} />
                    <div className={`absolute bottom-0 -right-24 h-64 w-64 rounded-full blur-3xl ${isLightMode ? 'bg-violet-200/35' : 'bg-violet-500/15'}`} />
                </div>

                <div className="relative px-4 pt-2 pb-2">
                    <div className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 ${isLightMode ? 'border-indigo-200/70 bg-white/80' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 text-white">
                                <Sparkles size={14} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">FinTrack</p>
                                <p className={`text-xs font-bold ${isLightMode ? 'text-slate-800' : 'text-white/85'}`}>User Panel</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`grid h-8 w-8 place-items-center rounded-xl border transition-colors ${isLightMode ? 'border-indigo-200/70 bg-white text-slate-600 hover:bg-indigo-50 hover:text-slate-900' : 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'}`}
                            aria-label="Close sidebar"
                        >
                            <PanelLeftClose size={16} />
                        </button>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="relative flex-1 px-2 overflow-y-auto space-y-1 py-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = location.pathname === item.path;
                        const hasSubmenu = item.submenu && item.submenu.length > 0;
                        const isSubmenuOpen = openSubmenu === item.text;

                        if (hasSubmenu) {
                            return (
                                <div key={item.text} className="space-y-1">
                                    <button
                                        onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.text)}
                                        className={`group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative ${active
                                            ? `${isLightMode ? 'text-white' : 'text-white'} font-bold shadow-lg shadow-indigo-500/25`
                                            : `${isLightMode ? 'text-slate-700 hover:text-slate-900 hover:bg-indigo-50/80' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                                            <span className="text-sm tracking-tight">{item.text}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="relative z-10"
                                        >
                                            <ChevronDown size={16} />
                                        </motion.div>
                                        {active && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isSubmenuOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden pl-11 space-y-1"
                                            >
                                                {item.submenu?.map((subItem) => {
                                                    const subActive = location.pathname === subItem.path;
                                                    return (
                                                        <Link
                                                            key={subItem.text}
                                                            to={subItem.path}
                                                            onClick={() => window.innerWidth < 1024 && onClose()}
                                                            className={`block px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                                                                subActive
                                                                    ? `${isLightMode ? 'text-indigo-600 bg-indigo-50/80' : 'text-indigo-400 bg-white/10'} font-bold`
                                                                    : `${isLightMode ? 'text-slate-500 hover:text-slate-900 hover:bg-indigo-50/50' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
                                                            }`}
                                                        >
                                                            {subItem.text}
                                                        </Link>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.text}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative ${active
                                    ? `${isLightMode ? 'text-white' : 'text-white'} font-bold shadow-lg shadow-indigo-500/25`
                                    : `${isLightMode ? 'text-slate-700 hover:text-slate-900 hover:bg-indigo-50/80' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`
                                    }`}
                            >
                                <Icon size={20} strokeWidth={active ? 2.5 : 2} className="relative z-10" />
                                <span className="text-sm tracking-tight relative z-10">{item.text}</span>
                                {active && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* AI Upgrade Card */}
                {/* Footer Controls */}
                <div className="relative mt-auto px-6 pb-2 pt-0.5 space-y-1 sm:space-y-1.5">
                    <button
                        onClick={toggleColorMode}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border transition-colors group ${isLightMode ? 'border-indigo-200/70 bg-white/80 text-slate-700 hover:bg-indigo-50' : 'border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10'}`}
                        aria-label="Toggle theme"
                    >
                        <span className="text-sm font-bold tracking-tight">Theme</span>
                        <span className={`grid h-8 w-8 place-items-center rounded-xl ${isLightMode ? 'bg-indigo-100 text-indigo-600 group-hover:text-indigo-700' : 'bg-white/10 text-indigo-300 group-hover:text-indigo-200'}`}>
                            {mode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                        </span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-2xl transition-colors group ${isLightMode ? 'text-rose-600 hover:bg-rose-100' : 'text-red-300 hover:bg-red-500/10'}`}
                    >
                        <LogOut size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-bold tracking-tight">Sign Out</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default SideBar;
