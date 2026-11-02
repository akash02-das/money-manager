'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Wallet, ShieldCheck } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="size-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-0 flex flex-col">
        {/* Brand Header */}
        <SheetHeader className="p-6 border-b border-border text-left">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Wallet className="size-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-base tracking-tight text-foreground">
                Money Manager
              </span>
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                Personal Finance{' '}
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
                  BDT ৳
                </Badge>
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
            Navigation
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'size-4.5',
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom footer */}
        <div className="p-4 border-t border-border mt-auto">
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-foreground">Encrypted & Local</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Active currency: Bangladeshi Taka (BDT)
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
