import { Result, TResult } from '@app/common/classes';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import {
  IOauthProviderStrategy,
  OAuthUserInfo,
} from 'src/auth/contracts/oauth2.contracts';
import { OAuthProvider } from 'src/auth/types/oauthProviders.type';

const GITHUB_OAUTH2_URL = 'https://github.com/login/oauth/authorize';

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

@Injectable()
export class GithubProvider implements IOauthProviderStrategy {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  getLoginUrl(): string {
    const url = new URL(GITHUB_OAUTH2_URL);

    const clientId = this.configService.getOrThrow<string>('GITHUB_CLIENT_ID');
    const redirectUri = this.configService.getOrThrow<string>(
      'GITHUB_REDIRECT_URI',
    );

    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'user:email');
    url.searchParams.set('state', 'github' as OAuthProvider);

    return url.toString();
  }

  async getAccessToken(code: string): Promise<TResult<string>> {
    const clientId = this.configService.getOrThrow<string>('GITHUB_CLIENT_ID');
    const secret = this.configService.getOrThrow<string>(
      'GITHUB_CLIENT_SECRET',
    );
    const redirectUri = this.configService.getOrThrow<string>(
      'GITHUB_REDIRECT_URI',
    );
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: secret,
      redirect_uri: redirectUri,
    });

    const resultToken: TResult<string> = await firstValueFrom(
      this.httpService.post<{ access_token: string }, unknown>(
        GITHUB_TOKEN_URL,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      ),
    )
      .then((response) => {
        if (response.status !== 200 || !response.data.access_token) {
          return Result.Failure<string>(
            'auth.errors.invalidAccessError',
            'UNAUTHORIZED_ERROR',
          );
        }
        return Result.Success<string>(response.data.access_token);
      })
      .catch(() => {
        return Result.Failure(
          'auth.errors.invalidAccessError',
          'UNAUTHORIZED_ERROR',
        );
      });

    return resultToken;
  }

  async getUserInfo(accessToken: string): Promise<TResult<OAuthUserInfo>> {
    try {
      const payload = await firstValueFrom(
        this.httpService.get<{ email: string; primary: boolean }[]>(
          'https://api.github.com/user/emails',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );
      if (
        !payload.data ||
        payload.status !== 200 ||
        payload.data.length === 0
      ) {
        return Result.Failure(
          'auth.errors.invalidAccessError',
          'UNAUTHORIZED_ERROR',
        );
      }

      const email = payload.data.find((email) => email.primary)?.email;

      if (!email) {
        return Result.Failure(
          'auth.errors.invalidAccessError',
          'UNAUTHORIZED_ERROR',
        );
      }

      return Result.Success({ email });
    } catch {
      return Result.Failure(
        'auth.errors.invalidAccessError',
        'UNAUTHORIZED_ERROR',
      );
    }
  }
}
