'use client';

import React, { useState } from 'react';
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
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { validateEmailAddress } from '@/features/auth/utils/email-validator';

export default function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validation checks for disabling/enabling the submit button
  const emailValidation = validateEmailAddress(email);
  const isEmailValid = emailValidation.isValidSyntax && !emailValidation.isDisposable;
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  // Custom client-side validation without browser default tooltips
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'We need your email to unlock your financial vault.';
    } else if (!isEmailValid) {
      errors.email =
        emailValidation.errorMessage ||
        'That email looks a bit off. Make sure it has "@" and a valid domain!';
    }

    if (!password) {
      errors.password = 'Don’t forget your password! Even Fort Knox needs a key.';
    } else if (password.length < 6) {
      errors.password = 'Passwords must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (serverError) setServerError(null);
  };

  const handleSuggestPassword = (suggested: string) => {
    setPassword(suggested);
    setShowPassword(true);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
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
      await login({ email: email.trim(), password });
      router.push('/');
    } catch (err: any) {
      if (
        err?.error === 'EMAIL_NOT_VERIFIED' ||
        err?.message?.includes('not been verified') ||
        err?.message?.includes('verification code')
      ) {
        if (typeof window !== 'undefined' && err?.verificationPreview) {
          sessionStorage.setItem(
            'mm_last_verification_preview',
            JSON.stringify({ email: email.trim(), code: err.verificationPreview.code }),
          );
        }
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      setServerError(
        err?.message ||
          'Email and password combination did not match. Please verify your credentials or jump in as Demo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    setServerError(null);
    setFieldErrors({});
    loginAsDemo();
    router.push('/');
  };

  return (
    <Card className="shadow-xl border-border/80 overflow-hidden backdrop-blur-sm">
      {/* Visual Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-indigo-600" />

      <CardHeader className="space-y-2 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary w-fit">
          <TrendingUp className="size-3" />
          <span>Your Financial Cockpit</span>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Welcome Back, Wealth Builder
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Ready to tell your money where to go instead of wondering where it
          went? Sign in to review your balances and cash flow.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Server / Network Error Banner */}
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in-50 duration-200">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Access Blocked</p>
              <p className="leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        {/* Form with noValidate to block default browser tooltip bubbles */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="akash@financialfreedom.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className={cn(
                  'h-10 transition-colors',
                  fieldErrors.email &&
                    'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive placeholder:text-destructive/50',
                )}
              />
            </div>

            {/* Email Typo Suggestion */}
            {emailValidation.suggestedEmail && !emailValidation.isDisposable && (
              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-2 text-xs text-amber-900 dark:text-amber-300 animate-in fade-in-50 duration-200">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    Did you mean{' '}
                    <strong className="font-semibold underline">
                      {emailValidation.suggestedEmail}
                    </strong>
                    ?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (emailValidation.suggestedEmail) {
                      setEmail(emailValidation.suggestedEmail);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }
                  }}
                  className="text-[11px] font-semibold text-amber-900 hover:bg-amber-100 dark:text-amber-200 px-2 py-0.5 rounded cursor-pointer"
                >
                  Yes, Fix It
                </button>
              </div>
            )}

            {fieldErrors.email && (
              <p
                id="email-error"
                className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in-50 duration-200"
              >
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-foreground"
              >
                Secret Password
              </Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" />
                <span>Protected</span>
              </span>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={handlePasswordChange}
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={cn(
                  'h-10 pr-10 transition-colors',
                  fieldErrors.password &&
                    'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive placeholder:text-destructive/50',
                )}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1 rounded-md cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {/* Interactive Strong Password Engine & Demo */}
            <PasswordStrengthMeter
              password={password}
              onSelectPassword={handleSuggestPassword}
            />

            {fieldErrors.password && (
              <p
                id="password-error"
                className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in-50 duration-200"
              >
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
          </div>

          {/* Primary Action Button (Disabled until email & password are valid) */}
          <div className="space-y-1.5">
            <Button
              type="submit"
              size="lg"
              className={cn(
                'w-full gap-2 font-semibold shadow-md transition-all',
                isFormValid && !isSubmitting
                  ? 'cursor-pointer active:scale-[0.99] bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'cursor-not-allowed opacity-50 bg-muted text-muted-foreground hover:bg-muted select-none',
              )}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Unlocking your dashboard...</span>
                </>
              ) : (
                <>
                  <span>Unlock My Dashboard</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            {!isFormValid && (email.length > 0 || password.length > 0) && (
              <p className="text-[11px] text-center text-muted-foreground animate-in fade-in-50 duration-200">
                {!isEmailValid
                  ? 'Please enter a valid email address to unlock'
                  : 'Password must be at least 6 characters'}
              </p>
            )}
          </div>
        </form>

        {/* Catchy Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-card px-2.5 text-muted-foreground font-medium">
              In a hurry to explore?
            </span>
          </div>
        </div>

        {/* Quick Instant Demo Account */}
        <div className="space-y-1.5 text-center">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50/70 dark:text-emerald-400 dark:hover:bg-emerald-950/40 cursor-pointer font-medium"
            onClick={handleDemoLogin}
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
          New to Money Manager?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline transition-all inline-flex items-center gap-0.5"
          >
            <span>Claim your financial cockpit</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
