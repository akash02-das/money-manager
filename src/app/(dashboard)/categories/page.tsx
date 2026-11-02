import { PieChart } from 'lucide-react';
import { ModulePlaceholder } from '@/components/shared/ModulePlaceholder';

export default function CategoriesPage() {
  return (
    <ModulePlaceholder
      title="Categories"
      description="Organize your financial transactions with custom income and expense categories."
      icon={PieChart}
      plannedFeatures={[
        'Income and Expense category management',
        'Custom icon picker and color palette selection',
        'System defaults and user-created custom categories',
        'Archive unused categories without losing history',
      ]}
    />
  );
}
