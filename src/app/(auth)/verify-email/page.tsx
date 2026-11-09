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
  Sparkles,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [devPreviewCode, setDevPreviewCode] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if a dev code preview was saved during registration/login in this session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('mm_last_verification_preview');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.email === email || !email) {
            setDevPreviewCode(parsed.code);
          }
        } catch {}
      }
    }
  }, [email]);

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
        err?.message || 'Verification token is invalid or has expired. Please request a new code.',
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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('mm_last_verification_preview');
      }
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Verification failed. The code may be incorrect or expired. Please check and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Email address is missing. Please return to the login page.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      const res = await resendVerification({ email: email.trim() });
      setResendNotice('A fresh 6-digit code has been sent to your email.');
      if (res?.verificationPreview?.code) {
        setDevPreviewCode(res.verificationPreview.code);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            'mm_last_verification_preview',
            JSON.stringify({ email: email.trim(), code: res.verificationPreview.code }),
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not resend code. Please try again in a few moments.');
    } finally {
      setIsResending(false);
    }
  };

  const handleAutoFillDevCode = () => {
    if (devPreviewCode) {
      setCode(devPreviewCode);
      setErrorMessage(null);
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
              We sent a 6-digit security code to{' '}
              <strong className="font-semibold text-foreground">{email}</strong>. Enter it below to
              unlock your verified account.
            </>
          ) : (
            'Enter the 6-digit verification code sent to your registered email.'
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

        {/* Local / In-App Email Simulator Card */}
        {devPreviewCode && !isSuccess && (
          <div className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-emerald-500/5 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Simulated Mail Delivery</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                Development Preview
              </span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              In this environment, your 6-digit Money Manager verification code is:{' '}
              <strong className="font-mono text-sm tracking-widest text-primary font-bold">
                {devPreviewCode}
              </strong>
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAutoFillDevCode}
              className="w-full text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 cursor-pointer h-7"
            >
              ⚡ Auto-Fill This Code
            </Button>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerifySubmit} noValidate className="space-y-4">
          {!emailParam && (
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email Address
              </Label>
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
            </div>
          )}

          <div className="space-y-1.5 text-center">
            <Label htmlFor="code" className="text-xs font-semibold block text-center">
              6-Digit Verification Code
            </Label>
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

        {/* Resend Option */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span>Didn't receive the email?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || isSubmitting || isSuccess}
            className="font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isResending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <RotateCcw className="size-3" />
            )}
            <span>Resend Code</span>
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

