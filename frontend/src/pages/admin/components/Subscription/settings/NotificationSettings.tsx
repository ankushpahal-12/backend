import React from 'react';
import type { SettingsData } from '../hooks/useSettings';
import { Toggle } from './SettingsTab';

interface NotificationSettingsProps {
  settings: SettingsData;
  updateSettings: (s: Partial<SettingsData>) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ settings, updateSettings }) => {
  return (
    <div className="bg-white border border-[#e6ecf7] rounded-xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-5 pb-3 border-b border-[#e6ecf7]">Notifications</h3>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-900">Payment Success Email</p>
            <p className="text-[11px] text-slate-500 font-medium">Send email on successful payment</p>
          </div>
          <Toggle 
            enabled={settings.notifications.paymentSuccess} 
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, paymentSuccess: v } })} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-900">Payment Failed Email</p>
            <p className="text-[11px] text-slate-500 font-medium">Send email on failed payment</p>
          </div>
          <Toggle 
            enabled={true} 
            onChange={() => {}} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-bold text-gray-900">Subscription Expiry Email</p>
            <p className="text-[11px] text-slate-500 font-medium">Send email before subscription expires</p>
          </div>
          <Toggle 
            enabled={settings.notifications.expiryReminders} 
            onChange={(v) => updateSettings({ notifications: { ...settings.notifications, expiryReminders: v } })} 
          />
        </div>
      </div>
    </div>
  );
};
