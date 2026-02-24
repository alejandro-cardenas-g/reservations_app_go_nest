import { AuthUser } from '@app/common/types';
import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
  const user = req.user;
  if (!user) throw new InternalServerErrorException('user_not_found:context');
  return user;
});
