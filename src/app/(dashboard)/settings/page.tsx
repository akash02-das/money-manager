import { SettingsView } from '@/features/settings/components/SettingsView';

export const metadata = {
  title: 'Settings & Preferences — Money Manager',
  description: 'Manage your profile, currency preferences, dark/light theme, and financial data backups.',
};

export const instant = false;

export default function SettingsPage() {
  return <SettingsView />;
}

