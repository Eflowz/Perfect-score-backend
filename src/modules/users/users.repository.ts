import { PrismaClient, Prisma } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class UsersRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roadmap: {
          include: {
            courses: {
              include: { course: true },
            },
          },
        },
        certificates: true,
        submissions: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async incrementXp(id: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    const newXp = user.xp + amount;
    // Simple level calculation: 1 level per 1000 XP
    const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);

    return this.prisma.user.update({
      where: { id },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });
  }

  async updateStreak(id: string, streakDays: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        streakDays,
        lastActiveAt: new Date(),
      },
    });
  }

  async listAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        xp: true,
        level: true,
        streakDays: true,
        createdAt: true,
      },
    });
  }
}
