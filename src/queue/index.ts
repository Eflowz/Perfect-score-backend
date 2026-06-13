import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

export interface AIReviewJobData {
  submissionId: string;
}

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface CertificateJobData {
  userId: string;
  courseId: string;
  title: string;
}

export interface RoadmapJobData {
  userId: string;
  goals: string[];
  targetDate?: string;
}

export const aiReviewQueue = new Queue<AIReviewJobData>('ai-review', { connection: redis as any });
export const emailQueue = new Queue<EmailJobData>('email', { connection: redis as any });
export const certificateQueue = new Queue<CertificateJobData>('certificate-generation', { connection: redis as any });
export const roadmapQueue = new Queue<RoadmapJobData>('roadmap-generation', { connection: redis as any });

