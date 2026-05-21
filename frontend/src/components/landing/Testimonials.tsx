import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Medical Student',
    content: 'This AI platform literally saved my biology finals. It generated MCQs that were eerily similar to my actual exam questions.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    rating: 5,
    tag: 'Aced Biology'
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    content: 'I use it to quickly learn new programming paradigms. The instant explanations for why I got a question wrong are invaluable.',
    avatar: 'https://i.pravatar.cc/150?u=david',
    rating: 5,
    tag: 'CS Learner'
  },
  {
    name: 'Emily Davis',
    role: 'High School Teacher',
    content: 'I generate quizzes for my students in seconds instead of hours. The custom difficulty settings make differentiation so easy.',
    avatar: 'https://i.pravatar.cc/150?u=emily',
    rating: 5,
    tag: 'Educator'
  },
  {
    name: 'Marcus Vance',
    role: 'Pre-Law Student',
    content: 'The dynamic doubt-solving feature acts as a 24/7 personal tutor. My retention rate went up by 40% in just two weeks.',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    rating: 5,
    tag: 'Retention Up'
  },
  {
    name: 'Priya Patel',
    role: 'MBA Candidate',
    content: 'Radar Analytics helped me pinpoint exactly which economics concepts I was weakest in. Highly recommended for busy professionals!',
    avatar: 'https://i.pravatar.cc/150?u=priya',
    rating: 5,
    tag: 'Pinpoint Analytics'
  },
  {
    name: 'Alex Mercer',
    role: 'Cognitive Science',
    content: 'The synthesis of concepts into interactive cards is brilliant. The custom difficulty scaling really helps lock in definitions.',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    rating: 5,
    tag: 'Cognitive Boost'
  },
  {
    name: 'Dr. Elena Rostova',
    role: 'Adjunct Professor',
    content: 'Finally, a platform that understands educational taxonomy. Aura\'s question generation is pedagogically sound and incredibly fast.',
    avatar: 'https://i.pravatar.cc/150?u=elena',
    rating: 5,
    tag: 'Pedagogical Gold'
  },
  {
    name: 'Jordan Hayes',
    role: 'Undergraduate',
    content: 'I love the clean interface and the game-like progression. Practice tests actually feel exciting rather than a boring chore.',
    avatar: 'https://i.pravatar.cc/150?u=jordan',
    rating: 5,
    tag: 'Fun Learning'
  },
];

// Split testimonials into two rows
const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4, 8);

export const Testimonials = () => {
  return (
    <section className="relative py-32 z-10 overflow-hidden" id="testimonials">
      {/* Dynamic Keyframes for Marquees */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 35s linear infinite;
        }
        .animate-marquee-right {
          animation: marquee-right 35s linear infinite;
        }
        .marquee-container:hover .animate-marquee-left,
        .marquee-container:hover .animate-marquee-right {
          animation-play-state: paused;
        }
      `}} />

      {/* Decorative Glows */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] rounded-full bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-pink-500/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="text-center max-w-3xl mx-auto mb-20 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 rounded-full backdrop-blur-md">
            <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              User Testimonials
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
            Loved by <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">Thousands</span> of Learners
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto pt-2">
            See how students, teachers, and professionals are mastering their study goals and elevating their scores.
          </p>
        </motion.div>
      </div>

      {/* Outer Marquee Wrapper with Pause-on-Hover class */}
      <div className="marquee-container flex flex-col gap-6 w-full overflow-hidden py-4 cursor-grab active:cursor-grabbing">
        
        {/* First Row: Scrolls Left */}
        <div className="flex gap-6 w-[200%] select-none">
          <div className="flex gap-6 animate-marquee-left">
            {[...row1, ...row1, ...row1, ...row1].map((test, index) => (
              <TestimonialCard key={`row1-${index}`} test={test} />
            ))}
          </div>
        </div>

        {/* Second Row: Scrolls Right */}
        <div className="flex gap-6 w-[200%] select-none">
          <div className="flex gap-6 animate-marquee-right">
            {[...row2, ...row2, ...row2, ...row2].map((test, index) => (
              <TestimonialCard key={`row2-${index}`} test={test} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
  tag: string;
}

const TestimonialCard = ({ test }: { test: Testimonial }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="w-[380px] flex-shrink-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/60 dark:border-slate-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.2)] hover:border-indigo-400/50 dark:hover:border-indigo-500/40 transition-colors duration-300 group flex flex-col justify-between"
    >
      <div>
        {/* Rating and Tag */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-0.5 text-amber-400">
            {[...Array(test.rating)].map((_, i) => (
              <Star key={i} size={15} fill="currentColor" className="stroke-none" />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            {test.tag}
          </span>
        </div>

        {/* Content */}
        <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-semibold mb-6 italic">
          "{test.content}"
        </p>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
        <div className="relative">
          <img 
            src={test.avatar} 
            alt={test.name} 
            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" 
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] text-white font-black">
            ✓
          </div>
        </div>
        <div>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
            {test.name}
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-0.5">
            {test.role}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Testimonials;
