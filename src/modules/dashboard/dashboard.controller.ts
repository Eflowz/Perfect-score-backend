import { Context } from 'hono';
import { DashboardService } from './dashboard.service.js';

interface Dependencies {
  dashboardService: DashboardService;
}

export class DashboardController {
  private dashboardService: DashboardService;

  constructor({ dashboardService }: Dependencies) {
    this.dashboardService = dashboardService;
  }

  getChallenge = async (c: Context) => {
    const user = c.get('user');
    const result = await this.dashboardService.getChallenge(user!.id);
    return c.json(result);
  };

  getLeaderboard = async (c: Context) => {
    const user = c.get('user');
    const result = await this.dashboardService.getLeaderboard(user!.id);
    return c.json(result);
  };

  getTrack = async (c: Context) => {
    const user = c.get('user');
    const result = await this.dashboardService.getTrack(user!.id);
    return c.json(result);
  };

  getMetrics = async (c: Context) => {
    const result = await this.dashboardService.getMetrics();
    return c.json(result);
  };
}
