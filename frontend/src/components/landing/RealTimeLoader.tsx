import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RealTimeLoaderProps {
  message?: string;
  isVisible?: boolean;
  progress?: number;
  status?: 'loading' | 'processing' | 'submitting' | 'success' | 'error';
  subMessage?: string;
}

const RealTimeLoader: React.FC<RealTimeLoaderProps> = ({
  message = 'Processing...',
  isVisible = false,
  progress = 0,
  status = 'loading',
  subMessage,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'from-green-500 to-green-600';
      case 'error':
        return 'from-red-500 to-red-600';
      case 'processing':
        return 'from-amber-500 to-amber-600';
      case 'submitting':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'processing':
        return 'bg-amber-500';
      case 'submitting':
        return 'bg-blue-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return '✓ Completed';
      case 'error':
        return '✗ Error';
      case 'processing':
        return '⟳ Processing';
      case 'submitting':
        return '⊙ Submitting';
      default:
        return '⟳ Loading';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Loader Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 w-full max-w-sm mx-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-white/20 dark:border-slate-700/50">
              {/* Animated Loader Spinner */}
              <div className="flex justify-center mb-6">
                <div className="relative w-16 h-16">
                  {/* Outer Ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStatusColor()}`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{
                      mask: 'radial-gradient(circle, transparent 60%, black 100%)',
                    }}
                  />

                  {/* Inner Ring */}
                  <motion.div
                    className={`absolute inset-1 rounded-full bg-gradient-to-r ${getStatusColor()}`}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{
                      mask: 'radial-gradient(circle, black 70%, transparent 100%)',
                      opacity: 0.3,
                    }}
                  />

                  {/* Center Dot */}
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStatusColor()}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      mask: 'radial-gradient(circle 25%, black 100%)',
                    }}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {message}
                </h3>

                {subMessage && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {subMessage}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {progress > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Progress
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {Math.round(progress)}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${getStatusColor()}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Status Chip */}
              <div className="flex justify-center mb-4">
                <motion.span
                  className={`${getStatusBgColor()} text-white text-xs font-bold px-3 py-1.5 rounded-full`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getStatusMessage()}
                </motion.span>
              </div>

              {/* Footer Text */}
              <p className="text-center text-xs text-slate-600 dark:text-slate-400">
                Please wait while we process your request...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RealTimeLoader;
