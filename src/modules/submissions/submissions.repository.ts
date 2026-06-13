import { PrismaClient, SubmissionStatus } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class SubmissionsRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: { course: true, user: true },
    });
  }

  async create(userId: string, courseId: string, code: string, language: string) {
    return this.prisma.submission.create({
      data: {
        userId,
        courseId,
        code,
        language,
        status: SubmissionStatus.SUBMITTED,
      },
    });
  }

  async updateStatus(id: string, status: SubmissionStatus, aiReview?: any, score?: number) {
    return this.prisma.submission.update({
      where: { id },
      data: {
        status,
        aiReview: aiReview || undefined,
        score: score !== undefined ? score : undefined,
        reviewedAt: status === SubmissionStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }

  async findByCourseId(userId: string, courseId: string) {
    return this.prisma.submission.findMany({
      where: { userId, courseId },
      orderBy: { submittedAt: 'desc' },
    });
  }
}
