import React from 'react';
import { motion } from 'framer-motion';
import { X, Info, Pause, CreditCard, Download } from 'lucide-react';
import type { UserSubscription } from '../hooks/useSubscriptions';

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSubscription;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-[850px] overflow-hidden flex flex-col max-h-[95vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-gray-900">Manage Subscription</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Header Profile Section */}
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-xl font-bold text-slate-500 overflow-hidden border-2 border-white shadow-sm">
                {/* Normally an image here */}
                {user.userName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{user.userName}</h3>
                <div className="text-[13px] text-slate-500 font-medium">{user.userEmail}</div>
                <div className="text-[13px] text-slate-500 font-medium">+91 98765 43210</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50">Active</span>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Current Plan</div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-200/50">Pro Plan</span>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Member Since</div>
                <div className="text-[13px] font-bold text-gray-900">18 May 2024</div>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-4">Subscription Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Plan</span>
                    <span className="font-bold text-gray-900">Pro Plan</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Billing Cycle</span>
                    <span className="font-bold text-gray-900">Monthly</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Start Date</span>
                    <span className="font-bold text-gray-900">18 May 2024</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Next Billing Date</span>
                    <span className="font-bold text-gray-900">18 Jun 2024</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">End Date</span>
                    <span className="font-bold text-gray-900">18 Jun 2024</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Auto Renew</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Enabled</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Amount</span>
                    <span className="font-bold text-gray-900">₹599 / month</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-slate-500 font-medium">Payment Method</span>
                    <span className="font-bold text-gray-900 flex items-center space-x-2">
                      <CreditCard size={14} className="text-slate-400" />
                      <span>**** 4242</span>
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-gray-900">Payment History</h4>
                  <button className="text-[12px] font-bold text-blue-600 hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {[
                    { date: '18 May 2024', amount: '₹599', status: 'Success' },
                    { date: '18 Apr 2024', amount: '₹599', status: 'Success' },
                    { date: '18 Mar 2024', amount: '₹599', status: 'Success' }
                  ].map((p, i) => (
                    <div key={i} className="flex justify-between items-center text-[13px]">
                      <span className="font-bold text-gray-900">{p.date}</span>
                      <span className="font-medium text-slate-600">{p.amount}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/50">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button className="px-4 py-2 text-[13px] font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors w-auto">
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-8 border-l border-slate-100 pl-8">
              <div>
                <h4 className="text-base font-bold text-gray-900 mb-4">Change Plan</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-500 mb-1.5">Select New Plan</label>
                    <select className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer">
                      <option>Premium Plan (₹999 / month)</option>
                      <option>Basic Plan (₹299 / month)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] font-bold text-blue-900">Changes will be applied immediately.</p>
                      <p className="text-[12px] text-blue-700/80 leading-tight mt-0.5">The price difference will be adjusted in the next billing cycle.</p>
                    </div>
                  </div>

                  <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm shadow-blue-600/20">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900 mb-4">Subscription Actions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Pause size={16} className="text-slate-400 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">Pause Subscription</p>
                        <p className="text-[11px] text-slate-500">Temporarily pause auto-renewal.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-[12px] font-bold text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
                      Pause
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <CreditCard size={16} className="text-slate-400 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">Change Payment Method</p>
                        <p className="text-[11px] text-slate-500">Update the payment method for this subscription.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-[12px] font-bold text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
                      Update
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Download size={16} className="text-slate-400 mt-0.5" strokeWidth={2.5} />
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">Download Invoice</p>
                        <p className="text-[11px] text-slate-500">Download latest invoice for this subscription.</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-[12px] font-bold text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-200 flex justify-end bg-slate-50">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-bold text-slate-600 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
