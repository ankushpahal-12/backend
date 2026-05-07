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
    <footer className="relative pt-24 pb-10">

      {/* 🌟 Background Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%)]" />

      <div className="max-w-7xl mx-auto px-6">

        {/* MAIN CARD */}
        <div className="relative bg-slate-800/80 dark:bg-slate-950/90 
                        backdrop-blur-2xl border border-slate-700/60 
                        rounded-3xl p-10 md:p-16 shadow-xl overflow-hidden">

          {/* Glass shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

            {/* BRAND */}
            <div className="lg:col-span-2 space-y-6">

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="font-extrabold text-xl">AURA</span>
              </div>

              <p className="text-slate-300 dark:text-slate-200 leading-relaxed max-w-sm">
                Master MCQs with AI-powered learning, instant summaries, and personalized practice tests.
              </p>

              {/* SOCIAL */}
              <div className="flex gap-4 pt-2">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center 
                               bg-slate-700/60 dark:bg-slate-800/60 
                               border border-slate-600/60 
                               hover:border-indigo-500 hover:text-indigo-500 
                               transition-all"
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>

            </div>

            {/* LINKS */}
            {Object.entries(links).map(([section, items]) => (
              <div key={section} className="space-y-6">
                <h4 className="font-bold text-sm uppercase tracking-widest text-slate-900 dark:text-white">
                  {section}
                </h4>

                <div className="flex flex-col space-y-4">
                  {items.map((link) => (
                    <motion.button
                      key={link.label}
                      whileHover={{ x: 4 }}
                      onClick={() => handleLinkClick(link.href)}
                      className="text-left text-slate-300 dark:text-slate-200 
                                 hover:text-indigo-500 transition"
                    >
                      {link.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}

          </div>

          {/* BOTTOM BAR */}
          <div className="border-t border-slate-700/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-sm text-slate-300 font-medium">
              © 2026 AURA. All rights reserved.
            </p>

            <div className="flex gap-6">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-sm text-slate-300 hover:text-indigo-500 transition"
              >
                Privacy Policy
              </button>

              <button
                onClick={() => navigate('/terms-of-service')}
                className="text-sm text-slate-300 hover:text-indigo-500 transition"
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