'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const CURRENT_YEAR = 2026;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthRedirectGuard>
        <div className="flex min-h-screen w-full flex-col justify-center items-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2.5 font-bold text-xl text-foreground hover:opacity-90 transition-opacity"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                <Wallet className="size-5" />
              </div>
              <span className="tracking-tight">Money Manager</span>
            </Link>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs mx-auto">
              Secure, precision-engineered personal finance and budget manager.
            </p>
          </div>

          <div className="w-full sm:max-w-md">{children}</div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            &copy; {CURRENT_YEAR} Money Manager PLC. All financial ledgers encrypted.
          </p>
        </div>
      </AuthRedirectGuard>
    </AuthProvider>
  );
}

