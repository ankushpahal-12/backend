import { useState } from 'react';

export interface CouponUser {
  id: string;
  name: string;
  email: string;
  usedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number | null; // null means unlimited
  currentUses: number;
  expirationDate: string | null;
  status: 'active' | 'expired' | 'depleted';
  createdAt: string;
  eligiblePlans: string[]; // e.g. ['all'] or ['pro', 'premium']
  usedBy: CouponUser[];
}

const mockCoupons: Coupon[] = [
  {
    id: 'c1',
    code: 'WELCOME50',
    discountType: 'percentage',
    discountValue: 50,
    maxUses: 100,
    currentUses: 45,
    expirationDate: '2026-12-31T23:59:59Z',
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
    eligiblePlans: ['all'],
    usedBy: [
      { id: 'u1', name: 'Rohan Mehta', email: 'rohan@example.com', usedAt: '2026-05-01T14:30:00Z' },
      { id: 'u2', name: 'Priya Sharma', email: 'priya@example.com', usedAt: '2026-05-02T09:15:00Z' },
      { id: 'u3', name: 'Arjun Singh', email: 'arjun@example.com', usedAt: '2026-05-04T16:45:00Z' },
    ]
  },
  {
    id: 'c2',
    code: 'PROUPGRADE200',
    discountType: 'fixed',
    discountValue: 200,
    maxUses: 50,
    currentUses: 50,
    expirationDate: '2026-06-30T23:59:59Z',
    status: 'depleted',
    createdAt: '2026-02-10T10:00:00Z',
    eligiblePlans: ['pro', 'premium'],
    usedBy: Array.from({ length: 50 }).map((_, i) => ({
      id: `ux${i}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      usedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }))
  },
  {
    id: 'c3',
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    maxUses: null,
    currentUses: 12,
    expirationDate: '2025-08-31T23:59:59Z',
    status: 'expired',
    createdAt: '2025-05-01T10:00:00Z',
    eligiblePlans: ['all'],
    usedBy: [
      { id: 'u4', name: 'Sneha Patel', email: 'sneha@example.com', usedAt: '2025-06-15T11:20:00Z' },
    ]
  }
];

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);
  const [filters, setFilters] = useState({ search: '', status: 'all', discountType: 'all' });
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const filteredCoupons = coupons.filter(c => {
    const matchSearch = c.code.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'all' || c.status === filters.status;
    const matchType = filters.discountType === 'all' || c.discountType === filters.discountType;
    return matchSearch && matchStatus && matchType;
  });

  const createCoupon = (newCoupon: Omit<Coupon, 'id' | 'currentUses' | 'status' | 'createdAt' | 'usedBy'>) => {
    const coupon: Coupon = {
      ...newCoupon,
      id: `c_${Math.random().toString(36).substr(2, 9)}`,
      currentUses: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      usedBy: []
    };
    setCoupons([coupon, ...coupons]);
    setIsCreateModalOpen(false);
  };

  const deleteCoupon = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const openDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailsModalOpen(true);
  };

  return {
    coupons: filteredCoupons,
    filters,
    setFilters,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedCoupon,
    createCoupon,
    deleteCoupon,
    openDetails
  };
};
