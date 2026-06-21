import { Context } from 'hono';
import { DiscussionsService } from './discussions.service.js';

interface Dependencies {
  discussionsService: DiscussionsService;
}

export class DiscussionsController {
  private discussionsService: DiscussionsService;

  constructor({ discussionsService }: Dependencies) {
    this.discussionsService = discussionsService;
  }

  list = async (c: Context) => {
    const courseId = c.req.param('courseId')!;
    const discussions = await this.discussionsService.getDiscussions(courseId);
    return c.json({ data: discussions });
  };

  create = async (c: Context) => {
    const user = c.get('user')!;
    const courseId = c.req.param('courseId')!;
    const body = c.get('body');
    const discussion = await this.discussionsService.createDiscussion(
      user.id,
      courseId,
      body.title,
      body.content
    );
    return c.json({ data: discussion }, 201);
  };

  reply = async (c: Context) => {
    const user = c.get('user')!;
    const id = c.req.param('id')!;
    const body = c.get('body');
    const reply = await this.discussionsService.createReply(user.id, id, body.content);
    return c.json({ data: reply }, 201);
  };
}
