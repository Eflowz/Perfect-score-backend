import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { createQuizSchema, updateQuizSchema, submitQuizSchema } from './quiz.schema.js';
import { QuizController } from './quiz.controller.js';
import { UserRole } from '@prisma/client';

const router = new Hono();

// Course quizzes (needs courseId in route)
router.get('/courses/:courseId/quizzes', requireAuth, async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.list(c);
});

router.get('/courses/:id/quizzes', requireAuth, async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.list(c);
});

router.post('/courses/:courseId/quizzes', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createQuizSchema), async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.create(c);
});

router.post('/courses/:id/quizzes', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createQuizSchema), async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.create(c);
});

// Quiz direct routes (quizzes/:id)
router.get('/quizzes/:id', requireAuth, async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.get(c);
});

router.put('/quizzes/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(updateQuizSchema), async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.update(c);
});

router.patch('/quizzes/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(updateQuizSchema), async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.update(c);
});

router.delete('/quizzes/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.delete(c);
});

router.post('/quizzes/:id/submit', requireAuth, validateBody(submitQuizSchema), async (c) => {
  const controller = c.get('container').resolve<QuizController>('quizController');
  return controller.submit(c);
});

export default router;
