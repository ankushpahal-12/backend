import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Medical Student',
    content: 'This AI platform literally saved my biology finals. It generated MCQs that were eerily similar to my actual exam questions.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
  },
  {
    name: 'David Chen',
    role: 'Software Engineer',
    content: 'I use it to quickly learn new programming paradigms. The instant explanations for why I got a question wrong are invaluable.',
    avatar: 'https://i.pravatar.cc/150?u=david',
  },
  {
    name: 'Emily Davis',
    role: 'High School Teacher',
    content: 'I generate quizzes for my students in seconds instead of hours. The custom difficulty settings make differentiation so easy.',
    avatar: 'https://i.pravatar.cc/150?u=emily',
  },
];

export const Testimonials = () => {
  return (
    <div className="relative py-24 z-10" id="testimonials">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Loved by Learners
          </h2>
          <p className="text-xl text-slate-600 font-medium">
            Don't just take our word for it. Here's what our users have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 flex flex-col justify-between"
            >
              <p className="text-slate-700 text-lg leading-relaxed mb-8 font-medium">
                "{test.content}"
              </p>
              
              <div className="flex items-center gap-4 pt-6 border-t border-white/40">
                <img src={test.avatar} alt={test.name} className="w-12 h-12 rounded-full ring-2 ring-white/80 shadow-sm" />
                <div>
                  <div className="font-bold text-slate-900 tracking-tight">{test.name}</div>
                  <div className="text-slate-500 text-sm font-semibold uppercase">{test.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
