import { PrismaClient } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class BookmarksRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async create(userId: string, courseId: string) {
    return this.prisma.bookmark.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      update: {},
      create: {
        userId,
        courseId,
      },
    });
  }

  async delete(userId: string, courseId: string) {
    return this.prisma.bookmark.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });
  }
}
