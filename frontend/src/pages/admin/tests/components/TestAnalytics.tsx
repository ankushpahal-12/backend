import React from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { BarChart3, Users, Clock, Award } from 'lucide-react';

export const TestAnalytics: React.FC = () => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  const stats = [
    { title: 'Total Attempts', value: '1,245', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Avg. Score', value: '76%', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Avg. Time', value: '34m', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Completion Rate', value: '92%', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold mb-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>{stat.title}</p>
                <p className={`text-3xl font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <h3 className={`text-lg font-bold mb-4 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Performance Overview</h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {/* Mock Bar Chart */}
          {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
            <div key={i} className="w-full relative group">
              <div 
                className="absolute bottom-0 w-full rounded-t-lg bg-indigo-500 transition-all group-hover:bg-indigo-400"
                style={{ height: `${height}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
