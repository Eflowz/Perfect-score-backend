import { PrismaClient } from '@prisma/client';
import { CreateQuizInput, UpdateQuizInput } from './quiz.schema.js';

interface Dependencies {
  prisma: PrismaClient;
}

export class QuizRepository {
  private prisma: PrismaClient;

  constructor({ prisma }: Dependencies) {
    this.prisma = prisma;
  }

  async findByCourseId(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
    });
  }

  async findById(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
    });
  }

  async create(courseId: string, data: CreateQuizInput) {
    return this.prisma.quiz.create({
      data: {
        courseId,
        moduleId: data.moduleId,
        title: data.title,
        questions: data.questions as any,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
      },
    });
  }

  async update(id: string, data: UpdateQuizInput) {
    return this.prisma.quiz.update({
      where: { id },
      data: {
        title: data.title,
        questions: data.questions as any,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.quiz.delete({
      where: { id },
    });
  }

  async createResult(userId: string, quizId: string, score: number, answers: string[]) {
    return this.prisma.userQuizResult.create({
      data: {
        userId,
        quizId,
        score,
        answers,
      },
    });
  }

  async findResult(userId: string, quizId: string) {
    return this.prisma.userQuizResult.findMany({
      where: {
        userId,
        quizId,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });
  }
}
