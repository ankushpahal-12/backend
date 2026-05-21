import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, CheckSquare, BookOpen, Users, Activity, Settings, CheckCircle2, Star, Pencil, Trash2, Mail } from 'lucide-react';
import { fetchTestDetailsAdmin, updateTest } from '../services/testApi';
import { useTestStore } from '../store/testStore';
import toast from 'react-hot-toast';
import { TestUsersTab } from './TestUsersTab';
import { TestAttemptsTab } from './TestAttemptsTab';
import { TestSettingsTab } from './TestSettingsTab';
import { AssignEmailModal } from './AssignEmailModal';

interface TestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
}

type TabType = 'users' | 'attempts' | 'settings' | 'analytics';

export const TestDetailModal: React.FC<TestDetailModalProps> = ({ isOpen, onClose, testId }) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testData, setTestData] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showAssignEmailModal, setShowAssignEmailModal] = useState(false);

  const deleteTest = useTestStore(state => state.deleteTest);

  const handleDelete = async () => {
    try {
      await deleteTest(testId);
      onClose(); // Close modal on successful delete
    } catch (err: any) {
      // Error handled in store
    }
  };

  const handleTogglePublish = async () => {
    if (!testData) return;
    setIsUpdatingStatus(true);
    const newStatus = testData.status === 'published' ? 'draft' : 'published';
    try {
      const res = await updateTest(testId, { status: newStatus });
      if (res.success) {
        setTestData({ ...testData, status: newStatus });
        toast.success(`Test ${newStatus === 'published' ? 'published' : 'un-published'} successfully`);
      } else {
        toast.error(res.error || 'Failed to update status');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const loadData = async (quiet = false) => {
    if (!quiet) setLoading(true);
    const res = await fetchTestDetailsAdmin(testId);
    if (res.success && res.data) {
      setTestData(res.data.test);
      setAttempts(res.data.attempts);
    } else {
      if (!quiet) setError(res.error || 'Failed to load test details');
    }
    if (!quiet) setLoading(false);
  };

  useEffect(() => {
    if (isOpen && testId) {
      loadData();
    }
  }, [isOpen, testId]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'attempts', label: 'Attempts', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BookOpen }, // Placeholder, no logic required
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className={`font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Loading test details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-rose-500 mb-2">
            <X size={48} />
          </div>
          <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Error loading data</h3>
          <p className="text-slate-500">{error}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'users':
        return <TestUsersTab test={testData} attempts={attempts} />;
      case 'attempts':
        return <TestAttemptsTab test={testData} attempts={attempts} onRefresh={() => loadData(true)} />;
      case 'settings':
        return <TestSettingsTab test={testData} onRefresh={() => loadData(true)} />;
      case 'analytics':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
            <BookOpen size={48} className={`mb-4 ${isLightMode ? 'text-slate-300' : 'text-slate-600'}`} />
            <h3 className={`text-lg font-bold mb-2 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>Analytics Dashboard</h3>
            <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>Detailed analytics will be available in the next release.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className={`relative w-full max-w-[1400px] h-full max-h-[95vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden ${
          isLightMode ? 'bg-slate-50 border-white' : 'bg-[#0f172a] border border-white/10'
        }`}
      >
        {/* Header Section */}
        <div className={`px-8 py-6 border-b flex flex-col gap-6 shrink-0 z-10 relative ${
          isLightMode ? 'bg-white border-slate-200' : 'bg-[#1e293b] border-white/10'
        }`}>
          {/* Action buttons absolute top right */}
          <div className="absolute top-4 right-4 flex gap-2 shrink-0 z-20">
            {/* Assign Emails button - only for private, published tests */}
            {testData?.visibility === 'private' && testData?.status === 'published' && (
              <button 
                onClick={() => setShowAssignEmailModal(true)}
                className={`p-2 rounded-xl transition-colors ${
                  isLightMode ? 'hover:bg-slate-100 text-indigo-600' : 'hover:bg-white/10 text-indigo-400'
                }`}
                title="Assign emails"
              >
                <Mail size={24} />
              </button>
            )}
            {/* Close button */}
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors shrink-0 ${
                isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400'
              }`}
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 justify-between mt-2">
            
            {/* Left Column: Icon + Details */}
            <div className="flex gap-6">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <BookOpen size={36} strokeWidth={1.5} />
              </div>
              
              {/* Details */}
              <div className="flex flex-col">
                <h1 className={`text-xl lg:text-2xl font-bold tracking-tight mb-4 pr-10 ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                  {testData?.title || 'Loading Test...'}
                </h1>
                <div className="grid grid-cols-[80px_1fr] gap-y-2 gap-x-4 text-sm font-medium">
                  <span className={`${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Category:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold w-fit ${isLightMode ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'}`}>
                    {testData?.category || '—'}
                  </span>
                  
                  <span className={`${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Created by:</span>
                  <span className={`${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {testData?.createdBy ? testData.createdBy.name : 'Admin'}
                  </span>
                  
                  <span className={`${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Created at:</span>
                  <span className={`${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                    {testData?.createdAt ? new Date(testData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Column: Status + Stats */}
            <div className="flex flex-col flex-1 xl:max-w-4xl xl:px-8 xl:border-l border-slate-200 dark:border-white/10">
              {/* Status Pill and Toggle */}
              <div className="mb-6 flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold border w-fit ${
                  testData?.status === 'published' 
                    ? isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : isLightMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {testData?.status === 'published' ? 'Published' : testData?.status === 'archived' ? 'Archived' : 'Draft'}
                  {testData?.status === 'published' && <CheckCircle2 size={14} />}
                </span>
                
                <label className={`relative inline-flex items-center cursor-pointer ${isUpdatingStatus ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={testData?.status === 'published'} 
                    onChange={handleTogglePublish}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className={`text-[11px] font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Start At</p>
                    <p className={`text-sm font-bold whitespace-nowrap ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      {testData?.startAt ? new Date(testData.startAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Always Open'}
                    </p>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                
                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className={`text-[11px] font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>End At</p>
                    <p className={`text-sm font-bold whitespace-nowrap ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
                      {testData?.endAt ? new Date(testData.endAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No Limit'}
                    </p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className={`text-[11px] font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Duration</p>
                    <p className={`text-sm font-bold whitespace-nowrap ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{testData?.durationMinutes || 0} Minutes</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden md:block"></div>

                <div className="flex items-start gap-3">
                  <CheckSquare size={20} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className={`text-[11px] font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Questions</p>
                    <p className={`text-sm font-bold whitespace-nowrap ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{testData?.questions?.length || 0}</p>
                  </div>
                </div>

                <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden md:block"></div>

                <div className="flex items-start gap-3">
                  <div className="text-slate-400 mt-0.5"><Star size={20} /></div>
                  <div>
                    <p className={`text-[11px] font-semibold ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Marks</p>
                    <p className={`text-sm font-bold whitespace-nowrap ${isLightMode ? 'text-slate-800' : 'text-white'}`}>{testData?.totalMarks || 0}</p>
                  </div>
                </div>
              </div>

              {/* Actions Row (Bottom Left) */}
              <div className="flex gap-3 mt-8">
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                  isLightMode 
                    ? 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300' 
                    : 'bg-transparent text-blue-400 border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50'
                }`}>
                  <Pencil size={16} /> Edit Test
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                  isLightMode 
                    ? 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300' 
                    : 'bg-transparent text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50'
                }`}>
                  <Trash2 size={16} /> Delete Test
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-6 mt-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-all relative ${
                  activeTab === tab.id
                    ? isLightMode ? 'border-indigo-600 text-indigo-600' : 'border-indigo-400 text-indigo-400'
                    : isLightMode ? 'border-transparent text-slate-500 hover:text-slate-800' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${
                isLightMode ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-white/10'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Delete Test</h3>
                  <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>This action cannot be undone.</p>
                </div>
              </div>
              <p className={`text-sm mb-6 ${isLightMode ? 'text-slate-600' : 'text-slate-300'}`}>
                Are you sure you want to delete <strong>{testData?.title}</strong>? All attempts and user progress for this test will also be deleted.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    isLightMode ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Email Modal */}
      <AssignEmailModal
        isOpen={showAssignEmailModal}
        onClose={() => setShowAssignEmailModal(false)}
        testData={testData}
        testId={testId}
        onEmailsUpdated={(updatedEmails) => {
          setTestData({ ...testData, assignedEmails: updatedEmails });
        }}
        isLightMode={isLightMode}
      />
    </div>
  );
};
