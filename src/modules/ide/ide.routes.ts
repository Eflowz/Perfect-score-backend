import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { executeCodeSchema } from './ide.schema.js';
import { IDEController } from './ide.controller.js';

const router = new Hono();

router.post('/execute', requireAuth, validateBody(executeCodeSchema), async (c) => {
  const controller = c.get('container').resolve<IDEController>('ideController');
  return controller.execute(c);
});

router.get('/session/:sessionId', async (c, next) => {
  const controller = c.get('container').resolve<IDEController>('ideController');
  return controller.collaborate(c, next);
});

export default router;
