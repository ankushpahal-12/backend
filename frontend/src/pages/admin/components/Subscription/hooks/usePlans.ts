import { useState } from 'react';

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  status: 'active' | 'archived';
}

const initialPlans: Plan[] = [
  { id: '1', name: 'Basic', price: 9, interval: 'monthly', features: ['Up to 10 users', 'Basic Analytics', '24/7 Support'], status: 'active' },
  { id: '2', name: 'Pro', price: 29, interval: 'monthly', features: ['Unlimited users', 'Advanced Analytics', 'Priority Support', 'Custom Domain'], isPopular: true, status: 'active' },
  { id: '3', name: 'Enterprise', price: 99, interval: 'monthly', features: ['Unlimited everything', 'Dedicated Agent', 'SLA', 'White-labeling'], status: 'active' }
];

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>(undefined);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const fetchPlans = () => {
    // In a real app, this would fetch from an API
    return plans;
  };

  const addPlan = (plan: Omit<Plan, 'id'>) => {
    setPlans([...plans, { ...plan, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const updatePlan = (id: string, updatedPlan: Partial<Plan>) => {
    setPlans(plans.map(p => (p.id === id ? { ...p, ...updatedPlan } : p)));
  };

  const deletePlan = (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
    setIsDeleteModalOpen(false);
    setPlanToDelete(null);
  };

  const openCreateModal = () => {
    setEditingPlan(undefined);
    setIsFormModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setPlanToDelete(id);
    setIsDeleteModalOpen(true);
  };

  return {
    plans,
    fetchPlans,
    addPlan,
    updatePlan,
    deletePlan,
    isFormModalOpen,
    setIsFormModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    editingPlan,
    planToDelete,
    openCreateModal,
    openEditModal,
    openDeleteModal
  };
};
