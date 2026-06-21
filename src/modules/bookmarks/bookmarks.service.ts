import { BookmarksRepository } from './bookmarks.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  bookmarksRepository: BookmarksRepository;
  prisma: PrismaClient;
}

export class BookmarksService {
  private bookmarksRepository: BookmarksRepository;
  private prisma: PrismaClient;

  constructor({ bookmarksRepository, prisma }: Dependencies) {
    this.bookmarksRepository = bookmarksRepository;
    this.prisma = prisma;
  }

  async bookmarkCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return this.bookmarksRepository.create(userId, courseId);
  }

  async unbookmarkCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    try {
      return await this.bookmarksRepository.delete(userId, courseId);
    } catch (e) {
      throw new NotFoundError('Bookmark not found');
    }
  }

  async getBookmarks(userId: string) {
    return this.bookmarksRepository.findByUser(userId);
  }
}
