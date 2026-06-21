import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { completeModuleSchema } from './progress.schema.js';
import { ProgressController } from './progress.controller.js';

const router = new Hono();

router.post('/module/:moduleId/complete', requireAuth, validateBody(completeModuleSchema), async (c) => {
  const controller = c.get('container').resolve<ProgressController>('progressController');
  return controller.complete(c);
});

router.get('/course/:courseId', requireAuth, async (c) => {
  const controller = c.get('container').resolve<ProgressController>('progressController');
  return controller.getByCourse(c);
});

router.get('/user', requireAuth, async (c) => {
  const controller = c.get('container').resolve<ProgressController>('progressController');
  return controller.getByUser(c);
});

export default router;
