import React from 'react';
import type { SupportTicket } from '../types/support.types';
import { TicketStatusBadge } from './TicketStatusBadge';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TicketCardProps {
  ticket: SupportTicket;
  onClick: (id: string) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  const formattedDate = new Date(ticket.createdAt).toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const firstScreenshot = ticket.screenshotUrls?.[0];

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(ticket._id)}
      className="w-full text-left bg-white border border-slate-100 p-4 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group flex gap-3"
    >
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* ID + Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">
            #{ticket._id.slice(-8).toUpperCase()}
          </span>
          <TicketStatusBadge status={ticket.status} />
        </div>

        {/* Subject */}
        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
          {ticket.subject}
        </h4>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] font-semibold text-slate-400">{formattedDate}</span>
          <TicketStatusBadge priority={ticket.priority} />
        </div>

        {/* Admin reply count */}
        {ticket.adminReplies?.length > 0 && (
          <p className="text-[11px] text-indigo-600 font-semibold">
            {ticket.adminReplies.length} admin repl{ticket.adminReplies.length === 1 ? 'y' : 'ies'}
          </p>
        )}
      </div>

      {/* Thumbnail or chevron */}
      <div className="flex flex-col items-end justify-center shrink-0">
        {firstScreenshot ? (
          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
            <img src={firstScreenshot} alt="Screenshot" className="w-full h-full object-cover" />
          </div>
        ) : (
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-indigo-500 transition-colors"
          />
        )}
      </div>
    </motion.button>
  );
};
