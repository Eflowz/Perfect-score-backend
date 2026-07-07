import { Context } from 'hono';
import { CoursesService } from './courses.service.js';

interface Dependencies {
  coursesService: CoursesService;
}

export class CoursesController {
  private coursesService: CoursesService;

  constructor({ coursesService }: Dependencies) {
    this.coursesService = coursesService;
  }

  list = async (c: Context) => {
    const user = c.get('user');
    const courses = await this.coursesService.getCourses(user?.id);
    return c.json({ data: courses });
  };

  get = async (c: Context) => {
    const id = c.req.param('id')!;
    const user = c.get('user');
    const course = await this.coursesService.getCourse(id, user?.id);
    return c.json({ data: course });
  };

  create = async (c: Context) => {
    const body = c.get('body');
    const course = await this.coursesService.createCourse(body);
    return c.json({ data: course }, 201);
  };

  update = async (c: Context) => {
    const id = c.req.param('id')!;
    const body = c.get('body');
    const course = await this.coursesService.updateCourse(id, body);
    return c.json(course);
  };

  delete = async (c: Context) => {
    const id = c.req.param('id')!;
    await this.coursesService.deleteCourse(id);
    return c.json({ success: true, message: 'Course deleted successfully' });
  };

  addModule = async (c: Context) => {
    const courseId = c.req.param('courseId')!;
    const body = c.get('body');
    const mod = await this.coursesService.addModule(courseId, body);
    return c.json({ data: mod }, 201);
  };

  updateModule = async (c: Context) => {
    const moduleId = c.req.param('moduleId')!;
    const body = c.get('body');
    const mod = await this.coursesService.updateModule(moduleId, body);
    return c.json(mod);
  };

  deleteModule = async (c: Context) => {
    const moduleId = c.req.param('moduleId')!;
    await this.coursesService.deleteModule(moduleId);
    return c.json({ success: true, message: 'Module deleted successfully' });
  };
}
