import { PrismaClient } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
}

export class CertificationsRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findById(id: string) {
    return this.prisma.certificate.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByCredentialId(credentialId: string) {
    return this.prisma.certificate.findUnique({
      where: { credentialId },
      include: { user: true },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
    });
  }

  async create(userId: string, courseId: string, title: string, credentialId: string, pdfUrl?: string) {
    return this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        title,
        credentialId,
        pdfUrl,
      },
    });
  }
}
