import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../../context/ThemeContext';

const PracticeFilters: React.FC = () => {
    const { mode } = useThemeContext();
    const isLightMode = mode === 'light';

    const selectWrapperClass = `relative flex items-center px-4 py-2 rounded-full border transition-all duration-300 ${
        isLightMode 
        ? 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-[0_4px_15px_rgba(99,102,241,0.1)]' 
        : 'bg-slate-900 border-white/10 text-slate-300 hover:border-indigo-500/50 hover:shadow-[0_4px_15px_rgba(99,102,241,0.2)]'
    }`;

    return (
        <div className="flex items-center justify-between pt-2">
            <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-[17px] font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}
            >
                All Topics
            </motion.h3>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
            >
                {/* Subjects Dropdown */}
                <motion.div whileHover={{ y: -2 }} className={selectWrapperClass}>
                    <select className="appearance-none bg-transparent pr-6 text-[13px] font-medium outline-none cursor-pointer w-full h-full">
                        <option>All Subjects</option>
                        <option>Biology</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 pointer-events-none text-slate-400" />
                </motion.div>

                {/* Difficulty Dropdown */}
                <motion.div whileHover={{ y: -2 }} className={selectWrapperClass}>
                    <select className="appearance-none bg-transparent pr-6 text-[13px] font-medium outline-none cursor-pointer w-full h-full">
                        <option>Difficulty: All</option>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 pointer-events-none text-slate-400" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PracticeFilters;
