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
    const modules = await this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
    const progressRecords = await this.progressRepository.findByCourse(userId, courseId);
    const progressMap = new Map(progressRecords.map((p) => [p.moduleId, p]));

    return modules.map((m) => {
      const prog = progressMap.get(m.id);
      return {
        moduleId: m.id,
        completed: prog ? prog.completed : false,
        timeSpent: prog ? prog.timeSpent : 0,
      };
    });
  }

  async getProgressByUser(userId: string) {
    return this.progressRepository.findByUser(userId);
  }
}
