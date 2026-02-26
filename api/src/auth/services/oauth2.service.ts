import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { OAuthProvider } from '../types/oauthProviders.type';
import { ManagerProvider } from './oauth/manager.provider';
import { UsersService } from './users.service';
import {
  AccessTokenResult,
  GetAuthAccessTokensResult,
} from '../contracts/auth.contracts';
import { SessionsService } from './sessions.service';
import { AuthService } from './auth.service';
import { Audience, AuthUser } from '@app/common/types';

@Injectable()
export class Oauth2Service {
  constructor(
    private readonly managerProvider: ManagerProvider,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly authService: AuthService,
  ) {}

  login(provider: OAuthProvider): TResult<string> {
    const providerOauthResult = this.managerProvider.getProvider(provider);
    if (!providerOauthResult.isSuccess) return providerOauthResult;
    const providerOauth = providerOauthResult.value;

    const result = providerOauth.getLoginUrl();
    return Result.Success(result);
  }

  async callback(
    code: string,
    state: OAuthProvider,
  ): Promise<TResult<GetAuthAccessTokensResult>> {
    const providerOauthResult = this.managerProvider.getProvider(state);
    if (!providerOauthResult.isSuccess) return providerOauthResult;
    const providerOauth = providerOauthResult.value;

    const tokenResult = await providerOauth.getAccessToken(code);

    if (!tokenResult.isSuccess) {
      return Result.Failure(tokenResult.error, tokenResult.code);
    }

    const userInfoResult = await providerOauth.getUserInfo(tokenResult.value);

    if (!userInfoResult.isSuccess) {
      return Result.Failure(userInfoResult.error, userInfoResult.code);
    }

    return this.withIdentity(userInfoResult.value.email);
  }

  private async withIdentity(
    email: string,
  ): Promise<TResult<GetAuthAccessTokensResult>> {
    const userResult = await this.usersService.getByEmail(email);

    if (!userResult.isSuccess && userResult.code === 'RESOURCE_NOT_FOUND') {
      return Result.Failure(
        'auth.errors.invalidCredentials',
        'UNAUTHORIZED_ERROR',
      );
    } else if (!userResult.isSuccess) {
      return Result.Failure(userResult.error, userResult.code);
    }

    const user = userResult.value;

    const session = await this.sessionsService.createSession(
      'Identity' satisfies Audience,
      user.id,
    );
    const tokenResult = this.authService.getAuthTokens({
      sid: user.id,
      token: session.id,
      aud: 'Identity' satisfies Audience,
    });
    if (tokenResult.isSuccess) {
      await this.sessionsService.addExpToToken(
        session.id,
        tokenResult.value.refreshTokenExpiresAt,
      );
    }
    return tokenResult;
  }

  refreshToken(user: AuthUser): AccessTokenResult {
    const access_token = this.authService.getAccessToken({
      aud: user.aud,
      sid: user.id,
      token: user.session,
    });
    return {
      accessToken: access_token,
    };
  }

  async signOut(user: AuthUser): Promise<boolean> {
    const { aud, id, session } = user;

    await Promise.all([
      this.sessionsService.revokeToken(session, aud),
      this.sessionsService.revokeExpTokens(id, aud),
    ]);

    return true;
  }
}
