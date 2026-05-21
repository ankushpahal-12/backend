import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTickets } from '../hooks/useTickets';
import { useSupportWidget } from '../hooks/useSupportWidget';
import type { SupportTicket } from '../types/support.types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { Loader2, AlertCircle, ExternalLink, MessageSquare } from 'lucide-react';

export const TicketDetail: React.FC = () => {
  const { activeTicketId, navigateTo } = useSupportWidget();
  const { getTicketById } = useTickets();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadTicket = useCallback(async () => {
    if (!activeTicketId) return;
    setLoading(true);
    try {
      const data = await getTicketById(activeTicketId);
      setTicket(data);
    } finally {
      setLoading(false);
    }
  }, [activeTicketId, getTicketById]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // Auto-scroll to bottom when replies load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticket?.adminReplies]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full text-center">
        <AlertCircle size={32} className="text-rose-400 mb-4" />
        <h3 className="font-bold text-slate-800">Ticket not found</h3>
        <p className="text-sm text-slate-500 mt-2">
          This ticket may have been removed or doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-slate-50"
    >
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-slate-100 shrink-0 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">
            #{ticket._id.slice(-8).toUpperCase()}
          </span>
          <TicketStatusBadge status={ticket.status} />
        </div>

        <h3 className="font-bold text-slate-900 leading-tight mb-2">{ticket.subject}</h3>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] text-slate-400">{fmt(ticket.createdAt)}</span>
          <TicketStatusBadge priority={ticket.priority} />
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {ticket.issueType}
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-100">
          {ticket.description}
        </p>
      </div>

      {/* Thread */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
      >
        {/* Screenshots */}
        {ticket.screenshotUrls?.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Attached Screenshots
            </p>
            <div className="flex gap-2 flex-wrap">
              {ticket.screenshotUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1}`}
                    className="h-24 w-24 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Admin replies */}
        {ticket.adminReplies?.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Support Replies
            </p>
            {ticket.adminReplies.map((reply, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col self-start items-start w-[85%]"
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">
                      {reply.adminName?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">{reply.adminName || 'Support'}</span>
                  <span className="text-[10px] text-slate-400">{fmt(reply.createdAt)}</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {reply.message}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8 text-slate-400">
            <MessageSquare size={28} strokeWidth={1.5} className="mb-2 opacity-50" />
            <p className="text-sm font-medium text-slate-500">Awaiting support reply</p>
            <p className="text-xs mt-1">Our team will reply shortly.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? (
        <div className="shrink-0 bg-slate-100 p-4 text-center border-t border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {ticket.status === 'CLOSED' ? 'This ticket has been closed' : 'This ticket is resolved'}
          </p>
        </div>
      ) : (
        <div className="shrink-0 bg-white border-t border-slate-100 p-4">
          <button
            onClick={() => navigateTo('chat')}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <ExternalLink size={15} />
            Continue in Chat
          </button>
        </div>
      )}
    </motion.div>
  );
};
