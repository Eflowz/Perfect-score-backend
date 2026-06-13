import { Context } from 'hono';
import { RoadmapService } from './roadmap.service.js';

interface Dependencies {
  roadmapService: RoadmapService;
}

export class RoadmapController {
  private roadmapService: RoadmapService;

  constructor({ roadmapService }: Dependencies) {
    this.roadmapService = roadmapService;
  }

  get = async (c: Context) => {
    const user = c.get('user');
    const roadmap = await this.roadmapService.getRoadmap(user!.id);
    return c.json({ data: roadmap });
  };

  generate = async (c: Context) => {
    const user = c.get('user');
    const body = c.get('body');
    const result = await this.roadmapService.queueGeneration(user!.id, body.goals, body.targetDate);
    return c.json({ data: result }, 202);
  };
}
