import { DiscussionsRepository } from './discussions.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  discussionsRepository: DiscussionsRepository;
  prisma: PrismaClient;
}

export class DiscussionsService {
  private discussionsRepository: DiscussionsRepository;
  private prisma: PrismaClient;

  constructor({ discussionsRepository, prisma }: Dependencies) {
    this.discussionsRepository = discussionsRepository;
    this.prisma = prisma;
  }

  async getDiscussions(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return this.discussionsRepository.findByCourseId(courseId);
  }

  async createDiscussion(userId: string, courseId: string, title: string, content: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return this.discussionsRepository.create(userId, courseId, title, content);
  }

  async createReply(userId: string, discussionId: string, content: string) {
    const discussion = await this.discussionsRepository.findById(discussionId);
    if (!discussion) {
      throw new NotFoundError('Discussion not found');
    }
    return this.discussionsRepository.createReply(userId, discussionId, content);
  }
}
