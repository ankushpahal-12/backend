import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useAdminSupport } from '../hooks/useAdminSupport';
import { ConversationSidebar } from '../components/support/ConversationSidebar';
import { AdminChatView } from '../components/support/AdminChatView';
import Sidebar from '../../../components/layouts/SideBar';

export const SupportTicketPage: React.FC = () => {
  const sidebarWidth = 248;
  const {
    conversations,
    stats,
    isLoadingList,
    fetchConversations,
    selectedConvId,
    activeConversation,
    activeMessages,
    activeTickets,
    isLoadingDetail,
    selectConversation,
    handleMessageSent,
    handleStatusChanged,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
  } = useAdminSupport();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open onClose={() => undefined} width={sidebarWidth} />
      <div className="flex flex-col flex-1 overflow-hidden ml-0 lg:ml-[248px] transition-all duration-300">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Support Inbox</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Real-time customer support & ticket management
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats pills */}
          <div className="hidden md:flex items-center gap-2">
            <StatPill label="Open" value={stats.open} color="bg-rose-100 text-rose-700" />
            <StatPill label="In Progress" value={stats.inProgress} color="bg-amber-100 text-amber-700" />
            <StatPill label="Waiting" value={stats.waitingForUser} color="bg-violet-100 text-violet-700" />
            <StatPill label="Resolved" value={stats.resolved} color="bg-emerald-100 text-emerald-700" />
          </div>

          {/* Unread bell */}
          <div className="relative">
            <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Bell size={17} />
            </button>
            {stats.open > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                {stats.open > 9 ? '9+' : stats.open}
              </span>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchConversations}
            disabled={isLoadingList}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={isLoadingList ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* ── Two-Pane Layout ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Conversation Sidebar */}
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedConvId}
          onSelect={selectConversation}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          isLoading={isLoadingList}
        />

        {/* Right: Active Chat View */}
        <AdminChatView
          conversation={activeConversation}
          messages={activeMessages}
          tickets={activeTickets}
          onMessageSent={handleMessageSent}
          onStatusChanged={handleStatusChanged}
          isLoading={isLoadingDetail}
        />
      </div>
      </div>
    </div>
  );
};

export default SupportTicketPage;

// ─── Stat pill component ──────────────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${color}`}>
    <span>{value}</span>
    <span className="opacity-75">{label}</span>
  </div>
);
