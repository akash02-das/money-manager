'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrencyCode } from '@/types/finance';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { evaluatePasswordStrength } from '@/features/auth/utils/password-strength';
import { validateEmailAddress } from '@/features/auth/utils/email-validator';

export default function RegisterPage() {
  const { register, loginAsDemo } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('BDT');

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setEmail(emailParam.trim());
      }
    }
  }, []);

  const passwordEvaluation = evaluatePasswordStrength(password);
  const emailValidation = validateEmailAddress(email);

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      errors.name = "Please provide your name so we know whose wealth we're organizing.";
    }

    const emailRes = validateEmailAddress(email);
    if (!emailRes.isValidSyntax) {
      errors.email = emailRes.errorMessage || 'Please provide a valid email address.';
    } else if (emailRes.isDisposable) {
      errors.email =
        'Temporary/disposable emails are blocked to safeguard your transaction ledger.';
    }

    if (!password) {
      errors.password = 'A strong password is required to encrypt your financial vault.';
    } else if (!passwordEvaluation.isStrong) {
      errors.password =
        'Please fulfill all 5 strong password requirements below before proceeding.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
    if (serverError) setServerError(null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
    if (serverError) setServerError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
    if (serverError) setServerError(null);
  };

  const handleSuggestPassword = (suggested: string) => {
    setPassword(suggested);
    setShowPassword(true);
    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        currency,
      });

      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      setServerError(
        err?.message || 'Could not complete registration. Please check your information.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = () => {
    setServerError(null);
    loginAsDemo();
    router.push('/');
  };

  return (
    <Card className="shadow-xl border-border/80 overflow-hidden backdrop-blur-sm">
      {/* Top Accent Gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-primary to-indigo-600" />

      <CardHeader className="space-y-2 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 w-fit">
          <ShieldCheck className="size-3" />
          <span>Join 1,000+ Wealth Builders</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Create Your Financial Vault
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Take total command of your money, accounts, and monthly targets with bank-grade security.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Server Error Notice */}
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Registration Issue</p>
              <p className="leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4" suppressHydrationWarning>
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-foreground">
              Full Legal or Preferred Name
            </Label>
            <div className="relative" suppressHydrationWarning>
              {isMounted ? (
                <Input
                  id="name"
                  placeholder="e.g. Akash Das"
                  value={name}
                  onChange={handleNameChange}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.name}
                  className={cn(
                    'h-10 transition-colors',
                    fieldErrors.name &&
                      'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive',
                  )}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-muted-foreground/60 flex items-center"
                >
                  e.g. Akash Das
                </div>
              )}
            </div>
            {fieldErrors.name && (
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in-50 duration-200">
                <AlertCircle className="size-3 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          {/* Email Address with real-time domain check and typo hints */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                Work or Personal Email
              </Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Mail className="size-3" />
                <span>Verification code sent here</span>
              </span>
            </div>
            <div className="relative" suppressHydrationWarning>
              {isMounted ? (
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. akash@financialfreedom.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.email}
                  className={cn(
                    'h-10 transition-colors',
                    fieldErrors.email &&
                      'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive',
                  )}
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-muted-foreground/60 flex items-center"
                >
                  e.g. akash@financialfreedom.com
                </div>
              )}
            </div>

            {/* Typo suggestions if applicable */}
            {isMounted && emailValidation.suggestedEmail && !fieldErrors.email && (
              <div className="flex items-center justify-between rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                <span>
                  Did you mean <strong>{emailValidation.suggestedEmail}</strong>?
                </span>
                <button
                  type="button"
                  onClick={() => setEmail(emailValidation.suggestedEmail!)}
                  className="font-semibold underline hover:text-amber-700 ml-2 cursor-pointer"
                >
                  Use suggestion
                </button>
              </div>
            )}

            {fieldErrors.email && (
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in-50 duration-200">
                <AlertCircle className="size-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password with Strength Engine & Suggestions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                Vault Password
              </Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" />
                <span>End-to-end encrypted</span>
              </span>
            </div>

            <div className="relative" suppressHydrationWarning>
              {isMounted ? (
                <>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Must meet all 5 security rules"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isSubmitting}
                    aria-invalid={!!fieldErrors.password}
                    className={cn(
                      'h-10 pr-10 transition-colors',
                      fieldErrors.password &&
                        'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive',
                    )}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1 rounded-md"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </>
              ) : (
                <div
                  aria-hidden="true"
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-muted-foreground/60 flex items-center"
                >
                  ••••••••••••
                </div>
              )}
            </div>

            {/* Password Strength Meter & Interactive Suggestions */}
            <PasswordStrengthMeter
              password={password}
              onSelectPassword={handleSuggestPassword}
            />

            {fieldErrors.password && (
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in-50 duration-200">
                <AlertCircle className="size-3 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Base Currency Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="currency" className="text-xs font-semibold text-foreground">
              Primary Financial Currency
            </Label>
            <select
              id="currency"
              suppressHydrationWarning
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors cursor-pointer"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              disabled={isSubmitting}
            >
              <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
              <option value="USD">USD ($ - United States Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="GBP">GBP (£ - British Pound Sterling)</option>
            </select>
            <p className="text-[10px] text-muted-foreground">
              Used as the base valuation for net worth calculations and category budgets.
            </p>
          </div>

          {/* Submit Action Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 cursor-pointer font-semibold shadow-md transition-all active:scale-[0.99]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Forging vault & sending verification code...</span>
              </>
            ) : (
              <>
                <span>Activate My Financial Vault</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Option Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-card px-2.5 text-muted-foreground font-medium">
              Want to take a test drive first?
            </span>
          </div>
        </div>

        {/* Instant Demo Button */}
        <div className="space-y-1.5 text-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/70 dark:text-emerald-400 dark:hover:bg-emerald-950/40 cursor-pointer font-medium"
            onClick={handleDemoSignIn}
            disabled={isSubmitting}
          >
            <Sparkles className="size-4 text-emerald-500" />
            <span>⚡ Jump in with Instant Demo</span>
          </Button>
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="size-3 text-emerald-500" />
            <span>Local Account — Stored only in this browser</span>
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 py-3.5">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline transition-all inline-flex items-center gap-0.5"
          >
            <span>Unlock your vault</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
