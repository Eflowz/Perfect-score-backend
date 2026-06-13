import { z } from 'zod';

export const executeCodeSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  language: z.string().default('python'),
});

export type ExecuteCodeInput = z.infer<typeof executeCodeSchema>;
