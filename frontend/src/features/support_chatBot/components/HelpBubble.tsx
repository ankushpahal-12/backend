import React from 'react';
import { MessageSquarePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupportWidget } from '../hooks/useSupportWidget';
import { useSupportWidgetContext } from '../context/SupportWidgetContext';

export const HelpBubble: React.FC = () => {
  const { isOpen, toggleWidget, unreadCount } = useSupportWidget();
  const { isAuthenticated } = useSupportWidgetContext();

  // Only show for authenticated non-admin users
  if (!isAuthenticated) return null;

  return (
    <motion.button
      onClick={toggleWidget}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center
        shadow-[0_8px_30px_rgba(79,70,229,0.35)] transition-colors duration-300
        ${isOpen
          ? 'bg-slate-800 text-white'
          : 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
        }
      `}
      aria-label="Toggle Support Chat"
      id="support-widget-bubble"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X size={22} strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <MessageSquarePlus size={22} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-indigo-600"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
