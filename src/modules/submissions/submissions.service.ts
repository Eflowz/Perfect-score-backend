import { SubmissionsRepository } from './submissions.repository.js';
import { aiReviewQueue } from '../../queue/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  submissionsRepository: SubmissionsRepository;
  prisma: PrismaClient;
}

export class SubmissionsService {
  private submissionsRepository: SubmissionsRepository;
  private prisma: PrismaClient;

  constructor({ submissionsRepository, prisma }: Dependencies) {
    this.submissionsRepository = submissionsRepository;
    this.prisma = prisma;
  }

  async submit(userId: string, courseId: string, code: string, language: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const submission = await this.submissionsRepository.create(userId, courseId, code, language);

    // Queue BullMQ job
    await aiReviewQueue.add(`ai-review-${submission.id}`, {
      submissionId: submission.id,
    });

    return submission;
  }

  async getSubmission(id: string) {
    const submission = await this.submissionsRepository.findById(id);
    if (!submission) {
      throw new NotFoundError('Submission not found');
    }
    return submission;
  }

  async getSubmissionsByCourse(userId: string, courseId: string) {
    return this.submissionsRepository.findByCourseId(userId, courseId);
  }
}
