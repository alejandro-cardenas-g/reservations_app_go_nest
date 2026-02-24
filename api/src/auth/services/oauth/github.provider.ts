import { Result, TResult } from '@app/common/classes';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import {
  IOauthProvider,
  OAuthUserInfo,
} from 'src/auth/contracts/oauth2.contracts';
import { OAuthProvider } from 'src/auth/types/oauthProviders.type';

const clientId = '';

const redirectUri = 'http://localhost:8000/auth/oauth2/callback';

const secret = '';

const GOOGLE_OAUTH2_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

export class GithubProvider implements IOauthProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  getLoginUrl(): string {
    const url = new URL(GOOGLE_OAUTH2_URL);

    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'email profile');
    url.searchParams.set('state', 'google' as OAuthProvider);

    return url.toString();
  }

  async getAccessToken(code: string): Promise<TResult<string>> {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: secret,
      redirect_uri: 'http://localhost:8000/auth/oauth2/callback',
      grant_type: 'authorization_code',
    });

    const resultToken: TResult<string> = await firstValueFrom(
      this.httpService.post<{ id_token: string }, unknown>(
        GOOGLE_TOKEN_URL,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    )
      .then((response) => {
        if (response.status !== 200 || !response.data.id_token) {
          return Result.Failure<string>(
            'auth.errors.invalidAccessError',
            'UNAUTHORIZED_ERROR',
          );
        }
        return Result.Success<string>(response.data.id_token);
      })
      .catch(() => {
        return Result.Failure(
          'auth.errors.invalidAccessError',
          'UNAUTHORIZED_ERROR',
        );
      });

    return resultToken;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getUserInfo(accessToken: string): Promise<TResult<OAuthUserInfo>> {
    try {
      const payload = this.jwtService.decode<{ email: string }>(accessToken);
      if (!payload) {
        return Result.Failure(
          'auth.errors.invalidAccessError',
          'UNAUTHORIZED_ERROR',
        );
      }
      return Result.Success({ email: payload.email });
    } catch {
      return Result.Failure(
        'auth.errors.invalidAccessError',
        'UNAUTHORIZED_ERROR',
      );
    }
  }
}
