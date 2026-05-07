import React from 'react';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';
import { useCoupons } from '../hooks/useCoupons';
import { CouponTable } from './CouponTable';
import { CreateCouponModal } from './CreateCouponModal';
import { CouponDetailsModal } from './CouponDetailsModal';
import { AnimatePresence } from 'framer-motion';

const CouponsTab: React.FC = () => {
  const { 
    coupons, 
    filters, 
    setFilters,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedCoupon,
    createCoupon,
    openDetails
  } = useCoupons();

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
            placeholder="Search coupons..."
            className="w-full pl-9 pr-4 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow shadow-sm hover:shadow-md"
          />
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-36">
            <select 
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="depleted">Depleted</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="relative w-full sm:w-36">
            <select 
              value={filters.discountType}
              onChange={(e) => setFilters(f => ({ ...f, discountType: e.target.value }))}
              className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] font-medium bg-white border border-[#e6ecf7] rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 transition-shadow shadow-sm hover:shadow-md cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20 shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      <CouponTable 
        coupons={coupons} 
        onViewDetails={openDetails}
      />

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateCouponModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={createCoupon}
          />
        )}
        {isDetailsModalOpen && selectedCoupon && (
          <CouponDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            coupon={selectedCoupon}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponsTab;
