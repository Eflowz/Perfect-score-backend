import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { env } from '../../config/env.js';
import { hashPassword, comparePassword } from '../../utils/hash.js';
import { AuthError, ConflictError } from '../../utils/errors.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { UserRole } from '@prisma/client';

interface Dependencies {
  prisma: PrismaClient;
  redis: Redis;
}

export class AuthService {
  private prisma: PrismaClient;
  private redis: Redis;

  constructor({ prisma, redis }: Dependencies) {
    this.prisma = prisma;
    this.redis = redis;
  }

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: UserRole.USER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streakDays: user.streakDays,
      },
      ...tokens,
    };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !(await comparePassword(input.password, user.passwordHash))) {
      throw new AuthError('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        xp: user.xp,
        level: user.level,
        streakDays: user.streakDays,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshTokenStr: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      // If token is reused/revoked/expired, revoke all user tokens for security
      if (tokenRecord) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: tokenRecord.userId },
          data: { revokedAt: new Date() },
        });
      }
      throw new AuthError('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    // Generate new pair
    const tokens = await this.generateTokens(tokenRecord.user.id, tokenRecord.user.role);

    return tokens;
  }

  async logout(refreshTokenStr: string) {
    await this.prisma.refreshToken.update({
      where: { token: refreshTokenStr },
      data: { revokedAt: new Date() },
    });
  }

  async generateTokens(userId: string, role: UserRole) {
    const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    
    const accessToken = await new SignJWT({ role })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setExpirationTime('15m')
      .sign(accessSecret);

    const refreshTokenVal = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenVal,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenVal,
    };
  }
}
