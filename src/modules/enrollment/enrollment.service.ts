import { EnrollmentRepository } from './enrollment.repository.js';
import { NotFoundError } from '../../utils/errors.js';
import { PrismaClient } from '@prisma/client';

interface Dependencies {
  enrollmentRepository: EnrollmentRepository;
  prisma: PrismaClient;
}

export class EnrollmentService {
  private enrollmentRepository: EnrollmentRepository;
  private prisma: PrismaClient;

  constructor({ enrollmentRepository, prisma }: Dependencies) {
    this.enrollmentRepository = enrollmentRepository;
    this.prisma = prisma;
  }

  async enrollInCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return this.enrollmentRepository.enroll(userId, courseId);
  }

  async unenrollFromCourse(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    try {
      return await this.enrollmentRepository.unenroll(userId, courseId);
    } catch (e) {
      throw new NotFoundError('Enrollment not found');
    }
  }

  async getEnrolledCourses(userId: string) {
    const enrollments = await this.enrollmentRepository.findEnrolledCourses(userId);
    return enrollments.map((e: any) => e.course);
  }
}
