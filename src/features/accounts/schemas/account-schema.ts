import { z } from 'zod';

export const ACCOUNT_COLORS = [
  { label: 'Sky Blue', value: '#0284c7' },
  { label: 'Rose Pink', value: '#e11d48' },
  { label: 'Emerald Green', value: '#059669' },
  { label: 'Royal Purple', value: '#7c3aed' },
  { label: 'Amber Orange', value: '#d97706' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Slate Gray', value: '#475569' },
] as const;

export const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Account name must be at least 2 characters.' })
    .max(50, { message: 'Account name cannot exceed 50 characters.' }),
  type: z.enum(
    ['CASH', 'BANK', 'MOBILE_WALLET', 'CREDIT_CARD', 'SAVINGS', 'OTHER'],
    { message: 'Please select a valid account type.' }
  ),
  balance: z.number({ message: 'Balance must be a valid number.' }),
  currency: z.literal('BDT'),
  institution: z
    .string()
    .trim()
    .max(50, { message: 'Institution name cannot exceed 50 characters.' })
    .optional(),
  accountNumberLast4: z
    .string()
    .trim()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: 'Account number must be exactly the last 4 digits.',
    })
    .optional(),
  color: z.string(),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;
