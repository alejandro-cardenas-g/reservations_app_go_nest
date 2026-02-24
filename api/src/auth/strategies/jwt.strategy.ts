import { Audience, AuthUser } from '@app/common/types';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';
import { UsersService } from '../services/users.service';
import { SessionsService } from '../services/sessions.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly sessionService: SessionsService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>(
        `${AuthService.secretAccessEnv}.publicKey`,
      ),
      ignoreExpiration: false,
      audience: 'IDENTITY' as Audience,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const { sid, token, aud } = payload;
    const [userResult, sessionResult] = await Promise.all([
      this.usersService.getByAuth(sid),
      this.sessionService.getSessionByAudience(aud, sid, token),
    ]);
    if (!sessionResult.isSuccess || !userResult.isSuccess)
      throw new UnauthorizedException('auth.errors.invalidAccessError');
    return { ...userResult.value, session: sessionResult.value.id };
  }
}
