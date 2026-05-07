import React from 'react';
import { motion } from 'framer-motion';
import { X, Tag, Users, Calendar, Percent } from 'lucide-react';
import type { Coupon } from '../hooks/useCoupons';

interface CouponDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon: Coupon;
}

export const CouponDetailsModal: React.FC<CouponDetailsModalProps> = ({ isOpen, onClose, coupon }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-[700px] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Tag size={18} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Coupon Details</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Header Stats */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Code</p>
                <p className="text-[13px] font-bold text-gray-900 font-mono">{coupon.code}</p>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Percent size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Discount</p>
                <p className="text-[13px] font-bold text-gray-900">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                </p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Usage</p>
                <p className="text-[13px] font-bold text-gray-900">
                  {coupon.currentUses} / {coupon.maxUses ? coupon.maxUses : '∞'}
                </p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Expires</p>
                <p className="text-[13px] font-bold text-gray-900">
                  {coupon.expirationDate ? new Date(coupon.expirationDate).toLocaleDateString('en-GB') : 'Never'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Redemption History</h3>
            
            {coupon.usedBy.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#f8fafc] text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold">User</th>
                      <th className="px-4 py-3 font-bold">Email</th>
                      <th className="px-4 py-3 font-bold">Date Redeemed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {coupon.usedBy.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900 flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600">
                            {user.name.charAt(0)}
                          </div>
                          <span>{user.name}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-medium">{user.email}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {new Date(user.usedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-slate-200 border-dashed rounded-xl bg-slate-50">
                <p className="text-[14px] font-bold text-slate-500">No one has redeemed this coupon yet.</p>
              </div>
            )}
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
