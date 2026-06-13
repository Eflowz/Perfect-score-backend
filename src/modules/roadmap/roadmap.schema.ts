import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  goals: z.array(z.string()).min(1, 'At least one goal is required'),
  targetDate: z.string().datetime().optional(),
});

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;
