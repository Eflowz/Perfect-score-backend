import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { NotificationsController } from './notifications.controller.js';

const router = new Hono();

router.get('/', requireAuth, async (c) => {
  const controller = c.get('container').resolve<NotificationsController>('notificationsController');
  return controller.list(c);
});

router.put('/:id/read', requireAuth, async (c) => {
  const controller = c.get('container').resolve<NotificationsController>('notificationsController');
  return controller.read(c);
});

router.delete('/:id', requireAuth, async (c) => {
  const controller = c.get('container').resolve<NotificationsController>('notificationsController');
  return controller.delete(c);
});

export default router;
