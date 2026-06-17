import { createContainer, asValue, asClass, InjectionMode, AwilixContainer } from 'awilix';
import { prisma } from '../config/prisma.js';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// Repositories
import { UsersRepository } from '../modules/users/users.repository.js';
import { CoursesRepository } from '../modules/courses/courses.repository.js';
import { RoadmapRepository } from '../modules/roadmap/roadmap.repository.js';
import { SubmissionsRepository } from '../modules/submissions/submissions.repository.js';
import { CertificationsRepository } from '../modules/certifications/certifications.repository.js';

// Services
import { AuthService } from '../modules/auth/auth.service.js';
import { UsersService } from '../modules/users/users.service.js';
import { CoursesService } from '../modules/courses/courses.service.js';
import { RoadmapService } from '../modules/roadmap/roadmap.service.js';
import { SubmissionsService } from '../modules/submissions/submissions.service.js';
import { CertificationsService } from '../modules/certifications/certifications.service.js';
import { IDEService } from '../modules/ide/ide.service.js';
import { DashboardService } from '../modules/dashboard/dashboard.service.js';

// Controllers
import { AuthController } from '../modules/auth/auth.controller.js';
import { UsersController } from '../modules/users/users.controller.js';
import { CoursesController } from '../modules/courses/courses.controller.js';
import { RoadmapController } from '../modules/roadmap/roadmap.controller.js';
import { SubmissionsController } from '../modules/submissions/submissions.controller.js';
import { CertificationsController } from '../modules/certifications/certifications.controller.js';
import { IDEController } from '../modules/ide/ide.controller.js';
import { DashboardController } from '../modules/dashboard/dashboard.controller.js';

export interface ContainerCradle {
  prisma: typeof prisma;
  redis: typeof redis;
  logger: typeof logger;

  usersRepository: UsersRepository;
  coursesRepository: CoursesRepository;
  roadmapRepository: RoadmapRepository;
  submissionsRepository: SubmissionsRepository;
  certificationsRepository: CertificationsRepository;

  authService: AuthService;
  usersService: UsersService;
  coursesService: CoursesService;
  roadmapService: RoadmapService;
  submissionsService: SubmissionsService;
  certificationsService: CertificationsService;
  ideService: IDEService;
  dashboardService: DashboardService;

  authController: AuthController;
  usersController: UsersController;
  coursesController: CoursesController;
  roadmapController: RoadmapController;
  submissionsController: SubmissionsController;
  certificationsController: CertificationsController;
  ideController: IDEController;
  dashboardController: DashboardController;
}

export type Container = AwilixContainer<ContainerCradle>;

export function createDIContainer(): Container {
  const container = createContainer<ContainerCradle>({
    injectionMode: InjectionMode.PROXY,
  });

  container.register({
    prisma: asValue(prisma),
    redis: asValue(redis),
    logger: asValue(logger),

    // Repositories
    usersRepository: asClass(UsersRepository).singleton(),
    coursesRepository: asClass(CoursesRepository).singleton(),
    roadmapRepository: asClass(RoadmapRepository).singleton(),
    submissionsRepository: asClass(SubmissionsRepository).singleton(),
    certificationsRepository: asClass(CertificationsRepository).singleton(),

    // Services
    authService: asClass(AuthService).singleton(),
    usersService: asClass(UsersService).singleton(),
    coursesService: asClass(CoursesService).singleton(),
    roadmapService: asClass(RoadmapService).singleton(),
    submissionsService: asClass(SubmissionsService).singleton(),
    certificationsService: asClass(CertificationsService).singleton(),
    ideService: asClass(IDEService).singleton(),
    dashboardService: asClass(DashboardService).singleton(),

    // Controllers
    authController: asClass(AuthController).singleton(),
    usersController: asClass(UsersController).singleton(),
    coursesController: asClass(CoursesController).singleton(),
    roadmapController: asClass(RoadmapController).singleton(),
    submissionsController: asClass(SubmissionsController).singleton(),
    certificationsController: asClass(CertificationsController).singleton(),
    ideController: asClass(IDEController).singleton(),
    dashboardController: asClass(DashboardController).singleton(),
  });

  return container;
}
