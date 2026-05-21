import React, { useState, useRef } from 'react';
import { Paperclip, Send, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScreenshotUpload } from '../hooks/useScreenshotUpload';

interface TicketReplyProps {
  onSend: (message: string, attachmentUrl?: string) => Promise<void>;
}

export const TicketReply: React.FC<TicketReplyProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    previewUrl,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    uploadFile,
    removeFile
  } = useScreenshotUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
      await uploadFile();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !previewUrl) return;

    setIsSending(true);
    try {
      let finalUrl = undefined;
      // If there is an uploaded preview, we pass it along (in a real app, uploadFile would return the S3 URL)
      if (previewUrl && !isUploading) {
         finalUrl = previewUrl; 
      }
      
      await onSend(message, finalUrl);
      setMessage('');
      removeFile();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border-t border-slate-100 flex flex-col gap-3">
      
      {/* Attachment Preview Area */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative w-24 h-24 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50"
          >
            <img src={previewUrl} alt="Attachment" className="w-full h-full object-cover" />
            
            {isUploading ? (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center">
                <Loader2 size={16} className="animate-spin text-indigo-600 mb-1" />
                <span className="text-[10px] font-bold text-indigo-600">{uploadProgress}%</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-rose-500 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={12} strokeWidth={3} />
              </button>
            )}
          </motion.div>
        )}
        
        {error && (
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-xs text-rose-600 font-semibold"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a reply..."
          className="flex-1 max-h-32 min-h-[48px] py-3 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-sm"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <div className="absolute right-14 bottom-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending || !!previewUrl}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors disabled:opacity-50"
          >
            <Paperclip size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={(!message.trim() && !previewUrl) || isUploading || isSending}
          className="w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-2xl transition-all shadow-md shrink-0"
        >
          {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
        </button>
      </div>
      <p className="text-[10px] text-center text-slate-400 font-medium">
        This ticket will be updated via email
      </p>
    </form>
  );
};
