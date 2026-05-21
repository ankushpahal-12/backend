// ─── Status Lifecycle ─────────────────────────────────────────────────────────
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueType = 'Login Issue' | 'Payment Issue' | 'Feature Request' | 'Technical Issue' | 'Account Issue' | 'Other';
export type MessageSenderRole = 'user' | 'admin' | 'bot';

// Valid status transitions (mirrors backend ticketLifecycle.js)
export const TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_USER', 'RESOLVED'],
  WAITING_FOR_USER: ['IN_PROGRESS'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_USER: 'Waiting for User',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const isValidTransition = (from: TicketStatus, to: TicketStatus): boolean =>
  TICKET_TRANSITIONS[from]?.includes(to) ?? false;

export const getAllowedTransitions = (current: TicketStatus): TicketStatus[] =>
  TICKET_TRANSITIONS[current] ?? [];

// ─── Shared Types ─────────────────────────────────────────────────────────────

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface Attachment {
  url: string;
  publicId?: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: string | 'bot' | 'admin';
  senderRole: MessageSenderRole;
  senderName: string;
  senderAvatar?: string | null;
  content: string;
  type: 'text' | 'image' | 'system';
  attachments: Attachment[];
  readBy: Array<{ userId: string; readAt: string }>;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  userId: UserInfo;
  status: 'active' | 'closed';
  ticketIds: string[];
  lastActivityAt: string;
  lastUserMessageAt: string | null;
  lastAdminReplyAt: string | null;
  adminUnreadCount: number;
  createdAt: string;
  // Populated by admin inbox
  lastMessage?: { content: string; createdAt: string } | null;
}

// ─── Ticket Debug Snapshot Types ──────────────────────────────────────────────

export interface ConsoleLog {
  type: 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
  stackTrace?: string;
}

export interface ApiFailure {
  method: string;
  url: string;
  status: number;
  statusText: string;
  duration: string;
  timestamp: string;
  errorDetail?: string;
  payload?: unknown;
}

export interface TimelineEvent {
  time: string;
  action: string;
  type: 'navigation' | 'interaction' | 'api' | 'error' | 'system';
  details?: string;
}

export interface SessionMetadata {
  browser: string;
  os: string;
  resolution: string;
  userAgent: string;
  connection: string;
  networkStatus: 'online' | 'offline';
  currentRoute?: string;
  timezone?: string;
}

// ─── Admin Reply ──────────────────────────────────────────────────────────────

export interface AdminReply {
  adminId: string;
  adminName: string;
  message: string;
  createdAt: string;
}

// ─── Ticket ───────────────────────────────────────────────────────────────────

export interface AdminTicket {
  _id: string;
  conversationId: string;
  userId: UserInfo;
  subject: string;
  description: string;
  issueType: IssueType;
  priority: TicketPriority;
  status: TicketStatus;

  // Inbox sorting timestamps
  lastActivityAt: string;
  lastUserMessageAt: string | null;
  lastAdminReplyAt: string | null;

  // Screenshots (Cloudinary URLs) — max 3
  screenshotUrls: string[];

  // Debug snapshot
  consoleLogs: ConsoleLog[];
  apiFailures: ApiFailure[];
  timeline: TimelineEvent[];
  sessionMetadata: SessionMetadata | null;

  // Admin replies
  adminReplies: AdminReply[];

  createdAt: string;
  updatedAt: string;
}

// ─── Support Stats ────────────────────────────────────────────────────────────

export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  waitingForUser: number;
  resolved: number;
  closed: number;
}
