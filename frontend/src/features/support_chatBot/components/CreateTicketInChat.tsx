import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImageIcon, AlertCircle, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { useSupportWidgetContext } from '../context/SupportWidgetContext';
import { useSupportWidget } from '../hooks/useSupportWidget';
import { supportService } from '../services/support.service';
import { uploadScreenshot, validateScreenshotFile } from '../services/upload.service';
import { collectTicketPayload, flushLogs } from '../monitoring/sessionManager';
import type { Attachment } from '../../../pages/admin/types/supportAdmin.types';
import toast from 'react-hot-toast';

const ISSUE_TYPES = [
  'Login Issue',
  'Payment Issue',
  'Technical Issue',
  'Account Issue',
  'Feature Request',
  'Other',
] as const;

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

export const CreateTicketInChat: React.FC = () => {
  const { conversation } = useSupportWidgetContext();
  const { navigateTo } = useSupportWidget();

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<string>('Other');
  const [priority, setPriority] = useState<string>('Medium');
  const [screenshots, setScreenshots] = useState<Attachment[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    if (screenshots.length >= 3) {
      toast.error('Maximum 3 screenshots allowed per ticket');
      return;
    }

    const file = files[0];
    const error = validateScreenshotFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    const newIndex = screenshots.length;
    setUploadingIndex(newIndex);
    try {
      const attachment = await uploadScreenshot(file);
      setScreenshots((prev) => [...prev, attachment]);
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploadingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in the subject and description');
      return;
    }
    if (!conversation) {
      toast.error('No active conversation found');
      return;
    }

    setIsSubmitting(true);
    try {
      // Collect monitoring logs
      const { consoleLogs, apiFailures, timeline, sessionMetadata } = collectTicketPayload();

      await supportService.createTicket({
        conversationId: conversation._id,
        subject: subject.trim(),
        description: description.trim(),
        issueType,
        priority,
        screenshotUrls: screenshots.map((s) => s.url),
        screenshotPublicIds: screenshots.map((s) => s.publicId || ''),
        consoleLogs,
        apiFailures,
        timeline,
        sessionMetadata,
      });

      // Clear local logs after successful submission
      flushLogs();

      toast.success('Ticket created! Our team will reply shortly.');
      navigateTo('success');
    } catch {
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col gap-4 p-5 overflow-y-auto"
    >
      {/* Subject */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Subject *</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief description of your issue"
          maxLength={200}
          className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
        />
      </div>

      {/* Issue type + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Issue Type</label>
          <div className="relative">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full appearance-none text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-400 pr-8"
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Priority</label>
          <div className="relative">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full appearance-none text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-indigo-400 pr-8"
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail…"
          rows={4}
          maxLength={5000}
          className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition resize-none"
        />
        <p className="text-[10px] text-slate-400 mt-1">{description.length}/5000</p>
      </div>

      {/* Screenshot Upload */}
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">
          Screenshots <span className="font-normal text-slate-400">(max 3)</span>
        </label>

        {/* Drop Zone */}
        {screenshots.length < 3 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-5 cursor-pointer transition-colors ${
              dragOver
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100'
            }`}
          >
            <Upload size={20} className={dragOver ? 'text-indigo-500' : 'text-slate-400'} />
            <p className="text-xs text-slate-500">
              {dragOver ? 'Drop to upload' : 'Click or drag to upload screenshot'}
            </p>
            <p className="text-[10px] text-slate-400">PNG, JPG, WEBP · max 5MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        {/* Preview grid */}
        {(screenshots.length > 0 || uploadingIndex !== null) && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {screenshots.map((s, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                <img src={s.url} alt={s.fileName} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeScreenshot(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {uploadingIndex !== null && (
              <div className="aspect-square rounded-lg border-2 border-dashed border-indigo-300 flex items-center justify-center bg-indigo-50">
                <Loader2 size={18} className="text-indigo-500 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-700 leading-relaxed">
          Session logs (console errors, API failures, page interactions) will be automatically attached to help our team debug your issue.
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !subject.trim() || !description.trim()}
        className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <CheckCircle size={16} />
            Submit Ticket
          </>
        )}
      </button>
    </motion.div>
  );
};
