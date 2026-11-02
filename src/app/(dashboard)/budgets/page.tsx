import { Target } from 'lucide-react';
import { ModulePlaceholder } from '@/components/shared/ModulePlaceholder';

export default function BudgetsPage() {
  return (
    <ModulePlaceholder
      title="Budgets & Spending Limits"
      description="Set monthly spending limits by category and track progress to avoid overspending."
      icon={Target}
      plannedFeatures={[
        'Monthly category-based budget caps',
        'Real-time spending progress bars',
        'Remaining budget and over-budget warnings',
        'Historical budget vs actual spending analysis',
      ]}
    />
  );
}
