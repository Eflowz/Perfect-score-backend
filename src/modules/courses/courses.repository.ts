import { PrismaClient, Prisma } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class CoursesRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string, userId?: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
        submissions: userId
          ? {
              where: { userId },
              orderBy: { submittedAt: 'desc' },
            }
          : undefined,
      },
    });
  }

  async listAll(userId?: string) {
    return this.prisma.course.findMany({
      orderBy: { order: 'asc' },
      include: {
        modules: {
          orderBy: { order: 'asc' },
        },
        submissions: userId
          ? {
              where: { userId },
              orderBy: { submittedAt: 'desc' },
              take: 1,
            }
          : undefined,
      },
    });
  }

  async create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({
      data,
      include: { modules: true },
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
      include: { modules: true },
    });
  }

  async delete(id: string) {
    return this.prisma.course.delete({
      where: { id },
    });
  }

  async createModule(courseId: string, data: Prisma.CourseModuleCreateWithoutCourseInput) {
    return this.prisma.courseModule.create({
      data: {
        ...data,
        courseId,
      },
    });
  }

  async findModuleById(id: string) {
    return this.prisma.courseModule.findUnique({
      where: { id },
    });
  }

  async updateModule(id: string, data: Prisma.CourseModuleUpdateInput) {
    return this.prisma.courseModule.update({
      where: { id },
      data,
    });
  }

  async deleteModule(id: string) {
    return this.prisma.courseModule.delete({
      where: { id },
    });
  }
}
