import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Clock, HardDrive, Search } from 'lucide-react';
import type { ApiFailure } from '../../types/supportAdmin.types';
import { formatDate, formatDuration, formatBytes, syntaxHighlightJson } from '../../utils/logFormatter';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  failures: ApiFailure[];
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({ isOpen, onClose, failures }) => {
  const [selectedId, setSelectedId] = useState<string | null>(failures.length > 0 ? failures[0].id : null);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredFailures = failures.filter(f => 
    f.url.toLowerCase().includes(search.toLowerCase()) || 
    f.status.toString().includes(search)
  );

  const selected = failures.find(f => f.id === selectedId) || filteredFailures[0];

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-inner">
                <Server size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">API Inspector</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{failures.length} failed requests</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter URLs..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {filteredFailures.map(failure => {
                  const isSelected = selectedId === failure.id;
                  const isError = failure.status >= 400;
                  
                  return (
                    <button
                      key={failure.id}
                      onClick={() => setSelectedId(failure.id)}
                      className={`
                        w-full text-left p-3 mb-1 rounded-xl transition-all border
                        ${isSelected 
                          ? 'bg-white border-indigo-200 shadow-sm' 
                          : 'border-transparent hover:bg-slate-100'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          failure.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                          failure.method === 'POST' ? 'bg-emerald-100 text-emerald-700' :
                          failure.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {failure.method}
                        </span>
                        <span className={`text-[11px] font-bold ${isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {failure.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate" title={failure.url}>
                        {failure.url}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              {selected ? (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md ${
                        selected.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        selected.method === 'POST' ? 'bg-emerald-100 text-emerald-700' :
                        selected.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {selected.method}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 break-all">{selected.url}</h2>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                      <p className={`text-lg font-bold ${selected.status >= 400 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selected.status} {selected.statusText}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Clock size={16} className="text-indigo-400" />
                        <span className="font-bold">{selected.duration}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Size</p>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <HardDrive size={16} className="text-indigo-400" />
                        <span className="font-bold">{selected.responseSize}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Timestamp</p>
                      <p className="font-bold text-slate-700 text-sm">
                        {formatDate(selected.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Tabs simulation (Headers, Payload, Response) */}
                  <div className="space-y-6">
                    {selected.errorDetail && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">Error Details</h3>
                        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-800 font-mono text-sm">
                          {selected.errorDetail}
                        </div>
                      </div>
                    )}

                    {selected.payload && (
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-200 pb-2">Request Payload</h3>
                        <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto custom-scrollbar">
                          <pre className="text-sm font-mono leading-relaxed text-cyan-300">
                            {JSON.stringify(selected.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Server size={48} className="text-slate-300 mb-4" />
                  <h4 className="text-slate-700 font-bold mb-1">No Request Selected</h4>
                  <p className="text-sm text-slate-500">Select a request from the sidebar to inspect its details.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
