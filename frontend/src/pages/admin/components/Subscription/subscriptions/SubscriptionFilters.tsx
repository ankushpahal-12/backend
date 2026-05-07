import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SubscriptionFiltersProps {
  filters: { search: string; status: string; plan: string };
  setFilters: React.Dispatch<React.SetStateAction<{ search: string; status: string; plan: string }>>;
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search users or emails..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>
      
      <div className="flex space-x-3">
        <div className="relative">
          <select 
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="appearance-none pl-4 pr-10 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <Filter size={16} />
          </div>
        </div>
        <div className="relative">
          <select 
            value={filters.plan}
            onChange={(e) => setFilters(f => ({ ...f, plan: e.target.value }))}
            className="appearance-none pl-4 pr-10 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
          >
            <option value="all">All Plans</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <Filter size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
