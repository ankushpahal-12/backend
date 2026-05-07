import React from 'react';
import { PlanCard } from './PlanCard';
import type { Plan } from '../hooks/usePlans';

interface PlanListProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
}

export const PlanList: React.FC<PlanListProps> = ({ plans, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard 
          key={plan.id} 
          plan={plan} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
