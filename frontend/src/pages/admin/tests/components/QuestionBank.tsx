import React, { useState } from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Search, Filter, Plus, BookOpen } from 'lucide-react';

export const QuestionBank: React.FC = () => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const [search, setSearch] = useState('');

  // Dummy questions
  const dummyBank = [
    { id: '1', text: 'What is photosynthesis?', category: 'Biology', marks: 2 },
    { id: '2', text: 'Define Newton\'s Second Law.', category: 'Physics', marks: 3 },
    { id: '3', text: 'Calculate the area of a circle with r=5.', category: 'Mathematics', marks: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-500" size={24} />
            <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Question Bank
            </h2>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                  isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-950 text-white'
                }`}
              />
            </div>
            <button className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              isLightMode ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {dummyBank.map((q) => (
            <div key={q.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              isLightMode ? 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50' : 'border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5'
            }`}>
              <div>
                <p className={`font-medium mb-1 ${isLightMode ? 'text-slate-800' : 'text-slate-200'}`}>{q.text}</p>
                <div className="flex gap-3 text-xs">
                  <span className={`px-2 py-0.5 rounded-md font-medium ${isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                    {q.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md font-medium ${isLightMode ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'}`}>
                    {q.marks} Marks
                  </span>
                </div>
              </div>
              <button className={`p-2 rounded-lg transition-colors ${
                isLightMode ? 'text-indigo-600 hover:bg-indigo-100' : 'text-indigo-400 hover:bg-indigo-500/20'
              }`}>
                <Plus size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
