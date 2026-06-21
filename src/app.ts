import { Hono } from 'hono';
import { createYoga } from 'graphql-yoga';
import crypto from 'crypto';
import { Container } from './container/index.js';
import { securityHeaders } from './middleware/security-headers.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './utils/errors.js';
import { schema } from './graphql/schema.js';
import { createGraphQLContext } from './graphql/context.js';

// Import routers
import authRouter from './modules/auth/auth.routes.js';
import usersRouter from './modules/users/users.routes.js';
import coursesRouter from './modules/courses/courses.routes.js';
import roadmapRouter from './modules/roadmap/roadmap.routes.js';
import submissionsRouter from './modules/submissions/submissions.routes.js';
import certificationsRouter from './modules/certifications/certifications.routes.js';
import ideRouter from './modules/ide/ide.routes.js';
import dashboardRouter from './modules/dashboard/dashboard.routes.js';
import progressRouter from './modules/progress/progress.routes.js';
import quizRouter from './modules/quiz/quiz.routes.js';
import discussionsRouter from './modules/discussions/discussions.routes.js';
import bookmarksRouter from './modules/bookmarks/bookmarks.routes.js';
import searchRouter from './modules/search/search.routes.js';
import notificationsRouter from './modules/notifications/notifications.routes.js';
import enrollmentRouter from './modules/enrollment/enrollment.routes.js';
import achievementsRouter from './modules/achievements/achievements.routes.js';

export function createApp(container: Container) {
  const app = new Hono();

  app.use('*', async (c, next) => {
    c.set('container', container);
    const requestId = crypto.randomUUID();
    c.header('x-request-id', requestId);
    await next();
  });

  app.use('*', securityHeaders);
  app.use('*', corsMiddleware);

  app.get('/api/v1/health', (c) => c.json({ status: 'UP', timestamp: new Date() }));

  app.route('/api/v1/auth', authRouter);
  app.route('/api/v1/users', usersRouter);
  app.route('/api/v1/courses', coursesRouter);
  app.route('/api/v1/roadmap', roadmapRouter);
  app.route('/api/v1/submissions', submissionsRouter);
  app.route('/api/v1/certifications', certificationsRouter);
  app.route('/api/v1/ide', ideRouter);
  app.route('/api/v1/dashboard', dashboardRouter);
  
  // Mixed root or custom mounted routers
  app.route('/api/v1/progress', progressRouter);
  app.route('/api/v1/users/bookmarks', bookmarksRouter);
  app.route('/api/v1/search', searchRouter);
  app.route('/api/v1/notifications', notificationsRouter);
  app.route('/api/v1', quizRouter);
  app.route('/api/v1', discussionsRouter);
  app.route('/api/v1', enrollmentRouter);
  app.route('/api/v1', achievementsRouter);

  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/v1/graphql',
    context: (ctx: any) => createGraphQLContext(ctx.honoContext),
  });

  app.all('/api/v1/graphql', async (c) => {
    return yoga.handleRequest(c.req.raw, { honoContext: c });
  });

  app.onError(errorHandler);

  app.notFound((c) => {
    return c.json({ error: { code: 'NotFound', message: 'Requested resource not found' } }, 404);
  });

  return app;
}
export type App = ReturnType<typeof createApp>;
