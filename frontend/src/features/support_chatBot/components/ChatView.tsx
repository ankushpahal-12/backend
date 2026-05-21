import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Ticket, Bot, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { useSupportWidgetContext } from '../context/SupportWidgetContext';
import { useSupportWidget } from '../hooks/useSupportWidget';
import type { ChatMessage } from '../../../pages/admin/types/supportAdmin.types';
import { supportService } from '../services/support.service';
import { uploadScreenshot, validateScreenshotFile } from '../services/upload.service';
import toast from 'react-hot-toast';

// ─── Bot auto-reply trigger keywords ─────────────────────────────────────────
const BOT_TRIGGER_KEYWORDS = /error|issue|bug|not working|problem|crash|broken|fail|can't|cannot/i;
const BOT_REPLY =
  'Please create a ticket with the issue details and a screenshot. We will investigate and reply as soon as possible. 🎫';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

// Group messages by calendar day
const groupByDay = (msgs: ChatMessage[]) => {
  const groups: Array<{ date: string; messages: ChatMessage[] }> = [];
  for (const msg of msgs) {
    const d = formatDate(msg.createdAt);
    const last = groups[groups.length - 1];
    if (!last || last.date !== d) {
      groups.push({ date: d, messages: [msg] });
    } else {
      last.messages.push(msg);
    }
  }
  return groups;
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: ChatMessage; isUser: boolean }> = ({ msg, isUser }) => {
  const isSystem = msg.type === 'system';
  const isBot = msg.senderRole === 'bot';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1 rounded-full font-medium">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1 ${
            isBot ? 'bg-indigo-100' : 'bg-slate-200'
          }`}
        >
          {isBot ? (
            <Bot size={14} className="text-indigo-600" />
          ) : (
            <span className="text-[11px] font-bold text-slate-600">
              {msg.senderName?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          )}
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {/* Sender name (for admin/bot messages) */}
        {!isUser && (
          <span className="text-[10px] font-semibold text-slate-400 ml-1">
            {isBot ? '🤖 Support Bot' : msg.senderName}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
          }`}
        >
          {msg.content}

          {/* Attachments */}
          {msg.attachments?.length > 0 && (
            <div className="mt-2 flex flex-col gap-1">
              {msg.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={att.url}
                    alt={att.fileName}
                    className="max-w-full rounded-lg border border-white/20 max-h-40 object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <span className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left'} ml-1`}>
          {formatTime(msg.createdAt)}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-2 px-1">
    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
      <Bot size={14} className="text-slate-500" />
    </div>
    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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

// ─── Main ChatView ────────────────────────────────────────────────────────────

export const ChatView: React.FC = () => {
  const { conversation, messages, addMessage, userName } = useSupportWidgetContext();
  const { navigateTo } = useSupportWidget();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synthetic local messages (bot greeting, before conversation loads)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, localMessages, isTyping]);

  // Auto-greet when chat opens
  useEffect(() => {
    if (hasGreeted) return;
    setHasGreeted(true);

    const greet1: ChatMessage = {
      _id: `bot_${Date.now()}_1`,
      conversationId: conversation?._id || 'local',
      sender: 'bot',
      senderRole: 'bot',
      senderName: 'Support Bot',
      content: `Hi ${userName} 👋`,
      type: 'text',
      attachments: [],
      readBy: [],
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setLocalMessages([greet1]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setLocalMessages((prev) => [
          ...prev,
          {
            _id: `bot_${Date.now()}_2`,
            conversationId: conversation?._id || 'local',
            sender: 'bot',
            senderRole: 'bot',
            senderName: 'Support Bot',
            content: 'How can I help you today?',
            type: 'text',
            attachments: [],
            readBy: [],
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 1200);
    }, 400);
  }, [hasGreeted, userName, conversation?._id]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !conversation) return;

    setInput('');
    setIsSending(true);

    // Add optimistic user message
    const optimistic: ChatMessage = {
      _id: `opt_${Date.now()}`,
      conversationId: conversation._id,
      sender: 'user',
      senderRole: 'user',
      senderName: userName,
      content: trimmed,
      type: 'text',
      attachments: [],
      readBy: [],
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimistic]);

    try {
      await supportService.sendMessage(conversation._id, trimmed);

      // Check for bot trigger keywords
      if (BOT_TRIGGER_KEYWORDS.test(trimmed)) {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setLocalMessages((prev) => [
            ...prev,
            {
              _id: `bot_${Date.now()}`,
              conversationId: conversation._id,
              sender: 'bot',
              senderRole: 'bot',
              senderName: 'Support Bot',
              content: BOT_REPLY,
              type: 'text',
              attachments: [],
              readBy: [],
              createdAt: new Date().toISOString(),
            },
          ]);
        }, 800);
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, conversation, userName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversation) return;

    const validationError = validateScreenshotFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploadingFile(true);
    try {
      const attachment = await uploadScreenshot(file);

      // Send a message with the image attachment
      await supportService.sendMessage(conversation._id, '📎 Shared a screenshot', 'image', [attachment]);

      // Optimistic image bubble
      setLocalMessages((prev) => [
        ...prev,
        {
          _id: `opt_img_${Date.now()}`,
          conversationId: conversation._id,
          sender: 'user',
          senderRole: 'user',
          senderName: userName,
          content: '📎 Shared a screenshot',
          type: 'image',
          attachments: [attachment],
          readBy: [],
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      toast.error('Screenshot upload failed. Please try again.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const allMessages = [...messages, ...localMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const groups = groupByDay(allMessages);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50">
        {groups.map((group) => (
          <div key={group.date} className="space-y-3">
            {/* Date divider */}
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-semibold text-slate-400">{group.date}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            {group.messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                msg={msg}
                isUser={msg.senderRole === 'user'}
              />
            ))}
          </div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Create Ticket CTA */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
        <button
          onClick={() => navigateTo('form')}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
        >
          <Ticket size={14} />
          Create a Support Ticket
        </button>
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 pb-4 pt-2 bg-white border-t border-slate-100">
        <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2">
          {/* File upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            className="text-slate-400 hover:text-indigo-500 transition-colors p-1 shrink-0 self-end mb-1"
            title="Attach screenshot"
          >
            {uploadingFile ? (
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Paperclip size={18} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none outline-none max-h-28 leading-relaxed"
            style={{ minHeight: '24px' }}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 self-end"
          >
            {isSending ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={14} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
