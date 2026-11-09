'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogIn, Sparkles, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await loginAsDemo();
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Could not connect demo account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your financial dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full gap-2 cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                <span>Sign In</span>
              </>
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 cursor-pointer"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
        >
          <Sparkles className="size-4 text-emerald-500" />
          <span>Quick Demo Account</span>
        </Button>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 pt-4">
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline transition-all"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

