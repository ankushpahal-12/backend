import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <motion.button
      onClick={toggleColorMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-md border border-white/60 transition-all duration-300 text-slate-700 dark:text-slate-300"
      aria-label="Toggle theme"
    >
      {mode === 'light' ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Moon size={20} className="text-slate-400" />
      )}
    </motion.button>
  );
};
