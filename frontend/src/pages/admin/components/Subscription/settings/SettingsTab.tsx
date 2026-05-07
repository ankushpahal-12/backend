import React from 'react';
import { useSettings, type SettingsData } from '../hooks/useSettings';
import { BillingSettings } from './BillingSettings';
import { FeatureLimits } from './FeatureLimits';
import { NotificationSettings } from './NotificationSettings';

export const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      enabled ? 'bg-blue-600' : 'bg-slate-200'
    }`}
  >
    <span
      className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-4' : 'translate-x-0'
      }`}
    ></span>
  </button>
);

const SettingsTab: React.FC = () => {
  const { settings, updateSettings, saveSettings, isSaving } = useSettings();

  return (
    <div className="space-y-6">
      {/* 
        The design shows a grid layout:
        Col 1: General Settings, Subscription Insights / something else
        Col 2: Billing Settings, Features & Limits
        Col 3: Cancellation & Refund, Notifications
        Actually let's just lay them out naturally in a responsive grid.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <BillingSettings settings={settings} updateSettings={updateSettings} />
        <FeatureLimits settings={settings} updateSettings={updateSettings} />
        <NotificationSettings settings={settings} updateSettings={updateSettings} />
      </div>

      <div className="flex justify-end pt-4 border-t border-[#e6ecf7]">
        <button 
          onClick={saveSettings}
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm shadow-blue-600/20"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
