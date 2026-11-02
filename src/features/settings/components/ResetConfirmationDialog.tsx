'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface ResetConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetConfirmationDialog({
  open,
  onOpenChange,
}: ResetConfirmationDialogProps) {
  const { factoryReset } = useSettings();
  const [confirmText, setConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const isConfirmed = confirmText.trim().toUpperCase() === 'RESET';

  const handleReset = async () => {
    if (!isConfirmed) return;
    try {
      setIsResetting(true);
      await factoryReset();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to factory reset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-destructive mb-1">
            <div className="p-2 rounded-xl bg-destructive/10">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-destructive font-bold">
              Factory Reset Application
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left pt-2 text-xs leading-relaxed">
            <span className="block text-foreground font-medium">
              This action cannot be undone. It will wipe all local data from your browser:
            </span>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>All bank accounts, cash wallets, and custom balances</li>
              <li>All income, expense, and transfer transaction records</li>
              <li>All category budget limits and progress benchmarks</li>
              <li>All customized categories and preferences</li>
            </ul>
            <span className="block p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive font-semibold">
              The application will be restored to its pristine initial seed state.
            </span>
            <div className="pt-2 space-y-1.5">
              <Label htmlFor="confirm-reset-input" className="text-foreground font-bold">
                Type <span className="font-mono text-destructive">RESET</span> to confirm:
              </Label>
              <Input
                id="confirm-reset-input"
                placeholder="RESET"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="font-mono text-center tracking-widest text-sm uppercase"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-1.5 pt-3">
          <AlertDialogCancel onClick={() => setConfirmText('')}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed || isResetting}
            onClick={handleReset}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold cursor-pointer"
          >
            {isResetting && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
            <span>Wipe & Reset Everything</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
