import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, MinusCircle, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeContext } from '../../../../context/ThemeContext';
import api from '../../../../utils/api';

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  attemptId: string | null;
}

export const TestResultModal: React.FC<TestResultModalProps> = ({ isOpen, onClose, attemptId }) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && attemptId) {
      setLoading(true);
      api.get(`/v1/attempt/tests/results/${attemptId}`)
        .then(res => {
          setResult(res.data.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, attemptId]);

  if (!isOpen) return null;

  const percentage = result?.percentage || 0;
  const isPassed = result?.isPassed ?? false;
  const totalQuestions = result?.testId?.questions?.length || result?.totalQuestions || 0;
  const attemptedAnswers = result?.answers?.filter((a: any) => a.selectedOptions && a.selectedOptions.length > 0) || [];
  const correctCount = attemptedAnswers.filter((a: any) => a.isCorrect).length;
  const incorrectCount = attemptedAnswers.filter((a: any) => !a.isCorrect && a.selectedOptions.length > 0).length;
  const unattemptedCount = totalQuestions - attemptedAnswers.length;
  const totalMarks = result?.totalMarksPossible || result?.testId?.totalMarks || 0;
  
  const timeTakenStr = result?.startedAt && result?.submittedAt 
    ? new Date((new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime())).toISOString().substr(11, 8)
    : '--:--:--';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}
        >
          <div className={`sticky top-0 z-10 flex justify-between items-center p-6 border-b backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 ${isLightMode ? 'bg-slate-50 border-slate-200' : 'dark:bg-[#0d1117] border-white/10'}`}>
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Candidate Report</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <X size={20} className={isLightMode ? 'text-slate-600' : 'text-slate-400'} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !result ? (
              <div className="text-center py-20 text-slate-500">Report not found.</div>
            ) : (
              <>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border shadow-sm ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
                  <div>
                    <h3 className={`text-xl font-bold mb-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{result.testId?.title}</h3>
                    <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Candidate: {result.userId?.name} ({result.userId?.email})</p>
                  </div>
                  <button className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
                    <FileDown size={16} /> Download
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className={`col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl border shadow-sm ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
                    <div className="relative w-24 h-24 mb-4">
                      <svg viewBox="0 0 36 36" className={`w-full h-full ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <path className="stroke-current opacity-20" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="stroke-current" strokeWidth="3" strokeDasharray={`${percentage}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{percentage}%</span>
                      </div>
                    </div>
                    <p className={`font-bold text-xs ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>{isPassed ? 'Passed' : 'Failed'}</p>
                  </div>

                  <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-4">
                    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border shadow-sm ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
                      <CheckCircle size={24} className="text-emerald-500 mb-2" />
                      <span className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{correctCount}</span>
                      <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Correct</span>
                    </div>
                    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border shadow-sm ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
                      <XCircle size={24} className="text-rose-500 mb-2" />
                      <span className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{incorrectCount}</span>
                      <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Incorrect</span>
                    </div>
                    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border shadow-sm ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
                      <MinusCircle size={24} className="text-slate-400 mb-2" />
                      <span className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{unattemptedCount}</span>
                      <span className={`text-xs font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Unattempted</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
                  <div className="flex flex-col gap-4 text-sm font-medium">
                    <div className="flex justify-between pb-3 border-b border-dashed border-slate-200 dark:border-white/10">
                      <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Total Questions</span>
                      <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-dashed border-slate-200 dark:border-white/10">
                      <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Total Marks</span>
                      <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{totalMarks}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-dashed border-slate-200 dark:border-white/10">
                      <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Score Obtained</span>
                      <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{result.totalMarksObtained || 0}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-dashed border-slate-200 dark:border-white/10">
                      <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Time Taken</span>
                      <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{timeTakenStr}</span>
                    </div>
                    <div className="flex justify-between pb-3 border-b border-dashed border-slate-200 dark:border-white/10">
                      <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>Active Location (Session ID)</span>
                      <span className={`font-mono text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{result.activeSessionId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
