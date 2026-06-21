import { z } from 'zod';

const quizQuestionSchema = z.object({
  type: z.enum(['multiple-choice', 'coding', 'true-false']),
  question: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required'),
  explanation: z.string().min(1, 'Explanation is required'),
  points: z.number().int().positive(),
});

export const createQuizSchema = z.object({
  moduleId: z.string().min(1, 'Module ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  questions: z.array(quizQuestionSchema).min(1, 'At least one question is required'),
  passingScore: z.number().int().positive(),
  timeLimit: z.number().int().positive(), // in minutes
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const updateQuizSchema = createQuizSchema.partial();
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

export const submitQuizSchema = z.object({
  answers: z.array(z.string()),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
