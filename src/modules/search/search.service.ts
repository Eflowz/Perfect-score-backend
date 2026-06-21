import { PrismaClient } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class SearchService {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async search(query: string, type: 'courses' | 'modules') {
    if (type === 'courses') {
      return this.prisma.course.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
      });
    } else {
      return this.prisma.courseModule.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          course: true,
        },
      });
    }
  }
}
