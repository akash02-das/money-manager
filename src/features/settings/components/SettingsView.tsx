'use client';

import React from 'react';
import {
  User,
  Coins,
  Palette,
  Database,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileSettingsCard } from './ProfileSettingsCard';
import { PreferencesCard } from './PreferencesCard';
import { AppearanceCard } from './AppearanceCard';
import { DataManagementCard } from './DataManagementCard';
import { useSettings } from '../hooks/useSettings';
import { CURRENCY_SYMBOLS } from '@/lib/formatters';

export function SettingsView() {
  const { preferences, profile } = useSettings();

  const currencySymbol = CURRENCY_SYMBOLS[preferences.currency] || '৳';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your personal profile, base currency, visual appearance, and data backups.
          </p>
        </div>

        {/* Live Badges */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs font-semibold px-2.5 py-1 gap-1.5 border-primary/30 text-primary bg-primary/5"
          >
            <span className="font-mono">{currencySymbol}</span>
            <span>{preferences.currency} Base</span>
          </Badge>

          <Badge
            variant="secondary"
            className="text-xs font-medium px-2.5 py-1 capitalize"
          >
            {preferences.theme} Theme
          </Badge>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="h-10 p-1 bg-muted/60 border border-border/60 rounded-xl gap-1">
          <TabsTrigger
            value="profile"
            className="cursor-pointer gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            <User className="size-4" />
            <span>Profile</span>
          </TabsTrigger>

          <TabsTrigger
            value="preferences"
            className="cursor-pointer gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            <Coins className="size-4" />
            <span>Currency & Regional</span>
          </TabsTrigger>

          <TabsTrigger
            value="appearance"
            className="cursor-pointer gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            <Palette className="size-4" />
            <span>Appearance</span>
          </TabsTrigger>

          <TabsTrigger
            value="data"
            className="cursor-pointer gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            <Database className="size-4" />
            <span>Data & Backup</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="space-y-6">
          <ProfileSettingsCard />
        </TabsContent>

        {/* Tab 2: Currency & Regional */}
        <TabsContent value="preferences" className="space-y-6">
          <PreferencesCard />
        </TabsContent>

        {/* Tab 3: Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceCard />
        </TabsContent>

        {/* Tab 4: Data & Backup */}
        <TabsContent value="data" className="space-y-6">
          <DataManagementCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
