import React from 'react';
import type { SettingsData } from '../hooks/useSettings';

interface FeatureLimitsProps {
  settings: SettingsData;
  updateSettings: (s: Partial<SettingsData>) => void;
}

export const FeatureLimits: React.FC<FeatureLimitsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="bg-white border border-[#e6ecf7] rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-[#e6ecf7]">Features & Limits</h3>
      
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-gray-900">Max Tests (Basic Plan)</label>
          <div className="w-32">
            <input 
              type="text" 
              defaultValue="10"
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm text-right"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-gray-900">Max Tests (Pro Plan)</label>
          <div className="w-32">
            <input 
              type="text" 
              defaultValue="Unlimited"
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm text-right"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-gray-900">Max Tests (Premium Plan)</label>
          <div className="w-32">
            <input 
              type="text" 
              defaultValue="Unlimited"
              className="w-full bg-white border border-[#e6ecf7] rounded-lg px-3 py-2 text-[13px] text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
