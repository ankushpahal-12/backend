import React from 'react';
import { Eye, Edit2, MoreVertical, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { UserSubscription } from '../hooks/useSubscriptions';

const StatusBadge = ({ status, plan = false }: { status: string, plan?: boolean }) => {
  if (plan) {
    if (status.includes('Pro')) return <span className="text-blue-600 font-semibold text-[11px] tracking-wide">Pro Plan</span>;
    if (status.includes('Premium') || status.includes('Enterprise')) return <span className="text-purple-600 font-semibold text-[11px] tracking-wide">Premium Plan</span>;
    return <span className="text-emerald-600 font-semibold text-[11px] tracking-wide">Basic Plan</span>;
  }

  const styles = {
    active: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
    trialing: 'bg-blue-50 text-blue-600 border border-blue-200/50',
    past_due: 'bg-amber-50 text-amber-600 border border-amber-200/50',
    canceled: 'bg-rose-50 text-rose-600 border border-rose-200/50',
  }[status] || 'bg-slate-50 text-slate-600 border border-slate-200/50';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
    </span>
  );
};

export const SubscriptionTable = ({ subscriptions, onViewUser }: { subscriptions: UserSubscription[], onViewUser: (user: UserSubscription) => void }) => {
  return (
    <div className="bg-white border border-[#e6ecf7] rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e6ecf7]">
            <tr>
              <th className="px-4 py-3.5 font-bold">User</th>
              <th className="px-4 py-3.5 font-bold">Plan</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-4 py-3.5 font-bold">Start Date</th>
              <th className="px-4 py-3.5 font-bold">End Date</th>
              <th className="px-4 py-3.5 font-bold">Amount</th>
              <th className="px-4 py-3.5 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6ecf7]">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-slate-500">
                      {sub.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 leading-tight">{sub.userName}</div>
                      <div className="text-[11px] text-slate-500">{sub.userEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.planName} plan />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                  18 May 2024
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                  {new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-bold text-gray-900">
                  {sub.planName.includes('Pro') ? '₹599' : sub.planName.includes('Basic') ? '₹299' : '₹999'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-1">
                    <button 
                      onClick={() => onViewUser(sub)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors border border-transparent hover:border-blue-200 hover:bg-blue-50"
                    >
                      <Eye size={14} strokeWidth={2.5} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors border border-transparent hover:border-blue-200 hover:bg-blue-50">
                      <Edit2 size={14} strokeWidth={2.5} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md transition-colors border border-transparent hover:border-slate-200 hover:bg-slate-50">
                      <MoreVertical size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t border-[#e6ecf7] bg-white gap-4">
        <div className="text-[13px] font-medium text-slate-500">
          Showing 1 to {subscriptions.length} of 25 entries
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white border border-[#e6ecf7] rounded-lg overflow-hidden shadow-sm">
            <button className="px-2 py-1.5 text-slate-400 hover:bg-slate-50 border-r border-[#e6ecf7]">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 text-[13px] font-bold text-blue-600 bg-blue-50/50 border-r border-[#e6ecf7]">1</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 border-r border-[#e6ecf7]">2</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 border-r border-[#e6ecf7]">3</button>
            <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 border-r border-[#e6ecf7]">4</button>
            <div className="px-2 py-1.5 text-[13px] text-slate-400 border-r border-[#e6ecf7]">...</div>
            <button className="px-2 py-1.5 text-slate-400 hover:bg-slate-50">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="relative">
            <select className="appearance-none pl-3 pr-8 py-1.5 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-slate-600 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer">
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
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
