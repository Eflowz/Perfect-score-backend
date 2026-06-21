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
import { ProgressRepository } from '../modules/progress/progress.repository.js';
import { QuizRepository } from '../modules/quiz/quiz.repository.js';
import { DiscussionsRepository } from '../modules/discussions/discussions.repository.js';
import { BookmarksRepository } from '../modules/bookmarks/bookmarks.repository.js';
import { NotificationsRepository } from '../modules/notifications/notifications.repository.js';
import { EnrollmentRepository } from '../modules/enrollment/enrollment.repository.js';
import { AchievementsRepository } from '../modules/achievements/achievements.repository.js';

// Services
import { AuthService } from '../modules/auth/auth.service.js';
import { UsersService } from '../modules/users/users.service.js';
import { CoursesService } from '../modules/courses/courses.service.js';
import { RoadmapService } from '../modules/roadmap/roadmap.service.js';
import { SubmissionsService } from '../modules/submissions/submissions.service.js';
import { CertificationsService } from '../modules/certifications/certifications.service.js';
import { IDEService } from '../modules/ide/ide.service.js';
import { DashboardService } from '../modules/dashboard/dashboard.service.js';
import { ProgressService } from '../modules/progress/progress.service.js';
import { QuizService } from '../modules/quiz/quiz.service.js';
import { DiscussionsService } from '../modules/discussions/discussions.service.js';
import { BookmarksService } from '../modules/bookmarks/bookmarks.service.js';
import { SearchService } from '../modules/search/search.service.js';
import { NotificationsService } from '../modules/notifications/notifications.service.js';
import { EnrollmentService } from '../modules/enrollment/enrollment.service.js';
import { AchievementsService } from '../modules/achievements/achievements.service.js';

// Controllers
import { AuthController } from '../modules/auth/auth.controller.js';
import { UsersController } from '../modules/users/users.controller.js';
import { CoursesController } from '../modules/courses/courses.controller.js';
import { RoadmapController } from '../modules/roadmap/roadmap.controller.js';
import { SubmissionsController } from '../modules/submissions/submissions.controller.js';
import { CertificationsController } from '../modules/certifications/certifications.controller.js';
import { IDEController } from '../modules/ide/ide.controller.js';
import { DashboardController } from '../modules/dashboard/dashboard.controller.js';
import { ProgressController } from '../modules/progress/progress.controller.js';
import { QuizController } from '../modules/quiz/quiz.controller.js';
import { DiscussionsController } from '../modules/discussions/discussions.controller.js';
import { BookmarksController } from '../modules/bookmarks/bookmarks.controller.js';
import { SearchController } from '../modules/search/search.controller.js';
import { NotificationsController } from '../modules/notifications/notifications.controller.js';
import { EnrollmentController } from '../modules/enrollment/enrollment.controller.js';
import { AchievementsController } from '../modules/achievements/achievements.controller.js';

export interface ContainerCradle {
  prisma: typeof prisma;
  redis: typeof redis;
  logger: typeof logger;

  usersRepository: UsersRepository;
  coursesRepository: CoursesRepository;
  roadmapRepository: RoadmapRepository;
  submissionsRepository: SubmissionsRepository;
  certificationsRepository: CertificationsRepository;
  progressRepository: ProgressRepository;
  quizRepository: QuizRepository;
  discussionsRepository: DiscussionsRepository;
  bookmarksRepository: BookmarksRepository;
  notificationsRepository: NotificationsRepository;
  enrollmentRepository: EnrollmentRepository;
  achievementsRepository: AchievementsRepository;

  authService: AuthService;
  usersService: UsersService;
  coursesService: CoursesService;
  roadmapService: RoadmapService;
  submissionsService: SubmissionsService;
  certificationsService: CertificationsService;
  ideService: IDEService;
  dashboardService: DashboardService;
  progressService: ProgressService;
  quizService: QuizService;
  discussionsService: DiscussionsService;
  bookmarksService: BookmarksService;
  searchService: SearchService;
  notificationsService: NotificationsService;
  enrollmentService: EnrollmentService;
  achievementsService: AchievementsService;

  authController: AuthController;
  usersController: UsersController;
  coursesController: CoursesController;
  roadmapController: RoadmapController;
  submissionsController: SubmissionsController;
  certificationsController: CertificationsController;
  ideController: IDEController;
  dashboardController: DashboardController;
  progressController: ProgressController;
  quizController: QuizController;
  discussionsController: DiscussionsController;
  bookmarksController: BookmarksController;
  searchController: SearchController;
  notificationsController: NotificationsController;
  enrollmentController: EnrollmentController;
  achievementsController: AchievementsController;
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
    progressRepository: asClass(ProgressRepository).singleton(),
    quizRepository: asClass(QuizRepository).singleton(),
    discussionsRepository: asClass(DiscussionsRepository).singleton(),
    bookmarksRepository: asClass(BookmarksRepository).singleton(),
    notificationsRepository: asClass(NotificationsRepository).singleton(),
    enrollmentRepository: asClass(EnrollmentRepository).singleton(),
    achievementsRepository: asClass(AchievementsRepository).singleton(),

    // Services
    authService: asClass(AuthService).singleton(),
    usersService: asClass(UsersService).singleton(),
    coursesService: asClass(CoursesService).singleton(),
    roadmapService: asClass(RoadmapService).singleton(),
    submissionsService: asClass(SubmissionsService).singleton(),
    certificationsService: asClass(CertificationsService).singleton(),
    ideService: asClass(IDEService).singleton(),
    dashboardService: asClass(DashboardService).singleton(),
    progressService: asClass(ProgressService).singleton(),
    quizService: asClass(QuizService).singleton(),
    discussionsService: asClass(DiscussionsService).singleton(),
    bookmarksService: asClass(BookmarksService).singleton(),
    searchService: asClass(SearchService).singleton(),
    notificationsService: asClass(NotificationsService).singleton(),
    enrollmentService: asClass(EnrollmentService).singleton(),
    achievementsService: asClass(AchievementsService).singleton(),

    // Controllers
    authController: asClass(AuthController).singleton(),
    usersController: asClass(UsersController).singleton(),
    coursesController: asClass(CoursesController).singleton(),
    roadmapController: asClass(RoadmapController).singleton(),
    submissionsController: asClass(SubmissionsController).singleton(),
    certificationsController: asClass(CertificationsController).singleton(),
    ideController: asClass(IDEController).singleton(),
    dashboardController: asClass(DashboardController).singleton(),
    progressController: asClass(ProgressController).singleton(),
    quizController: asClass(QuizController).singleton(),
    discussionsController: asClass(DiscussionsController).singleton(),
    bookmarksController: asClass(BookmarksController).singleton(),
    searchController: asClass(SearchController).singleton(),
    notificationsController: asClass(NotificationsController).singleton(),
    enrollmentController: asClass(EnrollmentController).singleton(),
    achievementsController: asClass(AchievementsController).singleton(),
  });

  return container;
}
