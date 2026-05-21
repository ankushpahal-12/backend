// Unified types for the user-facing support widget
// These align with what the backend returns from /api/v1/support/*

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueType =
  | 'Login Issue'
  | 'Payment Issue'
  | 'Technical Issue'
  | 'Account Issue'
  | 'Feature Request'
  | 'Other';

export const STATUS_DISPLAY: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_USER: 'Waiting for Reply',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const STATUS_COLOR: Record<TicketStatus, string> = {
  OPEN: 'bg-rose-100 text-rose-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  WAITING_FOR_USER: 'bg-violet-100 text-violet-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-500',
};

export const PRIORITY_COLOR: Record<TicketPriority, string> = {
  Low: 'bg-slate-100 text-slate-500',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

export interface AdminReply {
  adminId: string;
  adminName: string;
  message: string;
  createdAt: string;
}

// Full ticket as returned from GET /support/tickets/me
export interface SupportTicket {
  _id: string;
  conversationId: string;
  subject: string;
  description: string;
  issueType: IssueType;
  priority: TicketPriority;
  status: TicketStatus;
  screenshotUrls: string[];
  adminReplies: AdminReply[];
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  conversationId: string;
  subject: string;
  description: string;
  issueType?: IssueType;
  priority?: TicketPriority;
  screenshotUrls?: string[];
  screenshotPublicIds?: string[];
  consoleLogs?: unknown[];
  apiFailures?: unknown[];
  timeline?: unknown[];
  sessionMetadata?: unknown;
}
