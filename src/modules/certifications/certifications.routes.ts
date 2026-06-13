import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { verifyCertificateSchema } from './certifications.schema.js';
import { CertificationsController } from './certifications.controller.js';

const router = new Hono();

router.get('/my', requireAuth, async (c) => {
  const controller = c.get('container').resolve<CertificationsController>('certificationsController');
  return controller.listMy(c);
});

router.post('/verify', validateBody(verifyCertificateSchema), async (c) => {
  const controller = c.get('container').resolve<CertificationsController>('certificationsController');
  return controller.verify(c);
});

export default router;
