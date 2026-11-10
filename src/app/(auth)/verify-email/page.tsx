'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  CheckCircle2,
  Mail,
  RotateCcw,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // If a direct verification token link was clicked, automatically verify it on mount
  useEffect(() => {
    if (tokenParam) {
      handleAutoTokenVerification(tokenParam);
    }
  }, [tokenParam]);

  const handleAutoTokenVerification = async (token: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await verifyEmail({ token });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Verification link is invalid or has expired. Please request a new code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      await verifyEmail({
        email: email.trim(),
        code: code.trim(),
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Verification failed. The code may be incorrect or expired. Please check your inbox and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Email address is missing. Please return to the sign in page.');
      return;
    }

    if (resendCooldown > 0) return;

    setIsResending(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      await resendVerification({ email: email.trim() });
      setResendNotice('A fresh 6-digit code has been dispatched to your email.');
      setResendCooldown(60);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not resend code. Please try again in a few moments.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="shadow-xl border-border/80 overflow-hidden backdrop-blur-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-primary to-indigo-600" />

      <CardHeader className="space-y-2 pb-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Verify Your Email Address
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          {email ? (
            <>
              A 6-digit verification code has been dispatched to{' '}
              <strong className="font-semibold text-foreground">{email}</strong>. Enter it below to
              activate your verified vault.
            </>
          ) : (
            'Enter the 6-digit verification code sent to your registered email address.'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Success Banner */}
        {isSuccess && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in-50">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-sm">Email Verified Successfully!</p>
              <p>Redirecting you to your financial cockpit...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in-50">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Verification Issue</p>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Resend Notice */}
        {resendNotice && (
          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary animate-in fade-in-50">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{resendNotice}</span>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifySubmit} noValidate className="space-y-4" suppressHydrationWarning>
          {!emailParam && (
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address
              </Label>
              <div className="relative" suppressHydrationWarning>
                {isMounted ? (
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="akash@example.com"
                    required
                    disabled={isSubmitting || isSuccess}
                    className="h-10"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-muted-foreground/60 flex items-center"
                  >
                    akash@example.com
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-center">
            <Label htmlFor="code" className="text-xs font-semibold block text-center">
              6-Digit Security Code
            </Label>
            <div className="relative" suppressHydrationWarning>
              {isMounted ? (
                <Input
                  id="code"
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => {
                    const numeric = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCode(numeric);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isSubmitting || isSuccess}
                  className="h-12 text-center font-mono text-xl tracking-[0.4em] font-bold"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="h-12 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-center font-mono text-xl tracking-[0.4em] text-muted-foreground/60 flex items-center justify-center font-bold"
                >
                  ••••••
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Please enter the code from the verification email sent to your inbox.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 cursor-pointer font-semibold shadow-md"
            disabled={code.length !== 6 || isSubmitting || isSuccess}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              <>
                <span>Confirm & Unlock Vault</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>

        {/* Local Dev & Delivery Note */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Info className="size-3.5 text-primary shrink-0" />
            <span>Didn't see the email?</span>
          </p>
          <p className="leading-relaxed">
            Check your spam/junk folder. In local development without SMTP configured, the 6-digit code is logged securely to your backend terminal console.
          </p>
        </div>

        {/* Resend Option */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Need a fresh code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isSubmitting || isSuccess || resendCooldown > 0}
            className="font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:no-underline"
          >
            {isResending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RotateCcw className="size-3" />
            )}
            <span>
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
            </span>
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/40 bg-muted/20 py-3.5">
        <p className="text-xs text-muted-foreground">
          Wrong email address?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline transition-all"
          >
            Register again
          </Link>{' '}
          or{' '}
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] w-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
