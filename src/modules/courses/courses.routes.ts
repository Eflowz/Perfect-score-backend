import { Hono } from 'hono';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateBody } from '../../middleware/validate.js';
import { createCourseSchema, updateCourseSchema, createModuleSchema } from './courses.schema.js';
import { CoursesController } from './courses.controller.js';
import { UserRole } from '@prisma/client';

const router = new Hono();

router.get('/', optionalAuth, async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.list(c);
});

router.get('/:id', optionalAuth, async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.get(c);
});

// Admin-only operations
router.post('/', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createCourseSchema), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.create(c);
});

router.put('/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(updateCourseSchema), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.update(c);
});

router.patch('/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(updateCourseSchema), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.update(c);
});

router.delete('/:id', requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.delete(c);
});

// Module operations
router.post('/:courseId/modules', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createModuleSchema), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.addModule(c);
});

// Legacy paths
router.patch('/modules/:moduleId', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createModuleSchema.partial()), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.updateModule(c);
});

router.delete('/modules/:moduleId', requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.deleteModule(c);
});

// Recommended nested paths
router.put('/:courseId/modules/:moduleId', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createModuleSchema.partial()), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.updateModule(c);
});

router.patch('/:courseId/modules/:moduleId', requireAuth, requireRole(UserRole.SUPER_ADMIN), validateBody(createModuleSchema.partial()), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.updateModule(c);
});

router.delete('/:courseId/modules/:moduleId', requireAuth, requireRole(UserRole.SUPER_ADMIN), async (c) => {
  const controller = c.get('container').resolve<CoursesController>('coursesController');
  return controller.deleteModule(c);
});

export default router;
