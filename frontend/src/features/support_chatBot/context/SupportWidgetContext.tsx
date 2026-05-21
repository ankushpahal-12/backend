import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supportService, type Conversation } from '../services/support.service';
import type { ChatMessage } from '../../admin/types/supportAdmin.types';
import { io as socketIO, Socket } from 'socket.io-client';
import { ENV } from '../../../config/env';

export type WidgetView = 'home' | 'chat' | 'form' | 'list' | 'detail' | 'success';

interface SupportWidgetContextType {
  isOpen: boolean;
  toggleWidget: () => void;
  openWidget: () => void;
  closeWidget: () => void;
  currentView: WidgetView;
  setView: (view: WidgetView) => void;
  activeTicketId: string | null;
  setActiveTicketId: (id: string | null) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  // Chat state
  conversation: Conversation | null;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  isLoadingConversation: boolean;
  isSocketReady: boolean;
  // Auth gate
  isAuthenticated: boolean;
  userName: string;
}

const SupportWidgetContext = createContext<SupportWidgetContextType | undefined>(undefined);

export const SupportWidgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<WidgetView>('home');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Chat state
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSocketReady, setIsSocketReady] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const isUserAuthenticated = isAuthenticated && user?.role !== 'admin';

  // Load conversation once user is authenticated and widget opens
  const loadConversation = useCallback(async () => {
    if (!isUserAuthenticated || conversation) return;
    setIsLoadingConversation(true);
    try {
      const data = await supportService.getOrCreateConversation();
      setConversation(data.conversation);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      // Set a dummy conversation to allow UI to continue functioning
      setConversation({
        _id: 'offline_' + Date.now(),
        userId: user?._id || '',
        status: 'active',
        ticketIds: [],
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoadingConversation(false);
    }
  }, [isUserAuthenticated, conversation, user?._id]);

  // Connect Socket.IO when authenticated
  useEffect(() => {
    if (!isUserAuthenticated) return;

    // Validate socket URL is configured
    if (!ENV.socketUrl) {
      console.error('Socket URL not configured in ENV');
      return;
    }

    const socket = socketIO(ENV.socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      setIsSocketReady(true);
    });

    socket.on('disconnect', () => {
      setIsSocketReady(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Widget will gracefully degrade to HTTP-only polling
    });

    socket.on('support:new_message', ({ message }: { message: ChatMessage }) => {
      setMessages((prev) => {
        // Deduplicate
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      // Increment unread if widget is closed
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isUserAuthenticated, isOpen]);

  // Join conversation room when conversation is loaded
  useEffect(() => {
    if (!socketRef.current || !conversation?._id) return;
    socketRef.current.emit('support:join_conversation', {
      conversationId: conversation._id,
    });
  }, [conversation?._id]);

  // Load conversation on first open
  useEffect(() => {
    if (isOpen && isUserAuthenticated && !conversation) {
      loadConversation();
    }
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen, isUserAuthenticated, conversation, loadConversation]);

  const toggleWidget = () => setIsOpen((prev) => !prev);
  const openWidget = () => { setIsOpen(true); setUnreadCount(0); };
  const closeWidget = () => setIsOpen(false);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m._id === msg._id)) return prev;
      return [...prev, msg];
    });
  };

  return (
    <SupportWidgetContext.Provider
      value={{
        isOpen,
        toggleWidget,
        openWidget,
        closeWidget,
        currentView,
        setView: setCurrentView,
        activeTicketId,
        setActiveTicketId,
        unreadCount,
        setUnreadCount,
        conversation,
        messages,
        addMessage,
        isLoadingConversation,
        isSocketReady,
        isAuthenticated: isUserAuthenticated,
        userName: user?.name || 'there',
      }}
    >
      {children}
    </SupportWidgetContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSupportWidgetContext = () => {
  const context = useContext(SupportWidgetContext);
  if (!context) {
    throw new Error('useSupportWidgetContext must be used within a SupportWidgetProvider');
  }
  return context;
};
