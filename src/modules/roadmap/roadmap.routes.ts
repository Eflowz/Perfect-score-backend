import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { generateRoadmapSchema } from './roadmap.schema.js';
import { RoadmapController } from './roadmap.controller.js';

const router = new Hono();

router.get('/', requireAuth, async (c) => {
  const controller = c.get('container').resolve<RoadmapController>('roadmapController');
  return controller.get(c);
});

router.post('/generate', requireAuth, validateBody(generateRoadmapSchema), async (c) => {
  const controller = c.get('container').resolve<RoadmapController>('roadmapController');
  return controller.generate(c);
});

export default router;
