import React from 'react';
import type { TicketStatus, TicketPriority } from '../types/support.types';
import { STATUS_DISPLAY, STATUS_COLOR, PRIORITY_COLOR } from '../types/support.types';

interface TicketStatusBadgeProps {
  status?: TicketStatus;
  priority?: TicketPriority;
  className?: string;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({
  status,
  priority,
  className = '',
}) => {
  if (status) {
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_COLOR[status]} ${className}`}
      >
        {STATUS_DISPLAY[status]}
      </span>
    );
  }

  if (priority) {
    const icons: Record<TicketPriority, string> = {
      Low: '↓',
      Medium: '•',
      High: '↑',
      Critical: '!!',
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${PRIORITY_COLOR[priority]} ${className}`}
      >
        <span>{icons[priority]}</span>
        {priority}
      </span>
    );
  }

  return null;
};
