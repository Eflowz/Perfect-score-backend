import { z } from 'zod';
import { CourseLevel } from '@prisma/client';

export const createCourseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  level: z.nativeEnum(CourseLevel),
  order: z.number().int().nonnegative(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const createModuleSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  content: z.string().min(1, 'Content is required'),
  order: z.number().int().nonnegative(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
