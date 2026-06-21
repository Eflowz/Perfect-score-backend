import { Context } from 'hono';
import { EnrollmentService } from './enrollment.service.js';

interface Dependencies {
  enrollmentService: EnrollmentService;
}

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor({ enrollmentService }: Dependencies) {
    this.enrollmentService = enrollmentService;
  }

  enroll = async (c: Context) => {
    const user = c.get('user')!;
    const courseId = c.req.param('id')!;
    const enrollment = await this.enrollmentService.enrollInCourse(user.id, courseId);
    return c.json({ data: enrollment }, 201);
  };

  unenroll = async (c: Context) => {
    const user = c.get('user')!;
    const courseId = c.req.param('id')!;
    await this.enrollmentService.unenrollFromCourse(user.id, courseId);
    return c.json({ success: true });
  };

  list = async (c: Context) => {
    const user = c.get('user')!;
    const courses = await this.enrollmentService.getEnrolledCourses(user.id);
    return c.json({ data: courses });
  };
}
