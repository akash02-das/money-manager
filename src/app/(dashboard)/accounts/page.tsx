import { WalletCards } from 'lucide-react';
import { ModulePlaceholder } from '@/components/shared/ModulePlaceholder';

export default function AccountsPage() {
  return (
    <ModulePlaceholder
      title="Accounts Management"
      description="Track and manage bank accounts, mobile wallets (bKash/Nagad), cash, and credit cards."
      icon={WalletCards}
      plannedFeatures={[
        'List all active accounts with live BDT balances',
        'Create and edit accounts (Bank, Wallet, Cash, Card, Savings)',
        'Archive and restore accounts',
        'Filter by institution and account type',
      ]}
    />
  );
}
