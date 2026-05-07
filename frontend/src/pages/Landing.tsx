import React from 'react';
import { 
  Navbar, 
  Hero, 
  Features, 
  Stats, 
  HowItWorks, 
  Testimonials, 
  Pricing, 
  CallToAction,
  Footer
} from '../components/landing';

const Landing: React.FC = () => {
  return (
    <main className="relative w-full min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden text-slate-900 dark:text-slate-50 font-sans selection:bg-purple-500/30 transition-colors duration-300">
      
      {/* Global Soft Mesh Background Overlay - Enhanced Glassmorphism */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Animated Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/50 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900/80 dark:to-indigo-950/50" />
        
        {/* Top Left Peach - Enhanced Animation */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-rose-200/40 via-orange-100/25 to-transparent blur-[120px] opacity-50 dark:opacity-30 animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Top Right Purple */}
        <div className="absolute top-[0%] -right-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-bl from-purple-200/40 via-pink-100/25 to-transparent blur-[140px] opacity-60 dark:opacity-40" />
        
        {/* Center Blue/Indigo */}
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-gradient-to-b from-indigo-100/30 to-transparent blur-[150px] opacity-40 dark:opacity-20" />
        
        {/* Bottom Pink */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-pink-100/40 to-transparent blur-[130px] opacity-50 dark:opacity-30 animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Navbar transparent={false} />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CallToAction />
        <Footer companyName="Aura Learn" year={new Date().getFullYear()} />
      </div>
    </main>
  );
};

export default Landing;
