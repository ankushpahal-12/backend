import React from 'react';
import { CheckCircle, List, MessageSquarePlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSupportWidget } from '../hooks/useSupportWidget';

export const SuccessMessage: React.FC = () => {
  const { navigateTo, activeTicketId } = useSupportWidget();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100"
      >
        <CheckCircle size={38} strokeWidth={2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-black text-slate-900 mb-2">Ticket Submitted!</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-[260px] leading-relaxed">
          We've received your request. Our support team will investigate and reply to you shortly.
        </p>
      </motion.div>

      {/* Ticket ID badge */}
      {activeTicketId && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-3 mb-6 w-full max-w-xs flex justify-between items-center"
        >
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Ticket ID</span>
          <span className="text-xs font-black text-slate-900 font-mono">
            #{activeTicketId.slice(-8).toUpperCase()}
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-2 w-full max-w-xs"
      >
        <button
          onClick={() => navigateTo('list')}
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200"
        >
          <List size={16} />
          View My Tickets
        </button>

        <button
          onClick={() => navigateTo('chat')}
          className="flex items-center justify-center gap-2 w-full py-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold text-sm transition-colors"
        >
          <MessageSquarePlus size={15} />
          Continue Chat
        </button>

        <button
          onClick={() => navigateTo('home')}
          className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors mt-1"
        >
          Back to Home
        </button>
      </motion.div>
    </motion.div>
  );
};
