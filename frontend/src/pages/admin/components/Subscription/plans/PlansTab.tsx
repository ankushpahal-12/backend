import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { usePlans, type Plan } from '../hooks/usePlans';
import { PlanList } from './PlanList';
import { PlanFormModal } from './PlanFormModal';
import { DeletePlanModal } from './DeletePlanModal';

const PlansTab: React.FC = () => {
  const { 
    plans, 
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
  } = usePlans();

  const handleSavePlan = (planData: Omit<Plan, 'id'>) => {
    if (editingPlan) {
      updatePlan(editingPlan.id, planData);
    } else {
      addPlan(planData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-bold transition-colors shadow-sm shadow-blue-600/20"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Create New Plan</span>
        </button>
      </div>

      <PlanList plans={plans} onEdit={openEditModal} onDelete={openDeleteModal} />

      <AnimatePresence>
        {isFormModalOpen && (
          <PlanFormModal 
            isOpen={isFormModalOpen} 
            onClose={() => setIsFormModalOpen(false)} 
            onSave={handleSavePlan}
            initialData={editingPlan}
          />
        )}
        {isDeleteModalOpen && (
          <DeletePlanModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => setIsDeleteModalOpen(false)} 
            onConfirm={() => planToDelete && deletePlan(planToDelete)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlansTab;
