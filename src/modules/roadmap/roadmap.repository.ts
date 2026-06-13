import { PrismaClient } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class RoadmapRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findByUserId(userId: string) {
    return this.prisma.roadmap.findUnique({
      where: { userId },
      include: {
        courses: {
          orderBy: { order: 'asc' },
          include: { course: true },
        },
      },
    });
  }

  async createRoadmap(userId: string, targetDate?: Date) {
    return this.prisma.roadmap.create({
      data: {
        userId,
        targetDate,
      },
    });
  }

  async clearRoadmapCourses(roadmapId: string) {
    return this.prisma.roadmapCourse.deleteMany({
      where: { roadmapId },
    });
  }

  async addCourseToRoadmap(roadmapId: string, courseId: string, order: number) {
    return this.prisma.roadmapCourse.create({
      data: {
        roadmapId,
        courseId,
        order,
        status: 'PENDING',
      },
    });
  }

  async updateCourseStatus(roadmapId: string, courseId: string, status: string) {
    return this.prisma.roadmapCourse.updateMany({
      where: { roadmapId, courseId },
      data: {
        status,
        startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }
}
