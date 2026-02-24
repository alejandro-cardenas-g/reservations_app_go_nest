import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtPayloadWithExp, Secrets } from '../types';
import { GetAuthAccessTokensResult } from '../contracts/auth.contracts';

@Injectable()
export class AuthService {
  public static readonly secretAccessEnv = 'secrets.accessToken';
  public static readonly secretRefreshEnv = 'secrets.refreshToken';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  getAccessToken(payload: JwtPayload): string {
    const { privateKey } = this.configService.getOrThrow<Secrets>(
      AuthService.secretAccessEnv,
    );
    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      privateKey,
      expiresIn: 60 * 15,
    });
  }

  validateAccessToken(accessToken: string): JwtPayload {
    const { publicKey } = this.configService.getOrThrow<Secrets>(
      AuthService.secretAccessEnv,
    );
    return this.jwtService.verify<JwtPayload>(accessToken, {
      algorithms: ['RS256'],
      publicKey,
    });
  }

  getRefreshToken(payload: JwtPayload): string {
    const { privateKey } = this.configService.getOrThrow<Secrets>(
      AuthService.secretRefreshEnv,
    );
    return this.jwtService.sign(payload, {
      expiresIn: '2d',
      algorithm: 'RS256',
      privateKey,
    });
  }

  validateRefreshToken(refreshToken: string): JwtPayload {
    const { publicKey } = this.configService.getOrThrow<Secrets>(
      AuthService.secretRefreshEnv,
    );
    return this.jwtService.verify<JwtPayload>(refreshToken, {
      algorithms: ['RS256'],
      publicKey,
    });
  }

  decodeRefreshToken(refreshToken: string): TResult<JwtPayloadWithExp> {
    try {
      const payload = this.jwtService.decode<JwtPayloadWithExp>(refreshToken);
      return Result.Success(payload);
    } catch {
      return Result.Failure('errors.expirationToken', 'UNAUTHORIZED_ERROR');
    }
  }

  getAuthTokens(payload: JwtPayload): TResult<GetAuthAccessTokensResult> {
    const accessToken = this.getAccessToken(payload);
    const refreshToken = this.getRefreshToken(payload);
    const refreshPayload = this.decodeRefreshToken(refreshToken);
    if (!refreshPayload.isSuccess)
      return Result.Failure('error.creatingSession', 'UNEXPECTED_ERROR');
    return Result.Success({
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: new Date(refreshPayload.value.exp * 1000),
    });
  }
}
