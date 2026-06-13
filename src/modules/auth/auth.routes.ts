import { Hono } from 'hono';
import { validateBody } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { registerSchema, loginSchema } from './auth.schema.js';
import { AuthController } from './auth.controller.js';

const router = new Hono();

router.post('/register', validateBody(registerSchema), async (c) => {
  const controller = c.get('container').resolve<AuthController>('authController');
  return controller.register(c);
});

router.post('/login', validateBody(loginSchema), async (c) => {
  const controller = c.get('container').resolve<AuthController>('authController');
  return controller.login(c);
});

router.post('/refresh', async (c) => {
  const controller = c.get('container').resolve<AuthController>('authController');
  return controller.refresh(c);
});

router.post('/logout', requireAuth, async (c) => {
  const controller = c.get('container').resolve<AuthController>('authController');
  return controller.logout(c);
});

export default router;
