import React from 'react';
import type { SettingsData } from '../hooks/useSettings';
import { Toggle } from './SettingsTab';

interface BillingSettingsProps {
  settings: SettingsData;
  updateSettings: (s: Partial<SettingsData>) => void;
}

export const BillingSettings: React.FC<BillingSettingsProps> = ({ settings, updateSettings }) => {
  return (
    <>
      {/* General Settings */}
      <div className="bg-white border border-[#e6ecf7] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-[#e6ecf7]">General Settings</h3>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Enable Subscriptions</p>
              <p className="text-[11px] text-slate-500 font-medium">Allow users to purchase subscriptions</p>
            </div>
            <Toggle enabled={true} onChange={() => {}} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Free Trial</p>
              <p className="text-[11px] text-slate-500 font-medium">Offer free trial for new users</p>
            </div>
            <Toggle enabled={true} onChange={() => {}} />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Trial Duration (days)</label>
            <input 
              type="number" 
              defaultValue={7}
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Currency</label>
            <select className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer appearance-none">
              <option>INR (₹)</option>
              <option>USD ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Tax Percentage (%)</label>
            <input 
              type="number" 
              value={settings.billingRules.taxPercentage}
              onChange={(e) => updateSettings({ billingRules: { ...settings.billingRules, taxPercentage: Number(e.target.value) } })}
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="bg-white border border-[#e6ecf7] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-[#e6ecf7]">Billing Settings</h3>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Auto Renewal</p>
              <p className="text-[11px] text-slate-500 font-medium">Automatically renew subscriptions</p>
            </div>
            <Toggle 
              enabled={settings.billingRules.autoRenew} 
              onChange={(v) => updateSettings({ billingRules: { ...settings.billingRules, autoRenew: v } })} 
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Renewal Reminder (days before)</label>
            <input 
              type="number" 
              defaultValue={3}
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Invoice Generation</p>
              <p className="text-[11px] text-slate-500 font-medium">Automatically generate invoices</p>
            </div>
            <Toggle enabled={true} onChange={() => {}} />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Invoice Prefix</label>
            <input 
              type="text" 
              value={settings.billingRules.invoicePrefix}
              onChange={(e) => updateSettings({ billingRules: { ...settings.billingRules, invoicePrefix: e.target.value } })}
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Default Payment Method</label>
            <select className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] font-medium text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer appearance-none">
              <option>Razorpay</option>
              <option>Stripe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cancellation & Refund */}
      <div className="bg-white border border-[#e6ecf7] rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-[#e6ecf7]">Cancellation & Refund</h3>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Allow Cancellation</p>
              <p className="text-[11px] text-slate-500 font-medium">Users can cancel their subscriptions</p>
            </div>
            <Toggle enabled={true} onChange={() => {}} />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Refund Policy (days)</label>
            <input 
              type="number" 
              defaultValue={7}
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Enable Refunds</p>
              <p className="text-[11px] text-slate-500 font-medium">Allow refunds for eligible transactions</p>
            </div>
            <Toggle enabled={true} onChange={() => {}} />
          </div>

          <div>
            <label className="block text-[12px] font-bold text-gray-900 mb-1.5">Refund Percentage</label>
            <input 
              type="number" 
              defaultValue={100}
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>
    </>
  );
};
