import { NotificationsRepository } from './notifications.repository.js';
import { NotFoundError } from '../../utils/errors.js';

interface Dependencies {
  notificationsRepository: NotificationsRepository;
}

export class NotificationsService {
  private notificationsRepository: NotificationsRepository;

  constructor({ notificationsRepository }: Dependencies) {
    this.notificationsRepository = notificationsRepository;
  }

  async getNotifications(userId: string) {
    return this.notificationsRepository.findByUser(userId);
  }

  async markAsRead(id: string, userId: string) {
    const result = await this.notificationsRepository.markAsRead(id, userId);
    if (result.count === 0) {
      throw new NotFoundError('Notification not found');
    }
    return { success: true };
  }

  async deleteNotification(id: string, userId: string) {
    const result = await this.notificationsRepository.delete(id, userId);
    if (result.count === 0) {
      throw new NotFoundError('Notification not found');
    }
    return { success: true };
  }

  async createNotification(userId: string, title: string, message: string) {
    return this.notificationsRepository.create(userId, title, message);
  }
}
