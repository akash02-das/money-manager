import { z } from 'zod';

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, { message: 'Please select a category to budget.' }),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
      message: 'Please provide a valid month in YYYY-MM format.',
    }),
  limit: z
    .number({ message: 'Budget limit must be a valid number.' })
    .positive({ message: 'Budget limit must be greater than zero.' }),
});

export type BudgetFormData = z.infer<typeof budgetFormSchema>;
