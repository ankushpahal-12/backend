import React, { useState } from 'react';
import { useTests } from '../hooks/useTests';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Search, Plus, Filter, MoreVertical, Clock, CheckCircle, Play } from 'lucide-react';
import { TestTaking } from '../../components/TestTaking';

interface Test {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  category: string;
  status: 'draft' | 'published';
  questions: any[];
}

export const TestsPage: React.FC = () => {
  const { tests, loading } = useTests();
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const [takingTestId, setTakingTestId] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  // Filter only published tests for users to take
  const publishedTests = (tests as Test[]).filter(test => test.status === 'published');

  return (
    <>
      {/* Test Taking Modal */}
      {takingTestId && selectedTest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            isLightMode ? 'bg-white' : 'bg-slate-900'
          }`}>
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
              isLightMode ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-900'
            }`}>
              <h2 className={`text-xl font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {selectedTest.title}
              </h2>
              <button
                onClick={() => {
                  setTakingTestId(null);
                  setSelectedTest(null);
                }}
                className={`text-2xl transition-colors ${
                  isLightMode ? 'text-slate-400 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <TestTaking
                testId={takingTestId}
                testTitle={selectedTest.title}
                durationMinutes={selectedTest.durationMinutes}
                questions={selectedTest.questions}
                totalMarks={selectedTest.totalMarks}
                onSubmit={() => {
                  setTakingTestId(null);
                  setSelectedTest(null);
                }}
                onClose={() => {
                  setTakingTestId(null);
                  setSelectedTest(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Available Tests
            </h1>
            <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Take published tests and assess your knowledge
            </p>
          </div>
        </div>

        <div className={`rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
          {/* Toolbar */}
          <div className={`flex flex-col sm:flex-row gap-4 p-4 border-b ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}>
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
              <input
                type="text"
                placeholder="Search tests..."
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

          {/* List */}
          <div className="p-4">
            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading tests...</div>
            ) : publishedTests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">No published tests available.</div>
            ) : (
              <div className="space-y-3">
                {publishedTests.map(test => (
                  <div key={test.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                    isLightMode ? 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30' : 'border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{test.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          isLightMode ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          PUBLISHED
                        </span>
                      </div>
                      {test.description && (
                        <p className={`text-sm mb-2 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                          {test.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <span className={`flex items-center gap-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock size={14} /> {test.durationMinutes} mins
                        </span>
                        <span className={`flex items-center gap-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <CheckCircle size={14} /> {test.totalMarks} Marks
                        </span>
                        <span className={`px-2 py-0.5 rounded-md ${isLightMode ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                          {test.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setTakingTestId(test.id);
                          setSelectedTest(test);
                        }}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                          isLightMode
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <Play size={16} />
                        Take Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
