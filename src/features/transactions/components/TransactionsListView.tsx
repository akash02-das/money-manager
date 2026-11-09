'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowLeftRight,
  RotateCcw,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions } from '../hooks/useTransactions';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { TransactionsSummaryCards } from './TransactionsSummaryCards';
import {
  TransactionsFilters,
  type TransactionFilterType,
  type TransactionSortOption,
} from './TransactionsFilters';
import { TransactionsTable } from './TransactionsTable';
import { TransactionFormDialog } from './TransactionFormDialog';
import { TransactionDetailsDialog } from './TransactionDetailsDialog';
import { TransactionDeleteDialog } from './TransactionDeleteDialog';
import type { Transaction } from '@/types/finance';
import type { TransactionFormData } from '../schemas/transaction-schema';

export function TransactionsListView() {
  const {
    transactions,
    totalIncome,
    totalExpense,
    netCashFlow,
    totalCount,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    resetToDefault,
  } = useTransactions();

  const { accounts } = useAccounts();
  const { categories } = useCategories();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionFilterType>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [sortBy, setSortBy] = useState<TransactionSortOption>('date-desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Counts for filters
  const expenseCount = useMemo(
    () => transactions.filter((t) => t.type === 'EXPENSE').length,
    [transactions]
  );
  const incomeCount = useMemo(
    () => transactions.filter((t) => t.type === 'INCOME').length,
    [transactions]
  );
  const transferCount = useMemo(
    () => transactions.filter((t) => t.type === 'TRANSFER').length,
    [transactions]
  );

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedType !== 'ALL' ||
      selectedAccountId ||
      selectedCategoryId ||
      sortBy !== 'date-desc'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedAccountId('');
    setSelectedCategoryId('');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  // Filter & Sort pipeline
  const filteredAndSortedTransactions = useMemo(() => {
    let result = transactions.filter((tx) => {
      // 1. Type filter
      if (selectedType !== 'ALL' && tx.type !== selectedType) {
        return false;
      }

      // 2. Account filter
      if (selectedAccountId) {
        if (tx.accountId !== selectedAccountId && tx.toAccountId !== selectedAccountId) {
          return false;
        }
      }

      // 3. Category filter
      if (selectedCategoryId) {
        if (tx.categoryId !== selectedCategoryId) {
          return false;
        }
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const descMatch = tx.description.toLowerCase().includes(query);
        const notesMatch = tx.notes?.toLowerCase().includes(query);
        const catMatch = tx.category?.name.toLowerCase().includes(query);
        const accMatch = tx.account?.name.toLowerCase().includes(query);
        const toAccMatch = tx.toAccount?.name.toLowerCase().includes(query);
        return descMatch || notesMatch || catMatch || accMatch || toAccMatch;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [
    transactions,
    selectedType,
    selectedAccountId,
    selectedCategoryId,
    searchQuery,
    sortBy,
  ]);

  // Paginated slice
  const totalFilteredCount = filteredAndSortedTransactions.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedTransactions.slice(start, start + pageSize);
  }, [filteredAndSortedTransactions, currentPage, pageSize]);

  // Actions
  const handleCreateSubmit = async (data: TransactionFormData) => {
    await createTransaction(data);
    closeCreateModal();
  };

  const handleEditSubmit = async (data: TransactionFormData) => {
    if (transactionToEdit) {
      await updateTransaction(transactionToEdit.id, data);
      setIsEditModalOpen(false);
      setTransactionToEdit(null);
    }
  };

  const handleOpenEdit = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = (tx: Transaction) => {
    setSelectedForDetails(tx);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDelete = (tx: Transaction) => {
    setTransactionToDelete(tx);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ArrowLeftRight className="size-6 text-primary" />
            Transactions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Record, search, and audit your personal income, expenses, and transfers in BDT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreateModal}
            size="sm"
            className="gap-1.5 font-medium shadow-sm"
          >
            <Plus className="size-4" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <TransactionsSummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netCashFlow={netCashFlow}
        totalCount={totalCount}
      />

      {/* Search, Filter Tabs & Sort Controls */}
      <TransactionsFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        selectedType={selectedType}
        onTypeChange={(type) => {
          setSelectedType(type);
          setCurrentPage(1);
          if (type === 'TRANSFER') {
            setSelectedCategoryId('');
          } else if (type !== 'ALL' && selectedCategoryId) {
            const currentCat = categories.find((c) => c.id === selectedCategoryId);
            if (currentCat && currentCat.type !== type) {
              setSelectedCategoryId('');
            }
          }
        }}
        selectedAccountId={selectedAccountId}
        onAccountChange={(accId) => {
          setSelectedAccountId(accId);
          setCurrentPage(1);
        }}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={(catId) => {
          setSelectedCategoryId(catId);
          setCurrentPage(1);
        }}
        sortBy={sortBy}
        onSortChange={setSortBy}
        accounts={accounts}
        categories={categories}
        totalCount={totalCount}
        expenseCount={expenseCount}
        incomeCount={incomeCount}
        transferCount={transferCount}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Transactions Table / List View */}
      {paginatedTransactions.length > 0 ? (
        <TransactionsTable
          transactions={paginatedTransactions}
          onViewDetails={handleOpenDetails}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalFilteredCount={totalFilteredCount}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-muted/10">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Receipt className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No transactions found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {hasActiveFilters
              ? 'No transactions match your current search or filter criteria. Try resetting your filters.'
              : 'Start tracking your cash flow by recording your first transaction.'}
          </p>
          <div className="mt-4 flex gap-2">
            {hasActiveFilters ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            ) : (
              <Button onClick={openCreateModal} size="sm" className="gap-1.5">
                <Plus className="size-4" />
                Add Transaction
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Transaction Modal */}
      <TransactionFormDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateModal();
        }}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Transaction Modal */}
      <TransactionFormDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        transactionToEdit={transactionToEdit}
        onSubmit={handleEditSubmit}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsDialog
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        transaction={selectedForDetails}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      {/* Transaction Delete Modal */}
      <TransactionDeleteDialog
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        transaction={transactionToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
