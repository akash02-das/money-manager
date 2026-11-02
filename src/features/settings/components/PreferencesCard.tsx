'use client';

import React, { useState } from 'react';
import {
  Coins,
  Binary,
  Calendar,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '../hooks/useSettings';
import type { AppPreferences, NumberFormatSystem } from '../schemas/settings-schema';
import type { CurrencyCode } from '@/types/finance';
import { cn } from '@/lib/utils';

const CURRENCIES: { code: CurrencyCode; name: string; symbol: string }[] = [
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

export function PreferencesCard() {
  const { preferences, updatePreferences, isSaving } = useSettings();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local state for interactive editing before save or direct auto-save
  const [currency, setCurrency] = useState<CurrencyCode>(preferences.currency);
  const [numberFormat, setNumberFormat] = useState<NumberFormatSystem>(preferences.numberFormat);
  const [hideDecimals, setHideDecimals] = useState<boolean>(preferences.hideDecimals);
  const [monthStartDay, setMonthStartDay] = useState<number>(preferences.monthStartDay);

  const hasChanges =
    currency !== preferences.currency ||
    numberFormat !== preferences.numberFormat ||
    hideDecimals !== preferences.hideDecimals ||
    monthStartDay !== preferences.monthStartDay;

  const handleSave = async () => {
    try {
      await updatePreferences({
        ...preferences,
        currency,
        numberFormat,
        hideDecimals,
        monthStartDay,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Coins className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Financial & Regional Preferences
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Customize currency denomination, South Asian vs Western numbering, and billing cycles.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Currency Selection Grid */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Base Currency</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CURRENCIES.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    'flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                      : 'border-border/70 hover:border-border hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-base text-foreground font-mono">
                      {c.symbol}
                    </span>
                    {isSelected && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="font-semibold text-xs text-foreground mt-1">
                    {c.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Number Grouping Format */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Number Grouping System</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setNumberFormat('SOUTH_ASIAN')}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                numberFormat === 'SOUTH_ASIAN'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border/70 hover:bg-muted/40'
              )}
            >
              <Binary className="size-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <span>South Asian (Lakhs & Crores)</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-medium">Standard</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  e.g., ৳ 1,25,000.00
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Traditional format used in Bangladesh and South Asia.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setNumberFormat('INTERNATIONAL')}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer',
                numberFormat === 'INTERNATIONAL'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border/70 hover:bg-muted/40'
              )}
            >
              <Binary className="size-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-foreground">
                  International (Thousands & Millions)
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  e.g., ৳ 125,000.00
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Global standard numbering notation.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Decimal Display & Month Start Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Decimal Display */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Decimal Precision</Label>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-muted/50 border border-border/70">
              <button
                type="button"
                onClick={() => setHideDecimals(false)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer text-center',
                  !hideDecimals
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Show Cents / Paisa (.00)
              </button>
              <button
                type="button"
                onClick={() => setHideDecimals(true)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer text-center',
                  hideDecimals
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Round to Integers
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {!hideDecimals ? 'Displays ৳ 1,500.00' : 'Displays ৳ 1,500'}
            </p>
          </div>

          {/* Month Start Day */}
          <div className="space-y-1.5">
            <Label htmlFor="month-start-day" className="text-xs font-semibold">
              Monthly Budget Cycle Anchor
            </Label>
            <Select
              value={String(monthStartDay)}
              onValueChange={(val) => setMonthStartDay(Number(val))}
            >
              <SelectTrigger id="month-start-day" className="h-9 text-xs">
                <SelectValue placeholder="Select start day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1st of the month (Calendar standard)</SelectItem>
                <SelectItem value="5">5th of the month (Salary day)</SelectItem>
                <SelectItem value="10">10th of the month</SelectItem>
                <SelectItem value="15">15th of the month (Mid-month)</SelectItem>
                <SelectItem value="25">25th of the month</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Used to align monthly spending trends with salary inflow.
            </p>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div>
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                <CheckCircle2 className="size-4" />
                <span>Preferences saved successfully</span>
              </span>
            )}
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="gap-2 cursor-pointer font-semibold shadow-xs"
          >
            {isSaving && <Loader2 className="size-3.5 animate-spin" />}
            <span>Save Preferences</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
