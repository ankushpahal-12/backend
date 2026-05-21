import React from 'react';
import { AlertCircle, Clock, ShieldAlert, LogOut } from 'lucide-react';

export type ModalType = 'submit' | 'timeout' | 'leave' | 'warning';

interface AttemptModalProps {
  isOpen: boolean;
  type: ModalType;
  onConfirm: () => void;
  onCancel?: () => void;
  isLightMode: boolean;
  metadata?: {
    answeredCount?: number;
    totalQuestions?: number;
    violationMessage?: string;
  };
}

export const AttemptModal: React.FC<AttemptModalProps> = ({ 
  isOpen, type, onConfirm, onCancel, isLightMode, metadata 
}) => {
  if (!isOpen) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'submit':
        return {
          icon: <AlertCircle size={48} className="text-indigo-500" />,
          title: 'Submit Test?',
          desc: `You have answered ${metadata?.answeredCount || 0} out of ${metadata?.totalQuestions || 0} questions.\nAre you sure you want to submit the test?`,
          confirmText: 'Submit Test',
          confirmClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          showCancel: true
        };
      case 'timeout':
        return {
          icon: <Clock size={48} className="text-amber-500" />,
          title: "Time's Up!",
          desc: "Your time is over. Your test will be submitted automatically.",
          confirmText: 'OK',
          confirmClass: 'bg-indigo-600 hover:bg-indigo-500 text-white',
          showCancel: false
        };
      case 'leave':
        return {
          icon: <LogOut size={48} className="text-rose-500" />,
          title: 'Leave Test?',
          desc: 'If you leave now, your progress might be lost or the test will be auto-submitted.\nAre you sure you want to exit?',
          confirmText: 'Leave',
          confirmClass: 'bg-rose-600 hover:bg-rose-500 text-white',
          showCancel: true
        };
      case 'warning':
        return {
          icon: <ShieldAlert size={48} className="text-amber-500" />,
          title: 'Warning',
          desc: metadata?.violationMessage || 'Our system has detected suspicious activity. This will be recorded.',
          confirmText: 'OK',
          confirmClass: 'bg-amber-600 hover:bg-amber-500 text-white',
          showCancel: false
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 ${
        isLightMode ? 'bg-white text-slate-900' : 'bg-[#161b22] text-white border border-white/10'
      }`}>
        <div className="mb-6">{config.icon}</div>
        <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
        <p className={`mb-8 whitespace-pre-line ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
          {config.desc}
        </p>
        
        <div className="flex items-center gap-4 w-full">
          {config.showCancel && onCancel && (
            <button
              onClick={onCancel}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                isLightMode 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${config.confirmClass}`}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
