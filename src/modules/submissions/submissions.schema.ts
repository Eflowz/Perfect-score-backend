import { z } from 'zod';

export const submitCodeSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  code: z.string().min(1, 'Code cannot be empty').max(100000, 'Code length exceeds limit'),
  language: z.string().default('python'),
});

export type SubmitCodeInput = z.infer<typeof submitCodeSchema>;
