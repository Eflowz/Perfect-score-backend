import { createSchema, createPubSub } from 'graphql-yoga';
import { GraphQLContext } from './context.js';
import { UsersService } from '../modules/users/users.service.js';
import { CoursesService } from '../modules/courses/courses.service.js';
import { RoadmapService } from '../modules/roadmap/roadmap.service.js';
import { SubmissionsService } from '../modules/submissions/submissions.service.js';
import { CertificationsService } from '../modules/certifications/certifications.service.js';
import { AuthError } from '../utils/errors.js';

interface SubmissionReviewedPayload {
  id: string;
  status: string;
  score?: number;
  aiReview?: any;
}

const pubSub = createPubSub<{
  submissionReviewed: [string, SubmissionReviewedPayload];
}>();

export { pubSub };

export const schema = createSchema<GraphQLContext>({
  typeDefs: `
    type User {
      id: ID!
      email: String!
      name: String!
      role: String!
      xp: Int!
      level: Int!
      streakDays: Int!
    }

    type CourseModule {
      id: ID!
      title: String!
      content: String!
      order: Int!
    }

    type Course {
      id: ID!
      title: String!
      description: String!
      level: String!
      order: Int!
      modules: [CourseModule!]!
    }

    type RoadmapCourse {
      id: ID!
      courseId: ID!
      course: Course!
      order: Int!
      status: String!
    }

    type Roadmap {
      id: ID!
      userId: ID!
      targetDate: String
      courses: [RoadmapCourse!]!
    }

    type Submission {
      id: ID!
      userId: ID!
      courseId: ID!
      code: String!
      language: String!
      status: String!
      score: Float
      aiReview: String
    }

    type Certificate {
      id: ID!
      userId: ID!
      courseId: ID!
      title: String!
      credentialId: String!
      pdfUrl: String
      issuedAt: String!
    }

    type Query {
      me: User
      user(id: ID!): User
      courses: [Course!]!
      course(id: ID!): Course
      roadmap: Roadmap
      submissions(courseId: ID!): [Submission!]!
      certificates: [Certificate!]!
    }

    type Mutation {
      updateProfile(name: String, email: String): User
      submitCode(courseId: ID!, code: String!, language: String): Submission
      generateRoadmap(goals: [String!]!, targetDate: String): String
    }

    type Subscription {
      submissionReviewed(id: ID!): Submission!
    }
  `,
  resolvers: {
    Query: {
      me: async (_, __, ctx) => {
        if (!ctx.user) throw new AuthError();
        const usersService = ctx.container.resolve<UsersService>('usersService');
        return usersService.getProfile(ctx.user.id);
      },
      user: async (_, { id }, ctx) => {
        if (!ctx.user || ctx.user.role !== 'SUPER_ADMIN') throw new AuthError('Admin access required');
        const usersService = ctx.container.resolve<UsersService>('usersService');
        return usersService.getProfile(id);
      },
      courses: async (_, __, ctx) => {
        const coursesService = ctx.container.resolve<CoursesService>('coursesService');
        return coursesService.getCourses(ctx.user?.id);
      },
      course: async (_, { id }, ctx) => {
        const coursesService = ctx.container.resolve<CoursesService>('coursesService');
        return coursesService.getCourse(id, ctx.user?.id);
      },
      roadmap: async (_, __, ctx) => {
        if (!ctx.user) throw new AuthError();
        const roadmapService = ctx.container.resolve<RoadmapService>('roadmapService');
        return roadmapService.getRoadmap(ctx.user.id);
      },
      submissions: async (_, { courseId }, ctx) => {
        if (!ctx.user) throw new AuthError();
        const submissionsService = ctx.container.resolve<SubmissionsService>('submissionsService');
        return submissionsService.getSubmissionsByCourse(ctx.user.id, courseId);
      },
      certificates: async (_, __, ctx) => {
        if (!ctx.user) throw new AuthError();
        const certsService = ctx.container.resolve<CertificationsService>('certificationsService');
        return certsService.getUserCertificates(ctx.user.id);
      },
    },
    Mutation: {
      updateProfile: async (_, { name, email }, ctx) => {
        if (!ctx.user) throw new AuthError();
        const usersService = ctx.container.resolve<UsersService>('usersService');
        return usersService.updateProfile(ctx.user.id, { name, email });
      },
      submitCode: async (_, { courseId, code, language }, ctx) => {
        if (!ctx.user) throw new AuthError();
        const submissionsService = ctx.container.resolve<SubmissionsService>('submissionsService');
        return submissionsService.submit(ctx.user.id, courseId, code, language || 'python');
      },
      generateRoadmap: async (_, { goals, targetDate }, ctx) => {
        if (!ctx.user) throw new AuthError();
        const roadmapService = ctx.container.resolve<RoadmapService>('roadmapService');
        const result = await roadmapService.queueGeneration(ctx.user.id, goals, targetDate);
        return result.jobId;
      },
    },
    Subscription: {
      submissionReviewed: {
        subscribe: (_, { id }) => pubSub.subscribe('submissionReviewed', id) as any,
        resolve: (payload: SubmissionReviewedPayload) => ({
          id: payload.id,
          status: payload.status,
          score: payload.score,
          aiReview: payload.aiReview ? JSON.stringify(payload.aiReview) : null,
        }),
      },
    },
  },
});
