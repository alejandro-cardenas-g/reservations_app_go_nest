import { authEnvironments } from '@app/common/configuration/constants';
import { AuthUser } from '@app/common/types';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionsService } from '../services/sessions.service';
import { UsersService } from '../services/users.service';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  private cookieName: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {
    this.cookieName = this.configService.getOrThrow<string>(
      authEnvironments.COOKIE_AUTH_NAME,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res: Response = context.switchToHttp().getResponse();

    const refreshToken = (req?.cookies as Record<string, string>)?.[
      this.cookieName
    ];
    if (!refreshToken)
      throw new UnauthorizedException('auth.errors.invalidAccessError');

    try {
      const { aud, sid, token } =
        this.authService.validateRefreshToken(refreshToken);
      const [userResult, sessionResult] = await Promise.all([
        this.usersService.getByAuth(sid),
        this.sessionsService.getSessionByAudience(aud, sid, token),
      ]);
      if (!userResult.isSuccess || !sessionResult.isSuccess)
        throw new UnauthorizedException('auth.errors.invalidAccessError');

      const authUser: AuthUser = {
        ...userResult.value,
        session: sessionResult.value.id,
      };
      req.user = authUser;
      return true;
    } catch {
      const payloadResult = this.authService.decodeRefreshToken(refreshToken);
      if (payloadResult.isSuccess) {
        await Promise.all([
          this.sessionsService.revokeToken(
            payloadResult.value.token,
            payloadResult.value.aud,
          ),
          this.sessionsService.revokeExpTokens(
            payloadResult.value.sid,
            payloadResult.value.aud,
          ),
        ]);
      }
      res.clearCookie(this.cookieName);
      throw new UnauthorizedException('auth.errors.invalidAccessError');
    }
  }
}
