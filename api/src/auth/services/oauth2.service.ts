import { Result, TResult } from '@app/common/classes';
import { Injectable } from '@nestjs/common';
import { OAuthProvider } from '../types/oauthProviders.type';
import { ManagerProvider } from './oauth/manager.provider';
import { UsersService } from './users.service';
import { GetAuthAccessTokensResult } from '../contracts/auth.contracts';
import { SessionsService } from './sessions.service';
import { AuthService } from './auth.service';
import { Audience } from '@app/common/types';

@Injectable()
export class Oauth2Service {
  constructor(
    private readonly managerProvider: ManagerProvider,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly authService: AuthService,
  ) {}

  login(provider: OAuthProvider): TResult<string> {
    const providerOauth = this.managerProvider.getProvider(provider);
    if (!providerOauth) {
      return Result.Failure('Unknown provider');
    }

    const result = providerOauth.getLoginUrl();
    return Result.Success(result);
  }

  async callback(
    code: string,
    state: OAuthProvider,
  ): Promise<TResult<GetAuthAccessTokensResult>> {
    const providerOauth = this.managerProvider.getProvider(state);
    if (!providerOauth) {
      return Result.Failure('Unknown provider');
    }

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
      'IDENTITY',
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
}
