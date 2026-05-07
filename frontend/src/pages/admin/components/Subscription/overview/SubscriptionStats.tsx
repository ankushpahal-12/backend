import React from 'react';
import { IndianRupee, Users, Clock, UserCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '₹1,24,000',
    change: '+18.2%',
    isPositive: true,
    icon: IndianRupee,
    color: 'emerald',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Active Subscriptions',
    value: '1,248',
    change: '+12.4%',
    isPositive: true,
    icon: Users,
    color: 'purple',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Expiring This Month',
    value: '92',
    change: '+5.6%',
    isPositive: true,
    icon: Clock,
    color: 'amber',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    title: 'Free Users',
    value: '2,543',
    change: '-8.1%',
    isPositive: false,
    icon: UserCheck,
    color: 'blue',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
  }
];

export const SubscriptionStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="bg-white border border-[#e6ecf7] rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200 hover:shadow-[0_16px_36px_rgba(37,99,235,0.06),0_0_18px_rgba(37,99,235,0.03)] cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-full ${stat.iconBg} ${stat.iconColor}`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-[13px] font-bold text-slate-500 tracking-wide">{stat.title}</h3>
            </div>
            
            <div className="flex items-baseline justify-between">
              <span className="text-[28px] font-[800] text-gray-900">{stat.value}</span>
            </div>
            
            <div className="flex items-center mt-2">
              <span className={`flex items-center text-[13px] font-bold ${stat.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                {stat.change}
              </span>
              <span className="text-[13px] text-slate-500 font-medium ml-2">from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
