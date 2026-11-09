'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  Check,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import {
  evaluatePasswordStrength,
  generateStrongPassword,
} from '../utils/password-strength';

interface PasswordDemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPassword?: (password: string) => void;
}

export function PasswordDemoModal({
  open,
  onOpenChange,
  onApplyPassword,
}: PasswordDemoModalProps) {
  const [demoPassword, setDemoPassword] = useState(() => generateStrongPassword());
  const [showPassword, setShowPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  const evaluation = evaluatePasswordStrength(demoPassword);

  const handleGenerateNew = () => {
    const next = generateStrongPassword();
    setDemoPassword(next);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!demoPassword) return;
    navigator.clipboard.writeText(demoPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyPassword) {
      onApplyPassword(demoPassword);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-fit">
            <ShieldCheck className="size-3.5" />
            <span>Interactive Security Demo</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Strong Password Engine
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            See how our algorithm crafts high-entropy, crack-resistant passwords to protect your financial ledger.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Interactive Playground Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-foreground">
              <span>Interactive Generator Playground</span>
              <Badge
                variant="outline"
                className="text-[11px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              >
                Score: {evaluation.score}% ({evaluation.label})
              </Badge>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={demoPassword}
                onChange={(e) => {
                  setDemoPassword(e.target.value);
                  setCopied(false);
                }}
                className="h-11 font-mono text-sm tracking-wider pr-20 bg-muted/30"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded transition-colors"
                  aria-label="Copy password"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Strength Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex gap-1 p-0.5">
              {[1, 2, 3, 4, 5].map((level) => {
                const isActive = evaluation.criteriaMet >= level;
                return (
                  <div
                    key={level}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${isActive ? evaluation.color : 'bg-muted-foreground/20'
                      }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Real-time Criteria Checklist */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${evaluation.criteria.length
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
                }`}
            >
              {evaluation.criteria.length ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
              )}
              <span>8+ Characters</span>
            </div>

            <div
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${evaluation.criteria.uppercase
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
                }`}
            >
              {evaluation.criteria.uppercase ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
              )}
              <span>Uppercase (A-Z)</span>
            </div>

            <div
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${evaluation.criteria.lowercase
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
                }`}
            >
              {evaluation.criteria.lowercase ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
              )}
              <span>Lowercase (a-z)</span>
            </div>

            <div
              className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${evaluation.criteria.number
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
                }`}
            >
              {evaluation.criteria.number ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
              )}
              <span>Numbers (0-9)</span>
            </div>

            <div
              className={`col-span-2 flex items-center gap-2 p-2 rounded-lg border transition-colors ${evaluation.criteria.special
                  ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                  : 'border-border/60 bg-muted/20 text-muted-foreground'
                }`}
            >
              {evaluation.criteria.special ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0" />
              )}
              <span>Special Symbols (!@#$%&*?)</span>
            </div>
          </div>

          {/* Educational Note */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Zap className="size-3 text-primary" />
              <span>Why Strong Passwords Matter Here:</span>
            </p>
            <p className="leading-relaxed">
              Your Money Manager account guards real cash balances, banking links, and transaction logs. A password with 12+ mixed characters takes billions of years for automated dictionary bots to brute-force.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-1.5 cursor-pointer text-xs"
            onClick={handleGenerateNew}
          >
            <RefreshCw className="size-3.5" />
            <span>Generate Another</span>
          </Button>

          {onApplyPassword && (
            <Button
              type="button"
              className="flex-1 gap-1.5 cursor-pointer text-xs font-semibold"
              onClick={handleApply}
            >
              <KeyRound className="size-3.5" />
              <span>Use In Registration</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

