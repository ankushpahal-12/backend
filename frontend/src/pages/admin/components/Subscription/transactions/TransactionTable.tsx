import React from 'react';
import { Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { Transaction } from '../hooks/useTransactions';

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    succeeded: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
    failed: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    refunded: 'bg-amber-50 text-amber-600 border border-amber-200/50'
  }[status] || 'bg-slate-50 text-slate-600 border border-slate-200/50';

  const label = status === 'succeeded' ? 'Success' : 
                status === 'failed' ? 'Failed' : 
                status === 'refunded' ? 'Refunded' : status;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles}`}>
      {label}
    </span>
  );
};

export const TransactionTable = ({ 
  transactions, 
  onRefund,
  onViewDetails 
}: { 
  transactions: Transaction[], 
  onRefund: (t: Transaction) => void,
  onViewDetails: (t: Transaction) => void
}) => {
  return (
    <div className="bg-white border border-[#e6ecf7] rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#f8fafc] text-slate-500 border-b border-[#e6ecf7]">
            <tr>
              <th className="px-4 py-3.5 font-bold">Transaction ID</th>
              <th className="px-4 py-3.5 font-bold">User</th>
              <th className="px-4 py-3.5 font-bold">Plan</th>
              <th className="px-4 py-3.5 font-bold">Amount</th>
              <th className="px-4 py-3.5 font-bold">Payment Method</th>
              <th className="px-4 py-3.5 font-bold">Status</th>
              <th className="px-4 py-3.5 font-bold">Date</th>
              <th className="px-4 py-3.5 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6ecf7]">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                  TXN{Math.random().toString().slice(2, 12)}
                </td>
                <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">
                  {txn.userName}
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                  {txn.amount > 600 ? 'Premium Plan' : txn.amount > 300 ? 'Pro Plan' : 'Basic Plan'}
                </td>
                <td className="px-4 py-3 font-bold text-gray-900">
                  ₹{txn.amount}
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium">
                  Razorpay
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={txn.status} />
                </td>
                <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                  {new Date(txn.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={() => onViewDetails(txn)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200 shadow-sm"
                    >
                      <Eye size={14} strokeWidth={2.5} />
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
          Showing 1 to {transactions.length} of 42 entries
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
            <button className="px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 border-r border-[#e6ecf7]">5</button>
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
