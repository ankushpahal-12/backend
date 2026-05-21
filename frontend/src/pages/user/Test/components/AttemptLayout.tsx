import React from 'react';
import { Clock, Flag, Maximize, Minimize, Send } from 'lucide-react';
import type { Question, Answer, QuestionStatus } from '../types/attempt.types';
import { formatTime } from '../utils/attemptHelpers';

interface AttemptLayoutProps {
  testTitle: string;
  totalQuestions: number;
  timeLeft: number;
  isWarning: boolean;
  
  currentQuestion: Question;
  currentIndex: number;
  currentAnswer: Answer | undefined;
  
  isReviewMarked: boolean;
  questionStatuses: QuestionStatus[];
  
  isLightMode: boolean;
  isFullscreen: boolean;
  
  onSelectOption: (optionId: string) => void;
  onNavigate: (index: number) => void;
  onToggleReview: () => void;
  onSaveAndNext: () => void;
  onPrevious: () => void;
  onToggleFullscreen: () => void;
  onSubmit: () => void;
}

export const AttemptLayout: React.FC<AttemptLayoutProps> = ({
  testTitle, totalQuestions, timeLeft, isWarning,
  currentQuestion, currentIndex, currentAnswer,
  isReviewMarked, questionStatuses,
  isLightMode, isFullscreen,
  onSelectOption, onNavigate, onToggleReview,
  onSaveAndNext, onPrevious, onToggleFullscreen, onSubmit
}) => {
  const answeredCount = questionStatuses.filter(q => q.status === 'answered').length;
  const notAnsweredCount = questionStatuses.filter(q => q.status === 'not-answered').length;
  const markedCount = questionStatuses.filter(q => q.status === 'marked-review').length;
  const notVisitedCount = questionStatuses.filter(q => q.status === 'not-visited').length;

  return (
    <div className={`min-h-screen flex flex-col ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'}`}>
      {/* Top Navigation Bar */}
      <header className={`flex items-center justify-between px-6 py-4 shadow-sm z-10 ${
        isLightMode ? 'bg-white border-b border-slate-200' : 'bg-[#161b22] border-b border-white/10'
      }`}>
        <div className="flex flex-col">
          <h1 className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{testTitle}</h1>
          <span className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{totalQuestions} Questions</span>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${
            isWarning 
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
              : isLightMode ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0d1117] border-white/10 text-white'
          }`}>
            <Clock size={20} className={isWarning ? 'text-rose-500' : 'text-indigo-500'} />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 leading-none mb-1">Time Left</span>
              <span className="font-mono text-lg font-bold leading-none">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onToggleFullscreen} className={`p-2.5 rounded-lg transition-all ${
              isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}>
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
            <button onClick={onSubmit} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all">
              <Send size={18} />
              End Test
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Palette */}
        <aside className={`w-[320px] flex flex-col border-r shadow-sm z-0 ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'
        }`}>
          <div className="p-5 flex flex-col gap-3 text-sm font-medium border-b border-dashed border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-emerald-500" /> <span className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>Answered</span></div> <span className="font-bold">{answeredCount}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-rose-500" /> <span className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>Not Answered</span></div> <span className="font-bold">{notAnsweredCount}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-amber-500" /> <span className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>Marked for Review</span></div> <span className="font-bold">{markedCount}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-600" /> <span className={isLightMode ? 'text-slate-600' : 'text-slate-300'}>Not Visited</span></div> <span className="font-bold">{notVisitedCount}</span></div>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <h3 className={`font-bold mb-4 ${isLightMode ? 'text-slate-800' : 'text-white'}`}>Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {questionStatuses.map((q, idx) => {
                let bgColor = isLightMode ? 'bg-white border-slate-200 text-slate-600' : 'bg-[#0d1117] border-white/10 text-slate-400';
                if (q.status === 'answered') bgColor = 'bg-emerald-500 border-emerald-500 text-white';
                if (q.status === 'not-answered') bgColor = 'bg-rose-500 border-rose-500 text-white';
                if (q.status === 'marked-review') bgColor = 'bg-amber-500 border-amber-500 text-white';

                const isCurrent = currentIndex === idx;
                
                return (
                  <button
                    key={q.id}
                    onClick={() => onNavigate(idx)}
                    className={`aspect-square flex items-center justify-center rounded-lg border font-bold text-sm transition-all ${bgColor} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-[#161b22] scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 border-t border-slate-200 dark:border-white/10">
            <button onClick={onSubmit} className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all">
              <Send size={18} />
              Submit Test
            </button>
          </div>
        </aside>

        {/* Right Content - Question Area */}
        <main className="flex-1 flex flex-col relative">
          <div className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                <h2 className={`text-2xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Question {currentIndex + 1}</h2>
                <div className="flex items-center gap-4 text-sm font-bold">
                  <span className={`px-3 py-1 rounded-lg ${isLightMode ? 'bg-emerald-50 text-emerald-600' : 'bg-emerald-500/10 text-emerald-400'}`}>+{currentQuestion?.marks} Marks</span>
                </div>
              </div>

              <div className={`text-lg mb-8 whitespace-pre-line ${isLightMode ? 'text-slate-700' : 'text-slate-200'}`}>
                {currentQuestion?.text}
              </div>

              <div className="flex flex-col gap-3">
                {currentQuestion?.options.map((opt, i) => {
                  const isSelected = currentAnswer?.selectedOptions.includes(opt.id);
                  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onSelectOption(opt.id)}
                      className={`flex items-center text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? isLightMode ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-indigo-500 bg-indigo-500/10 text-white'
                          : isLightMode ? 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700' : 'border-white/10 bg-[#161b22] hover:border-indigo-500/40 text-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 transition-colors ${
                        isSelected 
                          ? 'bg-indigo-500 text-white' 
                          : isLightMode ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400'
                      }`}>
                        {letters[i]}
                      </div>
                      <span className="flex-1 text-base">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className={`p-6 border-t ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
            <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
              <button
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  currentIndex === 0 
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500' 
                    : isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                Previous
              </button>

              <button
                onClick={onToggleReview}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isReviewMarked
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : isLightMode ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                }`}
              >
                <Flag size={18} className={isReviewMarked ? 'fill-current' : ''} />
                {isReviewMarked ? 'Unmark Review' : 'Mark for Review'}
              </button>

              <button
                onClick={onSaveAndNext}
                className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all"
              >
                Save & Next
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
