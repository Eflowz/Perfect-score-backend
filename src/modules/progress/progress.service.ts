import { ProgressRepository } from './progress.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  progressRepository: ProgressRepository;
  prisma: PrismaClient;
}

export class ProgressService {
  private progressRepository: ProgressRepository;
  private prisma: PrismaClient;

  constructor({ progressRepository, prisma }: Dependencies) {
    this.progressRepository = progressRepository;
    this.prisma = prisma;
  }

  async completeModule(userId: string, moduleId: string, timeSpent?: number) {
    const courseModule = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!courseModule) {
      throw new NotFoundError('Module not found');
    }

    return this.progressRepository.completeModule(
      userId,
      moduleId,
      courseModule.courseId,
      timeSpent
    );
  }

  async getProgressByCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return this.progressRepository.findByCourse(userId, courseId);
  }

  async getProgressByUser(userId: string) {
    return this.progressRepository.findByUser(userId);
  }
}
