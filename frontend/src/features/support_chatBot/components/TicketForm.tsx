import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Monitor, Wifi, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useTickets } from '../hooks/useTickets';
import { useSupportWidget } from '../hooks/useSupportWidget';
import { ScreenShotUpload } from './ScreenShotUpload';
import { collectTicketPayload, flushLogs } from '../monitoring/sessionManager';
import { collectMetadata } from '../monitoring/metadataCollector';
import type { IssueType, TicketPriority } from '../types/support.types';
import toast from 'react-hot-toast';

const ISSUE_TYPES: IssueType[] = [
  'Login Issue',
  'Payment Issue',
  'Technical Issue',
  'Account Issue',
  'Feature Request',
  'Other',
];

const PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const TicketForm: React.FC = () => {
  const { createTicket, isLoading } = useTickets();
  const { navigateTo, setActiveTicketId } = useSupportWidget();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<IssueType>('Other');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotPublicId, setScreenshotPublicId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Collect metadata once on mount
  const metadata = collectMetadata();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim()) {
      setFormError('Please enter a subject for your ticket.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please describe the issue.');
      return;
    }

    try {
      // Collect monitoring payload from sessionStorage
      const { consoleLogs, apiFailures, timeline, sessionMetadata } = collectTicketPayload();

      const newTicket = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        issueType,
        priority,
        screenshotUrls: screenshotUrl ? [screenshotUrl] : [],
        screenshotPublicIds: screenshotPublicId ? [screenshotPublicId] : [],
        consoleLogs,
        apiFailures,
        timeline,
        sessionMetadata,
      });

      // Clear local logs after successful submission
      flushLogs();

      toast.success('Ticket created! Our team will reply shortly.');
      setActiveTicketId((newTicket as any)._id || null);
      navigateTo('success');
    } catch (err: any) {
      const msg = err.message || 'Failed to submit ticket. Please try again.';
      setFormError(msg);
      toast.error(msg);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit}
      className="p-5 flex flex-col gap-4 overflow-y-auto"
    >
      {/* Error banner */}
      {formError && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700">{formError}</p>
        </div>
      )}

      {/* Subject */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Subject *</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of the issue…"
          maxLength={200}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-slate-400 text-sm text-slate-900"
        />
      </div>

      {/* Issue Type + Priority grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Issue Type</label>
          <div className="relative">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-slate-900 pr-8"
            >
              {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full appearance-none px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-slate-900 pr-8"
            >
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Description *</label>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail…"
            required
            maxLength={5000}
            rows={4}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none placeholder:text-slate-400 text-sm text-slate-900"
          />
          <span className="absolute bottom-2 right-3 text-[10px] font-semibold text-slate-400">
            {description.length}/5000
          </span>
        </div>
      </div>

      {/* Screenshot upload */}
      <ScreenShotUpload
        onUploadSuccess={(url, publicId) => {
          setScreenshotUrl(url);
          setScreenshotPublicId(publicId || '');
        }}
      />

      {/* Auto-collected metadata preview */}
      {metadata && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
          <p className="text-[11px] font-bold text-indigo-700 mb-2">
            🔬 Debug info auto-attached:
          </p>
          <div className="flex flex-col gap-1.5">
            <MetaRow icon={<Globe size={12} />} label="Page" value={metadata.currentRoute} />
            <MetaRow icon={<Monitor size={12} />} label="Browser" value={`${metadata.browser} · ${metadata.os}`} />
            <MetaRow
              icon={<Wifi size={12} />}
              label="Network"
              value={metadata.networkStatus}
              highlight={metadata.networkStatus === 'online' ? 'emerald' : 'rose'}
            />
          </div>
        </div>
      )}

      {/* Session log notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
        <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700">
          Console errors, API failures, and page interactions will be attached automatically to help diagnose your issue.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !description.trim() || !subject.trim()}
        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 mt-1"
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <Send size={16} />
            Submit Ticket
          </>
        )}
      </button>
    </motion.form>
  );
};

// Small helper
const MetaRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: 'emerald' | 'rose';
}> = ({ icon, label, value, highlight }) => (
  <div className="flex items-center gap-2 text-[11px]">
    <span className="text-indigo-400 shrink-0">{icon}</span>
    <span className="font-semibold text-slate-500 w-14 shrink-0">{label}</span>
    <span
      className={`truncate font-medium ${
        highlight === 'emerald'
          ? 'text-emerald-600'
          : highlight === 'rose'
          ? 'text-rose-600'
          : 'text-slate-600'
      }`}
    >
      {value}
    </span>
  </div>
);
