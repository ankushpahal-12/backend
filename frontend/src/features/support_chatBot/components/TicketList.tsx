import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTickets } from '../hooks/useTickets';
import { useSupportWidget } from '../hooks/useSupportWidget';
import { TicketCard } from './TicketCard';
import type { TicketStatus } from '../types/support.types';
import { STATUS_DISPLAY } from '../types/support.types';
import { Loader2, Inbox, Plus } from 'lucide-react';

type TabFilter = 'All' | TicketStatus;

const TABS: TabFilter[] = ['All', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'];

export const TicketList: React.FC = () => {
  const { tickets, isLoading } = useTickets();
  const { navigateTo } = useSupportWidget();
  const [activeTab, setActiveTab] = useState<TabFilter>('All');

  const filtered = tickets.filter(
    (t) => activeTab === 'All' || t.status === activeTab
  );

  const getTabLabel = (tab: TabFilter) =>
    tab === 'All' ? 'All' : STATUS_DISPLAY[tab as TicketStatus];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1.5 px-4 py-3 border-b border-slate-100 shrink-0 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 ${
              activeTab === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-100'
            }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        <AnimatePresence mode="wait">
          {isLoading && tickets.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-40"
            >
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </motion.div>
          ) : filtered.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3 pb-4"
            >
              {filtered.map((ticket) => (
                <TicketCard
                  key={ticket._id}
                  ticket={ticket}
                  onClick={(id) => navigateTo('detail', id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center p-8 mt-4"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox size={28} className="text-slate-400" />
              </div>
              <h4 className="text-slate-800 font-bold mb-1">No tickets found</h4>
              <p className="text-xs text-slate-500 mb-6">
                {activeTab === 'All'
                  ? "You haven't created any support tickets yet."
                  : `No ${getTabLabel(activeTab).toLowerCase()} tickets.`}
              </p>
              <button
                onClick={() => navigateTo('chat')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus size={14} />
                Start a Conversation
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
