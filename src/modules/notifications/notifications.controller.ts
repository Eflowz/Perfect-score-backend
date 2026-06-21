import { Context } from 'hono';
import { NotificationsService } from './notifications.service.js';

interface Dependencies {
  notificationsService: NotificationsService;
}

export class NotificationsController {
  private notificationsService: NotificationsService;

  constructor({ notificationsService }: Dependencies) {
    this.notificationsService = notificationsService;
  }

  list = async (c: Context) => {
    const user = c.get('user')!;
    const notifications = await this.notificationsService.getNotifications(user.id);
    return c.json({ data: notifications });
  };

  read = async (c: Context) => {
    const user = c.get('user')!;
    const id = c.req.param('id')!;
    const result = await this.notificationsService.markAsRead(id, user.id);
    return c.json(result);
  };

  delete = async (c: Context) => {
    const user = c.get('user')!;
    const id = c.req.param('id')!;
    const result = await this.notificationsService.deleteNotification(id, user.id);
    return c.json(result);
  };
}
