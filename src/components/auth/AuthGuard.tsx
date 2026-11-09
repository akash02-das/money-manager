'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Wallet, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user?.accountType === 'VERIFIED' && !user.isEmailVerified) {
        router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm animate-pulse">
            <Wallet className="size-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Money Manager
            </h2>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Verifying your session...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Avoid rendering protected children while redirecting to /login
    return null;
  }

  return <>{children}</>;
}

