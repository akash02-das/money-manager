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
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateEmailAddress } from '@/features/auth/utils/email-validator';

interface AuthErrorInfo {
  title: string;
  message: string;
  type: 'not_found' | 'invalid_password' | 'service_error' | 'generic';
  suggestedEmail?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [authError, setAuthError] = useState<AuthErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');
      if (emailParam) setEmail(emailParam);
    }
  }, []);

  // Real-time validation checks for disabling/enabling the submit button
  const emailValidation = validateEmailAddress(email);
  const isEmailValid = emailValidation.isValidSyntax && !emailValidation.isDisposable;
  const isPasswordValid = password.length > 0;
  const isFormValid = isEmailValid && isPasswordValid;

  // Custom client-side validation
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
      errors.password = 'Please enter your password to unlock your vault.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (authError) setAuthError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (authError) setAuthError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

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
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      const rawMsg = String(err?.message || '');
      const rawError = String(err?.error || '');

      // 1. Account not found (unauthorized / unregistered email)
      if (
        rawError === 'ACCOUNT_NOT_FOUND' ||
        rawMsg.toLowerCase().includes('no account found') ||
        rawMsg.toLowerCase().includes('not registered') ||
        rawMsg.toLowerCase().includes('unregistered')
      ) {
        setAuthError({
          title: 'Account Not Found',
          message: `We couldn't find a registered account for "${email.trim()}". Check for spelling typos, or create an account below.`,
          type: 'not_found',
          suggestedEmail: email.trim(),
        });
        return;
      }

      // 2. Incorrect password
      if (
        rawError === 'INVALID_CREDENTIALS' ||
        rawMsg.toLowerCase().includes('incorrect password') ||
        rawMsg.toLowerCase().includes('password you entered is incorrect')
      ) {
        setAuthError({
          title: 'Incorrect Password',
          message: 'The password entered does not match our records for this account. Please verify and try again.',
          type: 'invalid_password',
        });
        return;
      }

      // 3. Database synchronization / connection error
      if (
        rawError === 'AUTH_DATABASE_UNAVAILABLE' ||
        rawError === 'DatabaseConfigurationError' ||
        rawMsg.includes('P2022') ||
        rawMsg.toLowerCase().includes('database') ||
        rawMsg.toLowerCase().includes('connect')
      ) {
        setAuthError({
          title: 'Authentication Service Synchronizing',
          message: 'The service is currently synchronizing or unreachable. Please verify your connection or try again shortly.',
          type: 'service_error',
        });
        return;
      }

      // 4. Fallback friendly error
      setAuthError({
        title: 'Unable to Sign In',
        message: rawMsg || 'The email and password combination did not match. Please verify your credentials or register for an account.',
        type: 'generic',
      });
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Dynamic & Helpful Auth Error Banner */}
        {authError && (
          <div
            className={cn(
              'rounded-xl border p-4 text-xs animate-in fade-in-50 duration-200 space-y-2.5',
              authError.type === 'not_found'
                ? 'border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                : 'border-destructive/25 bg-destructive/10 text-destructive'
            )}
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-inherit" />
              <div className="space-y-1 flex-1">
                <p className="font-semibold text-sm leading-none">{authError.title}</p>
                <p className="leading-relaxed opacity-95">{authError.message}</p>
              </div>
            </div>

            {/* Direct Action Guidance for Unregistered Accounts */}
            {authError.type === 'not_found' && (
              <div className="pt-2 border-t border-amber-500/25 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium cursor-pointer shadow-xs gap-1.5"
                  onClick={() =>
                    router.push(
                      `/register?email=${encodeURIComponent(authError.suggestedEmail || email.trim())}`
                    )
                  }
                >
                  <span>Sign Up with this Email</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )}

            {/* Direct Action Guidance for Database / Server issues */}
            {authError.type === 'service_error' && (
              <div className="pt-2 border-t border-destructive/20 text-[11px] text-destructive/90">
                <span>Please check your connection and retry in a moment.</span>
              </div>
            )}
          </div>
        )}

        {/* Form with noValidate to block default browser tooltip bubbles */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4" suppressHydrationWarning>
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email Address
            </Label>
            <div className="relative" suppressHydrationWarning>
              {isMounted ? (
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
              ) : (
                <div
                  aria-hidden="true"
                  className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-muted-foreground/60 flex items-center"
                >
                  akash@financialfreedom.com
                </div>
              )}
            </div>

            {/* Email Typo Suggestion */}
            {isMounted && emailValidation.suggestedEmail && !emailValidation.isDisposable && (
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
                Password
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

          {/* Primary Action Button (Enabled once email and password are provided) */}
          <div className="space-y-1.5 pt-1">
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
                  <span>Sign In to Financial Cockpit</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>

            {!isFormValid && (email.length > 0 || password.length > 0) && (
              <p className="text-[11px] text-center text-muted-foreground animate-in fade-in-50 duration-200">
                {!isEmailValid
                  ? 'Please enter a valid email address'
                  : 'Please enter your password'}
              </p>
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 py-3.5">
        <p className="text-xs text-muted-foreground">
          New to Money Manager?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline transition-all inline-flex items-center gap-0.5"
          >
            <span>Create a verified account</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
