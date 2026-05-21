import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MinusCircle, FileDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../../../context/ThemeContext';
import * as attemptApi from '../services/attemptApi';


export const AttemptResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) {
        navigate('/');
        return;
      }
      const res = await attemptApi.getAttemptResult(attemptId);
      if (res.success && res.data) {
        setResult(res.data);
      }
      setLoading(false);
    };
    fetchResult();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
        <p className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Result not found.</p>
      </div>
    );
  }

  const percentage = result.percentage || 0;
  const isPassed = result.isPassed ?? false;
  const totalQuestions = result.testId?.questions?.length || result.totalQuestions || 0;
  
  // Calculate correct/incorrect from the answers array
  const attemptedAnswers = result.answers?.filter((a: any) => a.selectedOptions && a.selectedOptions.length > 0) || [];
  const correctCount = attemptedAnswers.filter((a: any) => a.isCorrect).length;
  const incorrectCount = attemptedAnswers.filter((a: any) => !a.isCorrect && a.selectedOptions.length > 0).length;
  const unattemptedCount = totalQuestions - attemptedAnswers.length;
  
  const totalMarks = result.totalMarksPossible || result.testId?.totalMarks || 0;
  const timeTakenStr = result.startedAt && result.submittedAt 
    ? new Date((new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime())).toISOString().substr(11, 8)
    : '--:--:--';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className={`min-h-screen p-6 lg:p-12 overflow-hidden ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
      <motion.div 
        className="max-w-5xl mx-auto space-y-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl shadow-sm border ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'
        }`}>
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              {result.testId?.title || 'Test Result'}
            </h1>
            <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Attempted on {new Date(result.startedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <button className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
            <FileDown size={18} />
            Download Report
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Score Donut */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ scale: 1.02 }}
            className={`col-span-1 flex flex-col items-center justify-center p-8 rounded-2xl shadow-sm border ${
            isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'
          }`}>
            <div className="relative w-32 h-32 mb-4">
              {/* Fake Donut Chart */}
              <svg viewBox="0 0 36 36" className={`w-full h-full ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                <path
                  className="stroke-current opacity-20"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-current"
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{percentage}%</span>
              </div>
            </div>
            <p className={`font-bold text-sm ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPassed ? 'Well done! You passed.' : 'Better luck next time.'}
            </p>
          </motion.div>

          {/* Breakdown Stats */}
          <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4">
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
              <CheckCircle size={32} className="text-emerald-500 mb-3" />
              <span className={`text-2xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{correctCount}</span>
              <span className={`text-sm font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Correct</span>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
              <XCircle size={32} className="text-rose-500 mb-3" />
              <span className={`text-2xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{incorrectCount}</span>
              <span className={`text-sm font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Incorrect</span>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className={`flex flex-col items-center justify-center p-6 rounded-2xl shadow-sm border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
              <MinusCircle size={32} className="text-slate-400 mb-3" />
              <span className={`text-2xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{unattemptedCount}</span>
              <span className={`text-sm font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Unattempted</span>
            </motion.div>
          </div>
        </div>

        {/* Details List */}
        <motion.div variants={itemVariants} className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
          <div className="flex flex-col gap-4 text-sm font-medium">
            <div className="flex justify-between pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Total Questions</span>
              <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{totalQuestions}</span>
            </div>
            <div className="flex justify-between pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Total Marks</span>
              <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{totalMarks}</span>
            </div>
            <div className="flex justify-between pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Score Obtained</span>
              <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{result.totalMarksObtained || 0}</span>
            </div>
            <div className="flex justify-between pb-4 border-b border-dashed border-slate-200 dark:border-white/10">
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Time Taken</span>
              <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{timeTakenStr}</span>
            </div>
            <div className="flex justify-between">
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Status</span>
              <span className="font-bold text-emerald-500">Completed</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
