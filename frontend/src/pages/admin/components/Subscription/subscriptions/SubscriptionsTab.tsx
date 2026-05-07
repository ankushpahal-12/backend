import React from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { SubscriptionTable } from './SubscriptionTable';
import { ManageSubscriptionModal } from './ManageSubscriptionModal';
import { AddUserSubscriptionModal } from './AddUserSubscriptionModal';
import { AnimatePresence } from 'framer-motion';

const SubscriptionsTab: React.FC = () => {
  const { 
    subscriptions, 
    filters, 
    setFilters,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedUser,
    openDrawer: openUserDrawer,
    isAddUserModalOpen,
    setIsAddUserModalOpen,
    openAddUserModal,
    addUserToSubscription
  } = useSubscriptions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search users..."
            className="w-full pl-9 pr-4 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow-md"
          />
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-36">
            <select 
              value={filters.plan}
              onChange={(e) => setFilters(f => ({ ...f, plan: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic Plan</option>
              <option value="pro">Pro Plan</option>
              <option value="premium">Premium Plan</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="relative w-full sm:w-36">
            <select 
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>
          <button className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-white text-slate-700 border border-[#e6ecf7] rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md shrink-0">
            <Filter size={14} />
            <span>Filters</span>
          </button>
          <button 
            onClick={openAddUserModal}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <SubscriptionTable 
        subscriptions={subscriptions} 
        onViewUser={openUserDrawer}
      />

      <AnimatePresence>
        {isDrawerOpen && selectedUser && (
          <ManageSubscriptionModal 
            isOpen={isDrawerOpen} 
            onClose={() => setIsDrawerOpen(false)} 
            user={selectedUser} 
          />
        )}
        {isAddUserModalOpen && (
          <AddUserSubscriptionModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            onConfirm={addUserToSubscription}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionsTab;
