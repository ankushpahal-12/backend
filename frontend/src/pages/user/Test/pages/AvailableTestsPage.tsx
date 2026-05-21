import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useThemeContext } from '../../../../context/ThemeContext';
import * as attemptApi from '../services/attemptApi';
import type { PublicTest } from '../types/attempt.types';
import { TestCard } from '../components/TestCard';
import DashboardLayout from '../../Dashboard/DashboardLayout';

export const AvailableTestsPage: React.FC = () => {
  const [tests, setTests] = useState<PublicTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      const result = await attemptApi.fetchAvailableTests();
      if (result.success) {
        setTests(result.data || []);
      }
      setLoading(false);
    };
    fetchTests();
  }, []);

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout 
      title="Available Tests" 
      subtitle="Take a public test or participate in live assessments."
    >
      <div className={`p-6 lg:p-12 ${isLightMode ? 'bg-slate-50' : 'bg-[#0d1117]'} rounded-3xl w-full`}>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="relative w-full max-w-sm ml-auto">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                isLightMode
                  ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                  : 'bg-[#161b22] border-white/10 text-white placeholder-slate-500 focus:bg-[#1c2128]'
              }`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Loading available tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 text-center rounded-3xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#161b22] border-white/10'}`}>
            <div className={`p-6 rounded-full mb-4 ${isLightMode ? 'bg-slate-50' : 'bg-white/5'}`}>
              <Search size={32} className={isLightMode ? 'text-slate-300' : 'text-slate-600'} />
            </div>
            <h3 className={`text-lg font-bold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>No tests found</h3>
            <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
              No tests match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map(test => (
              <TestCard 
                key={test.id} 
                test={test} 
                onAttempt={(testId) => navigate(`/attempt/${testId}`)} 
                isLightMode={isLightMode}
                testType={test.testType || 'public'}
                isAssigned={test.emailAssigned !== false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};
