import { ArrowLeftRight } from 'lucide-react';
import { ModulePlaceholder } from '@/components/shared/ModulePlaceholder';

export default function TransactionsPage() {
  return (
    <ModulePlaceholder
      title="Transactions"
      description="Record income, expenses, and inter-account transfers with search, filtering, and sorting."
      icon={ArrowLeftRight}
      plannedFeatures={[
        'Income, Expense, and Transfer transactions',
        'Create, edit, and delete transactions with confirmation',
        'Full search, date range filter, and category filter',
        'Server & client pagination with sorting',
      ]}
    />
  );
}
