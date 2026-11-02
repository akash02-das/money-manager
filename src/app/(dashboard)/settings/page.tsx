import { Settings } from 'lucide-react';
import { ModulePlaceholder } from '@/components/shared/ModulePlaceholder';

export default function SettingsPage() {
  return (
    <ModulePlaceholder
      title="Settings & Preferences"
      description="Configure user profile, default currency, financial year, and appearance."
      icon={Settings}
      plannedFeatures={[
        'User profile and regional formats',
        'Currency preference (BDT, USD, EUR)',
        'Theme settings (System, Light, Dark)',
        'Data export / backup options',
      ]}
    />
  );
}
