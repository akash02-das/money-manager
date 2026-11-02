import { z } from 'zod';
import { profileSchema, preferencesSchema } from './settings-schema';

export const accountBackupSchema = z
  .object({
    id: z.string().min(1, 'Account ID is required'),
    name: z.string().trim().min(1, 'Account name is required'),
    type: z.enum(
      ['CASH', 'BANK', 'MOBILE_WALLET', 'CREDIT_CARD', 'SAVINGS', 'OTHER'],
      { message: 'Invalid account type' }
    ),
    balance: z.union([
      z.number(),
      z
        .string()
        .trim()
        .regex(/^-?\d+(\.\d+)?$/, 'Balance must be a valid number')
        .transform(Number),
    ]),
    currency: z.enum(['BDT', 'USD', 'EUR', 'GBP'], {
      message: 'Invalid currency code',
    }),
    institution: z.string().optional().nullable().transform((v) => v ?? undefined),
    accountNumberLast4: z
      .string()
      .optional()
      .nullable()
      .transform((v) => v ?? undefined),
    color: z.string().optional().nullable().transform((v) => v ?? undefined),
    isArchived: z.boolean().default(false),
  })
  .passthrough();

export const categoryBackupSchema = z
  .object({
    id: z.string().min(1, 'Category ID is required'),
    name: z.string().trim().min(1, 'Category name is required'),
    type: z.enum(['INCOME', 'EXPENSE'], {
      message: 'Invalid category type',
    }),
    icon: z.string().min(1, 'Category icon is required'),
    color: z.string().min(1, 'Category color is required'),
    isDefault: z.boolean().default(false),
    isArchived: z.boolean().default(false),
  })
  .passthrough();

export const transactionBackupSchema = z
  .object({
    id: z.string().min(1, 'Transaction ID is required'),
    amount: z.union([
      z.number().positive('Transaction amount must be greater than zero'),
      z
        .string()
        .trim()
        .regex(/^\d+(\.\d+)?$/, 'Transaction amount must be a positive number')
        .transform(Number)
        .refine((n) => n > 0, 'Transaction amount must be greater than zero'),
    ]),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'], {
      message: 'Invalid transaction type',
    }),
    description: z.string().trim().min(1, 'Transaction description is required'),
    date: z.string().min(1, 'Transaction date is required'),
    accountId: z.string().min(1, 'Account ID is required'),
    toAccountId: z.string().optional().nullable().transform((v) => v ?? undefined),
    categoryId: z.string().default(''),
    notes: z.string().optional().nullable().transform((v) => v ?? undefined),
    category: z.any().optional(),
    account: z.any().optional(),
    toAccount: z.any().optional(),
  })
  .passthrough();

export const budgetBackupSchema = z
  .object({
    id: z.string().min(1, 'Budget ID is required'),
    categoryId: z.string().min(1, 'Category ID is required'),
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format (e.g. 2026-10)'),
    limit: z.union([
      z.number().positive('Budget limit must be greater than zero'),
      z
        .string()
        .trim()
        .regex(/^\d+(\.\d+)?$/, 'Budget limit must be a positive number')
        .transform(Number)
        .refine((n) => n > 0, 'Budget limit must be greater than zero'),
    ]),
    spent: z
      .union([
        z.number(),
        z
          .string()
          .trim()
          .regex(/^-?\d+(\.\d+)?$/, 'Spent must be a valid number')
          .transform(Number),
      ])
      .default(0),
    category: z.any().optional(),
  })
  .passthrough();

export const settingsBackupSchema = z
  .object({
    profile: profileSchema,
    preferences: preferencesSchema,
  })
  .passthrough();

export const backupDataBundleSchema = z
  .object({
    version: z.string().min(1, 'Backup version is required'),
    appName: z.string().refine((val) => val === 'Money Manager', {
      message: 'Invalid backup file: Application name must be "Money Manager"',
    }),
    exportedAt: z.string().optional(),
    settings: settingsBackupSchema.optional(),
    accounts: z
      .array(accountBackupSchema)
      .min(1, 'Backup file must contain at least one account'),
    categories: z
      .array(categoryBackupSchema)
      .min(1, 'Backup file must contain categories'),
    transactions: z.array(transactionBackupSchema).default([]),
    budgets: z.array(budgetBackupSchema).default([]),
  })
  .passthrough();

export type BackupDataBundle = z.infer<typeof backupDataBundleSchema>;
export type AccountBackup = z.infer<typeof accountBackupSchema>;
export type CategoryBackup = z.infer<typeof categoryBackupSchema>;
export type TransactionBackup = z.infer<typeof transactionBackupSchema>;
export type BudgetBackup = z.infer<typeof budgetBackupSchema>;

/**
 * Validates a parsed JavaScript object against the Money Manager backup schema.
 * Throws a formatted Error with detailed field paths if invalid.
 */
export function validateBackupData(data: unknown): BackupDataBundle {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file: Content is not a JSON object.');
  }

  const result = backupDataBundleSchema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues
      .slice(0, 3)
      .map((issue) => {
        const fieldPath = issue.path.length > 0 ? `[${issue.path.join('.')}] ` : '';
        return `${fieldPath}${issue.message}`;
      })
      .join('; ');
    throw new Error(`Backup validation failed: ${errorDetails}`);
  }

  return result.data;
}

/**
 * Safely parses raw JSON text and validates against the Money Manager schema.
 */
export function parseAndValidateBackupJSON(jsonString: string): BackupDataBundle {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid file format: File does not contain valid JSON syntax.');
  }
  return validateBackupData(parsed);
}
