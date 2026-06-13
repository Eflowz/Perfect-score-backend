import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { updateProfileSchema } from './users.schema.js';
import { UsersController } from './users.controller.js';
import { UserRole } from '@prisma/client';

const router = new Hono();

router.get('/me', requireAuth, async (c) => {
  const controller = c.get('container').resolve<UsersController>('usersController');
  return controller.getMe(c);
});

router.patch('/me', requireAuth, validateBody(updateProfileSchema), async (c) => {
  const controller = c.get('container').resolve<UsersController>('usersController');
  return controller.updateMe(c);
});

router.get('/', requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const controller = c.get('container').resolve<UsersController>('usersController');
  return controller.listAll(c);
});

router.get('/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const controller = c.get('container').resolve<UsersController>('usersController');
  return controller.getUser(c);
});

export default router;
