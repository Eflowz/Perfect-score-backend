import { CoursesRepository } from './courses.repository.js';
import { CreateCourseInput, UpdateCourseInput, CreateModuleInput } from './courses.schema.js';
import { NotFoundError } from '../../utils/errors.js';

interface Dependencies {
  coursesRepository: CoursesRepository;
}

export class CoursesService {
  private coursesRepository: CoursesRepository;

  constructor({ coursesRepository }: Dependencies) {
    this.coursesRepository = coursesRepository;
  }

  async getCourses(userId?: string) {
    return this.coursesRepository.listAll(userId);
  }

  async getCourse(id: string, userId?: string) {
    const course = await this.coursesRepository.findById(id, userId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return course;
  }

  async createCourse(input: CreateCourseInput) {
    return this.coursesRepository.create(input);
  }

  async updateCourse(id: string, input: UpdateCourseInput) {
    await this.getCourse(id);
    return this.coursesRepository.update(id, input);
  }

  async deleteCourse(id: string) {
    await this.getCourse(id);
    await this.coursesRepository.delete(id);
  }

  async addModule(courseId: string, input: CreateModuleInput) {
    await this.getCourse(courseId);
    return this.coursesRepository.createModule(courseId, input);
  }

  async updateModule(moduleId: string, input: Partial<CreateModuleInput>) {
    const module = await this.coursesRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError('Module not found');
    }
    return this.coursesRepository.updateModule(moduleId, input);
  }

  async deleteModule(moduleId: string) {
    const module = await this.coursesRepository.findModuleById(moduleId);
    if (!module) {
      throw new NotFoundError('Module not found');
    }
    await this.coursesRepository.deleteModule(moduleId);
  }
}
