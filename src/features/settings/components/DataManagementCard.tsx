'use client';

import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileJson,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '../hooks/useSettings';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { useTransactions } from '@/features/transactions/hooks/useTransactions';
import { useBudgets } from '@/features/budgets/hooks/useBudgets';
import { ResetConfirmationDialog } from './ResetConfirmationDialog';

export function DataManagementCard() {
  const { exportData, importData } = useSettings();
  const { refreshAccounts } = useAccounts();
  const { refreshCategories } = useCategories();
  const { refreshTransactions } = useTransactions();
  const { refreshBudgets } = useBudgets();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportData();
      setStatusMessage({
        type: 'success',
        text: 'Backup file downloaded successfully. Keep this file safe for offline storage.',
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to generate backup export file.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const res = await importData(file);

      // Explicitly refresh all contexts in sequence to ensure atomic in-memory synchronization
      await refreshAccounts();
      await refreshCategories();
      await refreshTransactions();
      await refreshBudgets();

      setStatusMessage({
        type: 'success',
        text: `Data successfully imported! ${res.message}`,
      });
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Invalid backup JSON file';
      setStatusMessage({
        type: 'error',
        text: msg,
      });
    } finally {
      setIsImporting(false);
      // Reset input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Card className="border-border/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Database className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                Data Management & Backup
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Export offline JSON backups, restore financial history, or factory reset.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Export & Import Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Section */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Download className="size-4 text-primary" />
                  <span>Export Full Backup</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Export all your accounts, categorized ledger transactions, budgets, and settings into a single standard JSON file.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full gap-2 cursor-pointer font-semibold text-xs"
              >
                {isExporting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileJson className="size-3.5" />
                )}
                <span>Download JSON Backup</span>
              </Button>
            </div>

            {/* Import Section */}
            <div className="p-4 rounded-xl border border-border/80 bg-card/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Upload className="size-4 text-primary" />
                  <span>Restore from Backup</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Upload an existing Money Manager backup file to restore accounts, categories, transactions, and budgets.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                  id="backup-file-input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="w-full gap-2 cursor-pointer font-semibold text-xs"
                >
                  {isImporting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  <span>Upload & Restore (.json)</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-2">
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle className="size-4" />
                    <span>Danger Zone: Factory Reset</span>
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Erase all custom transactions, accounts, and budgets in your browser storage and reset the app back to original factory demo data.
                  </p>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsResetOpen(true)}
                  className="cursor-pointer gap-1.5 font-semibold text-xs shrink-0"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Factory Reset</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ResetConfirmationDialog
        open={isResetOpen}
        onOpenChange={setIsResetOpen}
      />
    </>
  );
}
