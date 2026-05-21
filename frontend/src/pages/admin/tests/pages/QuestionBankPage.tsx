import React from 'react';
import { QuestionBank } from '../components/QuestionBank';
import { useThemeContext } from '../../../../context/ThemeContext';

export const QuestionBankPage: React.FC = () => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
          Question Bank
        </h1>
        <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Manage your repository of reusable questions
        </p>
      </div>
      <QuestionBank />
    </div>
  );
};
