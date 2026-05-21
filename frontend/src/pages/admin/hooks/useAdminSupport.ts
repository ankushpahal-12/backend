import { useState, useCallback, useEffect, useRef } from 'react';
import { supportAdminService } from '../services/supportAdmin.service';
import type {
  Conversation,
  ChatMessage,
  AdminTicket,
  TicketStatus,
  SupportStats,
} from '../types/supportAdmin.types';
import { io as socketIO, Socket } from 'socket.io-client';
import { ENV } from '../../../config/env';

export const useAdminSupport = () => {
  // ── Conversation list state ───────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<SupportStats>({
    total: 0, open: 0, inProgress: 0, waitingForUser: 0, resolved: 0, closed: 0,
  });
  const [isLoadingList, setIsLoadingList] = useState(true);

  // ── Active conversation state ─────────────────────────────────────────────
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [activeTickets, setActiveTickets] = useState<AdminTicket[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');

  // ── Modals ────────────────────────────────────────────────────────────────
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isScreenshotModalOpen, setIsScreenshotModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  const socketRef = useRef<Socket | null>(null);

  // ── Fetch conversation list ───────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const [convData, statsData] = await Promise.all([
        supportAdminService.getConversations(),
        supportAdminService.getSupportStats(),
      ]);
      setConversations(convData.conversations);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // ── Fetch active conversation detail ─────────────────────────────────────
  const fetchConversationDetail = useCallback(async (convId: string) => {
    setIsLoadingDetail(true);
    try {
      const data = await supportAdminService.getConversationDetail(convId);
      setActiveConversation(data.conversation);
      setActiveMessages(data.messages);
      setActiveTickets(data.tickets);

      // Join socket room for real-time messages
      socketRef.current?.emit('support:join_conversation', { conversationId: convId });
    } catch (err) {
      console.error('Failed to load conversation detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // ── Select conversation ───────────────────────────────────────────────────
  const selectConversation = useCallback((convId: string) => {
    setSelectedConvId(convId);
    fetchConversationDetail(convId);
  }, [fetchConversationDetail]);

  // ── Handle new incoming message ───────────────────────────────────────────
  const handleMessageSent = useCallback((msg: ChatMessage) => {
    setActiveMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });

    // Update last message preview in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c._id === (msg.conversationId as string)
          ? {
              ...c,
              lastActivityAt: msg.createdAt,
              lastMessage: { content: msg.content.slice(0, 80), createdAt: msg.createdAt },
            }
          : c
      )
    );
  }, []);

  // ── Handle status change ──────────────────────────────────────────────────
  const handleStatusChanged = useCallback((ticketId: string, newStatus: TicketStatus) => {
    setActiveTickets((prev) =>
      prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
    );
  }, []);

  // ── Socket.IO setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const socket = socketIO(ENV.socketUrl, { withCredentials: true, transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('[Admin Support] Socket connected');
    });

    // New message in any conversation
    socket.on('support:new_message', ({ message }: { message: ChatMessage }) => {
      // If the message belongs to the currently open conversation, add it
      if (message.conversationId === selectedConvId) {
        setActiveMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }

      // Update sidebar preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === message.conversationId
            ? {
                ...c,
                lastActivityAt: message.createdAt,
                adminUnreadCount:
                  message.senderRole === 'user' && message.conversationId !== selectedConvId
                    ? (c.adminUnreadCount || 0) + 1
                    : c.adminUnreadCount,
                lastMessage: { content: message.content.slice(0, 80), createdAt: message.createdAt },
              }
            : c
        )
      );
    });

    // New ticket created by any user
    socket.on('support:ticket_created', ({ ticket }: { ticket: AdminTicket }) => {
      fetchConversations(); // refresh stats + list
    });

    // Conversation activity update
    socket.on('support:conversation_updated', ({ conversationId, lastMessage, lastActivityAt }: any) => {
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === conversationId
              ? { ...c, lastActivityAt, lastMessage: { content: lastMessage, createdAt: lastActivityAt } }
              : c
          )
          .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
      );
    });

    // Status changed remotely
    socket.on('support:status_changed', ({ ticketId, newStatus }: { ticketId: string; newStatus: TicketStatus }) => {
      setActiveTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: newStatus } : t))
      );
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [selectedConvId, fetchConversations]);

  // ── Re-join room when selection changes ───────────────────────────────────
  useEffect(() => {
    if (selectedConvId && socketRef.current?.connected) {
      socketRef.current.emit('support:join_conversation', { conversationId: selectedConvId });
    }
  }, [selectedConvId]);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    // List
    conversations,
    stats,
    isLoadingList,
    fetchConversations,
    // Active conversation
    selectedConvId,
    activeConversation,
    activeMessages,
    activeTickets,
    isLoadingDetail,
    selectConversation,
    handleMessageSent,
    handleStatusChanged,
    // Filters
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    // Modals
    modals: {
      isLogModalOpen, setIsLogModalOpen,
      isApiModalOpen, setIsApiModalOpen,
      isScreenshotModalOpen, setIsScreenshotModalOpen,
      isTimelineModalOpen, setIsTimelineModalOpen,
    },
  };
};
