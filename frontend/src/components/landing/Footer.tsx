import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';
import { initAuthSession } from '../../services/authService';
import toast from 'react-hot-toast';

const Footer = () => {
  const navigate = useNavigate();

  const handleLinkClick = async (href: string) => {
    // Auth routes need a session ID
    if (href === '/user/login') {
      try {
        const sid = await initAuthSession('login');
        navigate(`/user/login?sid=${sid}`);
      } catch { toast.error('Failed to initialize session.'); }
      return;
    }
    if (href === '/user/register') {
      try {
        const sid = await initAuthSession('signup');
        navigate(`/user/register?sid=${sid}&mode=signup`);
      } catch { toast.error('Failed to initialize session.'); }
      return;
    }
    navigate(href);
  };

  const links = {
    product: [
      { label: 'Student Login', href: '/user/login' },
      { label: 'Teacher Login', href: '/admin/login' },
      { label: 'Join Now', href: '/user/register' },
    ],
    company: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Contact Us', href: '/contact' },
    ],
    resources: [
      { label: 'Study Tips', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Support', href: '#' },
    ]
  };

  const socialLinks = [
    { icon: Github, href: '#' },
    { icon: Linkedin, href: '#' },
    { icon: Twitter, href: '#' },
  ];

  return (
    <footer className="relative pt-24 pb-12 w-full z-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.06),transparent_50%)]" />

      <div className="max-w-7xl mx-auto px-6 relative">
        
        {/* MAIN CARD */}
        <div className="relative bg-slate-50/60 dark:bg-slate-900/30 
                        backdrop-blur-3xl border border-slate-200/60 dark:border-slate-800/80 
                        rounded-[2.5rem] p-10 md:p-16 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden">

          {/* Glass shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

          {/* Massive Low-Opacity Watermark */}
          <div className="absolute bottom-[-8%] right-[-5%] text-[10rem] sm:text-[14rem] md:text-[18rem] font-black text-slate-200/30 dark:text-slate-800/10 select-none pointer-events-none z-0 tracking-tighter">
            AURA
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16 relative z-10">

            {/* BRAND */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md">
                  A
                </div>
                <span className="font-black text-xl text-slate-950 dark:text-white tracking-wider">AURA</span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm font-semibold text-sm">
                Master MCQs and synthesize complex curriculum modules with AI-powered study cycles, instant breakdowns, and smart question generation tracks.
              </p>

              {/* SOCIAL */}
              <div className="flex gap-4 pt-2">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center 
                               bg-slate-100 dark:bg-slate-800/50 
                               border border-slate-200/60 dark:border-slate-800/80 
                               text-slate-600 dark:text-slate-400
                               hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 
                               transition-all shadow-sm"
                  >
                    <social.icon size={16} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* LINKS */}
            {Object.entries(links).map(([section, items]) => (
              <div key={section} className="space-y-6">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-950 dark:text-white">
                  {section}
                </h4>

                <div className="flex flex-col space-y-4">
                  {items.map((link) => (
                    <motion.button
                      key={link.label}
                      whileHover={{ x: 4 }}
                      onClick={() => handleLinkClick(link.href)}
                      className="text-left text-slate-500 dark:text-slate-400 text-sm font-bold
                                 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      {link.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

          </div>

          {/* BOTTOM BAR */}
          <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              © 2026 AURA. All rights reserved. Built for learners worldwide.
            </p>

            <div className="flex gap-6">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Privacy Policy
              </button>

              <button
                onClick={() => navigate('/terms-of-service')}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Terms of Service
              </button>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;