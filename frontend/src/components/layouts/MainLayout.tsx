import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import SideBar from './SideBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext';
import { Menu } from 'lucide-react';


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';
    const sidebarWidth = isLargeScreen ? 240 : Math.min(280, Math.max(240, Math.round(viewportWidth * 0.78)));

    useEffect(() => {
        const handleResize = () => {
            const nextWidth = window.innerWidth;
            setViewportWidth(nextWidth);
            setIsLargeScreen(nextWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isLargeScreen) {
            setSidebarOpen(false);
        }
    }, [isLargeScreen]);

    return (
        <div className={`min-h-screen flex font-sans selection:bg-indigo-500/30 transition-colors duration-300 ${
            isLightMode
                ? 'bg-linear-to-br from-white via-purple-50/60 to-indigo-50/70 text-slate-900'
                : 'bg-slate-950 text-slate-100'
        }`}>
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute inset-0 ${isLightMode ? 'bg-linear-to-br from-white via-purple-50/50 to-indigo-50/50' : 'bg-linear-to-br from-slate-950 via-slate-900/80 to-indigo-950/50'}`} />
                <div className={`absolute -top-[8%] -left-[12%] w-[45%] h-[45%] rounded-full blur-[120px] ${isLightMode ? 'bg-linear-to-br from-rose-200/30 via-orange-100/20 to-transparent opacity-70' : 'bg-indigo-500/20 opacity-40'}`} />
                <div className={`absolute bottom-[-14%] right-[-8%] w-[55%] h-[55%] rounded-full blur-[130px] ${isLightMode ? 'bg-linear-to-tl from-pink-100/40 to-transparent opacity-70' : 'bg-violet-500/20 opacity-35'}`} />
            </div>
            {/* Sidebar */}
            <SideBar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                width={sidebarWidth}
            />

            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                    className={`fixed top-5 left-5 z-130 p-2.5 rounded-xl border backdrop-blur-xl transition-all ${
                        isLightMode
                            ? 'bg-white/90 border-indigo-200/70 text-indigo-700 hover:bg-indigo-50'
                            : 'bg-slate-900/80 border-white/10 text-zinc-200 hover:bg-slate-800/90'
                    }`}
                >
                    <Menu size={20} />
                </button>
            )}

            {/* Main Content */}
            <div
                className="relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
                style={{ paddingLeft: sidebarOpen && isLargeScreen ? sidebarWidth : 0 }}
            >
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

                <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={window.location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
                {/* <AIAssistantDrawer /> */}
            </div>
        </div>
    );
};

export default MainLayout;
