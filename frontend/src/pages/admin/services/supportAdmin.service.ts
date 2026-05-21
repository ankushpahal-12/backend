import api from '../../../utils/api';
import type {
  AdminTicket,
  TicketStatus,
  Conversation,
  ChatMessage,
  SupportStats,
} from '../types/supportAdmin.types';

// ─── Admin Conversations ──────────────────────────────────────────────────────

const getConversations = async (params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ conversations: Conversation[]; total: number; page: number }> => {
  const response = await api.get('/support/admin/conversations', { params });
  return response.data.data;
};

const getConversationDetail = async (conversationId: string): Promise<{
  conversation: Conversation;
  messages: ChatMessage[];
  tickets: AdminTicket[];
}> => {
  const response = await api.get(`/support/admin/conversations/${conversationId}`);
  return response.data.data;
};

// ─── Admin Tickets ────────────────────────────────────────────────────────────

const getTickets = async (params?: {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
}): Promise<{ tickets: AdminTicket[]; total: number }> => {
  const response = await api.get('/support/admin/tickets', { params });
  return response.data.data;
};

const getTicketById = async (id: string): Promise<AdminTicket> => {
  const response = await api.get(`/support/admin/tickets/${id}`);
  return response.data.data.ticket;
};

const sendAdminReply = async (
  ticketId: string,
  content: string,
  conversationId: string
): Promise<{ message: ChatMessage; ticket: AdminTicket }> => {
  const response = await api.post(`/support/admin/tickets/${ticketId}/reply`, {
    content,
    conversationId,
  });
  return response.data.data;
};

const updateTicketStatus = async (ticketId: string, status: TicketStatus): Promise<AdminTicket> => {
  const response = await api.patch(`/support/admin/tickets/${ticketId}/status`, { status });
  return response.data.data.ticket;
};

// ─── Stats ────────────────────────────────────────────────────────────────────

const getSupportStats = async (): Promise<SupportStats> => {
  const response = await api.get('/support/admin/stats');
  return response.data.data;
};

export const supportAdminService = {
  // Conversations
  getConversations,
  getConversationDetail,
  // Tickets
  getTickets,
  getTicketById,
  sendAdminReply,
  updateTicketStatus,
  // Stats
  getSupportStats,
};
