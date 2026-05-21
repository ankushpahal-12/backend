import api from '../../../utils/api';
import type { ChatMessage, AdminTicket } from '../../../pages/admin/types/supportAdmin.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  _id: string;
  userId: string;
  status: 'active' | 'closed';
  ticketIds: string[];
  lastActivityAt: string;
  createdAt: string;
}

export interface CreateTicketPayload {
  conversationId: string;
  subject: string;
  description: string;
  issueType?: string;
  priority?: string;
  screenshotUrls?: string[];
  screenshotPublicIds?: string[];
  consoleLogs?: unknown[];
  apiFailures?: unknown[];
  timeline?: unknown[];
  sessionMetadata?: unknown;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const supportService = {
  /**
   * Fetches or creates the user's active conversation.
   * Returns the conversation object and message history.
   */
  getOrCreateConversation: async (): Promise<{
    conversation: Conversation;
    messages: ChatMessage[];
  }> => {
    const response = await api.get('/support/conversations/me');
    return response.data.data;
  },

  /**
   * Sends a chat message in a conversation.
   */
  sendMessage: async (
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'system' = 'text',
    attachments: unknown[] = []
  ): Promise<ChatMessage> => {
    const response = await api.post(`/support/conversations/${conversationId}/messages`, {
      content,
      type,
      attachments,
    });
    return response.data.data.message;
  },

  /**
   * Creates a support ticket attached to a conversation.
   * Includes the full monitoring payload (logs, API failures, timeline, metadata).
   */
  createTicket: async (payload: CreateTicketPayload): Promise<AdminTicket> => {
    const response = await api.post('/support/tickets', payload);
    return response.data.data.ticket;
  },

  /**
   * Returns the authenticated user's own tickets.
   */
  getUserTickets: async (params?: { status?: string; page?: number }): Promise<{
    tickets: AdminTicket[];
    total: number;
  }> => {
    const response = await api.get('/support/tickets/me', { params });
    return response.data.data;
  },
};
