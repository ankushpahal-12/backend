import { useState } from 'react';

export interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
}

const initialSubscriptions: UserSubscription[] = [
  { id: 'sub_1', userId: 'usr_1', userName: 'Alice Smith', userEmail: 'alice@example.com', planId: '2', planName: 'Pro', status: 'active', currentPeriodEnd: '2026-06-01T00:00:00Z' },
  { id: 'sub_2', userId: 'usr_2', userName: 'Bob Jones', userEmail: 'bob@example.com', planId: '1', planName: 'Basic', status: 'trialing', currentPeriodEnd: '2026-05-15T00:00:00Z' },
  { id: 'sub_3', userId: 'usr_3', userName: 'Charlie Brown', userEmail: 'charlie@example.com', planId: '3', planName: 'Enterprise', status: 'past_due', currentPeriodEnd: '2026-04-30T00:00:00Z' }
];

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(initialSubscriptions);
  const [filters, setFilters] = useState({ search: '', status: 'all', plan: 'all' });
  
  // Drawer and Modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSubscription | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [userToUpgrade, setUserToUpgrade] = useState<UserSubscription | null>(null);

  const fetchSubscriptions = () => {
    // In a real app, this would fetch from an API
    return subscriptions;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchSearch = sub.userName.toLowerCase().includes(filters.search.toLowerCase()) || 
                        sub.userEmail.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === 'all' || sub.status === filters.status;
    const matchPlan = filters.plan === 'all' || sub.planName.toLowerCase() === filters.plan.toLowerCase();
    return matchSearch && matchStatus && matchPlan;
  });

  const updateSubscriptionStatus = (id: string, status: UserSubscription['status']) => {
    setSubscriptions(subs => subs.map(sub => sub.id === id ? { ...sub, status } : sub));
  };
  
  const changePlan = (id: string, newPlanName: string) => {
    setSubscriptions(subs => subs.map(sub => sub.id === id ? { ...sub, planName: newPlanName } : sub));
    setIsUpgradeModalOpen(false);
  };

  const openDrawer = (user: UserSubscription) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const openUpgradeModal = (user: UserSubscription) => {
    setUserToUpgrade(user);
    setIsUpgradeModalOpen(true);
  };

  // Add User to Subscription state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const openAddUserModal = () => setIsAddUserModalOpen(true);

  // Mock function to add a user
  const addUserToSubscription = (user: { name: string; email: string }, planName: string) => {
    const newSub: UserSubscription = {
      id: `sub_${Math.random().toString(36).substr(2, 9)}`,
      userId: `usr_${Math.random().toString(36).substr(2, 9)}`,
      userName: user.name,
      userEmail: user.email,
      planId: 'new', // mock plan ID
      planName,
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    setSubscriptions([newSub, ...subscriptions]);
  };

  return {
    subscriptions: filteredSubscriptions,
    fetchSubscriptions,
    filters,
    setFilters,
    updateSubscriptionStatus,
    changePlan,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedUser,
    openDrawer,
    isUpgradeModalOpen,
    setIsUpgradeModalOpen,
    userToUpgrade,
    openUpgradeModal,
    isAddUserModalOpen,
    setIsAddUserModalOpen,
    openAddUserModal,
    addUserToSubscription
  };
};
