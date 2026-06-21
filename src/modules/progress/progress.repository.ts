import { PrismaClient } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class ProgressRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findUnique(userId: string, moduleId: string) {
    return this.prisma.userProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });
  }

  async completeModule(userId: string, moduleId: string, courseId: string, timeSpent = 0) {
    return this.prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {
        completed: true,
        lastAccessed: new Date(),
        timeSpent: { increment: timeSpent },
      },
      create: {
        userId,
        moduleId,
        courseId,
        completed: true,
        timeSpent,
      },
    });
  }

  async findByCourse(userId: string, courseId: string) {
    return this.prisma.userProgress.findMany({
      where: {
        userId,
        courseId,
      },
      include: {
        module: true,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.userProgress.findMany({
      where: {
        userId,
      },
      include: {
        course: true,
        module: true,
      },
    });
  }
}
