'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { LogIn, UserPlus, Sparkles, AlertCircle, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrencyCode } from '@/types/finance';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { EmailVerificationBox } from './EmailVerificationBox';
import { evaluatePasswordStrength } from '../utils/password-strength';
import { validateEmailAddress } from '../utils/email-validator';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { login, register, loginAsDemo, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const loginEmailValidation = validateEmailAddress(loginEmail);
  const isLoginValid =
    loginEmailValidation.isValidSyntax &&
    !loginEmailValidation.isDisposable &&
    loginPassword.length >= 6;

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [isRegEmailVerified, setIsRegEmailVerified] = useState(false);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCurrency, setRegCurrency] = useState<CurrencyCode>('BDT');
  const [regErrors, setRegErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validateLoginForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const trimmed = loginEmail.trim();

    if (!trimmed) {
      errors.email = 'We need your email to unlock your financial vault.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      errors.email = 'Please provide a valid email address (e.g., name@domain.com).';
    }

    if (!loginPassword) {
      errors.password = 'Don’t forget your password! Even Fort Knox needs a key.';
    } else if (loginPassword.length < 6) {
      errors.password = 'Passwords must be at least 6 characters.';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!regName.trim()) {
      errors.name = 'Please provide your full name.';
    }

    const emailRes = validateEmailAddress(regEmail);
    if (!emailRes.isValidSyntax) {
      errors.email = emailRes.errorMessage || 'Please provide a valid email address.';
    } else if (emailRes.isDisposable) {
      errors.email = 'Temporary/disposable emails are blocked to secure your financial vault.';
    } else if (!isRegEmailVerified) {
      errors.email = 'Please click "Verify" next to your email to verify it is real.';
    }

    const strength = evaluatePasswordStrength(regPassword);
    if (!regPassword) {
      errors.password = 'Please provide a strong password.';
    } else if (!strength.isStrong) {
      errors.password = 'Password must meet all 5 strong password requirements.';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateLoginForm()) {
      return;
    }

    try {
      await login({ email: loginEmail.trim(), password: loginPassword });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Email and password did not match. Please verify your credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateRegisterForm()) {
      return;
    }

    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        currency: regCurrency,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    try {
      await loginAsDemo();
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Could not connect demo account.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Account Access
          </DialogTitle>
          <DialogDescription>
            Connect to the Money Manager API for real-time persistence across devices.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setError(null); }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-1.5">
              <LogIn className="size-4" />
              <span>Sign In</span>
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-1.5">
              <UserPlus className="size-4" />
              <span>Register</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4 space-y-4">
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-semibold">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="akash@financialfreedom.com"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: undefined }));
                    if (error) setError(null);
                  }}
                  aria-invalid={!!loginErrors.email}
                  className={cn(
                    'h-10 transition-colors',
                    loginErrors.email && 'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive'
                  )}
                  disabled={isLoading}
                />
                {loginErrors.email && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{loginErrors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-semibold">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                      if (error) setError(null);
                    }}
                    aria-invalid={!!loginErrors.password}
                    className={cn(
                      'h-10 pr-10 transition-colors',
                      loginErrors.password && 'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive'
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                  >
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter
                  password={loginPassword}
                  onSelectPassword={(suggested) => {
                    setLoginPassword(suggested);
                    setShowLoginPassword(true);
                    if (loginErrors.password) {
                      setLoginErrors((prev) => ({ ...prev, password: undefined }));
                    }
                    if (error) setError(null);
                  }}
                />

                {loginErrors.password && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{loginErrors.password}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Button
                  type="submit"
                  className={cn(
                    'w-full gap-2 font-medium transition-all',
                    isLoginValid && !isLoading
                      ? 'cursor-pointer'
                      : 'cursor-not-allowed opacity-50 bg-muted text-muted-foreground select-none'
                  )}
                  disabled={!isLoginValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Unlocking your dashboard...</span>
                    </>
                  ) : (
                    <span>Sign In to Financial Cockpit</span>
                  )}
                </Button>

                {!isLoginValid && (loginEmail.length > 0 || loginPassword.length > 0) && (
                  <p className="text-[11px] text-center text-muted-foreground">
                    {!loginEmailValidation.isValidSyntax
                      ? 'Please enter a valid email address'
                      : 'Password must be at least 6 characters'}
                  </p>
                )}
              </div>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              onClick={handleDemoSignIn}
              disabled={isLoading}
            >
              <Sparkles className="size-4 text-emerald-500" />
              <span>Quick Demo Sign In</span>
            </Button>
          </TabsContent>

          <TabsContent value="register" className="mt-4 space-y-4">
            <form onSubmit={handleRegister} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-xs font-semibold">Full Name</Label>
                <Input
                  id="reg-name"
                  placeholder="e.g. John Doe"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (regErrors.name) setRegErrors((prev) => ({ ...prev, name: undefined }));
                    if (error) setError(null);
                  }}
                  aria-invalid={!!regErrors.name}
                  className={cn(
                    'h-10 transition-colors',
                    regErrors.name && 'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive'
                  )}
                  disabled={isLoading}
                />
                {regErrors.name && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{regErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Real Email Verification Box */}
              <EmailVerificationBox
                email={regEmail}
                onEmailChange={setRegEmail}
                isVerified={isRegEmailVerified}
                onVerificationChange={setIsRegEmailVerified}
                disabled={isLoading}
                error={regErrors.email}
                onClearError={() => {
                  if (regErrors.email) setRegErrors((prev) => ({ ...prev, email: undefined }));
                  if (error) setError(null);
                }}
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reg-password" className="text-xs font-semibold">Vault Password</Label>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="size-3" />
                    <span>Encrypted</span>
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Must meet all 5 security rules"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: undefined }));
                      if (error) setError(null);
                    }}
                    aria-invalid={!!regErrors.password}
                    className={cn(
                      'h-10 pr-10 transition-colors',
                      regErrors.password && 'border-destructive focus-visible:ring-destructive/20 bg-destructive/5 text-destructive'
                    )}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                  >
                    {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                <PasswordStrengthMeter
                  password={regPassword}
                  onSelectPassword={(suggested) => {
                    setRegPassword(suggested);
                    setShowRegPassword(true);
                    if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: undefined }));
                    if (error) setError(null);
                  }}
                />

                {regErrors.password && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-destructive">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{regErrors.password}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-currency" className="text-xs font-semibold">Primary Currency</Label>
                <select
                  id="reg-currency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={regCurrency}
                  onChange={(e) => setRegCurrency(e.target.value as CurrencyCode)}
                  disabled={isLoading}
                >
                  <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                </select>
              </div>

              <Button type="submit" className="w-full gap-2 cursor-pointer font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Activate Financial Vault</span>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

