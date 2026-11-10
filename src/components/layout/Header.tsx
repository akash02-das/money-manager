'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, ChevronDown, User, Settings, LogOut, Check, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/layout/MobileNav';
import { TimeIsMoneyTicker } from '@/components/layout/TimeIsMoneyTicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthDialog } from '@/features/auth/components/AuthDialog';
import { TransactionFormDialog } from '@/features/transactions/components/TransactionFormDialog';
import { CURRENCY_SYMBOLS } from '@/lib/formatters';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': {
    title: 'Financial Overview',
    subtitle: 'Track your accounts, cash flow, and monthly spending in BDT',
  },
  '/accounts': {
    title: 'Accounts',
    subtitle: 'Manage your bank accounts, mobile wallets, and cash',
  },
  '/transactions': {
    title: 'Transactions',
    subtitle: 'View, filter, and organize all income and expenses',
  },
  '/budgets': {
    title: 'Budgets & Limits',
    subtitle: 'Keep your spending under control with monthly category limits',
  },
  '/categories': {
    title: 'Categories',
    subtitle: 'Organize your finances with custom categories and tags',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Manage profile preferences and currency settings',
  },
};

export function Header() {
  const pathname = usePathname();
  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createTransaction,
  } = useTransactions();
  const { profile, preferences } = useSettings();
  const { user, isAuthenticated, isBackendConnected, isDemo, isVerified, accountType, logout } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '৳';

  const displayName = user?.name || profile.name;
  const displayEmail = user?.email || profile.email;
  const displayLocation = user?.location || profile.location;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'MM';

  const currentInfo = PAGE_TITLES[pathname] || {
    title: 'Money Manager',
    subtitle: 'Personal finance dashboard',
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/90 backdrop-blur-md">
        {/* Main Header Bar */}
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile menu drawer trigger */}
            <MobileNav />

            <div>
              <h1 className="text-base md:text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                {currentInfo.title}
              </h1>
              <p className="hidden sm:block text-xs text-muted-foreground">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Action Button: Quick Add Transaction */}
            <Button
              size="sm"
              className="gap-1.5 shadow-sm font-medium cursor-pointer"
              onClick={openCreateModal}
            >
              <PlusCircle className="size-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>

            {/* User Profile / Auth Menu */}
            {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors outline-none cursor-pointer"
                  >
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col text-left">
                      <span className="text-xs font-semibold text-foreground leading-none">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {displayLocation}
                      </span>
                    </div>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                  </button>
                }
              />
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1.5 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                        {isDemo ? (
                          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-semibold shrink-0">
                            Local Account
                          </Badge>
                        ) : isVerified ? (
                          <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold shrink-0">
                            Verified
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                      <p className="text-[11px] text-muted-foreground/85 leading-snug pt-0.5">
                        {isDemo
                          ? '💾 Stored only in this browser (LocalStorage).'
                          : '☁️ Synced to PostgreSQL cloud database.'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer gap-2" render={<Link href="/settings" />}>
                    <User className="size-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2" render={<Link href="/settings" />}>
                    <Settings className="size-4 text-muted-foreground" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
                  <span>Currency</span>
                  <Badge variant="secondary" className="text-[10px] font-mono gap-1">
                    <Check className="size-3 text-emerald-500" /> {preferences.currency} ({currencySymbol})
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer gap-2"
                  onClick={() => logout()}
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => setAuthDialogOpen(true)}
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Clock & 50+ Motivational Quotes Ticker Row */}
      <TimeIsMoneyTicker />
    </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

      <TransactionFormDialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateModal();
        }}
        onSubmit={async (data) => {
          await createTransaction(data);
          closeCreateModal();
        }}
      />
    </>
  );
}
