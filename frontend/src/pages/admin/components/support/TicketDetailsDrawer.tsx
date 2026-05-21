import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, Image as ImageIcon, Download, Maximize2, 
  Terminal, Server, Clock, Activity, Send, CheckCircle
} from 'lucide-react';
import type { AdminTicket, TicketStatus } from '../../types/supportAdmin.types';
import { formatDate } from '../../utils/logFormatter';
import { Link } from 'react-router-dom';

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: AdminTicket | null;
  onStatusChange: (id: string, status: TicketStatus) => void;
  onSendReply: (id: string, message: string) => void;
  openLogModal: () => void;
  openApiModal: () => void;
  openScreenshotModal: () => void;
  openTimelineModal: () => void;
  isEmbedded?: boolean;
}

export const TicketDetailsDrawer: React.FC<TicketDetailsDrawerProps> = ({
  isOpen, onClose, ticket, onStatusChange, onSendReply,
  openLogModal, openApiModal, openScreenshotModal, openTimelineModal, isEmbedded = false
}) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Logs' | 'Timeline' | 'Replies'>('Overview');
  const [replyMessage, setReplyMessage] = useState('');

  if (!ticket) return null;

  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    onSendReply(ticket.id, replyMessage);
    setReplyMessage('');
  };

  const renderStatusBadge = (status: TicketStatus) => {
    const styles = {
      'Open': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'Resolved': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Closed': 'bg-slate-100 text-slate-700 border-slate-200'
    };
    return <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${styles[status]}`}>{status}</span>;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {!isEmbedded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
              onClick={onClose}
            />
          )}

          {/* Drawer */}
          <motion.div
            initial={isEmbedded ? false : { x: '100%' }}
            animate={isEmbedded ? false : { x: 0 }}
            exit={isEmbedded ? false : { x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={
              isEmbedded 
                ? "w-full h-full bg-slate-50 flex flex-col" 
                : "fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-slate-50 shadow-2xl border-l border-slate-200 flex flex-col"
            }
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">Ticket {ticket.id}</h2>
                  {renderStatusBadge(ticket.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/admin/support/tickets/${ticket.id.replace('#', '')}`}
                    target={isEmbedded ? "_self" : "_blank"}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors tooltip-trigger"
                    title="Open in New Tab"
                  >
                    <ExternalLink size={18} />
                  </Link>
                  {!isEmbedded && (
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-xs font-semibold text-slate-500 mb-6">
                Created: {formatDate(ticket.createdAt)}
              </p>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-200">
                {(['Overview', 'Logs', 'Timeline', 'Replies'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-bold relative transition-colors ${
                      activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                    {tab === 'Replies' && ticket.replies.length > 0 && (
                      <span className="ml-1.5 bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full">
                        {ticket.replies.length}
                      </span>
                    )}
                    {activeTab === tab && (
                      <motion.div layoutId="activeDrawerTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">User Information</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <img src={ticket.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user.name)}`} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{ticket.user.name}</p>
                          <p className="text-xs font-semibold text-slate-500">{ticket.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                        <span>User ID: <span className="text-slate-700">{ticket.user.id}</span></span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Ticket Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Issue Type</span>
                          <span className="font-bold text-slate-800">{ticket.issueType}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Priority</span>
                          <span className={`font-bold ${ticket.priority === 'High' || ticket.priority === 'Critical' ? 'text-rose-600' : 'text-amber-600'}`}>{ticket.priority}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Browser</span>
                          <span className="font-bold text-slate-800 truncate max-w-[120px]">{ticket.deviceMetadata.browser}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">OS</span>
                          <span className="font-bold text-slate-800">{ticket.deviceMetadata.os}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h4>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{ticket.description}</p>
                  </div>

                  {/* Screenshot */}
                  {ticket.screenshotUrl && (
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Screenshot</h4>
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center min-h-[200px]">
                        <img src={ticket.screenshotUrl} alt="Issue" className="max-h-64 object-contain" />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button onClick={openScreenshotModal} className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                            <Maximize2 size={16} /> View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Device & Network Details */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Device & Browser</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Resolution</span>
                          <span className="font-bold text-slate-800">{ticket.deviceMetadata.resolution}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                          {ticket.deviceMetadata.userAgent}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Network Info</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Connection</span>
                          <span className="font-bold text-slate-800">{ticket.networkInfo.connection}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Status</span>
                          <span className="font-bold text-emerald-600">{ticket.networkInfo.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Speed</span>
                          <span className="font-bold text-slate-800">{ticket.networkInfo.downlink}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500 font-semibold">Latency (RTT)</span>
                          <span className="font-bold text-slate-800">{ticket.networkInfo.rtt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LOGS TAB */}
              {activeTab === 'Logs' && (
                <div className="space-y-6">
                  {/* Console Errors */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Terminal size={14} /> Console Errors ({ticket.logs.length})
                      </h4>
                      {ticket.logs.length > 0 && (
                        <button onClick={openLogModal} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all</button>
                      )}
                    </div>
                    {ticket.logs.length > 0 ? (
                      <div className="space-y-3">
                        {ticket.logs.slice(0, 3).map(log => (
                          <div key={log.id} className="bg-rose-50 border border-rose-100 rounded-lg p-3">
                            <p className="text-xs font-bold text-rose-700 mb-1 font-mono">{log.message}</p>
                            <p className="text-[10px] font-semibold text-rose-500 opacity-70">{formatDate(log.timestamp)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-500 text-center py-4">No console errors recorded.</p>
                    )}
                  </div>

                  {/* API Failures */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Server size={14} /> API Failures ({ticket.apiFailures.length})
                      </h4>
                      {ticket.apiFailures.length > 0 && (
                        <button onClick={openApiModal} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View request/response</button>
                      )}
                    </div>
                    {ticket.apiFailures.length > 0 ? (
                      <div className="space-y-3">
                        {ticket.apiFailures.slice(0, 3).map(api => (
                          <div key={api.id} className="border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors cursor-pointer" onClick={openApiModal}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{api.method}</span>
                              <span className="text-[10px] font-bold text-rose-600">{api.status} {api.statusText}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 font-mono truncate">{api.url}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-semibold text-slate-400">
                              <span className="flex items-center gap-1"><Clock size={10} /> {api.duration}</span>
                              <span>{formatDate(api.timestamp)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-500 text-center py-4">No API failures recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TIMELINE TAB */}
              {activeTab === 'Timeline' && (
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity size={14} /> Session Timeline
                    </h4>
                    {ticket.timeline.length > 0 && (
                      <button onClick={openTimelineModal} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Full Timeline</button>
                    )}
                  </div>
                  
                  {ticket.timeline.length > 0 ? (
                    <div className="relative pl-4 border-l-2 border-indigo-100 space-y-4">
                      {ticket.timeline.slice(0, 8).map(event => (
                        <div key={event.id} className="relative">
                          <div className={`absolute -left-[21px] top-1.5 w-2 h-2 rounded-full ${
                            event.type === 'error' ? 'bg-rose-500' : 
                            event.type === 'api' ? 'bg-amber-500' : 
                            'bg-indigo-500'
                          }`} />
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-bold text-slate-400 mt-0.5 w-14 shrink-0">{event.time}</span>
                            <div>
                              <p className={`text-sm font-bold ${
                                event.type === 'error' ? 'text-rose-600' : 'text-slate-800'
                              }`}>{event.action}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-500 text-center py-8">No timeline recorded.</p>
                  )}
                </div>
              )}

              {/* REPLIES TAB */}
              {activeTab === 'Replies' && (
                <div className="flex flex-col h-full bg-slate-50 -mx-6 -mt-6">
                  <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6">
                    {/* Initial Description as first message */}
                    <div className="flex items-start gap-4">
                      <img src={ticket.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user.name)}`} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm max-w-[85%]">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-slate-800">{ticket.user.name}</span>
                          <span className="text-[10px] font-semibold text-slate-400">{formatDate(ticket.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                        {ticket.screenshotUrl && (
                          <img src={ticket.screenshotUrl} alt="Attached" className="mt-3 max-w-full h-32 object-cover rounded-lg border border-slate-200" />
                        )}
                      </div>
                    </div>

                    {ticket.replies.map(reply => (
                      <div key={reply.id} className={`flex items-start gap-4 ${reply.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                        <img 
                          src={reply.sender === 'admin' ? 'https://ui-avatars.com/api/?name=Admin+Support&background=4f46e5&color=fff' : (ticket.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ticket.user.name)}`)} 
                          alt="" 
                          className="w-8 h-8 rounded-full shadow-sm" 
                        />
                        <div className={`
                          border rounded-2xl p-4 shadow-sm max-w-[85%]
                          ${reply.sender === 'admin' ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-sm' : 'bg-white border-slate-200 text-slate-700 rounded-tl-sm'}
                        `}>
                          <div className="flex justify-between items-center mb-2 gap-4">
                            <span className={`text-sm font-bold ${reply.sender === 'admin' ? 'text-white' : 'text-slate-800'}`}>
                              {reply.sender === 'admin' ? 'You' : ticket.user.name}
                            </span>
                            <span className={`text-[10px] font-semibold ${reply.sender === 'admin' ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${reply.sender === 'admin' ? 'text-indigo-50' : 'text-slate-700'}`}>
                            {reply.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="relative flex items-center">
                      <textarea
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none h-[52px] overflow-hidden leading-relaxed custom-scrollbar"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply();
                          }
                        }}
                      />
                      <button 
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                      >
                        <Send size={16} className={replyMessage.trim() ? 'translate-x-[-1px] translate-y-[1px]' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Admin Footer Actions */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Change Status:</span>
                <select 
                  value={ticket.status}
                  onChange={(e) => onStatusChange(ticket.id, e.target.value as TicketStatus)}
                  className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              
              {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <button 
                  onClick={() => onStatusChange(ticket.id, 'Resolved')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                >
                  <CheckCircle size={16} /> Mark as Resolved
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
