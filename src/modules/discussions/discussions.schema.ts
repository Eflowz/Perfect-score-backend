import { z } from 'zod';

export const createDiscussionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  content: z.string().min(5, 'Content must be at least 5 characters'),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;

export const createReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
});

export type CreateReplyInput = z.infer<typeof createReplySchema>;
