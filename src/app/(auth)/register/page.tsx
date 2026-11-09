'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, UserPlus, Loader2 } from 'lucide-react';
import type { CurrencyCode } from '@/types/finance';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('BDT');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        currency,
      });
      router.push('/');
    } catch (err: any) {
      setError(err?.message || 'Could not complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-border/80">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>
          Start tracking your personal finances, balances, and budgets.
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Akash Das"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="akash@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Base Currency</Label>
            <select
              id="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              disabled={isSubmitting}
            >
              <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
              <option value="USD">USD ($ - US Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound)</option>
            </select>
          </div>

          <Button type="submit" className="w-full gap-2 cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                <span>Complete Registration</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 pt-4">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline transition-all"
          >
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

