'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  validateEmailAddress,
  type EmailValidationResult,
} from '../utils/email-validator';
import { cn } from '@/lib/utils';

interface EmailVerificationBoxProps {
  email: string;
  onEmailChange: (email: string) => void;
  isVerified: boolean;
  onVerificationChange: (verified: boolean) => void;
  disabled?: boolean;
  error?: string;
  onClearError?: () => void;
}

export function EmailVerificationBox({
  email,
  onEmailChange,
  isVerified,
  onVerificationChange,
  disabled = false,
  error,
  onClearError,
}: EmailVerificationBoxProps) {
  const [validation, setValidation] = useState<EmailValidationResult>(() =>
    validateEmailAddress(email),
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Re-run validation whenever email text changes
  useEffect(() => {
    const res = validateEmailAddress(email);
    setValidation(res);

    // If email changes after verification, revoke verified status
    if (isVerified) {
      onVerificationChange(false);
      setGeneratedCode(null);
      setEnteredCode('');
    }
  }, [email]);

  const handleSendCode = () => {
    if (!validation.isRealCandidate) return;

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setIsVerifying(true);
    setCodeError(null);
    setDemoNotice(
      `📬 Simulated Mail Delivery: Your 6-digit Money Manager verification code is ${code.slice(
        0,
        3,
      )}-${code.slice(3)}`,
    );
  };

  const handleVerifyCode = () => {
    if (!generatedCode) return;

    if (enteredCode.trim() === generatedCode.trim()) {
      onVerificationChange(true);
      setIsVerifying(false);
      setCodeError(null);
      setDemoNotice(null);
    } else {
      setCodeError('Incorrect 6-digit code. Please check and try again.');
    }
  };

  const handleFillDemoCode = () => {
    if (generatedCode) {
      setEnteredCode(generatedCode);
      onVerificationChange(true);
      setIsVerifying(false);
      setCodeError(null);
      setDemoNotice(null);
    }
  };

  const handleAcceptSuggestion = () => {
    if (validation.suggestedEmail) {
      onEmailChange(validation.suggestedEmail);
      if (onClearError) onClearError();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="email" className="text-xs font-semibold text-foreground">
          Email Address
        </Label>
        {isVerified && (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1 font-medium"
          >
            <CheckCircle2 className="size-3" />
            <span>Verified Real Email</span>
          </Badge>
        )}
      </div>

      <div className="relative">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="akash@financialfreedom.com"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
            if (onClearError) onClearError();
          }}
          disabled={disabled || isVerified}
          className={cn(
            'h-10 pr-24 transition-colors',
            (error || validation.isDisposable) &&
            'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive',
            isVerified && 'border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20',
          )}
        />

        {/* Action Button inside Input */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
          {isVerified ? (
            <button
              type="button"
              onClick={() => onVerificationChange(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-2 py-1 rounded transition-colors"
              title="Change email"
            >
              <RotateCcw className="size-3" />
              <span>Change</span>
            </button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleSendCode}
              disabled={disabled || !validation.isRealCandidate || isVerifying}
              className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2.5 font-medium cursor-pointer"
            >
              <Send className="size-3 mr-1" />
              <span>Verify</span>
            </Button>
          )}
        </div>
      </div>

      {/* Disposable Email Warning Alert */}
      {validation.isDisposable && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs text-destructive animate-in fade-in-50 duration-200">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Disposable Email Detected</p>
            <p className="text-[11px] leading-relaxed">
              Temporary inboxes like <code>@{validation.domain}</code> are blocked. Please use a permanent email so you can recover your financial records and password anytime.
            </p>
          </div>
        </div>
      )}

      {/* Typo Suggestion Banner */}
      {validation.suggestedEmail && !validation.isDisposable && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-2 text-xs text-amber-900 dark:text-amber-300 animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              Did you mean{' '}
              <strong className="font-semibold underline">
                {validation.suggestedEmail}
              </strong>
              ?
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleAcceptSuggestion}
            className="h-6 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 dark:text-amber-200 px-2"
          >
            Yes, Fix It
          </Button>
        </div>
      )}

      {/* Simulated Mail Delivery Preview Banner */}
      {demoNotice && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5 text-xs text-foreground animate-in fade-in-50 duration-200">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary shrink-0" />
            <span className="text-[11px] leading-snug">{demoNotice}</span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleFillDemoCode}
            className="h-6 text-[10px] font-medium border-primary/30 text-primary hover:bg-primary/10 self-end sm:self-auto shrink-0"
          >
            ⚡ Auto-Verify Code
          </Button>
        </div>
      )}

      {/* Verification Code Input Section */}
      {isVerifying && !isVerified && (
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3 space-y-2.5 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Enter 6-Digit Email Code</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Demo code shown above</span>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              maxLength={6}
              placeholder="e.g. 742918"
              value={enteredCode}
              onChange={(e) => {
                setEnteredCode(e.target.value.replace(/\D/g, ''));
                setCodeError(null);
              }}
              className="h-9 font-mono tracking-widest text-center text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleVerifyCode}
              className="h-9 px-4 text-xs font-semibold cursor-pointer shrink-0"
              disabled={enteredCode.length !== 6}
            >
              Confirm
            </Button>
          </div>

          {codeError && (
            <p className="text-[11px] font-medium text-destructive flex items-center gap-1">
              <AlertCircle className="size-3 shrink-0" />
              <span>{codeError}</span>
            </p>
          )}
        </div>
      )}

      {/* General Field Error */}
      {error && !validation.isDisposable && (
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive animate-in fade-in-50 duration-200">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

