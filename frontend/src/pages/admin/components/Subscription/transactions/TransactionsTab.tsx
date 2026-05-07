import React from 'react';
import { Search, Filter, ChevronDown, Calendar } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionTable } from './TransactionTable';
import { TransactionDetailsModal } from './TransactionDetailsModal';
import { RefundModal } from './RefundModal';
import { AnimatePresence } from 'framer-motion';

const TransactionsTab: React.FC = () => {
  const { 
    transactions, 
    filters, 
    setFilters, 
    refundTransaction,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedTransaction,
    openDetailsModal,
    isRefundModalOpen,
    setIsRefundModalOpen,
    transactionToRefund,
    openRefundModal
  } = useTransactions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-4 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow-md"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-auto min-w-[130px]">
            <select 
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="succeeded">Success</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="relative w-full sm:w-auto min-w-[160px]">
            <select 
              className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              <option value="razorpay">Razorpay</option>
              <option value="upi">UPI</option>
              <option value="cc">Credit Card</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="relative w-full sm:w-auto min-w-[200px] flex items-center px-3 py-2 bg-white border border-[#e6ecf7] rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <Calendar size={14} className="text-slate-400 mr-2 shrink-0" />
            <span className="text-[13px] font-medium text-gray-900">01 May 2024 - 31 May 2024</span>
            <ChevronDown size={14} className="text-slate-400 ml-auto" />
          </div>

          <button className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-white text-slate-700 border border-[#e6ecf7] rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md shrink-0 w-full sm:w-auto">
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <TransactionTable 
        transactions={transactions} 
        onRefund={openRefundModal} 
        onViewDetails={openDetailsModal} 
      />

      <AnimatePresence>
        {isDetailsModalOpen && (
          <TransactionDetailsModal 
            isOpen={isDetailsModalOpen} 
            onClose={() => setIsDetailsModalOpen(false)} 
            transaction={selectedTransaction} 
          />
        )}
        {isRefundModalOpen && (
          <RefundModal 
            isOpen={isRefundModalOpen} 
            onClose={() => setIsRefundModalOpen(false)} 
            transaction={transactionToRefund} 
            onConfirm={refundTransaction} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionsTab;
