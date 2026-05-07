import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home,
    ArrowLeft,
    Search,
    Compass,
    LayoutDashboard,
    Wallet,
    
    Settings,
    LogIn,
    UserPlus,
    FileText
} from 'lucide-react';
import { Navbar, Footer, DynamicBackground, SmoothScroll, Magnetic } from '../components/landing';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    const sitemap = [
        {
            title: 'Product',
            links: [
                { name: 'Home', icon: Home, path: '/' },
                { name: 'Features', icon: LayoutDashboard, path: '/#features' },
                { name: 'Benefits', icon: Wallet, path: '/#benefits' },
            ]
        },
        {
            title: 'Student Portal',
            links: [
                { name: 'Login', icon: LogIn, path: '/user/login' },
                { name: 'Register', icon: UserPlus, path: '/user/register' },
                { name: 'Dashboard', icon: LayoutDashboard, path: '/user/settings' },
            ]
        },
        {
            title: 'Teacher Portal',
            links: [
                { name: 'Teacher Login', icon: LogIn, path: '/admin/login' },
                { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
                { name: 'Settings', icon: Settings, path: '/admin/settings' },
            ]
        },
        {
            title: 'Compliance',
            links: [
                { name: 'Privacy Policy', icon: FileText, path: '/privacy-policy' },
                { name: 'Terms of Service', icon: FileText, path: '/terms-of-service' },
                { name: 'Settings', icon: Settings, path: '/user/settings' },
            ]
        }
    ];

    return (
        <SmoothScroll>
            <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 overflow-x-hidden relative">
                <DynamicBackground />
                <Navbar />

                {/* Header / Hero Section */}
                <div className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

                    {/* 404 Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative mb-12"
                    >
                        <h1 className="text-[12rem] md:text-[20rem] font-black text-white/5 leading-none select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{
                                    rotate: [0, 360],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="p-8 md:p-12 rounded-[3rem] bg-white/5 border border-purple-500/20 shadow-2xl shadow-purple-500/10 backdrop-blur-3xl relative"
                            >
                                <Search size={64} className="text-purple-500 md:w-20 md:h-20" />
                                {/* Decorative Bits */}
                                <div className="absolute -top-4 -right-4 w-12 h-12 border-t-2 border-r-2 border-purple-500/40 rounded-tr-2xl" />
                                <div className="absolute -bottom-4 -left-4 w-12 h-12 border-b-2 border-l-2 border-purple-500/40 rounded-bl-2xl" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="max-w-2xl relative z-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 uppercase italic">
                            Question Not <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Found</span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-10">
                            This MCQ question doesn't exist or has been moved. Let's get you back to practicing!
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Magnetic strength={0.3}>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-3 group backdrop-blur-md"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    Go Back
                                </button>
                            </Magnetic>
                            <Magnetic strength={0.3}>
                                <Link
                                    to="/"
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:opacity-90 transition-all flex items-center gap-3 shadow-lg shadow-purple-500/20 active:scale-95"
                                >
                                    <Home size={20} />
                                    Back to Practice
                                </Link>
                            </Magnetic>
                        </div>
                    </motion.div>
                </div>

                {/* Sitemap Section */}
                <div className="py-24 border-y border-white/5 bg-slate-900/30 backdrop-blur-xl">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-center gap-4 mb-16">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 border border-purple-500/20">
                                <Compass size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase italic">🧠 QuizMaster Pro</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Navigation Map</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                            {sitemap.map((section, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
                                        {section.title}
                                    </h4>
                                    <ul className="space-y-4">
                                        {section.links.map((link, lIdx) => {
                                            const Icon = link.icon;
                                            return (
                                                <li key={lIdx}>
                                                    <Link
                                                        to={link.path}
                                                        className="group flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                            <Icon size={14} />
                                                        </div>
                                                        {link.name}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </SmoothScroll>
    );
};

export default NotFound;
