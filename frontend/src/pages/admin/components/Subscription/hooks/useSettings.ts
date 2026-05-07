import { useState } from 'react';

export interface SettingsData {
  billingRules: {
    autoRenew: boolean;
    taxPercentage: number;
    currency: string;
    invoicePrefix: string;
  };
  featureLimits: {
    maxUsersPerBasicPlan: number;
    storageLimitGB: number;
  };
  coupons: {
    couponsList: { id: string, code: string, discount: number, expiryDate: string }[];
  };
  notifications: {
    paymentSuccess: boolean;
    expiryReminders: boolean;
    renewalAlerts: boolean;
  };
}

const initialSettings: SettingsData = {
  billingRules: {
    autoRenew: true,
    taxPercentage: 10,
    currency: 'USD',
    invoicePrefix: 'INV-',
  },
  featureLimits: {
    maxUsersPerBasicPlan: 10,
    storageLimitGB: 5,
  },
  coupons: {
    couponsList: [
      { id: '1', code: 'WELCOME20', discount: 20, expiryDate: '2026-12-31' }
    ],
  },
  notifications: {
    paymentSuccess: true,
    expiryReminders: true,
    renewalAlerts: true,
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = (newSettings: Partial<SettingsData>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
  };

  return {
    settings,
    updateSettings,
    saveSettings,
    isSaving
  };
};
