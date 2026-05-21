import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Circle, Clock, Plus, Send, Moon, Sun } from 'lucide-react';
import type { Conversation } from '../../../types/supportAdmin.types';

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'all' | 'active' | 'closed';
  onStatusFilter: (val: 'all' | 'active' | 'closed') => void;
  isLoading: boolean;
}

const formatRelativeTime = (iso: string | null | undefined) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const AVATAR_COLORS = [
  'from-violet-500 to-indigo-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
];
const getColor = (name: string) =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilter,
  isLoading,
}) => {
  const isLightMode = true; // You can connect this to ThemeContext if needed
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);

  const tabs: Array<{ key: 'all' | 'active' | 'closed'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'closed', label: 'Closed' },
  ];

  const filtered = conversations.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (!search) return true;
    const lc = search.toLowerCase();
    const user = c.userId as any;
    return (
      user?.name?.toLowerCase().includes(lc) ||
      user?.email?.toLowerCase().includes(lc) ||
      c.lastMessage?.content?.toLowerCase().includes(lc)
    );
  });

  return (
    <div className={`w-80 shrink-0 flex flex-col h-full backdrop-blur-2xl overflow-hidden shadow-2xl transition-colors duration-300 ${
      isLightMode
        ? 'border-r border-indigo-200/70 bg-white/88 shadow-indigo-200/40'
        : 'border-r border-indigo-200/10 bg-slate-950/95 shadow-indigo-950/50'
    }`}>
      {/* Gradient Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-28 -left-28 h-72 w-72 rounded-full blur-3xl ${isLightMode ? 'bg-indigo-300/35' : 'bg-indigo-500/20'}`} />
        <div className={`absolute bottom-0 -right-24 h-64 w-64 rounded-full blur-3xl ${isLightMode ? 'bg-violet-200/35' : 'bg-violet-500/15'}`} />
      </div>

      {/* Header */}
      <div className={`relative px-5 pt-6 pb-4 border-b backdrop-blur-sm ${isLightMode ? 'border-indigo-200/70 bg-white/50' : 'border-white/10 bg-white/5'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500">
            <MessageSquare size={18} className="text-white" />
          </div>
          <h2 className={`font-black text-base ${isLightMode ? 'text-slate-900' : 'text-white'}`}>Support Inbox</h2>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsNewConversationOpen(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all border ${
              isLightMode
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
                : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
            }`}
          >
            <Plus size={16} />
            <span>New Chat</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-sm transition-all border ${
              isLightMode
                ? 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200'
                : 'bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30'
            }`}
          >
            <Send size={16} />
            <span>Open</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations…"
            className={`w-full pl-8 pr-3 py-2.5 text-sm rounded-xl outline-none focus:ring-2 transition-all border font-medium ${
              isLightMode
                ? 'bg-slate-50 border-indigo-200/70 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-100'
                : 'bg-white/5 border-white/10 placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-indigo-500/20'
            }`}
          />
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 rounded-xl p-1 ${isLightMode ? 'bg-slate-100' : 'bg-white/10'}`}>
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => onStatusFilter(tab.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                statusFilter === tab.key
                  ? isLightMode
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'bg-indigo-600/30 text-indigo-300 shadow-sm'
                  : isLightMode
                  ? 'text-slate-500 hover:text-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="relative flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className={`w-7 h-7 border-[3px] ${isLightMode ? 'border-indigo-200 border-t-indigo-600' : 'border-indigo-500/30 border-t-indigo-500'} rounded-full animate-spin`} />
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
            <MessageSquare size={32} strokeWidth={1.5} className="mb-2 opacity-40" />
            <p className="text-sm font-medium">No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => {
            const user = conv.userId as any;
            const name = user?.name || 'Unknown User';
            const isSelected = conv._id === selectedId;
            const hasUnread = conv.adminUnreadCount > 0;

            return (
              <motion.button
                key={conv._id}
                onClick={() => onSelect(conv._id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b ${
                  isSelected
                    ? isLightMode
                      ? 'bg-indigo-50 border-l-2 border-l-indigo-500 border-b-indigo-100'
                      : 'bg-indigo-600/20 border-l-2 border-l-indigo-400 border-b-indigo-500/20'
                    : isLightMode
                    ? 'border-b-slate-100 hover:bg-slate-50'
                    : 'border-b-white/5 hover:bg-white/5'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full bg-linear-to-br ${getColor(name)} flex items-center justify-center shrink-0 text-white text-xs font-black shadow-lg shadow-current/20`}
                >
                  {getInitials(name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-sm font-bold truncate ${
                      isSelected
                        ? isLightMode
                          ? 'text-indigo-700'
                          : 'text-indigo-300'
                        : isLightMode
                        ? 'text-slate-800'
                        : 'text-slate-200'
                    }`}>
                      {name}
                    </span>
                    <span className={`text-[10px] shrink-0 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatRelativeTime(conv.lastActivityAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    <p className={`text-xs truncate ${isLightMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {conv.lastMessage?.content || user?.email || '—'}
                    </p>
                    {hasUnread && (
                      <span className="shrink-0 min-w-4.5 h-4.5 px-1 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40">
                        {conv.adminUnreadCount > 9 ? '9+' : conv.adminUnreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};
