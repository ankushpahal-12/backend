import React from 'react';
import { TestAnalytics } from '../components/TestAnalytics';
import { useThemeContext } from '../../../../context/ThemeContext';

export const TestAnalyticsPage: React.FC = () => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
          Test Analytics
        </h1>
        <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Overview of test performance and attempt statistics
        </p>
      </div>
      <TestAnalytics />
    </div>
  );
};
