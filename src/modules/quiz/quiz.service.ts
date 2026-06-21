import { QuizRepository } from './quiz.repository.js';
import { CreateQuizInput, UpdateQuizInput } from './quiz.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  quizRepository: QuizRepository;
  prisma: PrismaClient;
}

interface Question {
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export class QuizService {
  private quizRepository: QuizRepository;
  private prisma: PrismaClient;

  constructor({ quizRepository, prisma }: Dependencies) {
    this.quizRepository = quizRepository;
    this.prisma = prisma;
  }

  async getQuizzesForCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return this.quizRepository.findByCourseId(courseId);
  }

  async getQuiz(id: string) {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }
    return quiz;
  }

  async createQuiz(courseId: string, input: CreateQuizInput) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    const module = await this.prisma.courseModule.findUnique({
      where: { id: input.moduleId },
    });
    if (!module) {
      throw new NotFoundError('Module not found');
    }
    return this.quizRepository.create(courseId, input);
  }

  async updateQuiz(id: string, input: UpdateQuizInput) {
    await this.getQuiz(id);
    return this.quizRepository.update(id, input);
  }

  async deleteQuiz(id: string) {
    await this.getQuiz(id);
    return this.quizRepository.delete(id);
  }

  async submitQuiz(userId: string, id: string, answers: string[]) {
    const quiz = await this.getQuiz(id);
    const questions = quiz.questions as unknown as Question[];

    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q, index) => {
      totalPoints += q.points;
      const userAnswer = answers[index];
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        earnedPoints += q.points;
      }
    });

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;

    // Check if the user already passed this quiz before
    let firstTimePass = false;
    if (passed) {
      const existingResults = await this.quizRepository.findResult(userId, id);
      const previouslyPassed = existingResults.some((r: any) => r.score >= quiz.passingScore);
      if (!previouslyPassed) {
        firstTimePass = true;
      }
    }

    const result = await this.quizRepository.createResult(userId, id, score, answers);

    if (firstTimePass) {
      // Award 20 XP
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newXp = user.xp + 20;
        const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);
        await this.prisma.user.update({
          where: { id: userId },
          data: { xp: newXp, level: newLevel },
        });
      }
    }

    return {
      result,
      passed,
      score,
      earnedPoints,
      totalPoints,
      xpAwarded: firstTimePass ? 20 : 0,
    };
  }
}
