import { z } from 'zod';

export const bookmarkParamSchema = z.object({
  courseId: z.string(),
});
