import React from 'react';
import { Eye, Copy, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import type { Coupon } from '../hooks/useCoupons';

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
    expired: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    depleted: 'bg-amber-50 text-amber-600 border border-amber-200/50',
  }[status] || 'bg-slate-50 text-slate-600 border border-slate-200/50';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export const CouponTable = ({ coupons, onViewDetails }: { coupons: Coupon[], onViewDetails: (c: Coupon) => void }) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, code: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-[#e6ecf7] rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e6ecf7]">
            <tr>
              <th className="px-4 py-3.5 font-bold">Coupon Code</th>
              <th className="px-4 py-3.5 font-bold">Discount</th>
              <th className="px-4 py-3.5 font-bold">Usage</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-4 py-3.5 font-bold">Expiration Date</th>
              <th className="px-4 py-3.5 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6ecf7]">
            {coupons.map((coupon) => {
              const usagePercent = coupon.maxUses ? (coupon.currentUses / coupon.maxUses) * 100 : 0;
              return (
                <tr key={coupon.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 bg-slate-100 px-2 py-1 rounded text-[13px] font-mono border border-slate-200">
                        {coupon.code}
                      </span>
                      <button 
                        onClick={(e) => handleCopy(e, coupon.code, coupon.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Copy Code"
                      >
                        {copiedId === coupon.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-medium text-slate-600">{coupon.currentUses} used</span>
                        <span className="text-slate-400">{coupon.maxUses ? `/ ${coupon.maxUses}` : 'Unlimited'}</span>
                      </div>
                      {coupon.maxUses && (
                        <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200">
                          <div 
                            className={`h-1.5 rounded-full ${usagePercent >= 100 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={coupon.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                    {coupon.expirationDate 
                      ? new Date(coupon.expirationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'No Expiration'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <button 
                        onClick={() => onViewDetails(coupon)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors border border-transparent hover:border-blue-200 hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye size={14} strokeWidth={2.5} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors border border-transparent hover:border-slate-200 hover:bg-slate-50">
                        <MoreVertical size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-[#e6ecf7] bg-white gap-4">
        <div className="text-[13px] font-medium text-slate-500">
          Showing 1 to {coupons.length} of {coupons.length} entries
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white border border-[#e6ecf7] rounded-lg overflow-hidden shadow-sm">
            <button className="px-2 py-1.5 text-slate-400 hover:bg-slate-50 border-r border-[#e6ecf7]">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 text-[13px] font-bold text-blue-600 bg-blue-50/50 border-r border-[#e6ecf7]">1</button>
            <button className="px-2 py-1.5 text-slate-400 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-1.5 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-slate-600 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer">
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
