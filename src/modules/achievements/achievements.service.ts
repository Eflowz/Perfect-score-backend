import { AchievementsRepository } from './achievements.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  achievementsRepository: AchievementsRepository;
  prisma: PrismaClient;
}

export class AchievementsService {
  private achievementsRepository: AchievementsRepository;
  private prisma: PrismaClient;

  constructor({ achievementsRepository, prisma }: Dependencies) {
    this.achievementsRepository = achievementsRepository;
    this.prisma = prisma;
  }

  async getAllAchievements() {
    return this.achievementsRepository.findAll();
  }

  async getUserBadges(userId: string) {
    const userAwards = await this.achievementsRepository.findUserAchievements(userId);
    return userAwards.map((award: any) => ({
      awardId: award.id,
      awardedAt: award.awardedAt,
      ...award.achievement,
    }));
  }

  async awardBadge(userId: string, achievementId: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
    });
    if (!achievement) {
      throw new NotFoundError('Achievement not found');
    }

    const award = await this.achievementsRepository.awardAchievement(userId, achievementId);

    // Award XP
    if (achievement.xpReward > 0) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + achievement.xpReward;
        const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);
        await this.prisma.user.update({
          where: { id: userId },
          data: { xp: newXp, level: newLevel },
        });
      }
    }

    return award;
  }
}
