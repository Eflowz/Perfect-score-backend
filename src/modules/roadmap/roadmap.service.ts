import { RoadmapRepository } from './roadmap.repository.js';
import { roadmapQueue } from '../../queue/index.js';
import { NotFoundError } from '../../utils/errors.js';

interface Dependencies {
  roadmapRepository: RoadmapRepository;
}

export class RoadmapService {
  private roadmapRepository: RoadmapRepository;

  constructor({ roadmapRepository }: Dependencies) {
    this.roadmapRepository = roadmapRepository;
  }

  async getRoadmap(userId: string) {
    const roadmap = await this.roadmapRepository.findByUserId(userId);
    if (!roadmap) {
      throw new NotFoundError('Roadmap not found. Generate one first.');
    }
    return roadmap;
  }

  async queueGeneration(userId: string, goals: string[], targetDate?: string) {
    let roadmap = await this.roadmapRepository.findByUserId(userId);
    if (!roadmap) {
      const parsedDate = targetDate ? new Date(targetDate) : undefined;
      await this.roadmapRepository.createRoadmap(userId, parsedDate);
    }

    const job = await roadmapQueue.add(`roadmap-gen-${userId}`, {
      userId,
      goals,
      targetDate,
    });

    return { jobId: job.id };
  }
}
