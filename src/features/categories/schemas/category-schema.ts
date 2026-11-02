import { z } from 'zod';
import {
  // Income icons
  Briefcase,
  Laptop,
  TrendingUp,
  Coins,
  Gift,
  Building,
  Award,
  DollarSign,
  PiggyBank,
  CreditCard,
  Landmark,
  Wallet,
  // Expense icons
  Home,
  ShoppingBag,
  UtensilsCrossed,
  Zap,
  Car,
  Activity,
  HeartPulse,
  Film,
  BookOpen,
  Smartphone,
  Plane,
  Coffee,
  Baby,
  GraduationCap,
  Scissors,
  ShieldAlert,
  Fuel,
  Wrench,
  Wifi,
  Package,
  Sparkles,
  Tag,
} from 'lucide-react';

export const CATEGORY_COLORS = [
  { label: 'Emerald Green', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Sky Blue', value: '#0284c7' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Royal Purple', value: '#8b5cf6' },
  { label: 'Rose Pink', value: '#f43f5e' },
  { label: 'Fuchsia', value: '#ec4899' },
  { label: 'Amber Orange', value: '#f59e0b' },
  { label: 'Warm Orange', value: '#f97316' },
  { label: 'Slate Gray', value: '#64748b' },
  { label: 'Deep Gray', value: '#334155' },
] as const;

export const CATEGORY_ICONS_CATALOG = [
  // Income & Professional
  { name: 'Briefcase', icon: Briefcase, label: 'Job / Employment', group: 'Income' },
  { name: 'Laptop', icon: Laptop, label: 'Consulting / Tech', group: 'Income' },
  { name: 'TrendingUp', icon: TrendingUp, label: 'Investments / Returns', group: 'Income' },
  { name: 'Coins', icon: Coins, label: 'Dividends / Bonus', group: 'Income' },
  { name: 'Gift', icon: Gift, label: 'Gifts & Rewards', group: 'Income' },
  { name: 'Building', icon: Building, label: 'Rental Income', group: 'Income' },
  { name: 'Award', icon: Award, label: 'Grants / Prize', group: 'Income' },
  { name: 'Wallet', icon: Wallet, label: 'General Income', group: 'Income' },

  // Essential Living & Utilities
  { name: 'Home', icon: Home, label: 'Housing & Rent', group: 'Living' },
  { name: 'ShoppingBag', icon: ShoppingBag, label: 'Groceries & Supplies', group: 'Living' },
  { name: 'Zap', icon: Zap, label: 'Electricity & Gas', group: 'Living' },
  { name: 'Wifi', icon: Wifi, label: 'Internet & Mobile', group: 'Living' },
  { name: 'Smartphone', icon: Smartphone, label: 'Phone & Recharge', group: 'Living' },
  { name: 'Package', icon: Package, label: 'Delivery & Courier', group: 'Living' },

  // Food & Lifestyle
  { name: 'UtensilsCrossed', icon: UtensilsCrossed, label: 'Dining & Restaurants', group: 'Lifestyle' },
  { name: 'Coffee', icon: Coffee, label: 'Cafes & Snacks', group: 'Lifestyle' },
  { name: 'Film', icon: Film, label: 'Entertainment & Movies', group: 'Lifestyle' },
  { name: 'Scissors', icon: Scissors, label: 'Personal Grooming', group: 'Lifestyle' },
  { name: 'Sparkles', icon: Sparkles, label: 'Shopping & Hobbies', group: 'Lifestyle' },

  // Transport & Commute
  { name: 'Car', icon: Car, label: 'Vehicle & Rideshare', group: 'Transport' },
  { name: 'Fuel', icon: Fuel, label: 'Fuel / Gas Station', group: 'Transport' },
  { name: 'Plane', icon: Plane, label: 'Travel & Flights', group: 'Transport' },
  { name: 'Wrench', icon: Wrench, label: 'Maintenance & Repairs', group: 'Transport' },

  // Health, Family & Education
  { name: 'Activity', icon: Activity, label: 'Fitness & Sports', group: 'Health' },
  { name: 'HeartPulse', icon: HeartPulse, label: 'Medical & Healthcare', group: 'Health' },
  { name: 'GraduationCap', icon: GraduationCap, label: 'Tuition & Courses', group: 'Education' },
  { name: 'BookOpen', icon: BookOpen, label: 'Books & Supplies', group: 'Education' },
  { name: 'Baby', icon: Baby, label: 'Childcare & Family', group: 'Family' },
  { name: 'ShieldAlert', icon: ShieldAlert, label: 'Insurance & Taxes', group: 'Finance' },
  { name: 'Tag', icon: Tag, label: 'Other Miscellaneous', group: 'Other' },
] as const;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Category name must be at least 2 characters.' })
    .max(40, { message: 'Category name cannot exceed 40 characters.' }),
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: 'Please choose whether this is an Income or Expense category.',
  }),
  icon: z.string().min(1, { message: 'Please select an icon.' }),
  color: z.string().min(1, { message: 'Please pick a color.' }),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
