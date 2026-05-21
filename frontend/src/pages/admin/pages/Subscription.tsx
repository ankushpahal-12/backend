import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../../components/layouts/SideBar';
import OverviewTab from '../components/Subscription/overview/OverviewTab';
import PlansTab from '../components/Subscription/plans/PlansTab';
import SubscriptionsTab from '../components/Subscription/subscriptions/SubscriptionsTab';
import TransactionsTab from '../components/Subscription/transactions/TransactionsTab';
import CouponsTab from '../components/Subscription/coupons/CouponsTab';
import SettingsTab from '../components/Subscription/settings/SettingsTab';
import SmoothModal from '../../../components/ui/SmoothModal';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'plans', label: 'Plans' },
  { id: 'subscriptions', label: 'User Subscriptions' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'settings', label: 'Settings' },
];

const SubscriptionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const sidebarWidth = 248;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <Sidebar open onClose={() => undefined} width={sidebarWidth} />
      <div className="p-4 md:p-8 ml-0 lg:ml-[248px] transition-all duration-300">
        <div className="w-full space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col space-y-1">
            <h1 className="text-[28px] md:text-[34px] font-[800] text-gray-900 tracking-tight">Subscription Management</h1>
            <p className="text-slate-500 text-sm">Manage plans, users, transactions, coupons and subscription settings</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition"
            >
              + New Plan
            </button>
          </div>
        </div>

        <div className="flex space-x-6 border-b border-[#e6ecf7] pt-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap
                  ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-gray-900'}
                `}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabSubscription"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'plans' && <PlansTab />}
              {activeTab === 'subscriptions' && <SubscriptionsTab />}
              {activeTab === 'transactions' && <TransactionsTab />}
              {activeTab === 'coupons' && <CouponsTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <SmoothModal open={modalOpen} onClose={() => setModalOpen(false)} title="Create new plan">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">This is a smooth modal example — replace with your create plan form.</p>
          <div className="flex justify-end">
            <button onClick={() => setModalOpen(false)} className="px-3 py-2 bg-slate-100 rounded-md hover:bg-slate-200">Cancel</button>
            <button className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md">Create</button>
          </div>
        </div>
      </SmoothModal>
      </div>
    </div>
  );
};

export default SubscriptionPage;
