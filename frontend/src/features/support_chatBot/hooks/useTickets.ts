import { useState, useCallback, useEffect } from 'react';
import type { SupportTicket, CreateTicketPayload } from '../types/support.types';
import { supportService } from '../services/support.service';
import { useSupportWidgetContext } from '../context/SupportWidgetContext';

/**
 * Manages user-facing ticket operations:
 * - Fetches the user's own tickets from the real API
 * - Creates a new ticket with monitoring payload attached
 * - Wires into the active conversation from context
 */
export const useTickets = () => {
  const { conversation } = useSupportWidgetContext();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tickets for the current user
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportService.getUserTickets();
      setTickets(data.tickets as unknown as SupportTicket[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get a single ticket by ID (used by TicketDetail)
  const getTicketById = useCallback(async (id: string): Promise<SupportTicket | null> => {
    try {
      const ticket = tickets.find((t) => t._id === id);
      if (ticket) return ticket;
      // Fallback: fetch from API (for direct navigation)
      const data = await supportService.getUserTickets();
      const found = (data.tickets as unknown as SupportTicket[]).find((t) => t._id === id);
      return found || null;
    } catch {
      return null;
    }
  }, [tickets]);

  // Create a new ticket with the full monitoring payload
  const createTicket = useCallback(async (payload: Omit<CreateTicketPayload, 'conversationId'> & { conversationId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const conversationId = payload.conversationId || conversation?._id;
      if (!conversationId) throw new Error('No active conversation. Please open the chat first.');

      const newTicket = await supportService.createTicket({
        ...payload,
        conversationId,
      });

      setTickets((prev) => [newTicket as unknown as SupportTicket, ...prev]);
      return newTicket;
    } catch (err: any) {
      const message = err?.response?.data?.message || err.message || 'Failed to create ticket';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [conversation]);

  // Initial load
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    getTicketById,
    createTicket,
  };
};
