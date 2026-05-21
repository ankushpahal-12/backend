import React, { useEffect } from 'react';
import { useTestStore, TestProvider } from '../store/testStore';
import { useThemeContext } from '../../../../context/ThemeContext';
import { TestForm } from '../components/TestForm';
import { QuestionEditor } from '../components/QuestionEditor';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateEditTestContent: React.FC = () => {
  const { state, dispatch } = useTestStore();
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const navigate = useNavigate();

  // Initialize a blank test when the page loads if one doesn't exist
  useEffect(() => {
    if (!state.activeTest) {
      dispatch({ type: 'SET_TEST', payload: {} });
    }
  }, [state.activeTest, dispatch]);

  const handleSaveDraft = () => {
    dispatch({ type: 'MARK_SAVED' });
    // Add real API call here later
  };

  const handlePublish = () => {
    // Add real API call here later
    navigate('/admin/tests');
  };

  if (!state.activeTest) return <div className="p-8 text-center">Loading editor...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <div className="flex items-center gap-4">
          <Link to="/admin/tests" className={`p-2 rounded-xl transition-colors ${isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}>
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
              Create Test
            </h1>
            <div className="flex items-center gap-2 text-xs font-medium mt-0.5">
              <Link to="/admin/dashboard" className={isLightMode ? 'text-indigo-600' : 'text-indigo-400'}>Dashboard</Link>
              <span className={isLightMode ? 'text-slate-400' : 'text-slate-600'}>/</span>
              <Link to="/admin/tests" className={isLightMode ? 'text-indigo-600' : 'text-indigo-400'}>Tests</Link>
              <span className={isLightMode ? 'text-slate-400' : 'text-slate-600'}>/</span>
              <span className={isLightMode ? 'text-slate-500' : 'text-slate-400'}>Create Test</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-semibold ${
            state.hasUnsavedChanges 
              ? isLightMode ? 'text-amber-600' : 'text-amber-400'
              : isLightMode ? 'text-emerald-600' : 'text-emerald-400'
          }`}>
            <CheckCircle2 size={16} />
            {state.hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 p-6">
        {/* Left Sidebar: Test Info & Settings */}
        <div className="w-full md:w-[400px] shrink-0 overflow-y-auto no-scrollbar pb-20">
          <TestForm />
        </div>

        {/* Right Area: Question Editor */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          <QuestionEditor />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={`absolute bottom-0 left-0 right-0 md:left-[var(--sidebar-width)] flex items-center justify-between px-6 py-4 border-t shrink-0 z-10 transition-all duration-300 ${isLightMode ? 'bg-white border-slate-200 shadow-lg shadow-slate-200/50' : 'bg-slate-900 border-white/10 shadow-lg shadow-black/50'}`}>
        <div className={`text-sm font-bold ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
          Total Questions: {state.activeTest.questions?.length || 0} <span className="mx-2 opacity-30">|</span> Total Marks: {state.activeTest.totalMarks || 0}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
              isLightMode ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/10 text-white hover:bg-white/5'
            }`}
          >
            Save as Draft
          </button>
          <button
            className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
              isLightMode ? 'border-indigo-200 text-indigo-700 hover:bg-indigo-50' : 'border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10'
            }`}
          >
            Preview Test
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white transition-colors hover:bg-indigo-700 shadow-lg shadow-indigo-600/25"
          >
            Publish Test
          </button>
        </div>
      </div>
    </div>
  );
};

export const CreateEditTestPage: React.FC = () => {
  return (
    <TestProvider>
      <CreateEditTestContent />
    </TestProvider>
  );
};
