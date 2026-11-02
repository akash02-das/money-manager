'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  WalletCards,
  RotateCcw,
  SlidersHorizontal,
  FolderArchive,
  ArrowUpDown,
  Landmark,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAccounts } from '../hooks/useAccounts';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { AccountCard } from './AccountCard';
import { AccountFormDialog } from './AccountFormDialog';
import { AccountDeleteDialog } from './AccountDeleteDialog';
import { AccountsSummaryCards } from './AccountsSummaryCards';
import type { Account, AccountType } from '@/types/finance';
import type { AccountFormData } from '../schemas/account-schema';
import { cn } from '@/lib/utils';

type FilterTab = 'ALL' | AccountType | 'ARCHIVED';

export function AccountsListView() {
  const {
    accounts,
    isLoading,
    totalBalance,
    bankAndSavingsTotal,
    walletsAndCashTotal,
    creditCardTotal,
    activeAccountsCount,
    archivedAccountsCount,
    createAccount,
    updateAccount,
    archiveAccount,
    deleteAccount,
    resetToDefault,
  } = useAccounts();

  const { transactions } = useTransactions();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<FilterTab>('ALL');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Count linked transactions for the account staged for deletion
  const accountLinkedCount = useMemo(() => {
    if (!accountToDelete) return 0;
    return transactions.filter(
      (t) => t.accountId === accountToDelete.id || t.toAccountId === accountToDelete.id
    ).length;
  }, [accountToDelete, transactions]);

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // 1. Tab filter
      if (selectedTab === 'ARCHIVED') {
        if (!account.isArchived) return false;
      } else {
        if (account.isArchived) return false; // In other tabs, hide archived
        if (selectedTab !== 'ALL' && account.type !== selectedTab) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = account.name.toLowerCase().includes(query);
        const matchesInstitution = account.institution?.toLowerCase().includes(query);
        const matchesLast4 = account.accountNumberLast4?.includes(query);
        return matchesName || matchesInstitution || matchesLast4;
      }

      return true;
    });
  }, [accounts, selectedTab, searchQuery]);

  // Actions
  const handleOpenCreate = () => {
    setAccountToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setAccountToEdit(account);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: AccountFormData) => {
    if (accountToEdit) {
      await updateAccount(accountToEdit.id, data);
    } else {
      await createAccount(data);
    }
  };

  const handleToggleArchive = async (account: Account) => {
    await archiveAccount(account.id, !account.isArchived);
  };

  const handlePromptDelete = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (accountToDelete) {
      try {
        await deleteAccount(accountToDelete.id);
        setAccountToDelete(null);
      } catch (err: unknown) {
        console.error('Delete account failed:', err);
      }
    }
  };

  const handleArchiveInstead = async () => {
    if (accountToDelete) {
      await archiveAccount(accountToDelete.id, true);
      setAccountToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <WalletCards className="size-6 text-primary" />
            Accounts & Wallets
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your financial accounts, track balances, and organize payment sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Reset to default mock data"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden md:inline">Reset Demo Data</span>
          </Button>

          <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 font-medium shadow-sm">
            <Plus className="size-4" />
            <span>Add Account</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <AccountsSummaryCards
        totalBalance={totalBalance}
        bankAndSavingsTotal={bankAndSavingsTotal}
        walletsAndCashTotal={walletsAndCashTotal}
        creditCardTotal={creditCardTotal}
        activeCount={activeAccountsCount}
      />

      {/* Search Bar & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            onClick={() => setSelectedTab('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            All Active ({activeAccountsCount})
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('BANK')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'BANK'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Bank
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('MOBILE_WALLET')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'MOBILE_WALLET'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Mobile Wallet
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('CASH')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'CASH'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Cash
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('SAVINGS')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'SAVINGS'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Savings
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab('CREDIT_CARD')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedTab === 'CREDIT_CARD'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Credit Card
          </button>

          {archivedAccountsCount > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTab('ARCHIVED')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5',
                selectedTab === 'ARCHIVED'
                  ? 'bg-muted-foreground text-background shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <FolderArchive className="size-3.5" />
              Archived ({archivedAccountsCount})
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts or bank..."
            className="pl-8 text-xs h-9 bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Accounts Cards Grid */}
      {filteredAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleOpenEdit}
              onToggleArchive={handleToggleArchive}
              onDelete={handlePromptDelete}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-muted/10">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <WalletCards className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No accounts found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchQuery
              ? `No accounts matching "${searchQuery}". Try clearing your search.`
              : selectedTab === 'ARCHIVED'
              ? 'You do not have any archived accounts.'
              : 'Get started by creating your first bank account, mobile wallet, or cash balance.'}
          </p>
          <div className="mt-4 flex gap-2">
            {searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            ) : (
              <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
                <Plus className="size-4" />
                Add Account
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Form Dialog */}
      <AccountFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        accountToEdit={accountToEdit}
        onSubmit={handleFormSubmit}
      />

      {/* Destructive Action Confirmation Dialog */}
      <AccountDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        account={accountToDelete}
        linkedTransactionsCount={accountLinkedCount}
        onConfirmDelete={handleConfirmDelete}
        onArchiveInstead={handleArchiveInstead}
      />
    </div>
  );
}
