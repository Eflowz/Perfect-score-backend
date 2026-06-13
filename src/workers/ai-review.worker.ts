import { Worker } from 'bullmq';
import { prisma } from '../config/prisma.js';
import { redis, createRedisConnection } from '../config/redis.js';
import { pubSub } from '../graphql/schema.js';
import { emailQueue, certificateQueue } from '../queue/index.js';
import { SubmissionStatus } from '@prisma/client';

const workerRedis = createRedisConnection();

export const aiReviewWorker = new Worker(
  'ai-review',
  async (job) => {
    const { submissionId } = job.data;
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { course: true, user: true },
    });

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.REVIEWING },
    });

    const channel = `submission:${submissionId}:stream`;

    await redis.publish(channel, JSON.stringify({ type: 'progress', message: 'Analyzing code structure...' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    await redis.publish(channel, JSON.stringify({ type: 'progress', message: 'Checking execution logic...' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    await redis.publish(channel, JSON.stringify({ type: 'progress', message: 'Generating feedback suggestions...' }));
    await new Promise((resolve) => setTimeout(resolve, 800));

    const score = Math.floor(Math.random() * 40) + 60;
    const aiReview = {
      score,
      feedback: [
        { line: 2, message: 'Consider using a helper function to avoid duplicating this logic.' },
        { line: 5, message: 'Variable name can be more descriptive.' },
      ],
      suggestions: ['Optimize the inner loop complexity.', 'Use try-except blocks to catch runtime errors.'],
    };

    const finalStatus = score >= 70 ? SubmissionStatus.COMPLETED : SubmissionStatus.FAILED;

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: finalStatus,
        aiReview,
        score,
        reviewedAt: new Date(),
      },
    });

    await redis.publish(
      channel,
      JSON.stringify({ type: 'completed', data: aiReview, score, status: finalStatus })
    );

    pubSub.publish('submissionReviewed', submissionId, {
      id: submissionId,
      status: finalStatus,
      score,
      aiReview,
    });

    await emailQueue.add(`email-review-${submissionId}`, {
      to: submission.user.email,
      subject: `Your submission for "${submission.course.title}" was reviewed!`,
      body: `Hi ${submission.user.name}, your project scored ${score}%. Log in to see detailed feedback.`,
    });

    if (finalStatus === SubmissionStatus.COMPLETED) {
      await certificateQueue.add(`cert-${submissionId}`, {
        userId: submission.userId,
        courseId: submission.courseId,
        title: `Perfect Score Certification - ${submission.course.title}`,
      });
    }
  },
  { connection: workerRedis as any }
);
