import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { DashboardController } from './dashboard.controller.js';

const router = new Hono();

router.get('/challenge', requireAuth, async (c) => {
  const controller = c.get('container').resolve<DashboardController>('dashboardController');
  return controller.getChallenge(c);
});

router.get('/leaderboard', requireAuth, async (c) => {
  const controller = c.get('container').resolve<DashboardController>('dashboardController');
  return controller.getLeaderboard(c);
});

router.get('/track', requireAuth, async (c) => {
  const controller = c.get('container').resolve<DashboardController>('dashboardController');
  return controller.getTrack(c);
});

router.get('/metrics', requireAuth, async (c) => {
  const controller = c.get('container').resolve<DashboardController>('dashboardController');
  return controller.getMetrics(c);
});

export default router;
