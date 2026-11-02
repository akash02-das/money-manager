'use client';

import React from 'react';
import { Search, ArrowUpDown, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Account, Category, TransactionType } from '@/types/finance';
import { cn } from '@/lib/utils';

export type TransactionFilterType = 'ALL' | TransactionType;
export type TransactionSortOption =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc';

interface TransactionsFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedType: TransactionFilterType;
  onTypeChange: (val: TransactionFilterType) => void;
  selectedAccountId: string;
  onAccountChange: (val: string) => void;
  selectedCategoryId: string;
  onCategoryChange: (val: string) => void;
  sortBy: TransactionSortOption;
  onSortChange: (val: TransactionSortOption) => void;
  accounts: Account[];
  categories: Category[];
  totalCount: number;
  expenseCount: number;
  incomeCount: number;
  transferCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function TransactionsFilters({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedAccountId,
  onAccountChange,
  selectedCategoryId,
  onCategoryChange,
  sortBy,
  onSortChange,
  accounts,
  categories,
  totalCount,
  expenseCount,
  incomeCount,
  transferCount,
  onResetFilters,
  hasActiveFilters,
}: TransactionsFiltersProps) {
  return (
    <div className="space-y-3 pt-2">
      {/* Top Row: Type Pills & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            type="button"
            onClick={() => onTypeChange('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedType === 'ALL'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            All ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => onTypeChange('EXPENSE')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedType === 'EXPENSE'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Expenses ({expenseCount})
          </button>

          <button
            type="button"
            onClick={() => onTypeChange('INCOME')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedType === 'INCOME'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Income ({incomeCount})
          </button>

          <button
            type="button"
            onClick={() => onTypeChange('TRANSFER')}
            className={cn(
              'px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer',
              selectedType === 'TRANSFER'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            Transfers ({transferCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search description, notes, accounts..."
            className="pl-8 text-xs h-9 bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Second Row: Dropdown Filters & Sort */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        {/* Account Filter */}
        <div className="w-44">
          <Select
            value={selectedAccountId || 'all'}
            onValueChange={(val) => onAccountChange(val === 'all' ? '' : val || '')}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="w-44">
          <Select
            value={selectedCategoryId || 'all'}
            onValueChange={(val) => onCategoryChange(val === 'all' ? '' : val || '')}
          >
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Selector */}
        <div className="w-44 ml-auto">
          <Select
            value={sortBy}
            onValueChange={(val) => {
              if (val) onSortChange(val as TransactionSortOption);
            }}
          >
            <SelectTrigger className="w-full h-8 text-xs gap-1.5">
              <ArrowUpDown className="size-3 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters CTA */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="size-3.5" />
            <span>Reset Filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
