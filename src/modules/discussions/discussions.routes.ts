import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createDiscussionSchema, createReplySchema } from './discussions.schema.js';
import { DiscussionsController } from './discussions.controller.js';

const router = new Hono();

router.get('/courses/:courseId/discussions', requireAuth, async (c) => {
  const controller = c.get('container').resolve<DiscussionsController>('discussionsController');
  return controller.list(c);
});

router.post('/courses/:courseId/discussions', requireAuth, validateBody(createDiscussionSchema), async (c) => {
  const controller = c.get('container').resolve<DiscussionsController>('discussionsController');
  return controller.create(c);
});

router.post('/discussions/:id/replies', requireAuth, validateBody(createReplySchema), async (c) => {
  const controller = c.get('container').resolve<DiscussionsController>('discussionsController');
  return controller.reply(c);
});

export default router;
