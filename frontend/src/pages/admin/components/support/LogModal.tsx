import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, AlertTriangle, Info, Terminal } from 'lucide-react';
import type { ConsoleLog } from '../../types/supportAdmin.types';
import { formatDate } from '../../utils/logFormatter';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ConsoleLog[];
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, logs }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(search.toLowerCase()) || 
    (log.stackTrace && log.stackTrace.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white shadow-inner">
                <Terminal size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">Console Logs</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{logs.length} events captured</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-6 py-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs, errors, or stack traces..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
          </div>

          {/* Log List */}
          <div className="flex-1 overflow-auto bg-slate-50 p-6 custom-scrollbar">
            {filteredLogs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filteredLogs.map(log => (
                  <div key={log.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className={`
                      px-4 py-2.5 border-b flex items-center justify-between
                      ${log.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-900' : ''}
                      ${log.type === 'warn' ? 'bg-amber-50 border-amber-100 text-amber-900' : ''}
                      ${log.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-900' : ''}
                    `}>
                      <div className="flex items-center gap-2">
                        {log.type === 'error' && <AlertTriangle size={16} className="text-rose-600" />}
                        {log.type === 'warn' && <AlertTriangle size={16} className="text-amber-600" />}
                        {log.type === 'info' && <Info size={16} className="text-blue-600" />}
                        <span className="text-xs font-bold uppercase tracking-wider">{log.type}</span>
                      </div>
                      <span className="text-xs font-semibold opacity-70">{formatDate(log.timestamp)}</span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-bold text-slate-800 mb-2 font-mono">{log.message}</p>
                      {log.stackTrace && (
                        <div className="mt-3 bg-slate-900 rounded-lg p-3 overflow-x-auto custom-scrollbar">
                          <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                            {log.stackTrace}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Terminal size={48} className="text-slate-300 mb-4" />
                <h4 className="text-slate-700 font-bold mb-1">No logs found</h4>
                <p className="text-sm text-slate-500">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
