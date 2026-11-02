'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { format } from 'date-fns';
import { PlusCircle, Bell, ChevronDown, User, Settings, LogOut, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/layout/MobileNav';
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
  const { openCreateModal } = useTransactions();
  const [todayFormatted, setTodayFormatted] = useState<string>('');

  useEffect(() => {
    setTodayFormatted(format(new Date(), 'EEEE, MMMM d, yyyy'));
  }, []);

  const currentInfo = PAGE_TITLES[pathname] || {
    title: 'Money Manager',
    subtitle: 'Personal finance dashboard',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
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
        {/* Current Date Badge */}
        <div className="hidden xl:flex items-center text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border border-border/60">
          <span>{todayFormatted}</span>
        </div>

        {/* Action Button: Quick Add Transaction */}
        <Button
          size="sm"
          className="gap-1.5 shadow-sm font-medium cursor-pointer"
          onClick={openCreateModal}
        >
          <PlusCircle className="size-4" />
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors outline-none cursor-pointer"
              >
                <Avatar size="sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-foreground leading-none">
                    Akash Das
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Dhaka, Bangladesh
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">Akash Das</p>
                <p className="text-xs text-muted-foreground">akash@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <User className="size-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2">
                <Settings className="size-4 text-muted-foreground" />
                <span>Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
              <span>Currency</span>
              <Badge variant="secondary" className="text-[10px] font-mono gap-1">
                <Check className="size-3 text-emerald-500" /> BDT (৳)
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2"
              onClick={() => alert('Log out clicked')}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
