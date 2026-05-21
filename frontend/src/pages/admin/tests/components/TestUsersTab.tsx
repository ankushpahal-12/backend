import React, { useState } from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { Search, Download, Eye, MoreVertical, CheckCircle2, UserX } from 'lucide-react';
import { TestStatsCards } from './TestStatsCards';
import { TestResultModal } from './TestResultModal';

interface TestUsersTabProps {
  test: any;
  attempts: any[];
}

export const TestUsersTab: React.FC<TestUsersTabProps> = ({ test, attempts }) => {
  const { mode } = useThemeContext();
  const isLightMode = mode === 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  const assignedUsers = test?.assignedUsers || [];

  // Calculate stats
  const totalAssigned = assignedUsers.length;
  const started = attempts.length;
  const completed = attempts.filter(a => a.status === 'submitted' || a.status === 'graded').length;
  const inProgress = attempts.filter(a => a.status === 'in-progress').length;
  const notAttempted = totalAssigned - started;

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

  const filteredUsers = assignedUsers.filter((user: any) => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <TestStatsCards 
        totalAssigned={totalAssigned}
        started={started}
        completed={completed}
        inProgress={inProgress}
        notAttempted={notAttempted}
      />

      <div className={`rounded-2xl border ${isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/10'}`}>
        {/* Toolbar */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b ${isLightMode ? 'border-slate-100' : 'border-white/10'}`}>
          <div className="relative w-full sm:max-w-md">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
            <input
              type="text"
              placeholder="Search user by name or email..."
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`text-xs uppercase font-semibold ${isLightMode ? 'bg-slate-50 text-slate-500 border-b border-slate-200' : 'bg-slate-900/50 text-slate-400 border-b border-white/10'}`}>
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Assigned</th>
                <th className="px-6 py-4">Published Access</th>
                <th className="px-6 py-4">Attempted</th>
                <th className="px-6 py-4">Completed</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: any, idx: number) => {
                  const attempt = attempts.find(a => a.userId?._id === user._id || a.userId === user._id);
                  const isCompleted = attempt?.status === 'submitted' || attempt?.status === 'graded';
                  
                  return (
                    <tr key={user._id} className={`transition-colors ${isLightMode ? 'hover:bg-slate-50/50' : 'hover:bg-white/[0.02]'}`}>
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
                        <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                          <CheckCircle2 size={16} /> Yes
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 font-medium ${test?.publishedAccess === 'Public' ? 'text-emerald-500' : 'text-emerald-500'}`}>
                          <CheckCircle2 size={16} /> Yes
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {attempt ? (
                          <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                            <CheckCircle2 size={16} /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                            <UserX size={16} /> No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isCompleted ? (
                          <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                            <CheckCircle2 size={16} /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                            <UserX size={16} /> No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                          isCompleted
                            ? isLightMode ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : attempt
                              ? isLightMode ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isLightMode ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {isCompleted ? 'Completed' : attempt ? 'In Progress' : 'Not Started'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {isCompleted ? (
                            <button 
                              onClick={() => setSelectedAttemptId(attempt?._id)}
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
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your criteria.
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
