import React from 'react';
import { ShieldCheck, Eye, ArrowRight, Info } from 'lucide-react';
import { SubscriptionStats } from './SubscriptionStats';
import MotionCard from '../../../../../components/ui/MotionCard';

const recentSubscriptions = [
  { user: 'Priya Sharma', email: 'priya@example.com', plan: 'Pro Plan', status: 'Active', start: '18 May 2024', end: '18 Jun 2024', amount: '₹599' },
  { user: 'Rohan Mehta', email: 'rohan@example.com', plan: 'Basic Plan', status: 'Active', start: '17 May 2024', end: '17 Jun 2024', amount: '₹299' },
  { user: 'Sneha Patel', email: 'sneha@example.com', plan: 'Premium Plan', status: 'Active', start: '16 May 2024', end: '16 Jun 2024', amount: '₹999' },
  { user: 'Arjun Singh', email: 'arjun@example.com', plan: 'Pro Plan', status: 'Expired', start: '12 Apr 2024', end: '12 May 2024', amount: '₹599' },
  { user: 'Kavya Reddy', email: 'kavya@example.com', plan: 'Basic Plan', status: 'Cancelled', start: '10 Apr 2024', end: '10 May 2024', amount: '₹299' },
];

const recentTransactions = [
  { id: 'TXN1234567890', user: 'Priya Sharma', amount: '₹599', status: 'Success', date: '18 May 2024 10:24 AM', method: 'Razorpay' },
  { id: 'TXN1234567889', user: 'Rohan Mehta', amount: '₹299', status: 'Success', date: '17 May 2024 09:15 AM', method: 'UPI' },
  { id: 'TXN1234567888', user: 'Sneha Patel', amount: '₹999', status: 'Success', date: '16 May 2024 08:45 AM', method: 'Credit Card' },
  { id: 'TXN1234567887', user: 'Arjun Singh', amount: '₹599', status: 'Failed', date: '12 Apr 2024 11:30 AM', method: 'Razorpay' },
  { id: 'TXN1234567886', user: 'Kavya Reddy', amount: '₹299', status: 'Refunded', date: '10 Apr 2024 02:20 PM', method: 'UPI' },
];

const StatusBadge = ({ status, plan = false }: { status: string, plan?: boolean }) => {
  if (plan) {
    if (status.includes('Pro')) return <span className="text-blue-600 font-semibold text-xs tracking-wide">Pro Plan</span>;
    if (status.includes('Premium')) return <span className="text-purple-600 font-semibold text-xs tracking-wide">Premium Plan</span>;
    return <span className="text-emerald-600 font-semibold text-xs tracking-wide">Basic Plan</span>;
  }

  const styles = {
    Active: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
    Success: 'bg-emerald-50 text-emerald-600 border border-emerald-200/50',
    Expired: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    Failed: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    Cancelled: 'bg-rose-50 text-rose-600 border border-rose-200/50',
    Refunded: 'bg-amber-50 text-amber-600 border border-amber-200/50'
  }[status] || 'bg-slate-50 text-slate-600 border border-slate-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles}`}>
      {status}
    </span>
  );
};

const OverviewTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <SubscriptionStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <MotionCard className="bg-white border border-[#e6ecf7] rounded-xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-[#e6ecf7]">
            <h3 className="font-bold text-gray-900">Recent Subscriptions</h3>
            <button className="text-blue-600 font-bold text-[13px] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold border-b border-[#e6ecf7]">
                <tr>
                  <th className="px-4 py-3 font-bold">User</th>
                  <th className="px-4 py-3 font-bold">Plan</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Start Date</th>
                  <th className="px-4 py-3 font-bold">End Date</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf7]">
                {recentSubscriptions.map((sub, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">{sub.user}</div>
                          <div className="text-[11px] text-slate-500">{sub.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={sub.plan} plan /></td>
                    <td className="px-4 py-3"><StatusBadge status={sub.status} /></td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{sub.start}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{sub.end}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{sub.amount}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200">
                        <Eye size={14} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionCard>

        {/* Recent Transactions */}
        <MotionCard className="bg-white border border-[#e6ecf7] rounded-xl overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-[#e6ecf7]">
            <h3 className="font-bold text-gray-900">Recent Transactions</h3>
            <button className="text-blue-600 font-bold text-[13px] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold border-b border-[#e6ecf7]">
                <tr>
                  <th className="px-4 py-3 font-bold">Transaction ID</th>
                  <th className="px-4 py-3 font-bold">User</th>
                  <th className="px-4 py-3 font-bold">Amount</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ecf7]">
                {recentTransactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-medium">{txn.id}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{txn.user}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{txn.amount}</td>
                    <td className="px-4 py-3"><StatusBadge status={txn.status} /></td>
                    <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{txn.date}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{txn.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionCard>
      </div>

      {/* Subscription Insights Banner */}
      <MotionCard className="bg-blue-50 border border-blue-200/60 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-blue-900">Subscription Insights</h4>
            <p className="text-[13px] text-blue-700/80 font-medium">You have 92 subscriptions expiring this month. Consider sending renewal reminders.</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap">
          View Expiring Subscriptions
        </button>
      </MotionCard>
    </div>
  );
};

export default OverviewTab;
