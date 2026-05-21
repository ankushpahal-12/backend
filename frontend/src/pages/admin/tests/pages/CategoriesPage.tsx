import React from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Plus, Folder } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';

  const dummyCategories = [
    { id: '1', name: 'Biology', testsCount: 12, questionsCount: 145 },
    { id: '2', name: 'Physics', testsCount: 8, questionsCount: 92 },
    { id: '3', name: 'Mathematics', testsCount: 15, questionsCount: 210 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            Categories
          </h1>
          <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Organize your tests and questions
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-700">
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyCategories.map((cat) => (
          <div key={cat.id} className={`p-6 rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl ${isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                <Folder size={24} />
              </div>
              <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{cat.name}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>{cat.testsCount} Tests</span>
              <span className={isLightMode ? 'text-slate-600' : 'text-slate-400'}>{cat.questionsCount} Questions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
