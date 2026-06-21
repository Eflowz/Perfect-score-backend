import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { BookmarksController } from './bookmarks.controller.js';

const router = new Hono();

router.post('/course/:courseId', requireAuth, async (c) => {
  const controller = c.get('container').resolve<BookmarksController>('bookmarksController');
  return controller.add(c);
});

router.delete('/course/:courseId', requireAuth, async (c) => {
  const controller = c.get('container').resolve<BookmarksController>('bookmarksController');
  return controller.delete(c);
});

router.get('/', requireAuth, async (c) => {
  const controller = c.get('container').resolve<BookmarksController>('bookmarksController');
  return controller.list(c);
});

export default router;
