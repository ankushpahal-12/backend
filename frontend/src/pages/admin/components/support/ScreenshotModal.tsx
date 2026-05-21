import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn } from 'lucide-react';

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({ isOpen, onClose, imageUrl }) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={24} />
        </button>

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-7xl max-h-[90vh] w-full flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center bg-slate-800 px-6 py-4 rounded-t-2xl border-b border-slate-700">
            <div className="flex items-center gap-3 text-slate-200">
              <ZoomIn size={20} className="text-indigo-400" />
              <h3 className="font-bold text-lg">Screenshot Inspector</h3>
            </div>
            <a
              href={imageUrl}
              download="screenshot.jpg"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Download size={16} />
              <span>Download Full Res</span>
            </a>
          </div>
          
          <div className="bg-slate-900 p-2 rounded-b-2xl overflow-auto custom-scrollbar flex items-center justify-center min-h-[50vh]">
            <img 
              src={imageUrl} 
              alt="Full Resolution Screenshot" 
              className="max-w-full object-contain rounded-lg shadow-2xl border border-slate-800"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
