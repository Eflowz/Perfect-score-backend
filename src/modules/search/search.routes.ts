import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.js';
import { SearchController } from './search.controller.js';

const router = new Hono();

router.get('/', requireAuth, async (c) => {
  const controller = c.get('container').resolve<SearchController>('searchController');
  return controller.query(c);
});

export default router;
