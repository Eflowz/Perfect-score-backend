import { Context } from 'hono';
import { ProgressService } from './progress.service.js';

interface Dependencies {
  progressService: ProgressService;
}

export class ProgressController {
  private progressService: ProgressService;

  constructor({ progressService }: Dependencies) {
    this.progressService = progressService;
  }

  complete = async (c: Context) => {
    const user = c.get('user')!;
    const moduleId = c.req.param('moduleId')!;
    const body = c.get('body') || {};
    const progress = await this.progressService.completeModule(user.id, moduleId, body.timeSpent);
    return c.json({ data: progress });
  };

  getByCourse = async (c: Context) => {
    const user = c.get('user')!;
    const courseId = c.req.param('courseId')!;
    const progress = await this.progressService.getProgressByCourse(user.id, courseId);
    return c.json({ data: progress });
  };

  getByUser = async (c: Context) => {
    const user = c.get('user')!;
    const progress = await this.progressService.getProgressByUser(user.id);
    return c.json({ data: progress });
  };
}
