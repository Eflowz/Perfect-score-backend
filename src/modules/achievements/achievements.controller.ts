import { Context } from 'hono';
import { AchievementsService } from './achievements.service.js';

interface Dependencies {
  achievementsService: AchievementsService;
}

export class AchievementsController {
  private achievementsService: AchievementsService;

  constructor({ achievementsService }: Dependencies) {
    this.achievementsService = achievementsService;
  }

  listAchievements = async (c: Context) => {
    const achievements = await this.achievementsService.getAllAchievements();
    return c.json({ data: achievements });
  };

  listUserBadges = async (c: Context) => {
    const user = c.get('user')!;
    const badges = await this.achievementsService.getUserBadges(user.id);
    return c.json({ data: badges });
  };

  award = async (c: Context) => {
    const body = c.get('body');
    const user = c.get('user')!;
    const award = await this.achievementsService.awardBadge(user.id, body.achievementId);
    return c.json({ data: award }, 201);
  };
}
