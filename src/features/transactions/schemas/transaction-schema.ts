import { z } from 'zod';

export const transactionFormSchema = z
  .object({
    type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER'], {
      message: 'Please select a transaction type.',
    }),
    amount: z
      .number({ message: 'Amount must be a valid number.' })
      .positive({ message: 'Amount must be greater than 0.' }),
    description: z
      .string()
      .trim()
      .min(2, { message: 'Description must be at least 2 characters.' })
      .max(100, { message: 'Description cannot exceed 100 characters.' }),
    date: z.string().min(1, { message: 'Please select a date.' }),
    accountId: z.string().min(1, { message: 'Please select an account.' }),
    toAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    notes: z.string().max(250, { message: 'Notes cannot exceed 250 characters.' }).optional(),
  })
  .superRefine((data, ctx) => {
    // 1. If Expense or Income: Category is required
    if (data.type !== 'TRANSFER') {
      if (!data.categoryId || data.categoryId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categoryId'],
          message: 'Please select a category.',
        });
      }
    }

    // 2. If Transfer: Destination account is required and must differ from source
    if (data.type === 'TRANSFER') {
      if (!data.toAccountId || data.toAccountId.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['toAccountId'],
          message: 'Please select a destination account.',
        });
      } else if (data.toAccountId === data.accountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['toAccountId'],
          message: 'Source and destination accounts must be different.',
        });
      }
    }
  });

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
