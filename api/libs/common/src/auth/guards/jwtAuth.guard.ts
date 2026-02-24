import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly headerRefresh = 'X-Token-Expired';

  handleRequest<AuthUser>(
    err: any,
    user: AuthUser,
    info: any,
    context: ExecutionContext,
  ): AuthUser {
    const response = context.switchToHttp().getResponse<Response>();
    if (info instanceof TokenExpiredError) {
      response.setHeader(this.headerRefresh, 'refresh');
      throw new UnauthorizedException('errors.tokenExpired');
    }

    if (err || !user) {
      throw err || new UnauthorizedException('auth.errors.invalidAccessError');
    }

    return user;
  }
}
