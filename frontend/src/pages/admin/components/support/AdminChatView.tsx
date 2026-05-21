import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, FileText, Activity, Image as ImageIcon,
  BarChart2, CheckCircle, RotateCcw, Loader2, ChevronDown, Shield
} from 'lucide-react';
import type {
  ChatMessage, AdminTicket, Conversation,
  TicketStatus, Attachment
} from '../../types/supportAdmin.types';
import {
  STATUS_LABELS, getAllowedTransitions, isValidTransition
} from '../../types/supportAdmin.types';
import { supportAdminService } from '../../services/supportAdmin.service';
import { LogModal } from './LogModal';
import { ApiInspectorModal } from './ApiInspectorModal';
import { ScreenshotModal } from './ScreenshotModal';
import { TimeDetailModal } from './TimeDetailModal';
import toast from 'react-hot-toast';

interface AdminChatViewProps {
  conversation: Conversation | null;
  messages: ChatMessage[];
  tickets: AdminTicket[];
  onMessageSent: (msg: ChatMessage) => void;
  onStatusChanged: (ticketId: string, status: TicketStatus) => void;
  isLoading: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

const groupByDay = (msgs: ChatMessage[]) => {
  const groups: Array<{ date: string; messages: ChatMessage[] }> = [];
  for (const msg of msgs) {
    const d = formatDate(msg.createdAt);
    const last = groups[groups.length - 1];
    if (!last || last.date !== d) groups.push({ date: d, messages: [msg] });
    else last.messages.push(msg);
  }
  return groups;
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: 'bg-rose-100 text-rose-700',
  IN_PROGRESS: 'bg-amber-100 text-amber-700',
  WAITING_FOR_USER: 'bg-violet-100 text-violet-700',
  RESOLVED: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-slate-100 text-slate-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-blue-100 text-blue-700',
  High: 'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isAdmin = msg.senderRole === 'admin';
  const isBot = msg.senderRole === 'bot';
  const isSystem = msg.type === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-1">
        <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isAdmin && (
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 mb-1 ${
          isBot ? 'bg-indigo-500' : 'bg-gradient-to-br from-violet-500 to-indigo-600'
        }`}>
          {isBot ? <Bot size={13} /> : (msg.senderName?.[0]?.toUpperCase() || 'U')}
        </div>
      )}

      <div className={`max-w-[72%] flex flex-col gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
        {!isAdmin && (
          <span className="text-[10px] font-semibold text-slate-400 ml-1">
            {isBot ? '🤖 Bot' : msg.senderName}
          </span>
        )}

        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isAdmin
            ? 'bg-indigo-600 text-white rounded-br-sm'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
        }`}>
          {msg.content}
          {msg.attachments?.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {msg.attachments.map((att: Attachment, i: number) => (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={att.url}
                    alt={att.fileName}
                    className="max-w-full rounded-lg max-h-48 object-cover border border-white/20"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.createdAt)}</span>
      </div>
    </motion.div>
  );
};

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
      <Bot size={13} className="text-slate-500" />
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
      <div className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ─── Main AdminChatView ───────────────────────────────────────────────────────

export const AdminChatView: React.FC<AdminChatViewProps> = ({
  conversation,
  messages,
  tickets,
  onMessageSent,
  onStatusChanged,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState('');

  // Active ticket (latest open/in-progress ticket in this conversation)
  const activeTicket = tickets?.find(
    (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS' || t.status === 'WAITING_FOR_USER'
  ) || tickets?.[0] || null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendReply = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !activeTicket || !conversation) return;

    setInput('');
    setIsSending(true);
    try {
      const { message } = await supportAdminService.sendAdminReply(
        activeTicket._id,
        trimmed,
        conversation._id
      );
      onMessageSent(message);
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, activeTicket, conversation, onMessageSent]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!activeTicket) return;
    setIsChangingStatus(true);
    try {
      await supportAdminService.updateTicketStatus(activeTicket._id, newStatus);
      onStatusChanged(activeTicket._id, newStatus);
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid status transition');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <MessageSquareIcon />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-600">No conversation selected</p>
          <p className="text-sm mt-1">Select a conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  const groups = groupByDay([...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ));

  const allowedTransitions = activeTicket ? getAllowedTransitions(activeTicket.status) : [];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      {/* ── Ticket Header ───────────────────────────────────────────────── */}
      {activeTicket && (
        <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 truncate">{activeTicket.subject}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[activeTicket.status]}`}>
                  {STATUS_LABELS[activeTicket.status]}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[activeTicket.priority]}`}>
                  {activeTicket.priority}
                </span>
                <span className="text-[11px] text-slate-400">{activeTicket.issueType}</span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
              {/* Debug Tools */}
              {activeTicket.consoleLogs?.length > 0 && (
                <ToolButton icon={<FileText size={14} />} label="Logs" onClick={() => setLogModalOpen(true)} color="text-rose-600 bg-rose-50 hover:bg-rose-100" />
              )}
              {activeTicket.apiFailures?.length > 0 && (
                <ToolButton icon={<BarChart2 size={14} />} label="API" onClick={() => setApiModalOpen(true)} color="text-amber-600 bg-amber-50 hover:bg-amber-100" />
              )}
              {activeTicket.timeline?.length > 0 && (
                <ToolButton icon={<Activity size={14} />} label="Timeline" onClick={() => setTimelineModalOpen(true)} color="text-indigo-600 bg-indigo-50 hover:bg-indigo-100" />
              )}
              {activeTicket.screenshotUrls?.length > 0 && (
                <ToolButton
                  icon={<ImageIcon size={14} />}
                  label={`${activeTicket.screenshotUrls.length} Shot${activeTicket.screenshotUrls.length > 1 ? 's' : ''}`}
                  onClick={() => { setSelectedScreenshotUrl(activeTicket.screenshotUrls[0]); setScreenshotModalOpen(true); }}
                  color="text-violet-600 bg-violet-50 hover:bg-violet-100"
                />
              )}

              {/* Status changer */}
              {allowedTransitions.length > 0 && (
                <StatusDropdown
                  current={activeTicket.status}
                  allowed={allowedTransitions}
                  onChange={handleStatusChange}
                  isLoading={isChangingStatus}
                />
              )}
            </div>
          </div>

          {/* Session metadata strip */}
          {activeTicket.sessionMetadata && (
            <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 flex-wrap">
              <span>🌐 {activeTicket.sessionMetadata.browser}</span>
              <span>💻 {activeTicket.sessionMetadata.os}</span>
              <span>📐 {activeTicket.sessionMetadata.resolution}</span>
              <span>📶 {activeTicket.sessionMetadata.connection}</span>
              <span className={activeTicket.sessionMetadata.networkStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'}>
                ● {activeTicket.sessionMetadata.networkStatus}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Messages ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {groups.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-semibold text-slate-400">{group.date}</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              {group.messages.map((msg) => (
                <MessageBubble key={msg._id} msg={msg} />
              ))}
            </div>
          ))}

          <AnimatePresence>
            {isTyping && (
              <motion.div key="typing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      )}

      {/* ── Reply Input ───────────────────────────────────────────────────── */}
      {activeTicket && activeTicket.status !== 'CLOSED' && (
        <div className="shrink-0 px-6 pb-5 pt-3 bg-white border-t border-slate-200">
          <div className="flex items-end gap-3 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a reply… (Enter to send, Shift+Enter for newline)"
              rows={2}
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none outline-none leading-relaxed max-h-32"
            />
            <button
              onClick={sendReply}
              disabled={!input.trim() || isSending}
              className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors shrink-0 self-end"
            >
              {isSending
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Send size={15} strokeWidth={2.5} />
              }
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
            Replying as Admin · Ticket ID: {activeTicket._id?.slice(-8)}
          </p>
        </div>
      )}

      {activeTicket?.status === 'CLOSED' && (
        <div className="shrink-0 px-6 py-4 bg-slate-100 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500 font-medium">This ticket is closed.</p>
        </div>
      )}

      {/* ── Debug Modals ─────────────────────────────────────────────────── */}
      {activeTicket && (
        <>
          <LogModal isOpen={logModalOpen} onClose={() => setLogModalOpen(false)} logs={activeTicket.consoleLogs} />
          <ApiInspectorModal isOpen={apiModalOpen} onClose={() => setApiModalOpen(false)} failures={activeTicket.apiFailures} />
          <ScreenshotModal isOpen={screenshotModalOpen} onClose={() => setScreenshotModalOpen(false)} imageUrl={selectedScreenshotUrl} />
          <TimeDetailModal isOpen={timelineModalOpen} onClose={() => setTimelineModalOpen(false)} timeline={activeTicket.timeline} />
        </>
      )}
    </div>
  );
};

// ─── Small helper components ──────────────────────────────────────────────────

const ToolButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; color: string }> = ({ icon, label, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${color}`}
  >
    {icon}
    {label}
  </button>
);

const StatusDropdown: React.FC<{
  current: TicketStatus;
  allowed: TicketStatus[];
  onChange: (s: TicketStatus) => void;
  isLoading: boolean;
}> = ({ current, allowed, onChange, isLoading }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {isLoading
          ? <Loader2 size={12} className="animate-spin" />
          : <Shield size={12} />
        }
        Change Status
        <ChevronDown size={11} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[160px]"
          >
            {allowed.map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                → {STATUS_LABELS[s]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MessageSquareIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
