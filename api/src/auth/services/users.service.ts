import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { AuthUserWithoutSession } from '../contracts/auth.contracts';
import { Audience } from '@app/common/types';
import { User } from '../entities/users.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getByAuth(id: string): Promise<TResult<AuthUserWithoutSession>> {
    const userResult = await this.getById(id);

    if (!userResult.isSuccess)
      return Result.Failure('user_not_found', 'RESOURCE_NOT_FOUND');

    const { email } = userResult.value;
    return Result.Success({
      email,
      id,
      aud: 'Identity' satisfies Audience,
    });
  }

  async getById(id: string): Promise<TResult<User>> {
    const user = await this.usersRepository.getById(id);
    if (user === null)
      return Result.Failure('user_not_found', 'RESOURCE_NOT_FOUND');
    return Result.Success(user);
  }

  async getByEmail(email: string): Promise<TResult<User>> {
    const user = await this.usersRepository.getByEmail(email);
    if (user === null)
      return Result.Failure('user_not_found', 'RESOURCE_NOT_FOUND');
    return Result.Success(user);
  }
}
