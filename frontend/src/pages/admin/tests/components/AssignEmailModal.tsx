import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Trash2, Send, AlertCircle } from 'lucide-react';
import { updateTest } from '../services/testApi';
import toast from 'react-hot-toast';

interface AssignEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  testData: any;
  testId: string;
  onEmailsUpdated: (emails: string[]) => void;
  isLightMode: boolean;
}

export const AssignEmailModal: React.FC<AssignEmailModalProps> = ({
  isOpen,
  onClose,
  testData,
  testId,
  onEmailsUpdated,
  isLightMode,
}) => {
  const [emailInput, setEmailInput] = useState('');
  // Extract email strings from objects, handling both string and object formats
  const initialEmails = (testData?.assignedEmails || []).map((a: any) => 
    typeof a === 'string' ? a : a.email
  );
  const [assignedEmails, setAssignedEmails] = useState<string[]>(initialEmails);
  const [emailMetadata, setEmailMetadata] = useState<any[]>(testData?.assignedEmails || []);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Email validation regex
  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleAddEmail = () => {
    setEmailError('');
    const trimmedEmail = emailInput.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError('Please enter an email address');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (assignedEmails.includes(trimmedEmail)) {
      setEmailError('This email is already assigned');
      return;
    }

    setAssignedEmails([...assignedEmails, trimmedEmail]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email: string) => {
    setAssignedEmails(assignedEmails.filter((e) => e !== email));
  };

  const handleSave = async () => {
    if (assignedEmails.length === 0) {
      toast.error('Please add at least one email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updateTest(testId, { assignedEmails });
      if (res.success) {
        toast.success(`Email assignments updated! ${assignedEmails.length} email(s) assigned.`);
        onEmailsUpdated(assignedEmails);
        onClose();
      } else {
        toast.error(res.message || 'Failed to update email assignments');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while updating emails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleModalClose = () => {
    // Reset to original emails if user closes without saving
    const originalEmails = (testData?.assignedEmails || []).map((a: any) => 
      typeof a === 'string' ? a : a.email
    );
    setAssignedEmails(originalEmails);
    setEmailMetadata(testData?.assignedEmails || []);
    setEmailInput('');
    setEmailError('');
    onClose();
  };

  if (!isOpen || !testData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
              isLightMode ? 'bg-white border border-slate-200' : 'bg-[#1e293b] border border-white/10'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-[#0f172a] border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isLightMode ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
                  }`}
                >
                  <Mail size={20} />
                </div>
                <div>
                  <h2
                    className={`text-lg font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}
                  >
                    Assign Test to Users
                  </h2>
                  <p
                    className={`text-xs ${
                      isLightMode ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    Enter emails to send invitations
                  </p>
                </div>
              </div>
              <button
                onClick={handleModalClose}
                className={`p-2 rounded-lg transition-colors ${
                  isLightMode ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-slate-400'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Email Input Section */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${
                    isLightMode ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Add Email Address
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setEmailError('');
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="user@example.com"
                      className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        emailError
                          ? isLightMode
                            ? 'border-rose-300 bg-rose-50 text-slate-900 placeholder-rose-400'
                            : 'border-rose-500/30 bg-rose-500/10 text-white placeholder-rose-400/60'
                          : isLightMode
                          ? 'border-slate-300 bg-white text-slate-900 placeholder-slate-500'
                          : 'border-white/10 bg-white/5 text-white placeholder-slate-400'
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleAddEmail}
                    disabled={isLoading || !emailInput.trim()}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      isLoading || !emailInput.trim()
                        ? isLightMode
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    <Send size={16} />
                    Add
                  </button>
                </div>
                {emailError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                      isLightMode ? 'text-rose-600' : 'text-rose-400'
                    }`}
                  >
                    <AlertCircle size={14} />
                    {emailError}
                  </motion.div>
                )}
              </div>

              {/* Assigned Emails List */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 ${
                    isLightMode ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  Assigned Emails ({assignedEmails.length})
                </label>
                <div
                  className={`space-y-2 max-h-80 overflow-y-auto rounded-lg border ${
                    isLightMode
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {assignedEmails.length === 0 ? (
                    <div
                      className={`p-4 text-center text-sm ${
                        isLightMode ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      No emails assigned yet. Add one above.
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {assignedEmails.map((email) => {
                        // Find metadata for this email
                        const metadata = (testData?.assignedEmails || []).find((a: any) => {
                          const emailStr = typeof a === 'string' ? a : a.email;
                          return emailStr === email;
                        });
                        const assignedDate = metadata?.assignedAt ? new Date(metadata.assignedAt) : new Date();
                        const isVerified = metadata?.emailVerified || false;
                        const verifiedDate = metadata?.verifiedAt ? new Date(metadata.verifiedAt) : null;
                        const dateStr = assignedDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        
                        return (
                          <motion.div
                            key={email}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg ${
                              isLightMode
                                ? 'bg-white border border-slate-200'
                                : 'bg-white/10 border border-white/20'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium break-all ${
                                    isLightMode ? 'text-slate-700' : 'text-slate-300'
                                  }`}
                                >
                                  {email}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                                  isVerified
                                    ? isLightMode
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-emerald-500/20 text-emerald-400'
                                    : isLightMode
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {isVerified ? '✓ Verified' : 'Pending'}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${
                                isLightMode ? 'text-slate-500' : 'text-slate-400'
                              }`}>
                                Assigned: {dateStr}
                                {isVerified && verifiedDate && ` • Verified: ${verifiedDate.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveEmail(email)}
                              className={`p-1.5 rounded-md transition-colors shrink-0 ${
                                isLightMode
                                  ? 'hover:bg-rose-100 text-rose-500'
                                  : 'hover:bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Message */}
              <div
                className={`p-3 rounded-lg flex gap-3 ${
                  isLightMode
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-blue-500/10 border border-blue-500/20'
                }`}
              >
                <AlertCircle
                  size={16}
                  className={`shrink-0 mt-0.5 ${
                    isLightMode ? 'text-blue-600' : 'text-blue-400'
                  }`}
                />
                <p
                  className={`text-xs font-medium ${
                    isLightMode ? 'text-blue-700' : 'text-blue-300'
                  }`}
                >
                  Emails will receive invitation links with OTP verification. Only assigned users can access this test.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${
                isLightMode ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-white/5'
              }`}
            >
              <button
                onClick={handleModalClose}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isLightMode
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || assignedEmails.length === 0}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  isLoading || assignedEmails.length === 0
                    ? isLightMode
                      ? 'bg-indigo-200 text-indigo-600 cursor-not-allowed'
                      : 'bg-indigo-500/30 text-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Send size={16} />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Save & Send Invites
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
