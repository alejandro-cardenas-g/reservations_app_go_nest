import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsRepository extends Repository<Session> {
  constructor(
    @InjectRepository(Session, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<Session>,
  ) {
    super(Session, dataAccess.manager, dataAccess.queryRunner);
  }

  async revokeToken(id: string, audience: string): Promise<boolean> {
    const deleteResult = await this.delete({ id, audience });
    return Boolean(deleteResult.affected);
  }

  createWithAudience(audience: string, userId: string): Promise<Session> {
    return this.save(
      this.create({
        audience,
        userId,
      }),
    );
  }

  getSessionByAudience(
    token: string,
    userId: string,
    audience: string,
  ): Promise<Session | null> {
    return this.findOne({
      where: {
        id: token,
        audience,
        userId,
      },
    });
  }

  async revokeExpTokens(userId: string, audience: string): Promise<boolean> {
    const deleteResult = await this.createQueryBuilder()
      .delete()
      .from(Session)
      .where('userId = :userId', { userId })
      .andWhere('audience = :audience', { audience })
      .andWhere('expireAt <= :exp', { exp: new Date() })
      .execute();
    return Boolean(deleteResult.affected);
  }

  async addExpToToken(token: string, exp: Date): Promise<boolean> {
    const updateResult = await this.update(
      { id: token },
      {
        expireAt: exp,
      },
    );
    return Boolean(updateResult.affected);
  }
}
