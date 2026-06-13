import { Context } from 'hono';
import { upgradeWebSocket } from '@hono/node-server';
import { createRedisConnection } from '../../config/redis.js';
import { SubmissionsService } from './submissions.service.js';



interface Dependencies {
  submissionsService: SubmissionsService;
}

export class SubmissionsController {
  private submissionsService: SubmissionsService;

  constructor({ submissionsService }: Dependencies) {
    this.submissionsService = submissionsService;
  }

  submit = async (c: Context) => {
    const user = c.get('user');
    const body = c.get('body');
    const submission = await this.submissionsService.submit(
      user!.id,
      body.courseId,
      body.code,
      body.language
    );
    return c.json({ data: submission }, 201);
  };

  get = async (c: Context) => {
    const id = c.req.param('id')!;
    const submission = await this.submissionsService.getSubmission(id);
    return c.json({ data: submission });
  };

  streamReview = upgradeWebSocket((c: any) => {
    const submissionId = c.req.param('id')!;
    const subRedis = createRedisConnection();

    return {
      onOpen: async (event: any, ws: any) => {
        try {
          const container = c.get('container');
          const service = container.resolve('submissionsService') as SubmissionsService;
          const submission = await service.getSubmission(submissionId);
          
          ws.send(JSON.stringify({ type: 'status', status: submission.status }));

          if (submission.status === 'COMPLETED' || submission.status === 'FAILED') {
            ws.send(JSON.stringify({ type: 'result', data: submission.aiReview, score: submission.score }));
            ws.close();
            return;
          }

          const channel = `submission:${submissionId}:stream`;
          await subRedis.subscribe(channel);
          
          subRedis.on('message', (chan, message) => {
            if (chan === channel) {
              const data = JSON.parse(message);
              ws.send(JSON.stringify(data));
              if (data.type === 'completed' || data.type === 'failed') {
                ws.close();
              }
            }
          });
        } catch (error: any) {
          ws.send(JSON.stringify({ type: 'error', message: error.message }));
          ws.close();
        }
      },
      onClose: () => {
        subRedis.quit().catch(() => {});
      },
    };
  });
}
