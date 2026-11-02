'use client';

import React from 'react';
import { Sun, Moon, Laptop, Palette, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '../hooks/useSettings';
import type { ThemeMode } from '../schemas/settings-schema';
import { cn } from '@/lib/utils';

interface ThemeOption {
  mode: ThemeMode;
  title: string;
  description: string;
  icon: typeof Sun;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    mode: 'system',
    title: 'System Automatic',
    description: 'Syncs automatically with your operating system appearance schedule.',
    icon: Laptop,
  },
  {
    mode: 'light',
    title: 'Light Theme',
    description: 'Clean, high-clarity daylight theme optimized for daytime readability.',
    icon: Sun,
  },
  {
    mode: 'dark',
    title: 'Dark Theme',
    description: 'Modern, low-glare dark theme optimized for OLED screens and night sessions.',
    icon: Moon,
  },
];

export function AppearanceCard() {
  const { preferences, updatePreferences } = useSettings();

  const handleSelectTheme = (mode: ThemeMode) => {
    updatePreferences({
      ...preferences,
      theme: mode,
    });
  };

  return (
    <Card className="border-border/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Palette className="size-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-foreground">
              Appearance & Theme
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Choose your preferred visual aesthetic or let your operating system decide.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = preferences.theme === opt.mode;

            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => handleSelectTheme(opt.mode)}
                className={cn(
                  'flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs'
                    : 'border-border/70 hover:border-border hover:bg-muted/40'
                )}
              >
                {/* Active Indicator Checkmark */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 text-primary">
                    <CheckCircle2 className="size-4.5" />
                  </div>
                )}

                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl mb-3 transition-transform group-hover:scale-105',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">
                    {opt.title}
                  </h4>
                  {isSelected && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                      Active
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
