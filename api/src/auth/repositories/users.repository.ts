import { DB_CONNECTIONS } from '@app/common/configuration/constants';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/users.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User, DB_CONNECTIONS.MAIN)
    dataAccess: Repository<User>,
  ) {
    super(User, dataAccess.manager, dataAccess.queryRunner);
  }

  async getMatchByEmailOrUsername(
    email: string | null,
    username: string | null,
    organizationId: string,
  ): Promise<User[]> {
    if (!email && !username) return [];
    const query = this.createQueryBuilder('u').where(
      'u.organizationId = :organizationId',
      { organizationId },
    );

    const where = [
      'u.email = :email',
      'u.username = :username',
      '(u.email = :email OR u.username = :username)',
    ];

    let wherePosition = 0;
    if (email && username) {
      wherePosition = 2;
    } else if (email) {
      wherePosition = 0;
    } else if (username) {
      wherePosition = 1;
    }

    query.andWhere(where[wherePosition], { email, username });
    return query.getMany();
  }

  getById(id: string): Promise<User | null> {
    return this.findOne({
      select: ['id', 'email', 'isActive', 'createdAt'],
      where: {
        id,
      },
    });
  }

  async updateUser(id: string, user: Partial<User>): Promise<boolean> {
    const updateResult = await this.update({ id }, user);
    return (updateResult.affected ?? 0) > 0;
  }

  getActiveByIdAndOrganization(id: string): Promise<User | null> {
    return this.findOne({
      select: ['id', 'email', 'isActive', 'createdAt'],
      where: {
        id,
        isActive: true,
      },
    });
  }

  getByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('u')
      .where('u.isActive')
      .andWhere('u.email = :email', { email })
      .getOne();
  }
}
