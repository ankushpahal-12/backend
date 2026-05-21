import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Activity, AlertCircle, Server, Monitor } from 'lucide-react';
import type { TimelineEvent } from '../../types/supportAdmin.types';

interface TimeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: TimelineEvent[];
}

export const TimeDetailModal: React.FC<TimeDetailModalProps> = ({ isOpen, onClose, timeline }) => {
  if (!isOpen) return null;

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'navigation': return <Monitor size={14} className="text-blue-600" />;
      case 'interaction': return <Activity size={14} className="text-indigo-600" />;
      case 'error': return <AlertCircle size={14} className="text-rose-600" />;
      case 'api': return <Server size={14} className="text-amber-600" />;
      case 'system': return <Clock size={14} className="text-slate-500" />;
      default: return <Activity size={14} className="text-slate-400" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'navigation': return 'bg-blue-100 border-blue-200';
      case 'interaction': return 'bg-indigo-100 border-indigo-200';
      case 'error': return 'bg-rose-100 border-rose-200';
      case 'api': return 'bg-amber-100 border-amber-200';
      case 'system': return 'bg-slate-100 border-slate-200';
      default: return 'bg-slate-100 border-slate-200';
    }
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-inner">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">Session Timeline</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{timeline.length} recorded events</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-slate-50 p-6 custom-scrollbar">
            {timeline.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6">
                {timeline.map((event, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={event.id} 
                    className="relative"
                  >
                    {/* Node marker */}
                    <div className={`absolute -left-[33px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          event.type === 'error' ? 'bg-rose-100 text-rose-700' :
                          event.type === 'api' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-xs font-bold text-slate-400 font-mono">{event.time}</span>
                      </div>
                      <p className="font-bold text-slate-800 text-sm mb-1">{event.action}</p>
                      {event.details && (
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                          {event.details}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Clock size={48} className="text-slate-300 mb-4" />
                <h4 className="text-slate-700 font-bold mb-1">No timeline available</h4>
                <p className="text-sm text-slate-500">Session recording might have been disabled.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
