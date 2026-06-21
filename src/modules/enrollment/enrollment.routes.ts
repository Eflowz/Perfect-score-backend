import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { EnrollmentController } from './enrollment.controller.js';

const router = new Hono();

router.post('/courses/:id/enroll', requireAuth, async (c) => {
  const controller = c.get('container').resolve<EnrollmentController>('enrollmentController');
  return controller.enroll(c);
});

router.delete('/courses/:id/unenroll', requireAuth, async (c) => {
  const controller = c.get('container').resolve<EnrollmentController>('enrollmentController');
  return controller.unenroll(c);
});

router.get('/users/enrolled-courses', requireAuth, async (c) => {
  const controller = c.get('container').resolve<EnrollmentController>('enrollmentController');
  return controller.list(c);
});

export default router;
