import { TransactionsListView } from '@/features/transactions/components/TransactionsListView';

export const metadata = {
  title: 'Transactions — Money Manager',
  description: 'Track and manage your income, expenses, and account transfers in BDT.',
};

export default function TransactionsPage() {
  return <TransactionsListView />;
}
