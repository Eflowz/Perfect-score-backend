import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { AchievementsController } from './achievements.controller.js';

const router = new Hono();

router.get('/badges', requireAuth, async (c) => {
  const controller = c.get('container').resolve<AchievementsController>('achievementsController');
  return controller.listUserBadges(c);
});

router.get('/achievements', requireAuth, async (c) => {
  const controller = c.get('container').resolve<AchievementsController>('achievementsController');
  return controller.listAchievements(c);
});

export default router;
