'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface AuthRedirectGuardProps {
  children: React.ReactNode;
}

/**
 * AuthRedirectGuard:
 * Redirects verified, cloud-authenticated users away from /login and /register back to /
 * Allows LOCAL_DEMO users to access /register (e.g. to create a verified account) and /login.
 * Does not block initial HTML rendering, preventing dropped segment errors during prerender.
 */
export function AuthRedirectGuard({ children }: AuthRedirectGuardProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if user already has an active, VERIFIED cloud account
    if (!isLoading && isAuthenticated && user?.accountType === 'VERIFIED' && user?.isEmailVerified) {
      if (pathname !== '/verify-email') {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

  return <>{children}</>;
}

