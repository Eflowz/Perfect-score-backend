import { UsersRepository } from './users.repository.js';
import { UpdateProfileInput } from './users.schema.js';
import { NotFoundError } from '../../utils/errors.js';

interface Dependencies {
  usersRepository: UsersRepository;
}

export class UsersService {
  private usersRepository: UsersRepository;

  constructor({ usersRepository }: Dependencies) {
    this.usersRepository = usersRepository;
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { passwordHash, ...safeUser } = user as any;
    return safeUser;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const updated = await this.usersRepository.update(userId, input);
    const { passwordHash, ...safeUser } = updated as any;
    return safeUser;
  }

  async trackStreak(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) return;

    const now = new Date();
    const lastActive = user.lastActiveAt;

    if (!lastActive) {
      await this.usersRepository.updateStreak(userId, 1);
      return;
    }

    const diffTime = Math.abs(now.getTime() - lastActive.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      await this.usersRepository.updateStreak(userId, user.streakDays + 1);
    } else if (diffDays > 1) {
      await this.usersRepository.updateStreak(userId, 1);
    } else {
      await this.usersRepository.update(userId, { lastActiveAt: now });
    }
  }

  async addXp(userId: string, amount: number) {
    return this.usersRepository.incrementXp(userId, amount);
  }

  async listAllUsers() {
    return this.usersRepository.listAll();
  }
}
