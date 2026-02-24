import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { Session } from '../entities/session.entity';
import { SessionsRepository } from '../repositories/sessions.repository';
import { Audience } from '@app/common/types';

@Injectable()
export class SessionsService {
  constructor(private readonly sessionsRepository: SessionsRepository) {}

  async createSession(audience: string, userId: string): Promise<Session> {
    const session = await this.sessionsRepository.createWithAudience(
      audience,
      userId,
    );
    return session;
  }

  async getSessionByAudience(
    audience: Audience,
    userId: string,
    token: string,
  ): Promise<TResult<Session>> {
    const session = await this.sessionsRepository.getSessionByAudience(
      token,
      userId,
      audience,
    );
    if (session === null)
      return Result.Failure('errors.no_session', 'RESOURCE_NOT_FOUND');
    return Result.Success(session);
  }

  async revokeToken(token: string, audience: string): Promise<boolean> {
    const result = await this.sessionsRepository.revokeToken(token, audience);
    return result;
  }

  async revokeExpTokens(id: string, audience: string): Promise<boolean> {
    const result = await this.sessionsRepository.revokeExpTokens(id, audience);
    return result;
  }

  async addExpToToken(token: string, exp: Date): Promise<boolean> {
    return this.sessionsRepository.addExpToToken(token, exp);
  }
}
