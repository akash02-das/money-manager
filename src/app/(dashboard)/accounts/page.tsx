import { AccountsListView } from '@/features/accounts/components/AccountsListView';

export const metadata = {
  title: 'Accounts & Wallets — Money Manager',
  description: 'Manage bank accounts, mobile wallets, and cash reserves in BDT.',
};

export const instant = false;

export default function AccountsPage() {
  return <AccountsListView />;
}
