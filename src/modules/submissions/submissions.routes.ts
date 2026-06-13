import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { submitCodeSchema } from './submissions.schema.js';
import { SubmissionsController } from './submissions.controller.js';

const router = new Hono();

router.post('/', requireAuth, validateBody(submitCodeSchema), async (c) => {
  const controller = c.get('container').resolve<SubmissionsController>('submissionsController');
  return controller.submit(c);
});

router.get('/:id/review', requireAuth, async (c) => {
  const controller = c.get('container').resolve<SubmissionsController>('submissionsController');
  return controller.get(c);
});

router.get('/:id/stream', async (c, next) => {
  const controller = c.get('container').resolve<SubmissionsController>('submissionsController');
  return controller.streamReview(c, next);
});

export default router;
