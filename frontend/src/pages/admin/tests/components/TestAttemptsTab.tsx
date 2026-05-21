import React, { useState, useRef, useEffect } from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Search, Download, Eye, MoreVertical, RotateCcw, EyeOff, Settings, ShieldBan, MonitorX, Trash2, CheckCircle } from 'lucide-react';
import { TestStatsCards } from './TestStatsCards';
import { updateTestAttemptToggle, deleteTestAttempt, forceSubmitAttemptAdmin, grantRetakeForAttempt } from '../services/testApi';
import toast from 'react-hot-toast';
import { TestResultModal } from './TestResultModal';

interface TestAttemptsTabProps {
  test: any;
  attempts: any[];
  onRefresh: () => void;
}

export const TestAttemptsTab: React.FC<TestAttemptsTabProps> = ({ test, attempts, onRefresh }) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalAssigned = test?.assignedUsers?.length || 0;
  const started = attempts.length;
  const completed = attempts.filter(a => a.status === 'submitted' || a.status === 'graded').length;
  const inProgress = attempts.filter(a => a.status === 'in-progress').length;
  const notAttempted = totalAssigned - started;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-indigo-500', 'bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 
      'bg-amber-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500'
    ];
    return colors[index % colors.length];
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleDeleteAttempt = async (attemptId: string) => {
    if (!window.confirm('Are you sure you want to completely delete this attempt? This cannot be undone.')) return;
    
    setActiveDropdown(null);
    const toastId = toast.loading('Deleting attempt...');
    
    try {
      const res = await deleteTestAttempt(attemptId);
      if (res.success) {
        toast.success('Test attempt deleted successfully', { id: toastId });
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to delete test attempt', { id: toastId });
      }
    } catch {
      toast.error('Failed to delete test attempt', { id: toastId },);
    }
  };

  const handleToggle = async (attemptId: string, field: 'isUnseen' | 'isMoreOptionOn' | 'isBlocked' | 'allowRetake', currentValue: boolean) => {
    setActiveDropdown(null);
    
    const toastId = toast.loading(`Updating ${field}...`);
    try {
      const res = await updateTestAttemptToggle(attemptId, { [field]: !currentValue });
      if (res.success) {
        toast.success('Updated successfully', { id: toastId });
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to update', { id: toastId });
      }
    } catch {
      toast.error('Failed to update', { id: toastId });
    }
  };

  const handleForceSubmit = async (attemptId: string) => {
    if (!window.confirm('Are you sure you want to forcibly submit and terminate this active session?')) return;
    
    setActiveDropdown(null);
    const toastId = toast.loading('Terminating session...');
    try {
      const res = await forceSubmitAttemptAdmin(attemptId);
      if (res.success) {
        toast.success(res.message || 'Session terminated successfully', { id: toastId });
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to terminate session', { id: toastId });
      }
    } catch {
      toast.error('Failed to terminate session', { id: toastId });
    }
  };

  const handleGrantRetake = async (attemptId: string) => {
    setActiveDropdown(null);
    const toastId = toast.loading('Granting retake...');
    try {
      const res = await grantRetakeForAttempt(attemptId);
      if (res.success) {
        toast.success('Retake granted successfully! User can now take the test one more time.', { id: toastId });
        onRefresh();
      } else {
        toast.error(res.error || 'Failed to grant retake', { id: toastId });
      }
    } catch {
      toast.error('Failed to grant retake', { id: toastId });
    }
  };

  const filteredAttempts = attempts.filter((attempt: any) => {
    const name = (attempt.userId?.name || '').toLowerCase();
    const email = (attempt.userId?.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  return (
    <div className="space-y-6 relative">

      <TestStatsCards 
        totalAssigned={totalAssigned}
        started={started}
        completed={completed}
        inProgress={inProgress}
        notAttempted={notAttempted}
      />

      <div className={`rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}>
          <div className="relative w-full sm:max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${
                isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-950 text-white'
              }`}
            />
          </div>
          <div className="flex gap-2">
            <button className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              isLightMode ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/10 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`text-xs uppercase font-semibold ${isLightMode ? 'bg-slate-50 text-slate-500 border-b border-slate-200' : 'bg-slate-900/50 text-slate-400 border-b border-white/10'}`}>
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Started At</th>
                <th className="px-6 py-4">Ended At</th>
                <th className="px-6 py-4">Time Taken</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Percentage</th>
                <th className="px-6 py-4 text-center">Report</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt: any, idx: number) => {
                  const user = attempt.userId || {};
                  const isCompleted = attempt.status === 'submitted' || attempt.status === 'graded';
                  
                  return (
                    <tr key={attempt._id} className={`transition-colors ${isLightMode ? 'hover:bg-slate-50/50' : 'hover:bg-white/[0.02]'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(idx)}`}>
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <div className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                              {user.name || 'Unnamed User'}
                            </div>
                            <div className={`text-xs ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          isCompleted
                            ? isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : attempt.status === 'in-progress'
                              ? isLightMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isLightMode ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {attempt.status === 'in-progress' ? 'In Progress' : attempt.status === 'submitted' ? 'Completed' : attempt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(attempt.startedAt)}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(attempt.submittedAt)}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDuration(attempt.timeSpentSeconds)}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                        {isCompleted ? `${attempt.totalMarksObtained} / ${attempt.totalMarksPossible}` : '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                        {isCompleted ? `${attempt.percentage?.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {isCompleted ? (
                            <button 
                              onClick={() => setSelectedAttemptId(attempt._id)}
                              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              isLightMode 
                                ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                                : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                            }`}>
                              <Eye size={14} /> View Report
                            </button>
                          ) : (
                            <span className={`text-xs font-medium ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Unavailable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === attempt._id ? null : attempt._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isLightMode ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400'
                          }`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === attempt._id && (
                          <div 
                            ref={dropdownRef}
                            className={`absolute right-8 top-10 z-50 w-56 rounded-xl shadow-xl border py-2 ${
                              isLightMode ? 'bg-white border-slate-100' : 'bg-slate-800 border-white/10'
                            }`}
                          >
                            <div className="px-4 py-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm flex items-center gap-3 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                                  <RotateCcw size={16} /> Allow Retake
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={attempt.allowRetake || false}
                                    onChange={() => handleToggle(attempt._id, 'allowRetake', attempt.allowRetake)}
                                  />
                                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5..5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                              </div>
                            </div>
                            
                            <div className="px-4 py-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm flex items-center gap-3 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                                  <EyeOff size={16} /> Unseen Test
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={attempt.isUnseen || false}
                                    onChange={() => handleToggle(attempt._id, 'isUnseen', attempt.isUnseen)}
                                  />
                                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                              </div>
                            </div>

                            <div className={`my-1 border-t ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}></div>

                            <div className="px-4 py-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm flex items-center gap-3 ${isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                                  <Settings size={16} /> More option
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={attempt.isMoreOptionOn || false}
                                    onChange={() => handleToggle(attempt._id, 'isMoreOptionOn', attempt.isMoreOptionOn)}
                                  />
                                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                              </div>
                            </div>

                            <div className={`my-1 border-t ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}></div>
                            
                            <div className="px-4 py-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm flex items-center gap-3 ${attempt.isBlocked ? 'text-rose-500 font-semibold' : isLightMode ? 'text-slate-700' : 'text-slate-300'}`}>
                                  <ShieldBan size={16} /> Blocked
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={attempt.isBlocked || false}
                                    onChange={() => handleToggle(attempt._id, 'isBlocked', attempt.isBlocked)}
                                  />
                                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
                                </label>
                              </div>
                            </div>

                            {attempt.status === 'in-progress' && (
                              <button 
                                onClick={() => handleForceSubmit(attempt._id)}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                              >
                                <MonitorX size={16} /> Terminate Session
                              </button>
                            )}

                            {attempt.status !== 'in-progress' && !attempt.isAdminGrantedRetake && (
                              <button 
                                onClick={() => handleGrantRetake(attempt._id)}
                                className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                              >
                                <CheckCircle size={16} /> Grant Retake
                              </button>
                            )}

                            {attempt.isAdminGrantedRetake && (
                              <div className="px-4 py-2 text-sm flex items-center gap-3 text-emerald-600">
                                <CheckCircle size={16} /> Retake Granted
                              </div>
                            )}

                            <div className={`my-1 border-t ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}></div>

                            <button 
                              onClick={() => handleDeleteAttempt(attempt._id)}
                              className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            >
                              <Trash2 size={16} /> Delete Attempt
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No attempts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <TestResultModal 
        isOpen={!!selectedAttemptId} 
        onClose={() => setSelectedAttemptId(null)} 
        attemptId={selectedAttemptId} 
      />
    </div>
  );
};
