import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../../../../context/ThemeContext';
import { AlertCircle, Unlock, Loader2, Filter, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface BlockedUser {
  attemptId: string;
  userId: string;
  email: string;
  username: string;
  userName: string;
  blockedAt: string;
  status: string;
  marksObtained: number;
  blockedReason: string;
}

interface UnblockModalProps {
  isOpen: boolean;
  user: BlockedUser | null;
  onClose: () => void;
  onUnblock: (reason: string) => Promise<void>;
}

const UnblockModal: React.FC<UnblockModalProps> = ({ isOpen, user, onClose, onUnblock }) => {
  const { mode } = useThemeContext();
  const isLight = mode === 'light';
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUnblock(reason);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-lg w-full p-6 rounded-xl ${isLight ? 'bg-white' : 'bg-[#161b22]'} shadow-xl`}>
        <h2 className={`text-xl font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Unblock User
        </h2>

        <div className={`mb-4 p-3 rounded-lg ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'}`}>
          <p className={isLight ? 'text-amber-800' : 'text-amber-200'}>
            <strong>Email:</strong> {user.email}
          </p>
          <p className={`mt-1 ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
            <strong>Current Reason:</strong> {user.blockedReason}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Unblock Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Why are you unblocking this user?"
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border outline-none resize-none ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-slate-950 border-white/10 text-white'
              }`}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                isLight
                  ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
              Unblock User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BlockedUsersProps {
  testId: string;
}

export const BlockedUsersPanel: React.FC<BlockedUsersProps> = ({ testId }) => {
  const { mode } = useThemeContext();
  const isLight = mode === 'light';

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [unblockLoading, setUnblockLoading] = useState(false);

  const fetchBlockedUsers = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/admin/blocked-users/${testId}?page=${pageNum}&limit=10`);
      if (response.data.success) {
        setBlockedUsers(response.data.data.blockedUsers);
        setTotalPages(response.data.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch blocked users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`/api/v1/admin/block-statistics/${testId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    fetchBlockedUsers(1);
    fetchStatistics();
  }, [testId]);

  const handleUnblock = async (reason: string) => {
    if (!selectedUser) return;

    setUnblockLoading(true);
    try {
      const response = await axios.patch(`/api/v1/admin/unblock-user/${selectedUser.attemptId}`, {
        reason
      });

      if (response.data.success) {
        toast.success('User unblocked successfully');
        setShowUnblockModal(false);
        setSelectedUser(null);
        fetchBlockedUsers(page);
        fetchStatistics();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unblock user');
    } finally {
      setUnblockLoading(false);
    }
  };

  const bgCard = isLight ? 'bg-white' : 'bg-[#0d1117]';
  const borderClass = isLight ? 'border-slate-200' : 'border-white/10';
  const textPrimary = isLight ? 'text-slate-900' : 'text-white';
  const textSecondary = isLight ? 'text-slate-600' : 'text-slate-400';
  const hoverClass = isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold mb-2 ${textPrimary}`}>Blocked Users Management</h2>
        <p className={textSecondary}>Manage and review users blocked from this test</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${bgCard} border ${borderClass} p-6 rounded-lg`}>
            <p className={`text-sm font-medium ${textSecondary} mb-2`}>Total Attempts</p>
            <p className={`text-3xl font-bold ${textPrimary}`}>{stats.totalAttempts}</p>
          </div>
          <div className={`${bgCard} border ${borderClass} p-6 rounded-lg`}>
            <p className={`text-sm font-medium ${textSecondary} mb-2`}>Blocked Users</p>
            <p className={`text-3xl font-bold text-rose-600`}>{stats.blockedAttempts}</p>
            <p className={`text-xs ${textSecondary} mt-2`}>{stats.blockPercentage}% blocked</p>
          </div>
          <div className={`${bgCard} border ${borderClass} p-6 rounded-lg`}>
            <p className={`text-sm font-medium ${textSecondary} mb-2`}>Completed</p>
            <p className={`text-3xl font-bold text-green-600`}>{stats.completedAttempts}</p>
          </div>
          <div className={`${bgCard} border ${borderClass} p-6 rounded-lg`}>
            <p className={`text-sm font-medium ${textSecondary} mb-2`}>In Progress</p>
            <p className={`text-3xl font-bold text-blue-600`}>{stats.inProgressAttempts}</p>
          </div>
        </div>
      )}

      {/* Block Reasons */}
      {stats?.blockReasons && stats.blockReasons.length > 0 && (
        <div className={`${bgCard} border ${borderClass} p-6 rounded-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Block Reasons Distribution</h3>
          <div className="space-y-2">
            {stats.blockReasons.map((br: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between">
                <span className={textSecondary}>{br.reason}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-600"
                      style={{ width: `${(br.count / stats.blockedAttempts) * 100}%` }}
                    />
                  </div>
                  <span className={`font-semibold min-w-8 ${textPrimary}`}>{br.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked Users List */}
      <div className={`${bgCard} border ${borderClass} rounded-lg overflow-hidden`}>
        <div className={`p-6 border-b ${borderClass} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-indigo-600" />
            <h3 className={`text-lg font-semibold ${textPrimary}`}>
              Blocked Users ({blockedUsers.length})
            </h3>
          </div>
          <button
            onClick={() => fetchBlockedUsers(page)}
            className={`p-2 rounded-lg transition-colors ${hoverClass}`}
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="animate-spin mx-auto text-indigo-600 mb-4" />
            <p className={textSecondary}>Loading blocked users...</p>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle size={32} className={`mx-auto mb-4 ${textSecondary}`} />
            <p className={textSecondary}>No blocked users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isLight ? 'bg-slate-50' : 'bg-slate-900/30'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${textSecondary}`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${textSecondary}`}>
                    Email
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${textSecondary}`}>
                    Blocked Reason
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${textSecondary}`}>
                    Blocked At
                  </th>
                  <th className={`px-6 py-3 text-left text-sm font-semibold ${textSecondary}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {blockedUsers.map((user) => (
                  <tr key={user.attemptId} className={hoverClass}>
                    <td className={`px-6 py-4 text-sm ${textPrimary}`}>
                      <div>
                        <p className="font-medium">{user.userName}</p>
                        <p className={`text-xs ${textSecondary}`}>@{user.username}</p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${textPrimary} font-mono`}>{user.email}</td>
                    <td className={`px-6 py-4 text-sm`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isLight
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}>
                        {user.blockedReason}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${textSecondary}`}>
                      {new Date(user.blockedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUnblockModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Unlock size={16} />
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${borderClass} flex items-center justify-between`}>
            <p className={`text-sm ${textSecondary}`}>
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchBlockedUsers(page - 1)}
                disabled={page === 1 || loading}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => fetchBlockedUsers(page + 1)}
                disabled={page === totalPages || loading}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Unblock Modal */}
      <UnblockModal
        isOpen={showUnblockModal}
        user={selectedUser}
        onClose={() => {
          setShowUnblockModal(false);
          setSelectedUser(null);
        }}
        onUnblock={handleUnblock}
      />
    </div>
  );
};

export default BlockedUsersPanel;
