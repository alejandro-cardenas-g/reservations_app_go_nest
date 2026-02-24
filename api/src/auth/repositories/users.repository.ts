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

  getById(id: string): Promise<User | null> {
    return this.findOne({
      select: ['id', 'email', 'isActive', 'createdAt'],
      where: {
        id,
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
