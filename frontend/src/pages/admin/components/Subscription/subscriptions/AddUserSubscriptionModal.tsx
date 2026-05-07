import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AddUserSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (user: { name: string; email: string }, plan: string) => void;
}

// Mock non-active users
const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Michael Scott', email: 'michael@dundermifflin.com' },
];

export const AddUserSubscriptionModal: React.FC<AddUserSubscriptionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ name: string; email: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro Plan');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && selectedUser) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) {
      if (!adminPassword) {
        setError('Password is required');
        return;
      }
      setError('');
      // Mock authorization success since it's any non-empty string
      onConfirm(selectedUser!, selectedPlan);
      setStep(4); // Success step
    }
  };

  const resetAndClose = () => {
    setTimeout(() => {
      setStep(1);
      setSearchQuery('');
      setSelectedUser(null);
      setSelectedPlan('Pro Plan');
      setAdminPassword('');
      setError('');
    }, 300);
    onClose();
  };

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={resetAndClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-[500px] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-gray-900">
            {step === 1 && 'Select User'}
            {step === 2 && 'Choose Plan'}
            {step === 3 && 'Authorize Action'}
            {step === 4 && 'Success'}
          </h2>
          <button onClick={resetAndClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedUser?.id === user.id 
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-[13px] text-gray-900">{user.name}</div>
                      <div className="text-[11px] text-slate-500">{user.email}</div>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-[13px] text-slate-500 font-medium">No users found.</div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && selectedUser && (
              <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-slate-500">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[13px] text-gray-900">{selectedUser.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedUser.email}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Select Subscription Plan</label>
                  <div className="space-y-2">
                    {['Basic Plan', 'Pro Plan', 'Premium Plan'].map(plan => (
                      <div 
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPlan === plan 
                            ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[13px] text-gray-900">{plan}</span>
                          <span className="text-[12px] text-slate-500 font-medium">
                            {plan.includes('Basic') ? '₹299/mo' : plan.includes('Pro') ? '₹599/mo' : '₹999/mo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                  <ShieldCheck size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900">Admin Authorization Required</h3>
                  <p className="text-[13px] text-slate-500 font-medium mt-1">
                    You are manually adding a subscription for <strong className="text-gray-900">{selectedUser?.name}</strong>. Please enter your admin password to proceed.
                  </p>
                </div>

                <div className="text-left mt-4">
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">Admin Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                  {error && <p className="text-[11px] text-rose-500 font-bold mt-1">{error}</p>}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <CheckCircle2 size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Subscription Added!</h3>
                <p className="text-[13px] text-slate-500 font-medium">
                  {selectedUser?.name} has been successfully assigned to the {selectedPlan}.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step < 4 ? (
          <div className="p-4 border-t border-slate-200 flex justify-end space-x-3 bg-slate-50">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1 as 1 | 2 | 3)}
                className="px-4 py-2 text-[13px] font-bold text-slate-600 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={step === 1 && !selectedUser}
              className="px-5 py-2 text-[13px] font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Authorize & Add' : 'Next'}
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
            <button 
              onClick={resetAndClose}
              className="px-5 py-2 text-[13px] font-bold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
