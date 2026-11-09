'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Check,
  Copy,
  HelpCircle,
  Key,
} from 'lucide-react';
import {
  evaluatePasswordStrength,
  generateStrongPassword,
} from '../utils/password-strength';
import { PasswordDemoModal } from './PasswordDemoModal';

interface PasswordStrengthMeterProps {
  password: string;
  onSelectPassword: (newPassword: string) => void;
  showSuggestions?: boolean;
}

export function PasswordStrengthMeter({
  password,
  onSelectPassword,
  showSuggestions = true,
}: PasswordStrengthMeterProps) {
  const [demoOpen, setDemoOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const evaluation = evaluatePasswordStrength(password);

  const handleSuggest = () => {
    const generated = generateStrongPassword();
    onSelectPassword(generated);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2.5 pt-1">
      {/* Header Bar with Score & Controls */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          {evaluation.isStrong ? (
            <ShieldCheck className="size-3.5 text-emerald-500" />
          ) : (
            <ShieldAlert className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">Strength:</span>
          <span
            className={`font-semibold ${evaluation.isStrong
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-foreground'
              }`}
          >
            {password ? evaluation.label : 'None'}
          </span>
        </div>

        {showSuggestions && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSuggest}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors p-1 rounded hover:bg-primary/10"
              title="Auto-generate a strong password"
            >
              <Sparkles className="size-3 text-primary animate-pulse" />
              <span>Suggest Password</span>
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
              title="Open interactive password demo"
            >
              <HelpCircle className="size-3" />
              <span>Demo</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bars (5 segmented steps) */}
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((index) => {
          const filled = evaluation.criteriaMet >= index;
          return (
            <div
              key={index}
              className={`h-full flex-1 rounded-full transition-all duration-300 ${filled ? evaluation.color : 'bg-muted'
                }`}
            />
          );
        })}
      </div>

      {/* 5-Criteria Pill Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5 text-[11px]">
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${evaluation.criteria.length
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : 'text-muted-foreground/70'
            }`}
        >
          {evaluation.criteria.length ? (
            <Check className="size-3 text-emerald-500 shrink-0" />
          ) : (
            <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
          )}
          <span>8+ Chars</span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${evaluation.criteria.uppercase
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : 'text-muted-foreground/70'
            }`}
        >
          {evaluation.criteria.uppercase ? (
            <Check className="size-3 text-emerald-500 shrink-0" />
          ) : (
            <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
          )}
          <span>Uppercase (A-Z)</span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${evaluation.criteria.lowercase
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : 'text-muted-foreground/70'
            }`}
        >
          {evaluation.criteria.lowercase ? (
            <Check className="size-3 text-emerald-500 shrink-0" />
          ) : (
            <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
          )}
          <span>Lowercase (a-z)</span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${evaluation.criteria.number
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : 'text-muted-foreground/70'
            }`}
        >
          {evaluation.criteria.number ? (
            <Check className="size-3 text-emerald-500 shrink-0" />
          ) : (
            <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
          )}
          <span>Number (0-9)</span>
        </div>

        <div
          className={`col-span-2 sm:col-span-2 flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${evaluation.criteria.special
              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
              : 'text-muted-foreground/70'
            }`}
        >
          {evaluation.criteria.special ? (
            <Check className="size-3 text-emerald-500 shrink-0" />
          ) : (
            <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
          )}
          <span>Symbol (!@#$%^&*)</span>
        </div>
      </div>

      {/* Suggested Password Quick Actions Banner */}
      {evaluation.isStrong && password && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 text-xs text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-1.5">
            <Key className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-[11px]">Vault-grade password ready</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
          >
            {copied ? (
              <>
                <Check className="size-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Interactive Demo Modal */}
      <PasswordDemoModal
        open={demoOpen}
        onOpenChange={setDemoOpen}
        onApplyPassword={onSelectPassword}
      />
    </div>
  );
}

