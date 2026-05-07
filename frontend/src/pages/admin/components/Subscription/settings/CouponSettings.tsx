import React, { useState } from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';
import type { SettingsData } from '../hooks/useSettings';

interface CouponSettingsProps {
  settings: SettingsData;
  updateSettings: (s: Partial<SettingsData>) => void;
}

export const CouponSettings: React.FC<CouponSettingsProps> = ({ settings, updateSettings }) => {
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponExpiry, setNewCouponExpiry] = useState('');

  const handleAddCoupon = () => {
    if (!newCouponCode || !newCouponExpiry) return;

    const newCoupon = {
      id: Math.random().toString(36).substring(2, 9),
      code: newCouponCode,
      discount: newCouponDiscount,
      expiryDate: newCouponExpiry
    };

    updateSettings({
      coupons: {
        couponsList: [...settings.coupons.couponsList, newCoupon]
      }
    });

    setNewCouponCode('');
    setNewCouponDiscount(10);
    setNewCouponExpiry('');
  };

  const handleRemoveCoupon = (id: string) => {
    updateSettings({
      coupons: {
        couponsList: settings.coupons.couponsList.filter(c => c.id !== id)
      }
    });
  };

  return (
    <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-700/50 flex items-center space-x-3">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
          <Tag size={20} />
        </div>
        <h3 className="text-lg font-medium text-white">Coupons & Discounts</h3>
      </div>
      <div className="p-6 space-y-6">
        
        <div className="flex flex-col md:flex-row gap-4 items-end bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-gray-400 block mb-1">Coupon Code</label>
            <input 
              type="text" 
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-sm font-medium text-gray-400 block mb-1">Discount %</label>
            <input 
              type="number" 
              value={newCouponDiscount}
              onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="text-sm font-medium text-gray-400 block mb-1">Expiry Date</label>
            <input 
              type="date" 
              value={newCouponExpiry}
              onChange={(e) => setNewCouponExpiry(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handleAddCoupon}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors w-full md:w-auto flex justify-center items-center h-[42px]"
          >
            <Plus size={18} className="mr-1" /> Add
          </button>
        </div>

        {settings.coupons.couponsList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-700/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Discount</th>
                  <th className="px-4 py-3 font-medium">Expiry</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {settings.coupons.couponsList.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{coupon.code}</td>
                    <td className="px-4 py-3 text-emerald-400">{coupon.discount}%</td>
                    <td className="px-4 py-3">{coupon.expiryDate}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleRemoveCoupon(coupon.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
