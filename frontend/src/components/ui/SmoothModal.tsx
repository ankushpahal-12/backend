import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const SmoothModal: React.FC<Props> = ({ open, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
          onClick={onClose}
        >
          <motion.div
            className="max-w-3xl w-full mx-4 bg-white rounded-xl shadow-2xl border border-[#e6ecf7] overflow-hidden"
            variants={modal}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#eef2f7] flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-700">Close</button>
            </div>
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmoothModal;
