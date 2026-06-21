import { z } from 'zod';

export const completeModuleSchema = z.object({
  timeSpent: z.number().int().nonnegative().optional(),
});

export type CompleteModuleInput = z.infer<typeof completeModuleSchema>;
