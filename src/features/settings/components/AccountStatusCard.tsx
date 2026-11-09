'use client';

import React from 'react';
import Link from 'next/link';
import {
  HardDrive,
  CloudCheck,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function AccountStatusCard() {
  const { user, isDemo, isVerified, accountType, logout } = useAuth();

  return (
    <Card className="border-border/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-foreground">
                Account Status & Storage
              </CardTitle>
              {isDemo ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-xs px-2.5 py-0.5 gap-1.5"
                >
                  <HardDrive className="size-3.5" />
                  <span>Local Account</span>
                </Badge>
              ) : isVerified ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-xs px-2.5 py-0.5 gap-1.5"
                >
                  <CloudCheck className="size-3.5" />
                  <span>Verified Account</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Guest
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Review where your financial records are stored and your authentication status.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {isDemo ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <HardDrive className="size-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-amber-950 dark:text-amber-200 text-sm">
                    Instant Demo Mode Active
                  </p>
                  <p className="text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                    Your financial data (accounts, transactions, and budgets) is stored <strong>only in this browser</strong> using isolated LocalStorage keys. None of your demo records are sent to or stored on our cloud servers.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Storage Engine</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <HardDrive className="size-3.5 text-amber-500" />
                  <span>Browser LocalStorage (mm_demo_*)</span>
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Data Isolation</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  <span>Isolated from Registered Users</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Want to sync your financial data across multiple devices?
              </p>
              <Link href="/register">
                <Button size="sm" className="gap-1.5 text-xs font-semibold cursor-pointer">
                  <span>Create a Verified Account</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : isVerified ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CloudCheck className="size-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-emerald-950 dark:text-emerald-200 text-sm">
                    Verified Cloud Account
                  </p>
                  <p className="text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                    Your email address (<strong>{user?.email}</strong>) has been verified. Your ledgers and budgets are encrypted and synchronized with our PostgreSQL database backend.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Storage Engine</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CloudCheck className="size-3.5 text-emerald-500" />
                  <span>PostgreSQL Cloud Database</span>
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/60 bg-muted/30 space-y-1">
                <span className="text-[11px] font-medium text-muted-foreground">Email Status</span>
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  <span>Verified & Authenticated</span>
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user?.email}</span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground py-2">
            No active session detected. Please sign in or jump in with Instant Demo.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

