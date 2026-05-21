import React, { useState } from 'react';
import { useTests } from '../hooks/useTests';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Search, Plus, Clock, CheckCircle, Edit, Trash2, Eye, LayoutTemplate, Hash, Share2, Mail, Lock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteTest, updateTest } from '../services/testApi';
import MainLayout from '../../../../components/layouts/MainLayout';
import { TestDetailModal } from '../components/TestDetailModal';
import { AssignEmailModal } from '../components/AssignEmailModal';

interface Question {
  id: string;
  text: string;
  marks: number;
  allowMultiple: boolean;
  options: Array<{ id: string; text: string }>;
}

interface Test {
  id: string;
  testId?: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  category: string;
  status: 'draft' | 'published';
  questions: Question[];
}

const MockModal = ({ isOpen, onClose, isLightMode }: { isOpen: boolean, onClose: () => void, isLightMode: boolean }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`relative flex flex-col items-center justify-center w-full max-w-[1390px] h-full max-h-[700px] rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] transform transition-all animate-in zoom-in-95 duration-500 ease-out border ${
          isLightMode 
            ? 'bg-white/95 border-white/20 shadow-indigo-500/10' 
            : 'bg-[#0f172a]/95 border-white/10 shadow-indigo-500/5'
        }`}
        style={{ backdropFilter: 'blur(32px)' }}
      >
        {/* Animated Orbs for SaaS feeling */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-[32px] pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <button 
          onClick={onClose} 
          className={`absolute top-6 right-6 p-3 rounded-full transition-all hover:rotate-90 duration-300 z-10 ${
            isLightMode ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-800' : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
          title="Close Modal"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="relative z-10 text-center transform transition-all animate-in slide-in-from-bottom-8 duration-700 delay-150">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 mb-8 border border-indigo-500/20 shadow-inner">
            <LayoutTemplate className="h-12 w-12 text-indigo-500" />
          </div>
          <h3 className={`text-4xl md:text-5xl font-extrabold mb-6 tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
            For Mock
          </h3>
          <p className={`text-lg md:text-xl mb-12 max-w-lg mx-auto leading-relaxed ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
            I will update it later. This placeholder will eventually be replaced with the full feature.
          </p>
          <button 
            onClick={onClose} 
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-lg font-bold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-xl shadow-indigo-500/30 active:scale-95 border border-indigo-400/30"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminTestsPage: React.FC = () => {
  const { tests, loading, fetchTests, generateShareToken } = useTests();

  const handleShare = async (testId: string) => {
    try {
      const token = await generateShareToken(testId);
      const shareUrl = `${window.location.origin}/attempt/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link successfully copied!');
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [showEmailAssignModal, setShowEmailAssignModal] = useState(false);
  const [selectedTestForEmail, setSelectedTestForEmail] = useState<string | null>(null);

  // Filter tests based on status and search
  const filteredTests = (tests as Test[]).filter(test => {
    const matchesStatus = filterStatus === 'all' || test.status === filterStatus;
    const matchesSearch = 
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.testId && test.testId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (testId: string) => {
    try {
      setDeletingId(testId);
      await deleteTest(testId);
      toast.success('Test deleted successfully');
      fetchTests();
    } catch {
      toast.error('Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (testId: string, newStatus: 'draft' | 'published') => {
    try {
      await updateTest(testId, { status: newStatus });
      toast.success(`Test ${newStatus} successfully`);
      fetchTests();
    } catch {
      toast.error('Failed to update test status');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 w-full max-w-[1800px] mx-auto">
        {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isLightMode ? 'from-slate-900 to-slate-600' : 'from-white to-slate-400'}`}>
                Manage Tests
              </h1>
              <p className={`text-sm mt-2 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Create, edit, and manage your test assessments efficiently.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/tests/create')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 hover:from-indigo-500 hover:to-violet-500"
              >
                <Plus size={18} />
                Create New Test
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`rounded-3xl border shadow-sm overflow-hidden ${isLightMode ? 'bg-white border-slate-200' : 'bg-[#0d1117] border-white/10'}`}>
            {/* Toolbar */}
            <div className={`flex flex-col sm:flex-row gap-4 p-5 border-b backdrop-blur-md ${isLightMode ? 'border-slate-100 bg-slate-50/50' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="relative flex-1 max-w-md">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
                <input
                  type="text"
                  placeholder="Search by title or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                    isLightMode ? 'border-slate-200 bg-white placeholder-slate-400' : 'border-white/10 bg-white/5 text-white placeholder-slate-500'
                  }`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'draft' | 'published')}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                    isLightMode
                      ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Drafts</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className={`font-medium ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>Loading your tests...</p>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className={`p-6 rounded-full mb-4 ${isLightMode ? 'bg-slate-50' : 'bg-white/5'}`}>
                    <Search size={32} className={isLightMode ? 'text-slate-300' : 'text-slate-600'} />
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>No tests found</h3>
                  <p className={`text-sm ${isLightMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    {tests.length === 0 ? "You haven't created any tests yet. Get started by clicking 'Create New Test'." : "No tests match your current filter criteria."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredTests.map((test, index) => (
                    <div key={test.testId || test.id || index} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${
                      isLightMode 
                        ? 'border-slate-200 bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300' 
                        : 'border-white/10 bg-[#161b22] hover:bg-[#1c2128] hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10'
                    }`}>
                      <div className="flex-1 mb-4 sm:mb-0">
                        <div className="flex flex-col gap-1 mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>{test.title}</h3>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${
                              test.status === 'published'
                                ? isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : isLightMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {test.status}
                            </span>
                          </div>
                          {test.testId && (
                            <span className={`text-xs font-mono font-medium ${isLightMode ? 'text-indigo-600' : 'text-indigo-400'}`}>
                              ID: {test.testId}
                            </span>
                          )}
                        </div>
                        {test.description && (
                          <p className={`text-sm mb-4 line-clamp-1 ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {test.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                          <div className={`flex items-center gap-1.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            <Clock size={14} className="text-indigo-400" /> 
                            {test.durationMinutes} mins
                          </div>
                          <div className={`flex items-center gap-1.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            <CheckCircle size={14} className="text-emerald-400" /> 
                            {test.totalMarks} Marks
                          </div>
                          <div className={`flex items-center gap-1.5 ${isLightMode ? 'text-slate-600' : 'text-slate-400'}`}>
                            <Hash size={14} className="text-violet-400" /> 
                            {test.questions?.length || 0} Questions
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg border ${isLightMode ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                            {test.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:pl-6 sm:border-l border-dashed border-slate-200 dark:border-white/10">
                        {/* Visibility Badge - only for published tests */}
                        {test.status === 'published' && (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            test.visibility === 'private' || (test.accessControl?.visibility === 'private')
                              ? isLightMode
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isLightMode
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {test.visibility === 'private' || (test.accessControl?.visibility === 'private') ? (
                              <><Lock size={12} /> PRIVATE</>
                            ) : (
                              <><Globe size={12} /> PUBLIC</>
                            )}
                          </div>
                        )}

                        {/* Email Assignment Button - only for published private tests */}
                        {test.status === 'published' && (test.visibility === 'private' || test.accessControl?.visibility === 'private') && (
                          <button
                            onClick={() => {
                              setSelectedTestForEmail(test.id);
                              setShowEmailAssignModal(true);
                            }}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                              isLightMode 
                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                                : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                            }`}
                            title="Assign Test to Users"
                          >
                            <Mail size={15} />
                            Assign
                          </button>
                        )}

                        {/* Toggle Status Button */}
                        {test.status === 'draft' ? (
                          <button
                            onClick={() => handleStatusChange(test.id, 'published')}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                              isLightMode
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                            title="Publish Test"
                          >
                            <Eye size={15} />
                            Publish
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedTestId(test.id)}
                              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                                isLightMode 
                                  ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                                  : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                              }`}
                              title="View Details"
                            >
                              <Eye size={15} />
                              View Details
                            </button>
                            <button
                              onClick={() => handleShare(test.id)}
                              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                                isLightMode 
                                  ? 'bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100' 
                                  : 'bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20'
                              }`}
                              title="Share Test"
                            >
                              <Share2 size={15} />
                              Share
                            </button>
                            <button
                              onClick={() => handleStatusChange(test.id, 'draft')}
                              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                isLightMode
                                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              }`}
                              title="Unpublish Test"
                            >
                              <Eye size={15} />
                              Unpublish
                            </button>
                          </>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => navigate(`/admin/tests/edit/${test.testId || test.id}`)}
                          className={`p-2.5 rounded-xl transition-all ${
                            isLightMode 
                              ? 'text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100' 
                              : 'text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20'
                          }`}
                          title="Edit Test"
                        >
                          <Edit size={18} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
                              handleDelete(test.id);
                            }
                          }}
                          disabled={deletingId === (test.id)}
                          className={`p-2.5 rounded-xl transition-all ${
                            isLightMode 
                              ? 'text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100' 
                              : 'text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20'
                          }`}
                          title="Delete Test"
                        >
                          {deletingId === (test.id) ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Test Detail Modal */}
      {selectedTestId && (
        <TestDetailModal 
          isOpen={!!selectedTestId} 
          onClose={() => setSelectedTestId(null)} 
          testId={selectedTestId}
        />
      )}

      {/* Assign Email Modal */}
      {showEmailAssignModal && selectedTestForEmail && (
        <AssignEmailModal
          isOpen={showEmailAssignModal}
          onClose={() => {
            setShowEmailAssignModal(false);
            setSelectedTestForEmail(null);
          }}
          testData={filteredTests.find(t => t.id === selectedTestForEmail)}
          testId={selectedTestForEmail}
          onEmailsUpdated={() => {
            setShowEmailAssignModal(false);
            setSelectedTestForEmail(null);
            fetchTests();
          }}
          isLightMode={isLightMode}
        />
      )}
    </MainLayout>
  );
};



