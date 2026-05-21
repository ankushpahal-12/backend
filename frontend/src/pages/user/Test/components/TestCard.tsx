import React from 'react';
import { Clock, CheckCircle, FileText, Lock, Globe, Calendar } from 'lucide-react';
import type { PublicTest } from '../types/attempt.types';

interface TestCardProps {
  test: PublicTest & { startAt?: string; endAt?: string; visibility?: string };
  onAttempt: (testId: string) => void;
  isLightMode: boolean;
  isAssigned?: boolean;
  testType?: string;
}

export const TestCard: React.FC<TestCardProps> = ({ 
  test, 
  onAttempt, 
  isLightMode,
  isAssigned = true,
  testType = 'public'
}) => {
  const isPrivate = testType === 'private' || test.visibility === 'private';
  const canAccess = isPrivate ? isAssigned : true;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', month: 'short', year: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const startDate = formatDate(test.startAt);
  const endDate = formatDate(test.endAt);
  
  return (
    <div className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 ${
      isLightMode 
        ? 'bg-white border-slate-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300' 
        : 'bg-[#161b22] border-white/10 hover:bg-[#1c2128] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
          <FileText size={24} />
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {isPrivate ? (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border flex items-center gap-1 ${
              isLightMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <Lock size={12} />
              Private
            </span>
          ) : (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border flex items-center gap-1 ${
              isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Globe size={12} />
              Public
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${
            isLightMode ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            {test.category}
          </span>
        </div>
      </div>

      <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
        {test.title}
      </h3>
      
      {test.description && (
        <p className={`text-sm mb-4 line-clamp-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
          {test.description}
        </p>
      )}

      {/* Date/Time Info */}
      {(startDate || endDate) && (
        <div className={`mb-4 space-y-2 text-xs ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
          {startDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-500 shrink-0" />
              <span>Opens: <span className="font-semibold">{startDate}</span></span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-rose-500 shrink-0" />
              <span>Closes: <span className="font-semibold">{endDate}</span></span>
            </div>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-4">
        <div className={`grid grid-cols-2 gap-3 text-sm font-semibold ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            {test.durationMinutes} mins
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            {test.totalMarks} Marks
          </div>
        </div>

        <button
          onClick={() => onAttempt(test.id)}
          disabled={!canAccess}
          className={`w-full mt-2 py-3 px-4 rounded-xl font-bold transition-all ${
            canAccess
              ? 'text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]'
              : `text-white bg-gradient-to-r from-slate-400 to-slate-500 cursor-not-allowed opacity-60 ${isLightMode ? '' : ''}`
          }`}
          title={!canAccess ? 'You are not assigned to this test' : 'Start taking this test'}
        >
          {canAccess ? 'Start Attempt' : 'Not Assigned'}
        </button>
      </div>
    </div>
  );
};
